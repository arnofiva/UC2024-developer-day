import {
  property,
  subclass,
} from "@arcgis/core/core/accessorSupport/decorators";

import { tsx } from "@arcgis/core/widgets/support/widget";

import "@esri/calcite-components/dist/components/calcite-card";
import "@esri/calcite-components/dist/components/calcite-label";
import "@esri/calcite-components/dist/components/calcite-switch";

import { createToggle } from "../snippet";
import DownloadStore from "../stores/DownloadStore";
import { Widget } from "./Widget";

type DownloadProperties = Pick<Download, "store">;

const snippetToggle = createToggle("downloadCodeSnippet");

const stickyNote = document.getElementById("stickyNote");
let stickyNoteShown = false;

window.onkeydown = (e: KeyboardEvent) => {
  if (e.key === "c") {
    snippetToggle();
  } else if (e.key === " ") {
    if (stickyNoteShown) {
      stickyNote?.classList.add("hide");
    } else {
      stickyNote?.classList.remove("hide");
    }
    stickyNoteShown = !stickyNoteShown;
    e.stopImmediatePropagation();
  }
};

@subclass("arcgis-core-template.Download")
class Download extends Widget<DownloadProperties> {
  @property()
  store: DownloadStore;

  postInitialize() {}

  render() {
    return (
      <div>
        <calcite-card id="download">
          <calcite-button id="createButton" onclick={() => this.store.start()}>
            Select download extent
          </calcite-button>
          <calcite-button id="cancelButton" style="display:none">
            Cancel
          </calcite-button>
        </calcite-card>
      </div>
    );
  }
}

export default Download;
