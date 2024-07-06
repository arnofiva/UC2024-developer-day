import WebScene from "@arcgis/core/WebScene";
import SceneView from "@arcgis/core/views/SceneView";
import DefaultUI from "@arcgis/core/views/ui/DefaultUI";

export function timeout(timeoutInMilliseconds: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, timeoutInMilliseconds);
  });
}

/**
 * Finds an element in the view UI that can be used as a container for a widget.
 * @param position The position of the element in the view UI
 * @param widgetId A unique id specific to the component being added
 */
export function ensureViewUIContainer(
  position:
    | "top-left"
    | "top-right"
    | "bottom-left"
    | "bottom-right"
    | "manual",
  widgetId: string,
): HTMLElement {
  widgetId += "-ui-container"; // avoid conflicts with other ids used for CSS
  let widgetContainerEl = document.getElementById(widgetId);
  if (!widgetContainerEl) {
    widgetContainerEl = document.createElement("div");
    widgetContainerEl.id = widgetId;
    viewUI.add(widgetContainerEl, position);
  }
  return widgetContainerEl;
}

/**
 * For use in findViewUIContainer.
 */
let viewUI: DefaultUI;
export function setViewUI(ui: DefaultUI): void {
  viewUI = ui;
}

export async function applySlide(view: SceneView, index: number) {
  const map = view.map as WebScene;
  if (map.presentation) {
    const slides = map.presentation.slides;
    if (0 <= index && index < slides.length) {
      const slide = slides.getItemAt(index);
      try {
        await view.goTo(slide.viewpoint);
      } finally {
        await slide.applyTo(view, { animate: false });
      }
    }
  }
}
