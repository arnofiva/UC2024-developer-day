import Accessor from "@arcgis/core/core/Accessor";
import {
  property,
  subclass,
} from "@arcgis/core/core/accessorSupport/decorators";
import { watch, whenOnce } from "@arcgis/core/core/reactiveUtils";
import Geometry from "@arcgis/core/geometry/Geometry";
import Polygon from "@arcgis/core/geometry/Polygon";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import IntegratedMeshLayer from "@arcgis/core/layers/IntegratedMeshLayer";
import SceneLayer from "@arcgis/core/layers/SceneLayer";
import SceneModification from "@arcgis/core/layers/support/SceneModification";
import SceneModifications from "@arcgis/core/layers/support/SceneModifications";
import { waterGraphic } from "../constants";
import { createToggle } from "../snippet";
import { applySlide, findLayerById } from "../utils";
import DownloadStore from "./DownloadStore";
import RealisticStore from "./RealisticStore";
import SceneStore from "./SceneStore";
import TimeStore from "./TimeStore";
import UploadStore from "./UploadStore";
import UserStore from "./UserStore";
import ViewshedStore from "./ViewshedStore";

type AppStoreProperties = Pick<AppStore, "webSceneId">;

export type ScreenStoreUnion =
  | TimeStore
  | DownloadStore
  | UploadStore
  | RealisticStore
  | ViewshedStore;

@subclass("arcgis-core-template.AppStore")
class AppStore extends Accessor {
  @property({ constructOnly: true })
  webSceneId: string;

  @property({ constructOnly: true })
  sceneStore = new SceneStore();

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

  @property()
  downloadLayer: SceneLayer;

  @property()
  uploadLayer: SceneLayer;

  @property()
  lowPolyTrees: SceneLayer;

  @property()
  realisticTrees: SceneLayer;

  @property({ readOnly: true })
  waterLayer = new GraphicsLayer({
    graphics: [waterGraphic],
  });

  @property()
  mesh: IntegratedMeshLayer;

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

    whenOnce(() => this.sceneStore.view).then(async (view) => {
      const map = this.sceneStore.map;

      if (!map) throw Error();

      await map.load();

      this.title = document.title = map.portalItem.title;

      await map.loadAll();

      this.downloadLayer = findLayerById(map, "190697a6c61-layer-314");
      this.uploadLayer = findLayerById(map, "1908858b599-layer-102");
      this.lowPolyTrees = findLayerById(map, "19058d7d9f2-layer-87");
      this.realisticTrees = findLayerById(map, "19058d7d2b5-layer-86");
      this.mesh = findLayerById(map, "1904131bf90-layer-113");

      this.uploadLayer.definitionExpression = `name = '${this.deviceId}'`;
      const field = this.uploadLayer.fields.find((f) => f.name === "name")!;
      field.defaultValue = deviceId;

      this.modifications = this.mesh.modifications;

      this._loading = "delete-models";
      const query = this.uploadLayer.createQuery();
      query.returnGeometry = false;
      const { features } = await this.uploadLayer.queryFeatures(query);
      if (features.length) {
        await this.uploadLayer.applyEdits({
          deleteFeatures: features,
        });
      }

      this._loading = "preload-slides";

      const slides = map.presentation.slides;
      for (const slide of slides) {
        slide.applyTo(view, { animate: false });
        await whenOnce(() => !view.updating);
      }
      slides.getItemAt(0).applyTo(view, { animate: false });

      this._loading = "done";

      map.add(this.waterLayer);

      this.addHandles(
        watch(
          () => this.mesh.visible,
          (visible) => {
            this.waterLayer.visible = visible;
          },
        ),
      );
    });

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
  }

  private async updateFootprintFilter() {
    const view = this.sceneStore.view;
    if (!view) {
      return;
    }

    const footprint = this.uploadedFootprint;
    const layerView = await view.whenLayerView(this.downloadLayer);

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

      this.mesh.modifications = modifications;
    } else {
      this.mesh.modifications = this.modifications;
      layerView.filter = null as any;
    }
  }
}

const snippetToggle = createToggle("downloadCodeSnippet");
const snippetFlattenToggle = createToggle("flattenCodeSnippet");

const stickyNote = document.getElementById("stickyNote");
let stickyNoteShown = false;

export default AppStore;
