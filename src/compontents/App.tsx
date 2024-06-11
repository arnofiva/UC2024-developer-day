import {
  property,
  subclass,
} from "@arcgis/core/core/accessorSupport/decorators";

import { tsx } from "@arcgis/core/widgets/support/widget";

import { watch, whenOnce } from "@arcgis/core/core/reactiveUtils";
import FeatureFilter from "@arcgis/core/layers/support/FeatureFilter";
import Editor from "@arcgis/core/widgets/Editor";
import Expand from "@arcgis/core/widgets/Expand";
import Fullscreen from "@arcgis/core/widgets/Fullscreen";
import AppStore from "../stores/AppStore";
import Download from "./Download";
import Header from "./Header";
import Time from "./Time";
import Viewshed from "./Viewshed";
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

    const timeExpand = new Expand({
      view,
      content: time,
      group: "top-right",
      expanded: true,
      expandIcon: time.store.timeSlider.icon,
    });

    view.ui.add(timeExpand, "top-right");

    watch(
      () => timeExpand.expanded,
      (expanded) => (this.store.timeStore.showTimeSlider = expanded),
      { initial: true },
    );

    view.ui.add(this.store.timeStore.timeSlider, "manual");

    whenOnce(() => this.store.downloadStore).then((store) => {
      const download = new Download({
        store,
      });

      const downloadExpand = new Expand({
        view,
        content: download,
        group: "top-right",
        expandIcon: "download",
      });
      view.ui.add(downloadExpand, "top-right");

      watch(
        () => downloadExpand.expanded,
        (expanded) => {
          if (expanded) {
            store.highlightArea();
          } else {
            store.removeHighlight();
          }
        },
      );

      const editorExpand = new Expand({
        view,
        content: new Editor({
          view,
        }),
        group: "top-right",
      });

      view.ui.add(editorExpand, "top-right");

      watch(
        () => editorExpand.expanded,
        (expanded) => {
          const geometry = store.area;

          if (expanded && geometry) {
            store.buildingsLayerView.filter = new FeatureFilter({
              geometry,
              spatialRelationship: "disjoint",
            });
          } else {
            // store.buildingsLayerView.filter = null as any;
          }
        },
      );

      const viewshedExpand = new Expand({
        view,
        content: new Viewshed({
          store: this.store.viewshedStore,
        }),
        expandIcon: "viewshed",
        // expandIcon: "measure-building-height-shadow",
        group: "top-right",
      });

      view.ui.add(viewshedExpand, "top-right");
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
