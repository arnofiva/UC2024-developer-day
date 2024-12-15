import {
  property,
  subclass,
} from "@arcgis/core/core/accessorSupport/decorators";

import { tsx } from "@arcgis/core/widgets/support/widget";

import "@esri/calcite-components/dist/components/calcite-card";
import "@esri/calcite-components/dist/components/calcite-label";
import "@esri/calcite-components/dist/components/calcite-switch";

import ViewshedStore from "../stores/ViewshedStore";
import { Widget } from "./Widget";

type ViewshedProperties = Pick<Viewshed, "store">;

@subclass()
class Viewshed extends Widget<ViewshedProperties> {
  @property()
  store: ViewshedStore;

  postInitialize() {
    const view = this.store.view;

    this.addHandles([
      view.on("key-down", (event) => {
        if ((event.key = "Escape")) {
          this.store.stopCreating();
        }
      }),
    ]);
  }

  renderButton() {
    if (this.store.state === "idle") {
      return (
        <calcite-button id="createButton" onclick={() => this.store.create()}>
          Create viewshed
        </calcite-button>
      );
    } else {
      return (
        <calcite-button
          id="cancelButton"
          onclick={() => this.store.stopCreating()}
        >
          Cancel
        </calcite-button>
      );
    }
  }

  render() {
    return (
      <div>
        <calcite-card id="viewshedComponent">
          {this.renderButton()}
        </calcite-card>
      </div>
    );
  }
}

export default Viewshed;
