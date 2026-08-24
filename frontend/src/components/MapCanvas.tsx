import React from "react";
import { View, StyleSheet } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SHADOW } from "@/src/theme/theme";

const SOCOTRA_REGION = { latitude: 12.5, longitude: 53.95, latitudeDelta: 0.85, longitudeDelta: 0.85 };

// Distinctive teal tourism map theme.
const MAP_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#e9f2f2" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#0e4a52" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#ffffff" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#a9dfe4" }] },
  { featureType: "landscape.natural", elementType: "geometry", stylers: [{ color: "#dcebdc" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
  { featureType: "administrative", elementType: "geometry", stylers: [{ visibility: "off" }] },
];

export function MapCanvas({ destinations, colorMap, selected, granted, onSelect }: any) {
  return (
    <MapView
      style={StyleSheet.absoluteFill}
      provider={PROVIDER_GOOGLE}
      initialRegion={SOCOTRA_REGION}
      customMapStyle={MAP_STYLE}
      showsUserLocation={granted}
      showsMyLocationButton={false}
      onPress={() => onSelect(null)}
    >
      {destinations.map((d: any) => {
        const cfg = colorMap[d.category] || { color: COLORS.brand, icon: "location" };
        return (
          <Marker key={d.id} coordinate={{ latitude: d.latitude, longitude: d.longitude }} onPress={() => onSelect(d)}>
            <View style={[styles.marker, { backgroundColor: cfg.color }, selected?.id === d.id && styles.markerActive]}>
              <Ionicons name={cfg.icon} size={16} color="#fff" />
            </View>
          </Marker>
        );
      })}
    </MapView>
  );
}

export const supportsNativeMap = true;

const styles = StyleSheet.create({
  marker: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "#fff", ...SHADOW.soft },
  markerActive: { transform: [{ scale: 1.25 }] },
});
