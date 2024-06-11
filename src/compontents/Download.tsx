import {
  property,
  subclass,
} from "@arcgis/core/core/accessorSupport/decorators";

import { tsx } from "@arcgis/core/widgets/support/widget";

import "@esri/calcite-components/dist/components/calcite-card";
import "@esri/calcite-components/dist/components/calcite-label";
import "@esri/calcite-components/dist/components/calcite-switch";

import DownloadStore from "../stores/DownloadStore";
import { Widget } from "./Widget";

type DownloadProperties = Pick<Download, "store">;

@subclass("arcgis-core-template.Download")
class Download extends Widget<DownloadProperties> {
  @property()
  store: DownloadStore;

  postInitialize() {}

  render() {
    return (
      <div>
        <calcite-card id="download">
          <calcite-button id="createButton" onclick={() => this.store.start()}>
            Select extent
          </calcite-button>
          <calcite-button id="cancelButton" style="display:none">
            Cancel
          </calcite-button>
        </calcite-card>
      </div>
    );
  }
}

export default Download;
