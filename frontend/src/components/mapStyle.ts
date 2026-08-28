// Free, key-free satellite basemap for Socotra using Esri World Imagery raster
// tiles (no API key / token required). "hybrid" adds place/boundary labels.
export type MapType = "hybrid" | "satellite" | "streets";

// Socotra Island overview (lng, lat) + zoom.
export const SOCOTRA_CENTER: [number, number] = [53.92, 12.5];
export const SOCOTRA_ZOOM = 8.3;

const ESRI_SATELLITE =
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
const ESRI_LABELS =
  "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}";
const ESRI_STREET =
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}";

export function mapStyleJSON(type: MapType = "hybrid") {
  const sources: any = {};
  const layers: any[] = [];
  if (type === "streets") {
    sources.street = { type: "raster", tiles: [ESRI_STREET], tileSize: 256, attribution: "Esri" };
    layers.push({ id: "street", type: "raster", source: "street" });
  } else {
    sources.sat = { type: "raster", tiles: [ESRI_SATELLITE], tileSize: 256, attribution: "Esri, Maxar, Earthstar Geographics" };
    layers.push({ id: "sat", type: "raster", source: "sat" });
    if (type === "hybrid") {
      sources.labels = { type: "raster", tiles: [ESRI_LABELS], tileSize: 256 };
      layers.push({ id: "labels", type: "raster", source: "labels" });
    }
  }
  return { version: 8, sources, layers } as any;
}

export const MAP_TYPE_ORDER: MapType[] = ["hybrid", "satellite", "streets"];
export const MAP_TYPE_LABEL: Record<MapType, string> = {
  hybrid: "قمر صناعي + أسماء",
  satellite: "قمر صناعي",
  streets: "خريطة الطرق",
};
