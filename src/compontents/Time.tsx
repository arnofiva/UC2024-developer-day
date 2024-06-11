import {
  property,
  subclass,
} from "@arcgis/core/core/accessorSupport/decorators";

import { tsx } from "@arcgis/core/widgets/support/widget";

import "@esri/calcite-components/dist/components/calcite-card";
import "@esri/calcite-components/dist/components/calcite-label";
import "@esri/calcite-components/dist/components/calcite-switch";

import TimeStore from "../stores/TimeStore";
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
        <calcite-card id="temporal-filter">
          <span id="time-period" slot="description">
            {activePeriod}
          </span>
          <calcite-label slot="heading" layout="inline">
            <calcite-switch
              id="temporal-filter-switch"
              checked={this.store.enabled}
              onCalciteSwitchChange={() =>
                (this.store.enabled = !this.store.enabled)
              }
            ></calcite-switch>{" "}
            Temporal filter
          </calcite-label>
        </calcite-card>
      </div>
    );
  }
}

export default Time;
