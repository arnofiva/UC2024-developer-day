import {
  property,
  subclass,
} from "@arcgis/core/core/accessorSupport/decorators";

import { tsx } from "@arcgis/core/widgets/support/widget";

import AppStore from "../stores/AppStore";
import Flow from "./Flow";
import { Widget } from "./Widget";

import { debounce } from "@arcgis/core/core/promiseUtils";
import SceneLayer from "@arcgis/core/layers/SceneLayer";
import { getTimeSliderSettingsFromWebDocument } from "@arcgis/core/support/timeUtils";
import "@esri/calcite-components/dist/components/calcite-shell";
import "@esri/calcite-components/dist/components/calcite-shell-panel";
import { ScreenType, UIActions } from "../interfaces";
import DownloadStore from "../stores/DownloadStore";
import RealisticStore from "../stores/RealisticStore";
import TimeStore from "../stores/TimeStore";
import UploadStore from "../stores/UploadStore";
import ViewshedStore from "../stores/ViewshedStore";
import { ensureViewUIContainer, setViewUI } from "../utils";
import Download from "./Download";
import Splash from "./Splash";
import Time from "./Time";
import Upload from "./Upload";
import Viewshed from "./Viewshed";

import { ArcgisSceneCustomEvent } from "@arcgis/map-components";
import "@arcgis/map-components/dist/components/arcgis-expand";
import "@arcgis/map-components/dist/components/arcgis-fullscreen";
import "@arcgis/map-components/dist/components/arcgis-layer-list";
import "@arcgis/map-components/dist/components/arcgis-placement";
import "@arcgis/map-components/dist/components/arcgis-scene";
import Navigation from "./Navigation";

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

  private renderScreen() {
    const screenStore = this.store.currentScreenStore;
    switch (screenStore?.type) {
      case ScreenType.Time:
        return <Time store={screenStore}></Time>;
      case ScreenType.Download:
        return (
          <Download
            store={screenStore}
            container={ensureViewUIContainer("top-right", "download")}
          ></Download>
        );
      case ScreenType.Upload:
        return <Upload store={screenStore}></Upload>;
      case ScreenType.Viewshed:
        return (
          <Viewshed
            store={screenStore}
            container={ensureViewUIContainer("top-right", "viewshed")}
          ></Viewshed>
        );
    }
  }

  render() {
    return (
      <div>
        <Splash store={this.store}></Splash>
        <calcite-shell>
          <Navigation store={this.store}></Navigation>

          <calcite-panel>
            <arcgis-scene
              item-id={this.store.webSceneId}
              onArcgisViewReadyChange={(e: ArcgisSceneCustomEvent<void>) =>
                this.bindView(e.target)
              }
            >
              <arcgis-placement position="top-left">
                <arcgis-Fullscreen></arcgis-Fullscreen>
              </arcgis-placement>
              <arcgis-placement position="top-right">
                <arcgis-expand>
                  <arcgis-layer-list></arcgis-layer-list>
                </arcgis-expand>
              </arcgis-placement>
            </arcgis-scene>
          </calcite-panel>

          <div id="content">
            <div id="screen">{this.renderScreen()}</div>
          </div>

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
