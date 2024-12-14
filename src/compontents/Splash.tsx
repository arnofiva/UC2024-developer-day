import { tsx } from "@arcgis/core/widgets/support/widget";

import "@esri/calcite-components/dist/components/calcite-button";
import "@esri/calcite-components/dist/components/calcite-dialog";
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

const Splash = ({ store }: { store: AppStore }) => {
  return (
    <calcite-dialog
      open
      modal
      escapeDisabled
      outsideCloseDisabled
      heading={store.title}
    >
      <calcite-notice open icon width="full">
        <div slot="message">
          You can edit this choice later on, in Settings.
        </div>
      </calcite-notice>

      <Loader store={store}></Loader>

      <calcite-button slot="footer-start" kind="neutral">
        Back
      </calcite-button>
      <calcite-button slot="footer-end" appearance="outline">
        Cancel
      </calcite-button>
      <calcite-button slot="footer-end">Save</calcite-button>
    </calcite-dialog>
  );
};

export default Splash;
