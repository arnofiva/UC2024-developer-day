import Accessor from "@arcgis/core/core/Accessor";
import {
  property,
  subclass,
} from "@arcgis/core/core/accessorSupport/decorators";
import SceneView from "@arcgis/core/views/SceneView";
import { ScreenType } from "../interfaces";

type UploadStoreProperties = Pick<UploadStore, "view">;

@subclass()
class UploadStore extends Accessor {
  readonly type = ScreenType.Upload;

  @property({ constructOnly: true })
  view: SceneView;

  constructor(props: UploadStoreProperties) {
    super(props);
  }
}

export default UploadStore;
