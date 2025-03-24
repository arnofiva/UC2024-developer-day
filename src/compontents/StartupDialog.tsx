import { tsx } from "@arcgis/core/widgets/support/widget";

import WebScene from "@arcgis/core/WebScene";
import "@esri/calcite-components/dist/components/calcite-button";
import "@esri/calcite-components/dist/components/calcite-checkbox";
import "@esri/calcite-components/dist/components/calcite-dialog";
import "@esri/calcite-components/dist/components/calcite-label";
import AppStore from "../stores/AppStore";

const Loader = ({ store }: { store: AppStore }) => {
  switch (store.loading) {
    case "scene":
      return <calcite-loader text="Loading scene..."></calcite-loader>;
    case "delete-models":
      return (
        <calcite-loader text="Delete previous uploads..."></calcite-loader>
      );
    case "preload-slides":
      return <calcite-loader text="Preload viewpoints"></calcite-loader>;
    default:
      return [];
  }
};

const Description = ({ webScene }: { webScene: WebScene }) => {
  const bind = (div: HTMLDivElement) => {
    const description = webScene.portalItem?.description;
    if (description) {
      div.innerHTML = description;
    }
  };

  return <div afterCreate={bind}></div>;
};

const StartupDialog = ({ store }: { store: AppStore }) => {
  const loading = store.loading !== "done";

  return (
    <calcite-dialog
      slot="dialogs"
      open={store.isStartupDialogShown}
      modal
      escapeDisabled
      outsideCloseDisabled
      closeDisabled={loading}
      heading={loading ? null : store.title}
      onCalciteDialogClose={() => (store.isStartupDialogShown = false)}
    >
      <div class="startup-dialog-content">
        {loading ? (
          <Loader store={store}></Loader>
        ) : (
          <Description webScene={store.sceneStore.map}></Description>
        )}
      </div>

      {loading
        ? []
        : [
            <calcite-label slot="footer-end" layout="inline-space-between">
              <calcite-checkbox
                checked={store.skipStartupDialog}
                disabled={loading}
                onCalciteCheckboxChange={() => {
                  store.skipStartupDialog = !store.skipStartupDialog;
                }}
              ></calcite-checkbox>
              Hide on startup
            </calcite-label>,
            <calcite-button
              disabled={loading}
              slot="footer-end"
              onclick={() => {
                store.isStartupDialogShown = false;
              }}
            >
              Close
            </calcite-button>,
          ]}
    </calcite-dialog>
  );
};

export default StartupDialog;
