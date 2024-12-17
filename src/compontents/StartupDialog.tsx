import { tsx } from "@arcgis/core/widgets/support/widget";

import "@esri/calcite-components/dist/components/calcite-button";
import "@esri/calcite-components/dist/components/calcite-dialog";
import "@esri/calcite-components/dist/components/calcite-notice";
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

const StartupDialog = ({ store }: { store: AppStore }) => {
  return (
    <calcite-dialog
      slot="dialogs"
      open
      modal
      escapeDisabled
      outsideCloseDisabled
      closeDisabled={!store.title}
      heading={store.title}
    >
      {store.loading === "done" ? (
        <calcite-notice open icon width="full">
          <div slot="message">App is ready to use!</div>
        </calcite-notice>
      ) : (
        <Loader store={store}></Loader>
      )}

      {/* <calcite-button slot="footer-start" kind="neutral">
        Back
      </calcite-button>
      <calcite-button slot="footer-end" appearance="outline">
        Cancel
      </calcite-button> */}
      <calcite-button slot="footer-end">Start</calcite-button>
    </calcite-dialog>
  );
};

export default StartupDialog;
