import { tsx } from "@arcgis/core/widgets/support/widget";

import "@esri/calcite-components/dist/components/calcite-shell-panel";

import "@arcgis/map-components/dist/components/arcgis-editor";

import UploadStore from "../stores/UploadStore";

const UploadScreen = ({ store }: { store: UploadStore }) => {
  const appendEditor = (element: HTMLElement) => {
    store.initializeEditor(element);
  };

  return (
    <calcite-shell-panel
      key="upload-screen"
      slot="panel-end"
      display-mode="float"
      afterCreate={appendEditor}
    ></calcite-shell-panel>
  );
};

export default UploadScreen;
