import Color from "@arcgis/core/Color";
import Graphic from "@arcgis/core/Graphic";
import Accessor from "@arcgis/core/core/Accessor";
import {
  property,
  subclass,
} from "@arcgis/core/core/accessorSupport/decorators";
import { debounce } from "@arcgis/core/core/promiseUtils";
import { watch, when } from "@arcgis/core/core/reactiveUtils";
import { Extent, Geometry, Point, Polygon } from "@arcgis/core/geometry";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import FeatureFilter from "@arcgis/core/layers/support/FeatureFilter";
import { FillSymbol3DLayer, PolygonSymbol3D } from "@arcgis/core/symbols";
import StylePattern3D from "@arcgis/core/symbols/patterns/StylePattern3D";
import Sketch from "@arcgis/core/widgets/Sketch";
import SketchViewModel from "@arcgis/core/widgets/Sketch/SketchViewModel";
import { exportAsBinaryGLTF } from "../export";
import { ScreenType } from "../interfaces";
import { applySlide, ignoreAbortErrors } from "../utils";
import AppStore from "./AppStore";

type DownloadStoreProperties = Pick<DownloadStore, "appStore">;

function createSelectionGraphic(geometry?: Polygon) {
  return new Graphic({
    geometry,
    symbol: new PolygonSymbol3D({
      symbolLayers: [
        new FillSymbol3DLayer({
          material: { color: [255, 0, 0, 0.75] },
          outline: {
            color: "black",
          },
          pattern: new StylePattern3D({
            style: "forward-diagonal",
          }),
        }),
      ],
    }),
  });
}

@subclass()
class DownloadStore extends Accessor {
  readonly type = ScreenType.Download;

  @property({ constructOnly: true })
  appStore: AppStore;

  // @property({ constructOnly: true })
  // buildingsLayerView: SceneLayerView;

  @property()
  get state(): "ready" | "selecting" | "selected" | "downloading" {
    if (this.downloading) {
      return "downloading";
    } else if (this.tool.state !== "idle") {
      return "selecting";
    } else if (this.area) {
      return "selected";
    } else {
      return "ready";
    }
  }

  @property()
  private tool: ExtentTool;

  @property({ aliasOf: "appStore.selectedArea" })
  area: Geometry | null;

  @property()
  selectedObjectIds: number[] = [];

  @property({ readOnly: true })
  get invalidSelection() {
    const count = this.selectedObjectIds.length;
    return count < 1 || 35 <= count;
  }

  @property()
  private downloading = false;

  constructor(props: DownloadStoreProperties) {
    super(props);

    const view = props.appStore.sceneStore.view;

    applySlide(view, "App: Hürlimann Schematic");

    const sketchLayer = new GraphicsLayer({
      title: "Download selection",
      elevationInfo: {
        mode: "on-the-ground",
      },
    });

    view.map.add(sketchLayer);

    const sketch = new Sketch({
      view,
      layer: sketchLayer,
      creationMode: "single",
      defaultCreateOptions: {
        hasZ: false,
        mode: "click",
      },
      defaultUpdateOptions: {
        tool: "reshape",
        enableRotation: false,
        enableScaling: false,
        enableZ: false,
        reshapeOptions: {
          shapeOperation: "none",
          edgeOperation: "offset",
          vertexOperation: "move-xy",
        },
      },
      tooltipOptions: {
        enabled: true,
        inputEnabled: true,
      },
    });

    const highlightGeometry = (getGeometry: () => Geometry) => {
      const highlightHandle = watch(
        getGeometry,
        (geometry) => {
          if (geometry) {
            this.area = geometry;
            this.highlightArea();
          }
        },
        {
          initial: true,
        },
      );

      return {
        remove: () => {
          highlightHandle.remove();
          this.removeHighlight();
        },
      };
    };

    this.tool = new ExtentTool({
      sketchVM: sketch.viewModel,
      highlightGeometry,
    });

    view.highlightOptions.haloOpacity = 0;
    const defaultHighlightColor = view.highlightOptions.color;

    this.addHandles([
      when(
        () => this.tool.state === "placing-a",
        () => {
          this.appStore.sceneStore.lowPolyTrees.visible = false;
          this.appStore.originLayer.visible = true;
          this.appStore.showStickyNote();
        },
      ),
      watch(
        () => this.invalidSelection,
        (tooManyFeatures) => {
          if (tooManyFeatures) {
            view.highlightOptions.color = new Color("red");
          } else {
            view.highlightOptions.color = defaultHighlightColor;
          }
        },
      ),
    ]);

    this.addHandles({
      remove: () => {
        this.removeHighlight();
        view.map.remove(sketchLayer);
        sketch.destroy();
      },
    });
  }

