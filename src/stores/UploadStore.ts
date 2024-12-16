import Graphic from "@arcgis/core/Graphic";
import Accessor from "@arcgis/core/core/Accessor";
import {
  property,
  subclass,
} from "@arcgis/core/core/accessorSupport/decorators";
import { whenOnce } from "@arcgis/core/core/reactiveUtils";
import FormTemplate from "@arcgis/core/form/FormTemplate";
import { Polygon, SpatialReference } from "@arcgis/core/geometry";
import { buffer } from "@arcgis/core/geometry/geometryEngine";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import FeatureFilter from "@arcgis/core/layers/support/FeatureFilter";
import FillSymbol3DLayer from "@arcgis/core/symbols/FillSymbol3DLayer";
import PolygonSymbol3D from "@arcgis/core/symbols/PolygonSymbol3D";
import StylePattern3D from "@arcgis/core/symbols/patterns/StylePattern3D";
import Editor from "@arcgis/core/widgets/Editor";
import { ScreenType } from "../interfaces";
import { applySlide } from "../utils";
import AppStore from "./AppStore";

type UploadStoreProperties = Pick<UploadStore, "appStore">;

@subclass()
class UploadStore extends Accessor {
  readonly type = ScreenType.Upload;

  @property({ constructOnly: true })
  appStore: AppStore;

  @property({ readOnly: true })
  siteLayer = new GraphicsLayer({
    title: "Site",
    elevationInfo: {
      mode: "on-the-ground",
    },
  });

  constructor(props: UploadStoreProperties) {
    super(props);

    whenOnce(() => this.appStore).then(() => this.initializeStore());

    const view = props.appStore.sceneStore.view!;

    const map = view.map;
    map.add(this.siteLayer);

    const area = props.appStore.selectedArea;
    if (area) {
      this.siteLayer.add(
        new Graphic({
          geometry: area,
          symbol: new PolygonSymbol3D({
            symbolLayers: [
              new FillSymbol3DLayer({
                material: { color: "red" },
                outline: {
                  color: "black",
                },
                pattern: new StylePattern3D({
                  style: "forward-diagonal",
                }),
              }),
            ],
          }),
        }),
      );
    }

    this.addHandles({
      remove: () => map.remove(this.siteLayer),
    });
  }

  initializeEditor(parent: HTMLElement) {
    const view = this.appStore.sceneStore.view!;

    const container = document.createElement("div");
    const editor = new Editor({
      view,
      container,
      layerInfos: [
        {
          layer: this.appStore.sceneStore.downloadLayer,
          enabled: false,
        },
        {
          layer: this.appStore.sceneStore.uploadLayer,
          formTemplate: new FormTemplate({
            elements: [
              {
                type: "field",
                fieldName: "name",
                visibilityExpression: "false",
              },
            ],
          }),
        },
      ],
      tooltipOptions: {
        enabled: true,
      },
      snappingOptions: {
        enabled: true,
        featureSources: [{ enabled: true, layer: this.siteLayer }],
      },
    });

    parent.appendChild(container);

    this.addHandles([
      editor.on("sketch-create", (e) => {
        if (e.detail.state === "complete") {
          e.detail.graphic.setAttribute("name", this.appStore.deviceId);
        }
      }),
      {
        remove: () => {
          parent.removeChild(container);
          editor.destroy();
        },
      },
    ]);
  }

  private async initializeStore() {
    const view = this.appStore.sceneStore.view!;
    applySlide(view, 2);

    this.addHandles(
      this.appStore.sceneStore.uploadLayer.on("edits", async (edits) => {
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
        this.appStore.sceneStore.downloadLayer,
        this.appStore.sceneStore.lowPolyTrees,
      ];

      const layerViews = await Promise.all(
        sceneLayers.map((l) => view.whenLayerView(l)),
      );

      layerViews.forEach(
        (lv) =>
          (lv.filter = new FeatureFilter({
            // objectIds: [1406],
            where: `${lv.layer.objectIdField} not in (1406)`,
            // geometry: area,
            // spatialRelationship: "disjoint",
          })),
      );
    }
  }

  private async updateFootprint(objectId: number) {
    const uploadLayer = this.appStore.sceneStore.uploadLayer;

    const query = uploadLayer.createQuery();
    query.outSpatialReference = SpatialReference.WebMercator;
    query.objectIds = [objectId];
    query.returnGeometry = true;
    query.returnZ = true;
    query.multipatchOption = "xyFootprint";
    const { features } = await uploadLayer.queryFeatures(query);

    const footprint = features[0].geometry;
    const bufferedFootprint = buffer(footprint, 1.2, "meters") as Polygon;

    this.appStore.uploadedFootprint = bufferedFootprint;
  }
}

export default UploadStore;
