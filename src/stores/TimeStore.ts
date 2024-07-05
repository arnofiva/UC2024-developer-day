import TimeExtent from "@arcgis/core/TimeExtent";
import Accessor from "@arcgis/core/core/Accessor";
import {
  property,
  subclass,
} from "@arcgis/core/core/accessorSupport/decorators";
import { watch } from "@arcgis/core/core/reactiveUtils";
import SceneView from "@arcgis/core/views/SceneView";
import Expand from "@arcgis/core/widgets/Expand";
import TimeSlider from "@arcgis/core/widgets/TimeSlider";
import Time from "../compontents/Time";
import { ScreenType } from "../interfaces";

type TimeStoreProperties = Pick<TimeStore, "view" | "timeSliderConfig">;

@subclass("arcgis-core-template.TimeStore")
class TimeStore extends Accessor {
  readonly type = ScreenType.Time;

  @property({ constructOnly: true })
  view: SceneView;

  @property({ constructOnly: true })
  timeSlider: TimeSlider;

  @property({ constructOnly: true })
  timeSliderConfig: any;

  @property()
  enabled = false;

  @property()
  showTimeSlider = true;

  constructor(props: TimeStoreProperties) {
    super(props);

    const view = props.view;

    const timeDiv = document.createElement("div");
    timeDiv.classList.add("time-slider");

    const timeSliderConfig = props.timeSliderConfig;

    this.timeSlider = new TimeSlider({
      container: timeDiv,
      view,
      ...timeSliderConfig,
    });

    const updateTimeSlider = () => {
      if (this.enabled && this.showTimeSlider) {
        timeDiv.classList.remove("hide");
      } else {
        timeDiv.classList.add("hide");
      }
    };

    watch(
      () => this.enabled,
      (enabled) => {
        if (enabled) {
          view.timeExtent = new TimeExtent({
            start: new Date("2020-01-21"),
            end: new Date("2020-01-21"),
          });
        }
        updateTimeSlider();
      },
      { initial: true },
    );

    watch(() => this.showTimeSlider, updateTimeSlider);

    const time = new Time({
      store: this,
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
      (expanded) => (this.showTimeSlider = expanded),
      { initial: true },
    );

    view.ui.add(this.timeSlider, "manual");

    this.addHandles({
      remove: () => {
        view.ui.remove(timeExpand);
        view.ui.remove(this.timeSlider);
      },
    });
  }
}

export default TimeStore;