  start() {
    this.tool.start();
  }

  async download() {
    if (this.state !== "selected" || this.invalidSelection) {
      return;
    }

    const extent = this.area?.extent;

    if (extent) {
      this.downloading = true;
      await exportAsBinaryGLTF(
        this.appStore.sceneStore,
        extent,
        this.selectedObjectIds,
      );

      this.downloading = false;
    }
  }

  private currentHighlight: IHandle = { remove: () => {} };

  private highlightArea = async () =>
    ignoreAbortErrors(this.highlightAreaDebounced());

  private highlightAreaDebounced = debounce(async () => {
    const geometry = this.area;
    if (geometry == null) {
      this.removeHighlight();
      return;
    }

    const layerView = this.appStore.sceneStore.buildingsLayerView;
    const query = layerView.createQuery();
    query.geometry = geometry;
    query.spatialRelationship = "intersects";

    const { features } = await layerView.queryFeatures(query);
    this.removeHighlight();

    this.selectedObjectIds = features.map((f) => f.getObjectId() as number);
    this.currentHighlight = layerView.highlight(features);
  });

  removeHighlight() {
    this.selectedObjectIds = [];
    this.currentHighlight.remove();
  }

  filterArea = debounce(async () => {
    const geometry = this.area;
    if (geometry == null) {
      this.removeHighlight();
      return;
    }

    const layerView = this.appStore.sceneStore.buildingsLayerView;
    layerView.filter = new FeatureFilter({
      geometry,
      spatialRelationship: "intersects",
    });
  });
}

@subclass()
class ExtentShape extends Accessor {
  constructor(
    initialExtent: Extent,
    private highlightGeometry: (getGeometry: () => Geometry | null) => IHandle,
  ) {
    super();
    const { xmax, xmin, ymax, ymin } = initialExtent;

    const ring = [
      [xmax, ymax],
      [xmax, ymin],
      [xmin, ymin],
      [xmin, ymax],
      [xmax, ymax],
    ];

    const polygon = new Polygon({
      rings: [ring],
      spatialReference: initialExtent.spatialReference,
    });

    this.graphic = createSelectionGraphic(polygon);
  }

  @property()
  graphic: Graphic;

  @property()
  get polygon() {
    return this.graphic.geometry as Polygon;
  }

  @property()
  get aa() {
    const [ring] = this.polygon.rings;
    const aa = ring[0];
    return aa;
  }

  @property()
  get ab() {
    const [ring] = this.polygon.rings;
    const ab = ring[1];
    return ab;
  }

  @property()
  get bb() {
    const [ring] = this.polygon.rings;
    const bb = ring[2];
    return bb;
  }

  @property()
  get ba() {
    const [ring] = this.polygon.rings;
    const ba = ring[3];
    return ba;
  }

  updateNeighboringVertices(
    index: number,
    vertical: number,
    horizontal: number,
  ) {
    const polygon = this.polygon.clone() as Polygon;
    const [currentRing] = polygon.rings;

    const path = currentRing.slice(0, -1);

    const [x, y] = path[index];

    path[vertical][0] = x;
    path[horizontal][1] = y;

    path.push(path[0]);

    polygon.rings = [path];

    return polygon;
  }

  highlights: IHandle | null;

  initialize() {
    const highlightHandle = this.highlightGeometry(() => this.polygon);

    this.addHandles([
      highlightHandle,
      watch(
        () => this.polygon.rings[0].length - 1,
        (vertexes) => {
          // deleting a vertex creates an invalid extent,
          // so we treat that as deleting the whole thing
          if (vertexes < 4) {
            this.destroy();
          }
        },
      ),
      watch(
        () => this.aa,
        (vertex) => {
          if (vertex) {
            const polygon = this.updateNeighboringVertices(0, 1, 3);
            this.graphic.geometry = polygon;
          }
        },
      ),
      watch(
        () => this.ab,
        (vertex) => {
          if (vertex) {
            const polygon = this.updateNeighboringVertices(1, 0, 2);
            this.graphic.geometry = polygon;
          }
        },
      ),
      watch(
        () => this.bb,
        (vertex) => {
          if (vertex) {
            const polygon = this.updateNeighboringVertices(2, 3, 1);
            this.graphic.geometry = polygon;
          }
        },
      ),
      watch(
        () => this.ba,
        (vertex) => {
          if (vertex) {
            const polygon = this.updateNeighboringVertices(3, 2, 0);
            this.graphic.geometry = polygon;
          }
        },
      ),
    ]);
  }

