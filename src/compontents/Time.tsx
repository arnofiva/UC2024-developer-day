import {
  property,
  subclass,
} from "@arcgis/core/core/accessorSupport/decorators";

import { tsx } from "@arcgis/core/widgets/support/widget";

import "@esri/calcite-components/dist/components/calcite-card";
import "@esri/calcite-components/dist/components/calcite-label";
import "@esri/calcite-components/dist/components/calcite-switch";

import TimeSlider from "@arcgis/core/widgets/TimeSlider";
import TimeStore from "../stores/TimeStore";
import { ensureViewUIContainer } from "../utils";
import { Widget } from "./Widget";

type TimeProperties = Pick<Time, "store">;

const SPEED_FACTORS = [0.1, 0.2, 0.5, 1, 2, 3, 5];

@subclass("arcgis-core-template.Time")
class Time extends Widget<TimeProperties> {
  @property()
  store: TimeStore;

  postInitialize() {}

  render() {
    const timeExtent = this.store.view.timeExtent;
    const { fullTimeExtent, loop, mode, playRate, stops } =
      this.store.timeSliderConfig;

    const infoTextElement = document.getElementById("time-period");
    let activePeriod = "No Time Filtering";
    if (timeExtent?.start) {
      activePeriod = "Current/Past Time";
      if (timeExtent.start >= new Date("2030-01-21")) {
        activePeriod = "Future Time (Near Term)";
      } else if (timeExtent.start >= new Date("2028-01-21")) {
        activePeriod = "Future Time (Medium Term)";
      }
    }

    return (
      <div>
        <TimeSlider
          container={ensureViewUIContainer("manual", "time-slider")}
          view={this.store.view}
          fullTimeExtent={fullTimeExtent}
          timeExtent={timeExtent}
          loop={loop}
          mode={mode}
          playRate={playRate}
          stops={stops}
        ></TimeSlider>
      </div>
    );
  }
}

export default Time;
