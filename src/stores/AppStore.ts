import WebScene from "@arcgis/core/WebScene";
import Accessor from "@arcgis/core/core/Accessor";
import {
  property,
  subclass,
} from "@arcgis/core/core/accessorSupport/decorators";
import { whenOnce } from "@arcgis/core/core/reactiveUtils";
import SceneView from "@arcgis/core/views/SceneView";
import { applySlide } from "../utils";
import DownloadStore from "./DownloadStore";
import RealisticStore from "./RealisticStore";
import TimeStore from "./TimeStore";
import UploadStore from "./UploadStore";
import UserStore from "./UserStore";
import ViewshedStore from "./ViewshedStore";

type AppStoreProperties = Pick<AppStore, "view">;

export type ScreenStoreUnion =
  | TimeStore
  | DownloadStore
  | UploadStore
  | RealisticStore
  | ViewshedStore;

@subclass("arcgis-core-template.AppStore")
class AppStore extends Accessor {
  @property({ constructOnly: true })
  view: SceneView;

  @property({ aliasOf: "view.map" })
  map: WebScene;

  @property({ constructOnly: true })
  userStore = new UserStore();

  @property()
  get currentScreenStore() {
    return this._currentScreen;
  }
  set currentScreenStore(screen: ScreenStoreUnion | null) {
    const current = this._currentScreen;
    if (current) {
      current.destroy();
    }
    this._currentScreen = screen;
  }

  @property({})
  private _currentScreen: ScreenStoreUnion | null;

  constructor(props: AppStoreProperties) {
    super(props);

    const view = props.view;

    whenOnce(() => this.map).then((map) => {
      document.title = map.portalItem.title;
    });

    window.onkeydown = (e) => {
      const index = Number.parseInt(e.key);
      if (Number.isInteger(index)) {
        applySlide(view, index - 1);
      }
    };

    this.addHandles({
      remove: () => {
        window.onkeydown = null;
      },
    });
  }
}

export default AppStore;
