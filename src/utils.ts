import Map from "@arcgis/core/Map";
import WebScene from "@arcgis/core/WebScene";
import { isAbortError } from "@arcgis/core/core/promiseUtils";
import Layer from "@arcgis/core/layers/Layer";
import SceneView from "@arcgis/core/views/SceneView";

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
 * Apply a slide by moving to the viewpoint before changing layer visibility.
 */
export async function applySlide(view: SceneView, title: string) {
  const map = view.map as WebScene;
  if (map.presentation) {
    const slides = map.presentation.slides;
    const slide = slides.find(
      ({ title: slideTitle }) => slideTitle.text === title,
    );
    if (slide) {
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
