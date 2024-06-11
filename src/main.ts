import WebScene from "@arcgis/core/WebScene";
import * as kernel from "@arcgis/core/kernel";
import SceneView from "@arcgis/core/views/SceneView";
import "@esri/calcite-components/dist/calcite/calcite.css";
import App from "./compontents/App";
import AppStore from "./stores/AppStore";

console.log(`Using ArcGIS Maps SDK for JavaScript v${kernel.fullVersion}`);

// setAssetPath("https://js.arcgis.com/calcite-components/1.0.0-beta.77/assets");

const params = new URLSearchParams(document.location.search.slice(1));

const webSceneId = params.get("webscene") || "5e8fbb7e4ad244d5ae60ca09f21aad63";

const map = new WebScene({
  portalItem: {
    id: webSceneId,
    // portal: {
    //   url: portalUrl,
    // },
  },
});

const view = new SceneView({
  container: "viewDiv",
  map,

  camera: {
    position: {
      longitude: 8.57298074,
      latitude: 47.39919367,
      z: 888.12951,
    },
    heading: 333.71,
    tilt: 62.09,
  },
});

(window as any)["view"] = view;

const store = new AppStore({
  view,
});

const app = new App({
  container: "app",
  store,
});