  destroy() {
    if (this.graphic?.layer) {
      // if the graphic was previously deleted, the layer property is null
      (this.graphic.layer as GraphicsLayer).remove(this.graphic);
    }
    super.destroy();
  }
}

@subclass()
class ExtentTool extends Accessor {
  @property({ constructOnly: true })
  sketchVM: SketchViewModel;

  @property({ constructOnly: true })
  private highlightGeometry: (getGeometry: () => Geometry | null) => IHandle;

  @property()
  state: "idle" | "placing-a" | "placing-b" = "idle";

  @property()
  controlPointA: Graphic | null = null;

  @property()
  controlPointB: Graphic | null = null;

  @property()
  get polygon() {
    const { controlPointA, controlPointB } = this;
    const a = controlPointA?.geometry as Point | null;
    const b = (controlPointB?.geometry ??
      this.sketchVM.createGraphic?.geometry) as Point | null;

    if (a == null || b == null) {
      return null;
    } else {
      const ring = [
        [a.x, a.y],
        [a.x, b.y],
        [b.x, b.y],
        [b.x, a.y],
        [a.x, a.y],
      ];

      return new Polygon({
        spatialReference: a.spatialReference,
        rings: [ring],
      });
    }
  }

  @property()
  wipExtent = createSelectionGraphic();

  initialize() {
    const highlightHandle = this.highlightGeometry(() => this.polygon);

    this.addHandles([
      highlightHandle,
      watch(
        () => this.state,
        (state) => {
          if (state === "idle") {
            this.controlPointA = null;
            this.controlPointB = null;
            (this.wipExtent.layer as GraphicsLayer).remove(this.wipExtent);
            this.wipExtent = createSelectionGraphic();
            this.sketchVMCreateHandle?.remove();
          }
        },
      ),
      watch(
        () => this.polygon,
        (polygon) => {
          if (polygon) {
            this.wipExtent.geometry = polygon.extent;
            if (!this.sketchVM.layer.graphics.includes(this.wipExtent)) {
              this.sketchVM.layer.add(this.wipExtent);
            }
          }
        },
      ),
      when(
        () => this.controlPointA,
        (a) => {
          a.addHandles([
            watch(
              () => this.controlPointA,
              (next, old) => {
                if (next == null && old) {
                  this.sketchVM.layer.remove(old);
                }
              },
            ),
          ]);
        },
      ),
      when(
        () => this.controlPointB,
        (b) => {
          b.addHandles([
            watch(
              () => this.controlPointB,
              (next, old) => {
                if (next == null && old) {
                  this.sketchVM.layer.remove(old);
                }
              },
            ),
          ]);
        },
      ),
    ]);
  }

  sketchVMCreateHandle: IHandle | null = null;

  onCancel() {
    this.state = "idle";
  }

  onComplete(graphic: Graphic) {
    this.sketchVM.layer.remove(graphic);
    const extent = new ExtentShape(
      graphic.geometry as Extent,
      this.highlightGeometry,
    );

    const deletionHandle = this.sketchVM.on("delete", (event) => {
      event.graphics.includes(extent.graphic);
      extent.destroy();
    });
    extent.addHandles(deletionHandle);
    this.sketchVM.layer.add(extent.graphic);
    this.sketchVM.update(extent.graphic);
    this.state = "idle";
  }

  start() {
    this.state = "placing-a";
    this.sketchVM.create("point");

    this.sketchVMCreateHandle = this.sketchVM.on("create", (event) => {
      if (event.state === "cancel") {
        this.onCancel();
        return;
      }

      if (event.state === "complete") {
        const graphic = event.graphic;

        if (this.state === "placing-a") {
          this.controlPointA = graphic;
          this.sketchVM.create("point");
          this.state = "placing-b";
          return;
        }

        if (this.state === "placing-b") {
          this.controlPointB = graphic;
          this.onComplete(this.wipExtent.clone());
          return;
        }
      }
    });
  }
}

export default DownloadStore;
