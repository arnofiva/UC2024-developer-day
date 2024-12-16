import { tsx } from "@arcgis/core/widgets/support/widget";

import "@esri/calcite-components/dist/components/calcite-shell-panel";
import "@esri/calcite-components/dist/components/calcite-tile";
import "@esri/calcite-components/dist/components/calcite-tile-group";

import { ScreenType } from "../interfaces";
import AppStore from "../stores/AppStore";

const TILES = [
  {
    screenType: ScreenType.Time,
    icon: "clock",
    heading: "Filter by time",
    description: "Visualize past and future development",
  },
  {
    screenType: ScreenType.Download,
    icon: "download",
    heading: "Export 3D context",
    description: "Download buildings and terrain",
  },
  {
    screenType: ScreenType.Upload,
    icon: "upload",
    heading: "Upload new building",
    description: "Provide a new design proposal",
  },
  {
    screenType: ScreenType.Realistic,
    icon: "show-multiple-layers-at-a-time",
    heading: "Realistic visualization",
    description: "Using 3D Tiles or I3S integrated mesh",
  },
  {
    screenType: ScreenType.Viewshed,
    icon: "viewshed",
    heading: "Viewshed analysis",
    description: "Evaluate visible areas",
  },
];

const AppMenu = ({ store }: { store: AppStore }) => {
  return (
    <calcite-shell-panel
      id="bottomPanel"
      slot="footer"
      position="start"
      layout="horizontal"
    >
      <calcite-tile-group selection-mode="single-persist">
        {TILES.map((tile) => (
          <calcite-tile
            selected={store.currentScreenStore?.type === tile.screenType}
            input-alignment="end"
            input-enabled="true"
            icon={tile.icon}
            heading={tile.heading}
            description={tile.description}
            onCalciteTileSelect={() => {
              store.selectScreen(tile.screenType);
            }}
          ></calcite-tile>
        ))}
      </calcite-tile-group>
    </calcite-shell-panel>
  );
};

export default AppMenu;
