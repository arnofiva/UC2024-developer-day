import Accessor from "@arcgis/core/core/Accessor";
import {
  property,
  subclass,
} from "@arcgis/core/core/accessorSupport/decorators";
import SceneView from "@arcgis/core/views/SceneView";
import { ScreenType } from "../interfaces";

type RealisticStoreProperties = Pick<RealisticStore, "view">;

@subclass()
class RealisticStore extends Accessor {
  readonly type = ScreenType.Realistic;
  @property({ constructOnly: true })
  view: SceneView;

  constructor(props: RealisticStoreProperties) {
    super(props);
  }
}

export default RealisticStore;
