import {
  property,
  subclass,
} from "@arcgis/core/core/accessorSupport/decorators";

import { tsx } from "@arcgis/core/widgets/support/widget";

import AppStore from "../stores/AppStore";
import { Widget } from "./Widget";

import "@esri/calcite-components/dist/components/calcite-panel";
import "@esri/calcite-components/dist/components/calcite-shell";
import "@esri/calcite-components/dist/components/calcite-shell-panel";

import { ArcgisSceneCustomEvent } from "@arcgis/map-components";
import "@arcgis/map-components/dist/components/arcgis-compass";
import "@arcgis/map-components/dist/components/arcgis-navigation-toggle";
import "@arcgis/map-components/dist/components/arcgis-scene";
import "@arcgis/map-components/dist/components/arcgis-zoom";
import AppMenu from "./AppMenu";
import AppScreen from "./AppScreen";
import NavigationBar from "./NavigationBar";
import StartupDialog from "./StartupDialog";

type AppProperties = Pick<App, "store">;

@subclass()
class App extends Widget<AppProperties> {
  @property()
  store: AppStore;

  private bindView(arcgisScene: HTMLArcgisSceneElement) {
    const view = arcgisScene.view;
    this.store.sceneStore.view = view;
    view.popupEnabled = false;
  }

  render() {
    return (
      <div>
        <calcite-shell>
          <StartupDialog store={this.store}></StartupDialog>
          <NavigationBar store={this.store}></NavigationBar>

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

          <AppMenu store={this.store}></AppMenu>
        </calcite-shell>
      </div>
    );
  }
}

export default App;
