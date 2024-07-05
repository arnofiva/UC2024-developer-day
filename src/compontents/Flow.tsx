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
    heading: "Change over time",
    description: "Visualize past and future development",
  },
  {
    screenType: ScreenType.Download,
    icon: "download",
    heading: "Export buildings",
    description: "Download existing system of record...",
  },
  {
    screenType: ScreenType.Upload,
    icon: "upload",
    heading: "Upload new design",
    description: "New 3D model....",
  },
  {
    screenType: ScreenType.Realistic,
    icon: "show-multiple-layers-at-a-time",
    heading: "Realistic visualization",
    description: "...",
  },
  {
    screenType: ScreenType.Viewshed,
    icon: "viewshed",
    heading: "Visbility Analysis",
    description: "...",
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
