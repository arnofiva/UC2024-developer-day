import {
  property,
  subclass,
} from "@arcgis/core/core/accessorSupport/decorators";

import { tsx } from "@arcgis/core/widgets/support/widget";

import Fullscreen from "@arcgis/core/widgets/Fullscreen";
import AppStore from "../stores/AppStore";
import Flow from "./Flow";
import Header from "./Header";
import { Widget } from "./Widget";

import { debounce } from "@arcgis/core/core/promiseUtils";
import { whenOnce } from "@arcgis/core/core/reactiveUtils";
import SceneLayer from "@arcgis/core/layers/SceneLayer";
import { getTimeSliderSettingsFromWebDocument } from "@arcgis/core/support/timeUtils";
import Expand from "@arcgis/core/widgets/Expand";
import LayerList from "@arcgis/core/widgets/LayerList";
import "@esri/calcite-components/dist/components/calcite-shell";
import { ScreenType, UIActions } from "../interfaces";
import DownloadStore from "../stores/DownloadStore";
import RealisticStore from "../stores/RealisticStore";
import TimeStore from "../stores/TimeStore";
import UploadStore from "../stores/UploadStore";
import ViewshedStore from "../stores/ViewshedStore";
import { ensureViewUIContainer } from "../utils";
import Download from "./Download";
import Time from "./Time";
import Upload from "./Upload";
import Viewshed from "./Viewshed";

type AppProperties = Pick<App, "store">;

@subclass("arcgis-core-template.App")
class App extends Widget<AppProperties> implements UIActions {
  @property()
  store: AppStore;

  postInitialize(): void {
    whenOnce(() => this.store.view).then((view) => {
      const fullscreen = new Fullscreen({ view });
      view.ui.add(fullscreen, "top-left");

      view.ui.add(
        new Expand({
          view,
          content: new LayerList({ view }),
        }),
        "bottom-right",
      );
    });
  }

  private bindView(element: HTMLDivElement) {
    element.appendChild(this.store.view.container);
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

  private loaderText() {
    switch (this.store.loading) {
      case "scene":
        return "Loading scene...";
      case "delete-models":
        return "Delete previous uploads...";
      case "preload-slides":
        return "Preload viewpoints";
    }
  }

  private renderLoader() {
    if (this.store.loading !== "done") {
      return (
        <calcite-scrim class={this.store.loading ? "loader" : "hide"}>
          <calcite-loader text={this.loaderText()}></calcite-loader>
        </calcite-scrim>
      );
    }
  }

  render() {
    return (
      <div>
        <calcite-shell>
          <Header view={this.store.view} store={this.store}></Header>

          <div id="content" afterCreate={(e: any) => this.bindView(e)}>
            {this.renderLoader()}
            <div id="screen">{this.renderScreen()}</div>
          </div>

          <Flow uiActions={this} store={this.store}></Flow>
        </calcite-shell>
      </div>
    );
  }

  private async createScreen(screen: ScreenType) {
    const view = this.store.view;
    const map = this.store.map;

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
