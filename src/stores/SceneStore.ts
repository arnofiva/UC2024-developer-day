import Accessor from "@arcgis/core/core/Accessor";
import {
  property,
  subclass,
} from "@arcgis/core/core/accessorSupport/decorators";
import SceneView from "@arcgis/core/views/SceneView";
import WebScene from "@arcgis/core/WebScene";

@subclass()
class SceneStore extends Accessor {
  @property({ aliasOf: "view.map", readOnly: true })
  map: WebScene | null;

  @property()
  view: SceneView | null;
}

export default SceneStore;
