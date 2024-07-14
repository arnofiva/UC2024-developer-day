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

const TICKS = [1150, 1300, 1500, 1700, 1900, 2050];

const STOPS = [
  1150, 1200, 1250, 1300, 1350, 1400, 1450, 1500, 1550, 1600, 1650, 1700, 1750,
  1800, 1850, 1900, 1950, 2000, 2024, 2050,
].map((year) => new Date(Date.UTC(year, 0)));

@subclass("arcgis-core-template.Time")
class Time extends Widget<TimeProperties> {
  @property()
  store: TimeStore;

  postInitialize() {}

  render() {
    return (
      <div>
        <TimeSlider
          container={ensureViewUIContainer("manual", "time-slider")}
          view={this.store.view}
          fullTimeExtent={{
            start: STOPS[0],
            end: STOPS[STOPS.length - 1],
          }}
          timeExtent={this.store.view.timeExtent}
          mode="instant"
          tickConfigs={[
            {
              mode: "position",
              values: TICKS.map((year) => Date.UTC(year, 0)),
              labelsVisible: true,
              labelFormatFunction: (value) => {
                const date = new Date(value);
                return `${date.getUTCFullYear()}`;
              },
              tickCreatedFunction: (_, tickElement, labelElement) => {
                tickElement.classList.add("year-ticks");
                labelElement?.classList.add("year-labels");
              },
            },
            {
              mode: "position",
              values: [Date.UTC(2024, 0)],
              labelsVisible: true,
              labelFormatFunction: () => {
                return "Present";
              },
            },
          ]}
          stops={{
            dates: STOPS,
          }}
        ></TimeSlider>
      </div>
    );
  }
}

export default Time;
