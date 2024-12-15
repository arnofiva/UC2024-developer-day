import {
  property,
  subclass,
} from "@arcgis/core/core/accessorSupport/decorators";

import "@esri/calcite-components/dist/components/calcite-card";
import "@esri/calcite-components/dist/components/calcite-label";
import "@esri/calcite-components/dist/components/calcite-switch";

import UploadStore from "../stores/UploadStore";
import { Widget } from "./Widget";

type UploadProperties = Pick<Upload, "store">;

@subclass()
class Upload extends Widget<UploadProperties> {
  @property()
  store: UploadStore;

  postInitialize() {
    const view = this.store.appStore.sceneStore.view;

    if (view) {
      view.ui.add(this.store.editor, "bottom-right");

      this.addHandles({ remove: () => view.ui.remove(this.store.editor) });
    }
  }

  renderButton() {}

  render() {}
}

export default Upload;
