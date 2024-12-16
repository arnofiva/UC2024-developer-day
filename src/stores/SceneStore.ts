import Accessor from "@arcgis/core/core/Accessor";
import {
  property,
  subclass,
} from "@arcgis/core/core/accessorSupport/decorators";
import { whenOnce } from "@arcgis/core/core/reactiveUtils";
import IntegratedMeshLayer from "@arcgis/core/layers/IntegratedMeshLayer";
import SceneLayer from "@arcgis/core/layers/SceneLayer";
import Map from "@arcgis/core/Map";
import SceneView from "@arcgis/core/views/SceneView";
import WebScene from "@arcgis/core/WebScene";
import { findLayerById } from "../utils";

@subclass()
class SceneStore extends Accessor {
  @property({ readOnly: true })
  get ready() {
    return this._ready;
  }

  @property()
  get view() {
    if (!this.ready) {
      throw new Error("SceneView has not yet been initialized");
    }
    return this._view!;
  }
  set view(view: SceneView) {
    this._view = view;
  }

  @property({ aliasOf: "view.map", readOnly: true })
  map: WebScene;

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
  private _view: SceneView | null;

  @property()
  private _ready = false;

  constructor() {
    super();

    whenOnce(() => this._view).then(async (view) => {
      await view.when();
      this.findLayers(view.map);
      this._ready = true;
    });
  }

  private findLayers(map: Map) {
    this.downloadLayer = findLayerById(map, "190697a6c61-layer-314");
    this.uploadLayer = findLayerById(map, "1908858b599-layer-102");
    this.lowPolyTrees = findLayerById(map, "19058d7d9f2-layer-87");
    this.realisticTrees = findLayerById(map, "19058d7d2b5-layer-86");
    this.mesh = findLayerById(map, "1904131bf90-layer-113");
  }
}

export default SceneStore;
