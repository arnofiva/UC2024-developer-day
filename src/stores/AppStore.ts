import Accessor from "@arcgis/core/core/Accessor";
import {
  property,
  subclass,
} from "@arcgis/core/core/accessorSupport/decorators";
import { watch, whenOnce } from "@arcgis/core/core/reactiveUtils";
import Geometry from "@arcgis/core/geometry/Geometry";
import Polygon from "@arcgis/core/geometry/Polygon";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import SceneModification from "@arcgis/core/layers/support/SceneModification";
import SceneModifications from "@arcgis/core/layers/support/SceneModifications";
import { waterGraphic } from "../constants";
import { ScreenType } from "../interfaces";
import { createToggle } from "../snippet";
import { applySlide } from "../utils";
import DownloadStore from "./DownloadStore";
import RealisticStore from "./RealisticStore";
import SceneStore from "./SceneStore";
import TimeStore from "./TimeStore";
import UploadStore from "./UploadStore";
import UserStore from "./UserStore";
import ViewshedStore from "./ViewshedStore";

type AppStoreProperties = Pick<AppStore, "webSceneId" | "skipPreload">;

export type ScreenStoreUnion =
  | TimeStore
  | DownloadStore
  | UploadStore
  | RealisticStore
  | ViewshedStore;

@subclass()
class AppStore extends Accessor {
  @property({ constructOnly: true })
  webSceneId: string;

  @property({ constructOnly: true })
  sceneStore = new SceneStore();

  @property()
  get skipStartupDialog() {
    return localStorage.getItem("skipStartupDialog") === "true";
  }
  set skipStartupDialog(skip: boolean) {
    localStorage.setItem("skipStartupDialog", `${skip}`);
  }

  @property()
  isStartupDialogShown = true;

  @property()
  skipPreload = false;

  @property()
  title: string;

  @property({ constructOnly: true })
  userStore = new UserStore();

  @property()
  get loading() {
    return this._loading;
  }

  @property()
  private _loading: "scene" | "delete-models" | "preload-slides" | "done" =
    "scene";

  @property({ constructOnly: true })
  deviceId: string;

  @property()
  selectedArea: Geometry;

  @property()
  uploadedFootprint: Polygon;

  @property({ readOnly: true })
  waterLayer = new GraphicsLayer({
    graphics: [waterGraphic],
  });

  private modifications: SceneModifications;

  @property()
  get currentScreenStore() {
    return this._currentScreen;
  }
  set currentScreenStore(screen: ScreenStoreUnion | null) {
    const current = this._currentScreen;
    if (current) {
      current.destroy();
    }
    this._currentScreen = screen;
  }

  @property({})
  private _currentScreen: ScreenStoreUnion | null;

  constructor(props: AppStoreProperties) {
    super(props);

    let deviceId = localStorage.getItem("deviceId");
    if (deviceId === null) {
      deviceId = crypto.randomUUID();
      localStorage.setItem("deviceId", deviceId);
    }
    this.deviceId = deviceId;

    window.onkeydown = (e) => {
      const key = e.key;

      const view = this.sceneStore.view;
      if (!view) {
        return;
      }

      const index = Number.parseInt(key);
      if (Number.isInteger(index)) {
        applySlide(view, index - 1);
      } else if (key === "c") {
        snippetToggle();
      } else if (key === "v") {
        snippetFlattenToggle();
      } else if (key === " ") {
        if (stickyNoteShown) {
          stickyNote?.classList.add("hide");
        } else {
          stickyNote?.classList.remove("hide");
        }
        stickyNoteShown = !stickyNoteShown;
        e.stopImmediatePropagation();
      }
    };

    this.addHandles([
      watch(
        () => this.uploadedFootprint,
        () => this.updateFootprintFilter(),
      ),
      {
        remove: () => {
          window.onkeydown = null;
        },
      },
    ]);

    whenOnce(() => this.sceneStore.ready).then(async () => {
      await this.performAppLoad();

      this.sceneStore.map.add(this.waterLayer);

      this.addHandles(
        watch(
          () => this.sceneStore.mesh.visible,
          (visible) => {
            this.waterLayer.visible = visible;
          },
          { initial: true },
        ),
      );

      if (this.skipStartupDialog) {
        this.isStartupDialogShown = false;
      }
    });
  }

  private async performAppLoad() {
    const view = this.sceneStore.view;
    const map = this.sceneStore.map;

    this.title = document.title = map.portalItem.title;

    await map.loadAll();

    this.sceneStore.uploadLayer.definitionExpression = `name = '${this.deviceId}'`;
    const field = this.sceneStore.uploadLayer.fields.find(
      (f) => f.name === "name",
    )!;
    field.defaultValue = this.deviceId;

    this.modifications = this.sceneStore.mesh.modifications;

    this._loading = "delete-models";
    const query = this.sceneStore.uploadLayer.createQuery();
    query.returnGeometry = false;
    const { features } = await this.sceneStore.uploadLayer.queryFeatures(query);
    if (features.length) {
      await this.sceneStore.uploadLayer.applyEdits({
        deleteFeatures: features,
      });
    }

    if (!this.skipPreload) {
      this._loading = "preload-slides";

      const slides = map.presentation.slides;
      for (const slide of slides) {
        slide.applyTo(view, { animate: false });
        await whenOnce(() => !view.updating);
      }
      slides.getItemAt(0).applyTo(view, { animate: false });
    }

    this._loading = "done";
  }

  private async updateFootprintFilter() {
    const view = this.sceneStore.view;
    if (!view) {
      return;
    }

    const footprint = this.uploadedFootprint;
    const layerView = await view.whenLayerView(this.sceneStore.downloadLayer);

    if (footprint) {
      const modifications = this.modifications
        ? this.modifications.clone()
        : new SceneModifications();

      modifications.add(
        new SceneModification({
          geometry: footprint,
          type: "replace",
        }),
      );

      this.sceneStore.mesh.modifications = modifications;
    } else {
      this.sceneStore.mesh.modifications = this.modifications;
      layerView.filter = null as any;
    }
  }

  private createScreen(screen: ScreenType) {
    const view = this.sceneStore.view;
    const map = this.sceneStore.map;

    if (!view || !map) {
      throw new Error();
    }

    switch (screen) {
      case ScreenType.Time:
        return new TimeStore({ view });
      case ScreenType.Download:
        return new DownloadStore({ appStore: this });
      case ScreenType.Upload:
        return new UploadStore({ appStore: this });
      case ScreenType.Realistic:
        return new RealisticStore({ view });
      case ScreenType.Viewshed:
        return new ViewshedStore({ view });
      default:
        throw new Error();
    }
  }

  selectScreen(screenType: ScreenType) {
    if (this.currentScreenStore?.type === screenType) {
      return;
    }

    const screen = this.createScreen(screenType);
    this.currentScreenStore = screen;
  }
}

const snippetToggle = createToggle("downloadCodeSnippet");
const snippetFlattenToggle = createToggle("flattenCodeSnippet");

const stickyNote = document.getElementById("stickyNote");
let stickyNoteShown = false;

export default AppStore;
