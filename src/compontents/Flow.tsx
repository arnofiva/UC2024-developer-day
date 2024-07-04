import {
  property,
  subclass,
} from "@arcgis/core/core/accessorSupport/decorators";

import { tsx } from "@arcgis/core/widgets/support/widget";

import "@esri/calcite-components/dist/components/calcite-shell-panel";
import "@esri/calcite-components/dist/components/calcite-tile";
import "@esri/calcite-components/dist/components/calcite-tile-group";

import AppStore from "../stores/AppStore";
import { Widget } from "./Widget";

type FlowProperties = Pick<Flow, "store">;

@subclass()
class Flow extends Widget<FlowProperties> {
  @property()
  store: AppStore;

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
            <calcite-tile
              selected="true"
              input-alignment="end"
              input-enabled="true"
              icon="clock"
              heading="Change over time"
              description="Visualize past and future development"
            ></calcite-tile>
            <calcite-tile
              input-alignment="end"
              input-enabled="true"
              icon="download"
              heading="Export buildings"
              description="Download existing system of record..."
            ></calcite-tile>
            <calcite-tile
              input-alignment="end"
              input-enabled="true"
              disabled="true"
              icon="upload"
              heading="Upload new design"
              description="New 3D model...."
            ></calcite-tile>
            <calcite-tile
              input-alignment="end"
              input-enabled="true"
              disabled="true"
              icon="show-multiple-layers-at-a-time"
              heading="Realistic visualization"
              description="..."
            ></calcite-tile>
            <calcite-tile
              input-alignment="end"
              input-enabled="true"
              disabled="true"
              icon="viewshed"
              heading="Visbility Analysis"
              description="..."
            ></calcite-tile>
          </calcite-tile-group>
        </calcite-shell-panel>
      </div>
    );
  }
}

export default Flow;
