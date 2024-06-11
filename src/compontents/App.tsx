import {
  property,
  subclass,
} from "@arcgis/core/core/accessorSupport/decorators";

import { tsx } from "@arcgis/core/widgets/support/widget";

import { whenOnce } from "@arcgis/core/core/reactiveUtils";
import Expand from "@arcgis/core/widgets/Expand";
import Fullscreen from "@arcgis/core/widgets/Fullscreen";
import AppStore from "../stores/AppStore";
import Download from "./Download";
import Header from "./Header";
import Time from "./Time";
import { Widget } from "./Widget";

type AppProperties = Pick<App, "store">;

@subclass("arcgis-core-template.App")
class App extends Widget<AppProperties> {
  @property()
  store: AppStore;

  postInitialize(): void {
    const view = this.store.view;
    const fullscreen = new Fullscreen({ view });
    view.ui.add(fullscreen, "top-left");

    const time = new Time({
      store: this.store.timeStore,
    });

    view.ui.add(
      new Expand({
        view,
        content: time,
        group: "top-right",
        expanded: true,
      }),
      "top-right",
    );

    view.ui.add(this.store.timeStore.timeSlider, "manual");

    whenOnce(() => this.store.downloadStore).then((store) => {
      const download = new Download({
        store,
      });

      view.ui.add(
        new Expand({
          view,
          content: download,
          group: "top-right",
        }),
        "top-right",
      );
    });
  }

  render() {
    return (
      <div>
        <Header store={this.store}></Header>
      </div>
    );
  }
}

export default App;
