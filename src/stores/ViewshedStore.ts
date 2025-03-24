import ViewshedAnalysis from "@arcgis/core/analysis/ViewshedAnalysis";
import Accessor from "@arcgis/core/core/Accessor";
import {
  property,
  subclass,
} from "@arcgis/core/core/accessorSupport/decorators";
import * as promiseUtils from "@arcgis/core/core/promiseUtils";
import * as reactiveUtils from "@arcgis/core/core/reactiveUtils";
import ViewshedAnalysisView3D from "@arcgis/core/views/3d/analysis/ViewshedAnalysisView3D";
import SceneView from "@arcgis/core/views/SceneView";
import { ScreenType } from "../interfaces";
import { applySlide } from "../utils";

type ViewshedStoreProperties = Pick<ViewshedStore, "view">;

@subclass()
class ViewshedStore extends Accessor {
  readonly type = ScreenType.Viewshed;

  @property({ constructOnly: true })
  view: SceneView;

  @property()
  viewshedAnalysis = new ViewshedAnalysis();

  @property()
  analysisView: ViewshedAnalysisView3D;

  @property()
  get state() {
    return this.abortController ? "creating" : "idle";
  }

  @property()
  private abortController: AbortController | null;

  constructor(props: ViewshedStoreProperties) {
    super(props);

    const view = props.view;

    applySlide(view, "App: Viewshed Viewpoint");

    view.analyses.add(this.viewshedAnalysis);

    view.whenAnalysisView(this.viewshedAnalysis).then((analysisView) => {
      this.analysisView = analysisView;
    });
  }

  create() {
    // Cancel any pending creation operation.
    this.stopCreating();

    // Create a new abort controller for the new operation.
    this.abortController = new AbortController();

    // Save current number of viewsheds to track whenever a new one is created.
    const viewshedCounter = this.viewshedAnalysis.viewsheds.length;
    // Watch whenever the a new viewshed is created and selected and then stop the creation method.
    reactiveUtils.when(
      () =>
        this.viewshedAnalysis.viewsheds.length > viewshedCounter &&
        this.analysisView.selectedViewshed,
      () => {
        this.stopCreating();
      },
    );

    // Pass the controller as an argument to the interactive creation method
    // and schedule the updateUI function after creating viewsheds is finished.
    this.analysisView.createViewsheds(this.abortController).catch((e) => {
      // When the operation is cancelled, don't do anything. Any other errors are thrown.
      if (!promiseUtils.isAbortError(e)) {
        throw e;
      }
    });
  }

  stopCreating() {
    this.abortController?.abort();
    this.abortController = null;
  }
}

export default ViewshedStore;
