import {
  property,
  subclass,
} from "@arcgis/core/core/accessorSupport/decorators";

import { tsx } from "@arcgis/core/widgets/support/widget";

import "@esri/calcite-components/dist/components/calcite-card";
import "@esri/calcite-components/dist/components/calcite-label";
import "@esri/calcite-components/dist/components/calcite-switch";

import Editor from "@arcgis/core/widgets/Editor";
import UploadStore from "../stores/UploadStore";
import { ensureViewUIContainer } from "../utils";
import { Widget } from "./Widget";

type UploadProperties = Pick<Upload, "store">;

@subclass("arcgis-core-template.Upload")
class Upload extends Widget<UploadProperties> {
  @property()
  store: UploadStore;

  postInitialize() {}

  renderButton() {}

  render() {
    return (
      <div>
        <Editor
          view={this.store.view}
          container={ensureViewUIContainer("top-right", "editor")}
        ></Editor>
      </div>
    );
  }
}

export default Upload;
