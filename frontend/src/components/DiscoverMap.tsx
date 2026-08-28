import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Map, Camera, Marker } from "@maplibre/maplibre-react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { COLORS, SPACING, RADIUS, FONT, FSIZE, SHADOW } from "@/src/theme/theme";
import { useI18n } from "@/src/context/LanguageContext";
import { MapLocationCard } from "@/src/components/MapLocationCard";
import { MapPin } from "@/src/components/MapPin";
import { mapStyleJSON, SOCOTRA_CENTER, SOCOTRA_ZOOM } from "@/src/components/mapStyle";
import { MapFallback, isExpoGo } from "@/src/components/MapFallback";

// Compact interactive satellite map embedded at the top of Discover (native).
export function DiscoverMap({ destinations, colorMap }: any) {
  const router = useRouter();
  const { t } = useI18n();
  const [sel, setSel] = useState<any>(null);
  return (
    <View style={styles.wrap}>
      <View style={[styles.mapBox, SHADOW.card]}>
        {isExpoGo ? (
          <MapFallback style={StyleSheet.absoluteFill} />
        ) : (
        <Map style={StyleSheet.absoluteFill} mapStyle={mapStyleJSON("hybrid")} logo={false} attribution={false} compass={false} onPress={() => setSel(null)}>
          <Camera center={SOCOTRA_CENTER} zoom={SOCOTRA_ZOOM} />
          {(destinations || [])
            .filter((d: any) => typeof d.latitude === "number" && typeof d.longitude === "number")
            .map((d: any) => {
              const cfg = colorMap[d.category] || { color: COLORS.brand, icon: "location" };
              return (
                <Marker key={d.id} coordinate={[d.longitude, d.latitude]} anchor="bottom" onPress={() => setSel(d)}>
                  <MapPin color={cfg.color} icon={d.marker_icon || cfg.icon} active={sel?.id === d.id} />
                </Marker>
              );
            })}
        </Map>
        )}
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
  badge: { position: "absolute", top: SPACING.md, right: SPACING.md, flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: COLORS.brand, paddingHorizontal: 10, paddingVertical: 5, borderRadius: RADIUS.pill },
  badgeTxt: { fontFamily: FONT.bold, color: "#fff", fontSize: FSIZE.sm },
  expand: { position: "absolute", top: SPACING.md, left: SPACING.md, width: 34, height: 34, borderRadius: 17, backgroundColor: "#fff", alignItems: "center", justifyContent: "center", ...SHADOW.soft },
  card: { position: "absolute", left: SPACING.md, right: SPACING.md, bottom: SPACING.md },
});
