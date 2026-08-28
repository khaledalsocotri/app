import React from "react";
import { StyleSheet } from "react-native";
import { Map, Camera, Marker, UserLocation } from "@maplibre/maplibre-react-native";
import { COLORS } from "@/src/theme/theme";
import { MapPin } from "@/src/components/MapPin";
import { mapStyleJSON, SOCOTRA_CENTER, SOCOTRA_ZOOM, MapType } from "@/src/components/mapStyle";
import { MapFallback, isExpoGo } from "@/src/components/MapFallback";

type CameraState = { center: [number, number]; zoom: number; heading: number };

export function MapCanvas({
  destinations,
  colorMap,
  selected,
  granted,
  onSelect,
  mapType = "hybrid",
  camera,
}: {
  destinations: any[];
  colorMap: Record<string, { color: string; icon: string }>;
  selected: any;
  granted: boolean;
  onSelect: (d: any) => void;
  mapType?: MapType;
  camera?: CameraState;
}) {
  const cam = camera || { center: SOCOTRA_CENTER, zoom: SOCOTRA_ZOOM, heading: 0 };
  if (isExpoGo) return <MapFallback style={StyleSheet.absoluteFill} />;
  return (
    <Map
      style={StyleSheet.absoluteFill}
      mapStyle={mapStyleJSON(mapType)}
      logo={false}
      attribution={false}
      compass={false}
      onPress={() => onSelect(null)}
    >
      <Camera center={cam.center} zoom={cam.zoom} bearing={cam.heading} duration={600} />
      {granted ? <UserLocation /> : null}
      {(destinations || [])
        .filter((d) => typeof d.latitude === "number" && typeof d.longitude === "number")
        .map((d) => {
          const cfg = colorMap[d.category] || { color: COLORS.brand, icon: "location" };
          return (
            <Marker key={d.id} coordinate={[d.longitude, d.latitude]} anchor="bottom" onPress={() => onSelect(d)}>
              <MapPin color={cfg.color} icon={d.marker_icon || cfg.icon} active={selected?.id === d.id} />
            </Marker>
          );
        })}
    </Map>
  );
}

export const supportsNativeMap = true;
