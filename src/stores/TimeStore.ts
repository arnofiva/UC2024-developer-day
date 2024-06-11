import TimeExtent from "@arcgis/core/TimeExtent";
import TimeInterval from "@arcgis/core/TimeInterval";
import Accessor from "@arcgis/core/core/Accessor";
import {
  property,
  subclass,
} from "@arcgis/core/core/accessorSupport/decorators";
import { watch } from "@arcgis/core/core/reactiveUtils";
import SceneView from "@arcgis/core/views/SceneView";
import TimeSlider from "@arcgis/core/widgets/TimeSlider";

type TimeStoreProperties = Pick<TimeStore, "view">;

@subclass("arcgis-core-template.TimeStore")
class TimeStore extends Accessor {
  @property({ constructOnly: true })
  view: SceneView;

  @property({ constructOnly: true })
  timeSlider: TimeSlider;

  @property()
  enabled = false;

  constructor(props: TimeStoreProperties) {
    super(props);

    const view = props.view;

    const timeDiv = document.createElement("div");
    timeDiv.classList.add("time-slider");

    this.timeSlider = new TimeSlider({
      container: timeDiv,
      view,
      mode: "instant",
      fullTimeExtent: {
        start: new Date("2019-01-21"),
        end: new Date("2031-01-21"),
      },
      timeExtent: {
        start: new Date("2028-01-21"),
        end: new Date("2028-01-21"),
      },
      stops: {
        interval: new TimeInterval({
          value: 1,
          unit: "years",
        }),
      },
    });

    watch(
      () => this.enabled,
      (enabled) => {
        if (enabled) {
          view.timeExtent = new TimeExtent({
            start: new Date("2020-01-21"),
            end: new Date("2020-01-21"),
          });
          timeDiv.classList.remove("hide");
        } else {
          timeDiv.classList.add("hide");
        }
      },
      { initial: true },
    );
  }
}

export default TimeStore;
