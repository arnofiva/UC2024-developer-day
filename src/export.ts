import * as projection from "@arcgis/core/geometry/projection";
import MeshGeoreferencedVertexSpace from "@arcgis/core/geometry/support/MeshGeoreferencedVertexSpace";
import MeshLocalVertexSpace from "@arcgis/core/geometry/support/MeshLocalVertexSpace";
import * as meshUtils from "@arcgis/core/geometry/support/meshUtils";
import Ground from "@arcgis/core/Ground";
import SceneLayer from "@arcgis/core/layers/SceneLayer";
import SceneStore from "./stores/SceneStore";

import Color from "@arcgis/core/Color";
import { Extent, Point } from "@arcgis/core/geometry";
import Mesh from "@arcgis/core/geometry/Mesh";
import MeshComponent from "@arcgis/core/geometry/support/MeshComponent";
import MeshMaterialMetallicRoughness from "@arcgis/core/geometry/support/MeshMaterialMetallicRoughness";
import * as symbolUtils from "@arcgis/core/symbols/support/symbolUtils";
import { origin } from "./constants";

async function mergeSliceMeshes({
  ground,
  buildings,
  origin,
  includeOriginMarker = true,
  signal,
}: {
  ground: Mesh;
  buildings: Mesh[];
  origin: Point;
  includeOriginMarker?: boolean;
  signal?: AbortSignal;
}) {
  const originSpatialReference = origin.spatialReference;
  const featureSpatialReference =
    buildings[0]?.spatialReference ?? originSpatialReference;

  let projectedOrigin = origin;
  if (originSpatialReference.wkid !== featureSpatialReference.wkid) {
    await projection.load();
    projectedOrigin = projection.project(
      origin,
      featureSpatialReference,
    ) as Point;
  }

  const VertexSpace =
    projectedOrigin.spatialReference.isWGS84 ||
    projectedOrigin.spatialReference.isWebMercator
      ? MeshLocalVertexSpace
      : MeshGeoreferencedVertexSpace;

  const vertexSpace = new VertexSpace({
    origin: [projectedOrigin.x, projectedOrigin.y, projectedOrigin.z || 0],
  });

  const meshPromises = buildings
    .map(async (mesh) => {
      await mesh.load();
      return meshUtils.convertVertexSpace(mesh, vertexSpace, { signal });
    })
    .concat(meshUtils.convertVertexSpace(ground, vertexSpace, { signal }));

  if (includeOriginMarker) {
    const zmax = buildings.reduce(
      (max, next) => (next.extent.zmax! > max ? next.extent.zmax! : max),
      ground.extent.zmax!,
    );
    const zmin = buildings.reduce(
      (min, next) => (min > next.extent.zmin! ? next.extent.zmin! : min),
      ground.extent.zmin!,
    );
    const height = zmax - zmin;

    // const originMesh = await createOriginMarker(projectedOrigin, height);
    // meshPromises.push(
    //   meshUtils.convertVertexSpace(originMesh, vertexSpace, { signal }),
    // );
  }

  const meshes = await Promise.all(meshPromises);

  const slice = meshUtils.merge(
    meshes.filter((mesh): mesh is Mesh => mesh != null),
  );

  return slice!;
}

function addComponent(mesh: Mesh, name: string, color: Color) {
  let component: MeshComponent;
  if (mesh.components?.length) {
    component = mesh.components[0].clone();
    mesh.removeComponent(mesh.components[0]);
  } else {
    component = new MeshComponent();
  }

  component.material = new MeshMaterialMetallicRoughness({
    color,
  });
  component.name = name;

  mesh.addComponent(component);
  return component;
}

async function queryBuildings(layer: SceneLayer, objectIds: number[]) {
  const query = layer.createQuery();
  query.objectIds = objectIds;
  query.returnGeometry = true;
  const { features } = await layer.queryFeatures(query);

  const renderer = layer.renderer;

  return await Promise.all(
    features.map(async (feature) => {
      const mesh = feature.geometry as Mesh;
      const [color] = await Promise.all([
        symbolUtils.getDisplayedColor(feature, { renderer }),
        mesh.load(),
      ]);
      if (color) {
        addComponent(mesh, `building-${feature.getObjectId()}`, color);
      }

      return mesh;
    }),
  );
}

async function queryGround(ground: Ground, extent: Extent) {
  const elevation = await meshUtils.createFromElevation(ground, extent, {
    demResolution: "finest-contiguous",
  });

  await elevation.load();
  const component = addComponent(
    elevation,
    "ground",
    new Color([200, 200, 200]),
  );
  component.name = "world-elevation";

  return elevation;
}

export async function exportAsBinaryGLTF(
  sceneStore: SceneStore,
  extent: Extent,
  objectIds: number[],
) {
  const layer = sceneStore.buildingsLayer;

  await projection.load();
  const projectedExtent = projection.project(
    extent,
    layer.spatialReference,
  ) as Extent;

  const [buildings, ground] = await Promise.all([
    queryBuildings(layer, objectIds),
    queryGround(sceneStore.map.ground, projectedExtent),
  ]);

  const mesh = await mergeSliceMeshes({
    buildings,
    ground,
    origin,
  });

  await mesh.load();

  const file = await mesh.toBinaryGLTF();
  const blob = new Blob([file], { type: "model/gltf-binary" });

  const link = document.createElement("a");
  link.download = `buildings-export.glb`;
  link.href = window.URL.createObjectURL(blob);
  link.click();
}
