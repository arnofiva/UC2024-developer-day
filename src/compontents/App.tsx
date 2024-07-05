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
import SceneView from "@arcgis/core/views/SceneView";
import Expand from "@arcgis/core/widgets/Expand";
import LayerList from "@arcgis/core/widgets/LayerList";
import "@esri/calcite-components/dist/components/calcite-shell";
import { ScreenType, UIActions } from "../interfaces";
import DownloadStore from "../stores/DownloadStore";
import TimeStore from "../stores/TimeStore";

type AppProperties = Pick<App, "store">;

@subclass("arcgis-core-template.App")
class App extends Widget<AppProperties> implements UIActions {
  @property()
  store: AppStore;

  @property()
  view: SceneView;

  postInitialize(): void {
    whenOnce(() => this.view).then((view) => {
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

  private bindView(container: HTMLDivElement) {
    requestAnimationFrame(() => {
      this.view = new SceneView({
        container,
        map: this.store.map,
      });

      this.view.popupEnabled = false;
      (window as any)["view"] = this.view;
    });
  }

  render() {
    return (
      <div>
        <calcite-shell>
          <Header view={this.view} store={this.store}></Header>

          <div id="viewDiv" afterCreate={(e: any) => this.bindView(e)}></div>

          <Flow uiActions={this} store={this.store}></Flow>
        </calcite-shell>
      </div>
    );
  }

  private async createScreen(screen: ScreenType) {
    const view = this.view;
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
        return new DownloadStore({ view, buildingsLayerView });
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
