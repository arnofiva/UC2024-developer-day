import { whenOnce } from "@arcgis/core/core/reactiveUtils";
import * as kernel from "@arcgis/core/kernel";
import "@esri/calcite-components/dist/calcite/calcite.css";
import App from "./compontents/App";
import AppStore from "./stores/AppStore";

console.log(`Using ArcGIS Maps SDK for JavaScript v${kernel.fullVersion}`);

// setAssetPath("https://js.arcgis.com/calcite-components/1.0.0-beta.77/assets");

/*
47.36629893125558,8.525363607720573,417.9994201660156
*/

const params = new URLSearchParams(document.location.search.slice(1));

const webSceneId = params.get("webscene") || "30bd624de45247dfa53320a8213729a4";

const skipPreload = params.has("skipPreload");

const store = new AppStore({
  webSceneId,
  skipPreload,
});

new App({
  container: "app",
  store,
});

whenOnce(() => store.sceneStore.ready).then(() => {
  (window as any)["view"] = store.sceneStore.view;
});
