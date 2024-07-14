import {
  property,
  subclass,
} from "@arcgis/core/core/accessorSupport/decorators";

import { tsx } from "@arcgis/core/widgets/support/widget";

import "@esri/calcite-components/dist/components/calcite-card";
import "@esri/calcite-components/dist/components/calcite-icon";
import "@esri/calcite-components/dist/components/calcite-label";
import "@esri/calcite-components/dist/components/calcite-switch";

import DownloadStore from "../stores/DownloadStore";
import { Widget } from "./Widget";

type DownloadProperties = Pick<Download, "store">;

@subclass("arcgis-core-template.Download")
class Download extends Widget<DownloadProperties> {
  @property()
  store: DownloadStore;

  private renderButton() {
    if (this.store.tool.state === "idle") {
      if (this.store.area) {
        return (
          <div>
            <calcite-label
              // scale="m"
              layout="inline"
            >
              <calcite-icon
                // class="row-span-full place-self-center"
                icon="urban-model"
                scale="m"
              ></calcite-icon>
              Selected features: 28
            </calcite-label>
            <calcite-button
              icon-start="download"
              width="full"
              appearance="solid"
              href="./model.glb"
              download="model.glb"
            >
              Download
            </calcite-button>
          </div>
        );
      } else {
        return (
          <calcite-button
            onclick={() => this.store.start()}
            width="full"
            appearance="solid"
          >
            Select download extent
          </calcite-button>
        );
      }
    } else {
      return (
        <calcite-button appearance="outline-fill" width="full">
          Cancel
        </calcite-button>
      );
    }
  }

  render() {
    return (
      <div>
        <calcite-card class="download">{this.renderButton()}</calcite-card>
      </div>
    );
  }
}

export default Download;
