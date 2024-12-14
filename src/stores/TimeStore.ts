import Accessor from "@arcgis/core/core/Accessor";
import {
  property,
  subclass,
} from "@arcgis/core/core/accessorSupport/decorators";
import TimeExtent from "@arcgis/core/time/TimeExtent";
import SceneView from "@arcgis/core/views/SceneView";
import { ScreenType } from "../interfaces";
import { applySlide } from "../utils";

type TimeStoreProperties = Pick<TimeStore, "view" | "timeSliderConfig">;

@subclass("arcgis-core-template.TimeStore")
class TimeStore extends Accessor {
  readonly type = ScreenType.Time;

  @property({ constructOnly: true })
  view: SceneView;

  @property({ constructOnly: true })
  timeSliderConfig: any;

  constructor(props: TimeStoreProperties) {
    super(props);

    const view = props.view;

    applySlide(view, 0).then(() => {
      view.timeExtent = new TimeExtent({
        start: new Date("1200-01-02"),
        end: new Date("1200-01-02"),
      });
    });

    this.addHandles({
      remove: () => {
        view.timeExtent = null as any;
      },
    });
  }
}

export default TimeStore;
