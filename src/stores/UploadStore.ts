import Accessor from "@arcgis/core/core/Accessor";
import {
  property,
  subclass,
} from "@arcgis/core/core/accessorSupport/decorators";
import { whenOnce } from "@arcgis/core/core/reactiveUtils";
import { Polygon } from "@arcgis/core/geometry";
import FeatureFilter from "@arcgis/core/layers/support/FeatureFilter";
import SceneView from "@arcgis/core/views/SceneView";
import { ScreenType } from "../interfaces";
import { applySlide } from "../utils";
import AppStore from "./AppStore";

type UploadStoreProperties = Pick<UploadStore, "appStore">;

@subclass()
class UploadStore extends Accessor {
  readonly type = ScreenType.Upload;

  @property({ constructOnly: true })
  appStore: AppStore;

  @property({ aliasOf: "appStore.view" })
  view: SceneView;

  constructor(props: UploadStoreProperties) {
    super(props);

    whenOnce(() => this.appStore).then(() => this.initializeStore());
  }

  private async initializeStore() {
    applySlide(this.view, 2);

    this.addHandles(
      this.appStore.uploadLayer.on("edits", async (edits) => {
        const changed = edits.addedFeatures?.length
          ? edits.addedFeatures
          : edits.updatedFeatures;
        if (changed.length) {
          this.updateFootprint(changed[0].objectId);
        }
      }),
    );

    /* Initialize area*/
    const area = this.appStore.selectedArea;
    if (area) {
      const sceneLayers = [
        this.appStore.downloadLayer,
        this.appStore.lowPolyTrees,
      ];

      const layerViews = await Promise.all(
        sceneLayers.map((l) => this.view.whenLayerView(l)),
      );

      layerViews.forEach(
        (lv) =>
          (lv.filter = new FeatureFilter({
            geometry: area,
            spatialRelationship: "disjoint",
          })),
      );

      this.addHandles({
        remove: () => layerViews.forEach((lv) => (lv.filter = null as any)),
      });
    }
  }

  private async updateFootprint(objectId: number) {
    const uploadLayer = this.appStore.uploadLayer;

    const query = uploadLayer.createQuery();
    query.objectIds = [objectId];
    query.returnGeometry = true;
    query.returnZ = true;
    query.multipatchOption = "xyFootprint";
    const { features } = await uploadLayer.queryFeatures(query);

    this.appStore.uploadedFootprint = features[0].geometry as Polygon;
  }
}

export default UploadStore;
