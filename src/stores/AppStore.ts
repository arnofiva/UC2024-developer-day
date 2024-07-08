import WebScene from "@arcgis/core/WebScene";
import Accessor from "@arcgis/core/core/Accessor";
import {
  property,
  subclass,
} from "@arcgis/core/core/accessorSupport/decorators";
import { watch, whenOnce } from "@arcgis/core/core/reactiveUtils";
import Geometry from "@arcgis/core/geometry/Geometry";
import Polygon from "@arcgis/core/geometry/Polygon";
import IntegratedMeshLayer from "@arcgis/core/layers/IntegratedMeshLayer";
import SceneLayer from "@arcgis/core/layers/SceneLayer";
import FeatureFilter from "@arcgis/core/layers/support/FeatureFilter";
import SceneModification from "@arcgis/core/layers/support/SceneModification";
import SceneModifications from "@arcgis/core/layers/support/SceneModifications";
import SceneView from "@arcgis/core/views/SceneView";
import { createToggle } from "../snippet";
import { applySlide, findLayerById } from "../utils";
import DownloadStore from "./DownloadStore";
import RealisticStore from "./RealisticStore";
import TimeStore from "./TimeStore";
import UploadStore from "./UploadStore";
import UserStore from "./UserStore";
import ViewshedStore from "./ViewshedStore";

type AppStoreProperties = Pick<AppStore, "view">;

export type ScreenStoreUnion =
  | TimeStore
  | DownloadStore
  | UploadStore
  | RealisticStore
  | ViewshedStore;

@subclass("arcgis-core-template.AppStore")
class AppStore extends Accessor {
  @property({ constructOnly: true })
  view: SceneView;

  @property({ aliasOf: "view.map" })
  map: WebScene;

  @property({ constructOnly: true })
  userStore = new UserStore();

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

  @property()
  mesh: IntegratedMeshLayer;

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

    whenOnce(() => this.map).then(async (map) => {
      await map.load();

      document.title = map.portalItem.title;

      await map.loadAll();

      this.downloadLayer = findLayerById(map, "190697a6c61-layer-314");
      this.uploadLayer = findLayerById(map, "1908858b599-layer-102");
      this.lowPolyTrees = findLayerById(map, "19058d7d9f2-layer-87");
      this.realisticTrees = findLayerById(map, "19058d7d2b5-layer-86");
      this.mesh = findLayerById(map, "1904131bf90-layer-113");
    });

    watch(
      () => this.uploadedFootprint,
      () => this.updateFootprintFilter(),
    );

    window.onkeydown = (e) => {
      const index = Number.parseInt(e.key);
      if (Number.isInteger(index)) {
        applySlide(this.view, index - 1);
      } else if (e.key === "c") {
        snippetToggle();
      } else if (e.key === " ") {
        if (stickyNoteShown) {
          stickyNote?.classList.add("hide");
        } else {
          stickyNote?.classList.remove("hide");
        }
        stickyNoteShown = !stickyNoteShown;
        e.stopImmediatePropagation();
      }
    };

    this.addHandles({
      remove: () => {
        window.onkeydown = null;
      },
    });
  }

  private async updateFootprintFilter() {
    const footprint = this.uploadedFootprint;
    const layerView = await this.view.whenLayerView(this.downloadLayer);

    if (footprint) {
      this.mesh.modifications = new SceneModifications([
        new SceneModification({
          geometry: footprint,
          type: "replace",
        }),
      ]);
      layerView.filter = new FeatureFilter({
        geometry: footprint.extent.center,
        spatialRelationship: "disjoint",
      });
    } else {
      this.mesh.modifications = new SceneModifications();
      layerView.filter = null as any;
    }
  }
}

const snippetToggle = createToggle("downloadCodeSnippet");

const stickyNote = document.getElementById("stickyNote");
let stickyNoteShown = false;

export default AppStore;
