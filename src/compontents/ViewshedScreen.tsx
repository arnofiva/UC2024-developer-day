import { tsx } from "@arcgis/core/widgets/support/widget";

import "@esri/calcite-components/dist/components/calcite-button";
import "@esri/calcite-components/dist/components/calcite-panel";
import "@esri/calcite-components/dist/components/calcite-shell-panel";

import ViewshedStore from "../stores/ViewshedStore";

const ViewshedScreen = ({ store }: { store: ViewshedStore }) => {
  return (
    <calcite-shell-panel
      key="viewshed-screen"
      slot="panel-end"
      display-mode="float"
    >
      <calcite-panel>
        {store.state === "idle" ? (
          <calcite-button
            key="viewshed-create"
            slot="footer"
            width="full"
            onclick={() => store.create()}
          >
            Create viewshed
          </calcite-button>
        ) : (
          <calcite-button
            key="viewshed-cancel"
            slot="footer"
            width="full"
            appearance="outline-fill"
            onclick={() => store.stopCreating()}
          >
            Cancel
          </calcite-button>
        )}
      </calcite-panel>
    </calcite-shell-panel>
  );
};

export default ViewshedScreen;
