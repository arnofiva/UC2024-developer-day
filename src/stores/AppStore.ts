import WebScene from "@arcgis/core/WebScene";
import Accessor from "@arcgis/core/core/Accessor";
import {
  property,
  subclass,
} from "@arcgis/core/core/accessorSupport/decorators";
import { whenOnce } from "@arcgis/core/core/reactiveUtils";
import SceneLayer from "@arcgis/core/layers/SceneLayer";
import SceneView from "@arcgis/core/views/SceneView";
import DownloadStore from "./DownloadStore";
import TimeStore from "./TimeStore";
import UserStore from "./UserStore";

type AppStoreProperties = Pick<AppStore, "view">;

@subclass("arcgis-core-template.AppStore")
class AppStore extends Accessor {
  @property({ aliasOf: "view.map" })
  map: WebScene;

  @property({ constructOnly: true })
  view: SceneView;

  @property({ constructOnly: true })
  userStore = new UserStore();

  @property({ constructOnly: true })
  timeStore: TimeStore;

  @property({})
  downloadStore: DownloadStore;

  constructor(props: AppStoreProperties) {
    super(props);

    this.timeStore = new TimeStore({ view: props.view });

    whenOnce(() => this.map).then(async (map) => {
      await map.load();
      // document.title = map.portalItem.title;

      await map.loadAll();

      const buildingsLayer = map.allLayers.find(
        (l) => l.type === "scene" && l.title === "Buildings in Zurich",
      ) as SceneLayer;

      const buildingsLayerView = await this.view.whenLayerView(buildingsLayer);

      this.downloadStore = new DownloadStore({
        view: props.view,
        buildingsLayerView,
      });
    });
  }
}

export default AppStore;
