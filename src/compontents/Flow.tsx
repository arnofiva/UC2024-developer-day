import {
  property,
  subclass,
} from "@arcgis/core/core/accessorSupport/decorators";

import { tsx } from "@arcgis/core/widgets/support/widget";

import "@esri/calcite-components/dist/components/calcite-shell-panel";
import "@esri/calcite-components/dist/components/calcite-tile";
import "@esri/calcite-components/dist/components/calcite-tile-group";

import { ScreenType, UIActions } from "../interfaces";
import AppStore from "../stores/AppStore";
import { Widget } from "./Widget";

type FlowProperties = Pick<Flow, "store" | "uiActions">;

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

@subclass()
class Flow extends Widget<FlowProperties> {
  @property()
  store: AppStore;

  @property()
  uiActions: UIActions;

  postInitialize() {}

  render() {
    return (
      <div>
        <calcite-shell-panel
          id="bottomPanel"
          slot="panel-bottom"
          position="start"
        >
          <calcite-tile-group selection-mode="single-persist">
            {TILES.map((tile) => (
              <calcite-tile
                selected={
                  this.store.currentScreenStore?.type === tile.screenType
                }
                input-alignment="end"
                input-enabled="true"
                icon={tile.icon}
                heading={tile.heading}
                description={tile.description}
                onCalciteTileSelect={() => {
                  this.uiActions.selectScreen(tile.screenType);
                }}
              ></calcite-tile>
            ))}
          </calcite-tile-group>
        </calcite-shell-panel>
      </div>
    );
  }
}

export default Flow;
