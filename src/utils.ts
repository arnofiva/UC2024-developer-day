import Map from "@arcgis/core/Map";
import WebScene from "@arcgis/core/WebScene";
import { isAbortError } from "@arcgis/core/core/promiseUtils";
import Layer from "@arcgis/core/layers/Layer";
import SceneView from "@arcgis/core/views/SceneView";
import DefaultUI from "@arcgis/core/views/ui/DefaultUI";

export function timeout(timeoutInMilliseconds: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, timeoutInMilliseconds);
  });
}

/**
 * Suppress errors about uncaught abort errors in promises, for cases where we expect them to be thrown.
 */
export async function ignoreAbortErrors<T>(
  promise: Promise<T>,
): Promise<T | undefined> {
  try {
    return await promise;
  } catch (error: any) {
    if (!isAbortError(error)) {
      throw error;
    }
    return undefined;
  }
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

/**
 * Apply a slide by moving to the viewpoint before changing layer visibility.
 */
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

export function findLayerById<T extends Layer>(map: Map, layerId: string) {
  const layer = map.findLayerById(layerId) as T;
  if (!layer) {
    throw new Error(`No layer with id ${layerId} found`);
  }
  return layer;
}
