import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { COLORS, SPACING, RADIUS, FONT, FSIZE, SHADOW } from "@/src/theme/theme";
import { useI18n } from "@/src/context/LanguageContext";
import { MapLocationCard } from "@/src/components/MapLocationCard";

const REGION = { latitude: 12.5, longitude: 53.95, latitudeDelta: 0.9, longitudeDelta: 0.9 };
const MAP_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#e9f2f2" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#a9dfe4" }] },
  { featureType: "landscape.natural", elementType: "geometry", stylers: [{ color: "#dcebdc" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "administrative", elementType: "geometry", stylers: [{ visibility: "off" }] },
];

// Compact interactive map embedded at the top of Discover (native).
export function DiscoverMap({ destinations, colorMap }: any) {
  const router = useRouter();
  const { t } = useI18n();
  const [sel, setSel] = useState<any>(null);
  return (
    <View style={styles.wrap}>
      <View style={[styles.mapBox, SHADOW.card]}>
        <MapView style={StyleSheet.absoluteFill} provider={PROVIDER_GOOGLE} initialRegion={REGION} customMapStyle={MAP_STYLE} onPress={() => setSel(null)}>
          {(destinations || []).map((d: any) => {
            const cfg = colorMap[d.category] || { color: COLORS.brand, icon: d.marker_icon || "location" };
            return (
              <Marker key={d.id} coordinate={{ latitude: d.latitude, longitude: d.longitude }} onPress={() => setSel(d)}>
                <View style={[styles.pin, { backgroundColor: cfg.color }, sel?.id === d.id && styles.pinActive]}>
                  <Ionicons name={(d.marker_icon || cfg.icon) as any} size={14} color="#fff" />
                </View>
              </Marker>
            );
          })}
        </MapView>
        <View style={styles.badge}>
          <Ionicons name="leaf" size={13} color="#fff" />
          <Text style={styles.badgeTxt}>{t("discover_socotra")}</Text>
        </View>
        <Pressable style={styles.expand} onPress={() => router.push("/(tabs)/map")} testID="discover-map-expand">
          <Ionicons name="expand" size={16} color={COLORS.brand} />
        </Pressable>
        {sel ? (
          <MapLocationCard item={sel} onClose={() => setSel(null)} style={styles.card} />
        ) : null}
      </View>
    </View>
  );
}

export const embedNativeMap = true;

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: SPACING.lg, marginTop: SPACING.lg },
  mapBox: { height: 320, borderRadius: RADIUS.lg, overflow: "hidden", backgroundColor: COLORS.surfaceSecondary },
  pin: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "#fff" },
  pinActive: { transform: [{ scale: 1.25 }] },
  badge: { position: "absolute", top: SPACING.md, right: SPACING.md, flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: COLORS.brand, paddingHorizontal: 10, paddingVertical: 5, borderRadius: RADIUS.pill },
  badgeTxt: { fontFamily: FONT.bold, color: "#fff", fontSize: FSIZE.sm },
  expand: { position: "absolute", top: SPACING.md, left: SPACING.md, width: 34, height: 34, borderRadius: 17, backgroundColor: "#fff", alignItems: "center", justifyContent: "center", ...SHADOW.soft },
  card: { position: "absolute", left: SPACING.md, right: SPACING.md, bottom: SPACING.md },
});
