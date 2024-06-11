import Graphic from "@arcgis/core/Graphic";
import Accessor from "@arcgis/core/core/Accessor";
import {
  property,
  subclass,
} from "@arcgis/core/core/accessorSupport/decorators";
import { debounce } from "@arcgis/core/core/promiseUtils";
import * as reactiveUtils from "@arcgis/core/core/reactiveUtils";
import { Extent, Geometry, Point, Polygon } from "@arcgis/core/geometry";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import { FillSymbol3DLayer, PolygonSymbol3D } from "@arcgis/core/symbols";
import StylePattern3D from "@arcgis/core/symbols/patterns/StylePattern3D";
import SceneView from "@arcgis/core/views/SceneView";
import SceneLayerView from "@arcgis/core/views/layers/SceneLayerView";
import Sketch from "@arcgis/core/widgets/Sketch";
import SketchViewModel from "@arcgis/core/widgets/Sketch/SketchViewModel";

type DownloadStoreProperties = Pick<
  DownloadStore,
  "view" | "buildingsLayerView"
>;

@subclass("arcgis-core-template.DownloadStore")
class DownloadStore extends Accessor {
  @property({ constructOnly: true })
  view: SceneView;

  @property({ constructOnly: true })
  buildingsLayerView: SceneLayerView;

  @property()
  tool: ExtentTool;

  constructor(props: DownloadStoreProperties) {
    super(props);

    const view = props.view;

    const sketchLayer = new GraphicsLayer({
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
      let highlights: IHandle | null = null;

      const highlightHandle = reactiveUtils.watch(
        getGeometry,
        debounce(async (geometry) => {
          if (geometry == null) {
            highlights?.remove();
            return;
          }

          const layerView = this.buildingsLayerView;
          const query = layerView.createQuery();
          query.geometry = geometry;
          query.spatialRelationship = "intersects";

          const { features } = await layerView.queryFeatures(query);
          highlights?.remove();

          highlights = layerView.highlight(features);
        }),
        {
          initial: true,
        },
      );

      return {
        remove: () => {
          highlightHandle.remove();
          highlights?.remove();
        },
      };
    };

    this.tool = new ExtentTool({ vm: sketch.viewModel, highlightGeometry });
  }

  start() {
    this.tool.start();
  }
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

    this.graphic = new Graphic({
      geometry: polygon,
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
    });
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
      reactiveUtils.watch(
        () => this.polygon.rings[0].length - 1,
        (vertexes) => {
          // deleting a vertex creates an invalid extent,
          // so we treat that as deleting the whole thing
          if (vertexes < 4) {
            this.destroy();
          }
        },
      ),
      reactiveUtils.watch(
        () => this.aa,
        (vertex) => {
          if (vertex) {
            const polygon = this.updateNeighboringVertices(0, 1, 3);
            this.graphic.geometry = polygon;
          }
        },
      ),
      reactiveUtils.watch(
        () => this.ab,
        (vertex) => {
          if (vertex) {
            const polygon = this.updateNeighboringVertices(1, 0, 2);
            this.graphic.geometry = polygon;
          }
        },
      ),
      reactiveUtils.watch(
        () => this.bb,
        (vertex) => {
          if (vertex) {
            const polygon = this.updateNeighboringVertices(2, 3, 1);
            this.graphic.geometry = polygon;
          }
        },
      ),
      reactiveUtils.watch(
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
  vm: SketchViewModel;

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
      this.vm.createGraphic?.geometry) as Point | null;

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
  wipExtent = this.#createWipExtentGraphic();

  initialize() {
    const highlightHandle = this.highlightGeometry(() => this.polygon);

    this.addHandles([
      highlightHandle,
      reactiveUtils.watch(
        () => this.state,
        (state) => {
          if (state === "idle") {
            this.controlPointA = null;
            this.controlPointB = null;
            (this.wipExtent.layer as GraphicsLayer).remove(this.wipExtent);
            this.wipExtent = this.#createWipExtentGraphic();
            this.#vmCreateHandle?.remove();
          }
        },
      ),
      reactiveUtils.watch(
        () => this.polygon,
        (polygon) => {
          if (polygon) {
            this.wipExtent.geometry = polygon.extent;
            if (!this.vm.layer.graphics.includes(this.wipExtent)) {
              this.vm.layer.add(this.wipExtent);
            }
          }
        },
      ),
      reactiveUtils.when(
        () => this.controlPointA,
        (a) => {
          a.addHandles([
            reactiveUtils.watch(
              () => this.controlPointA,
              (next, old) => {
                if (next == null && old) {
                  this.vm.layer.remove(old);
                }
              },
            ),
          ]);
        },
      ),
      reactiveUtils.when(
        () => this.controlPointB,
        (b) => {
          b.addHandles([
            reactiveUtils.watch(
              () => this.controlPointB,
              (next, old) => {
                if (next == null && old) {
                  this.vm.layer.remove(old);
                }
              },
            ),
          ]);
        },
      ),
    ]);
  }

  #vmCreateHandle: IHandle | null = null;

  onCancel() {
    this.state = "idle";
  }

  onComplete(graphic: Graphic) {
    this.vm.layer.remove(graphic);
    const extent = new ExtentShape(
      graphic.geometry as Extent,
      this.highlightGeometry,
    );

    const deletionHandle = this.vm.on("delete", (event) => {
      event.graphics.includes(extent.graphic);
      extent.destroy();
    });
    extent.addHandles(deletionHandle);
    this.vm.layer.add(extent.graphic);
    this.vm.update(extent.graphic);
    this.state = "idle";
  }

  start() {
    this.state = "placing-a";
    this.vm.create("point");

    this.#vmCreateHandle = this.vm.on("create", (event) => {
      if (event.state === "cancel") {
        this.onCancel();
        return;
      }

      if (event.state === "complete") {
        const graphic = event.graphic;

        if (this.state === "placing-a") {
          this.controlPointA = graphic;
          this.vm.create("point");
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

  #createWipExtentGraphic() {
    return new Graphic({
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
    });
  }
}

export default DownloadStore;
