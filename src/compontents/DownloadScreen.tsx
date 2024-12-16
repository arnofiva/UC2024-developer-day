import { tsx } from "@arcgis/core/widgets/support/widget";

import "@esri/calcite-components/dist/components/calcite-block";
import "@esri/calcite-components/dist/components/calcite-button";
import "@esri/calcite-components/dist/components/calcite-card";
import "@esri/calcite-components/dist/components/calcite-icon";
import "@esri/calcite-components/dist/components/calcite-label";
import "@esri/calcite-components/dist/components/calcite-panel";
import "@esri/calcite-components/dist/components/calcite-shell-panel";
import "@esri/calcite-components/dist/components/calcite-switch";

import DownloadStore from "../stores/DownloadStore";

const DownloadScreen = ({ store }: { store: DownloadStore }) => {
  return (
    <calcite-shell-panel
      key="download-screen"
      slot="panel-end"
      display-mode="float"
    >
      <calcite-panel heading="Export context">
        <DownloadPanel store={store}></DownloadPanel>
      </calcite-panel>
    </calcite-shell-panel>
  );
};

const DownloadPanel = ({ store }: { store: DownloadStore }) => {
  if (store.tool.state === "idle") {
    if (store.area) {
      return [
        <calcite-block open>
          <calcite-label layout="inline">
            <calcite-icon icon="urban-model" scale="m"></calcite-icon>
            Selected features: 28
          </calcite-label>
        </calcite-block>,
        <calcite-button
          key="download-button"
          slot="footer"
          icon-start="download"
          width="full"
          appearance="solid"
          href="./model.glb"
          download="model.glb"
        >
          Download
        </calcite-button>,
      ];
    } else {
      return (
        <calcite-button
          key="select-button"
          slot="footer"
          onclick={() => store.start()}
          width="full"
        >
          Select download extent
        </calcite-button>
      );
    }
  } else {
    return (
      <calcite-button
        key="cancel-button"
        slot="footer"
        appearance="outline-fill"
        width="full"
      >
        Cancel
      </calcite-button>
    );
  }
};

export default DownloadScreen;
