import {
  property,
  subclass,
} from "@arcgis/core/core/accessorSupport/decorators";

import { tsx } from "@arcgis/core/widgets/support/widget";

import AppStore from "../stores/AppStore";
import Flow from "./Flow";
import Navigation from "./Navigation";
import { Widget } from "./Widget";

import { debounce } from "@arcgis/core/core/promiseUtils";
import SceneLayer from "@arcgis/core/layers/SceneLayer";
import { getTimeSliderSettingsFromWebDocument } from "@arcgis/core/support/timeUtils";
import "@esri/calcite-components/dist/components/calcite-panel";
import "@esri/calcite-components/dist/components/calcite-shell";
import "@esri/calcite-components/dist/components/calcite-shell-panel";
import { ScreenType, UIActions } from "../interfaces";
import DownloadStore from "../stores/DownloadStore";
import RealisticStore from "../stores/RealisticStore";
import TimeStore from "../stores/TimeStore";
import UploadStore from "../stores/UploadStore";
import ViewshedStore from "../stores/ViewshedStore";
import { setViewUI } from "../utils";
import Splash from "./Splash";

import { ArcgisSceneCustomEvent } from "@arcgis/map-components";
import "@arcgis/map-components/dist/components/arcgis-compass";
import "@arcgis/map-components/dist/components/arcgis-navigation-toggle";
import "@arcgis/map-components/dist/components/arcgis-scene";
import "@arcgis/map-components/dist/components/arcgis-zoom";
import AppScreen from "./AppScreen";

type AppProperties = Pick<App, "store">;

@subclass()
class App extends Widget<AppProperties> implements UIActions {
  @property()
  store: AppStore;

  private bindView(arcgisScene: HTMLArcgisSceneElement) {
    const view = arcgisScene.view;
    this.store.sceneStore.view = view;
    view.popupEnabled = false;
    setViewUI(view.ui);
    (window as any)["view"] = view;
  }

  render() {
    return (
      <div>
        <calcite-shell>
          <Splash store={this.store}></Splash>
          <Navigation store={this.store}></Navigation>

          <AppScreen store={this.store}></AppScreen>

          <arcgis-scene
            item-id={this.store.webSceneId}
            onArcgisViewReadyChange={(e: ArcgisSceneCustomEvent<void>) =>
              this.bindView(e.target)
            }
          >
            <arcgis-zoom position="top-left"></arcgis-zoom>
            <arcgis-navigation-toggle position="top-left"></arcgis-navigation-toggle>
            <arcgis-compass position="top-left"></arcgis-compass>
          </arcgis-scene>

          <Flow uiActions={this} store={this.store}></Flow>
        </calcite-shell>
      </div>
    );
  }

  private async createScreen(screen: ScreenType) {
    const view = this.store.sceneStore.view;
    const map = this.store.sceneStore.map;

    if (!view || !map) {
      throw new Error();
    }

    switch (screen) {
      case ScreenType.Time:
        const timeSliderConfig =
          await getTimeSliderSettingsFromWebDocument(map);

        return new TimeStore({ view, timeSliderConfig });
      case ScreenType.Download:
        const buildingsLayer = map.findLayerById(
          "190697a6c61-layer-314",
        ) as SceneLayer;

        const buildingsLayerView = await view.whenLayerView(buildingsLayer);
        return new DownloadStore({ appStore: this.store, buildingsLayerView });
      case ScreenType.Upload:
        return new UploadStore({ appStore: this.store });
      case ScreenType.Realistic:
        return new RealisticStore({ view });
      case ScreenType.Viewshed:
        return new ViewshedStore({ view });
      default:
        throw new Error();
    }
  }

  selectScreen = debounce(async (screenType: ScreenType) => {
    if (this.store.currentScreenStore?.type === screenType) {
      return;
    }

    const screen = await this.createScreen(screenType);
    this.store.currentScreenStore = screen;
  });
}

export default App;
