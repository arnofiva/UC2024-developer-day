import AppStore from "../stores/AppStore";

import { tsx } from "@arcgis/core/widgets/support/widget";

import "@esri/calcite-components/dist/components/calcite-shell";
import { ScreenType } from "../interfaces";
import DownloadScreen from "./DownloadScreen";
import TimeScreen from "./TimeScreen";
import UploadScreen from "./UploadScreen";
import Viewshed from "./ViewshedScreen";

function renderScreen(store: AppStore) {
  const screenStore = store.currentScreenStore;
  switch (screenStore?.type) {
    case ScreenType.Time:
      return <TimeScreen store={screenStore}></TimeScreen>;
    case ScreenType.Download:
      return <DownloadScreen store={screenStore}></DownloadScreen>;
    case ScreenType.Upload:
      return <UploadScreen store={screenStore}></UploadScreen>;
    case ScreenType.Viewshed:
      return <Viewshed store={screenStore}></Viewshed>;
  }
}

const AppScreen = ({ store }: { store: AppStore }) => {
  return (
    <calcite-shell id="screen" content-behind="true">
      {renderScreen(store)}
    </calcite-shell>
  );
};

export default AppScreen;
