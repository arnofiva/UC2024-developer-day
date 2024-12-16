import { tsx } from "@arcgis/core/widgets/support/widget";

import "@esri/calcite-components/dist/components/calcite-card";
import "@esri/calcite-components/dist/components/calcite-label";
import "@esri/calcite-components/dist/components/calcite-panel";
import "@esri/calcite-components/dist/components/calcite-shell";
import "@esri/calcite-components/dist/components/calcite-shell-panel";
import "@esri/calcite-components/dist/components/calcite-switch";

import "@arcgis/map-components/dist/components/arcgis-time-slider";

import TimeStore from "../stores/TimeStore";

const TICKS = [1150, 1300, 1500, 1700, 1900, 2050];

const STOPS = [
  1150, 1200, 1250, 1300, 1350, 1400, 1450, 1500, 1550, 1600, 1650, 1700, 1750,
  1800, 1850, 1900, 1950, 2000, 2024, 2050,
].map((year) => new Date(Date.UTC(year, 0)));

const TimeScreen = ({ store }: { store: TimeStore }) => {
  return [
    <calcite-shell-panel
      key="time-padding-left"
      slot="panel-start"
      width-scale="s"
      display-mode="float"
    ></calcite-shell-panel>,
    <calcite-shell-panel
      key="time-padding-right"
      slot="panel-end"
      width-scale="s"
      display-mode="float"
    ></calcite-shell-panel>,
    <calcite-shell-panel
      key="time-screen"
      slot="panel-bottom"
      layout="horizontal"
      display-mode="float"
    >
      <arcgis-time-slider
        view={store.view}
        fullTimeExtent={{
          start: STOPS[0],
          end: STOPS[STOPS.length - 1],
        }}
        timeExtent={store.view.timeExtent}
        mode="instant"
        tickConfigs={[
          {
            mode: "position",
            values: TICKS.map((year) => Date.UTC(year, 0)),
            labelsVisible: true,
            labelFormatFunction: (value: number) => {
              const date = new Date(value);
              return `${date.getUTCFullYear()}`;
            },
            tickCreatedFunction: (
              _: any,
              tickElement: HTMLElement,
              labelElement?: HTMLElement,
            ) => {
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
      ></arcgis-time-slider>
    </calcite-shell-panel>,
  ];
};

export default TimeScreen;
