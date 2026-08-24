import React, { useMemo, useState, useEffect } from "react";
import { View, Text, StyleSheet, Pressable, Platform, Linking } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { COLORS, SPACING, RADIUS, FONT, FSIZE, SHADOW } from "@/src/theme/theme";
import { useI18n } from "@/src/context/LanguageContext";
import { useFetch } from "@/src/hooks/useFetch";
import { CategoryChips } from "@/src/components/CategoryChips";
import { FavoriteButton } from "@/src/components/FavoriteButton";
import { Stars } from "@/src/components/Stars";
import { Button } from "@/src/components/Button";
import { MapCanvas, supportsNativeMap } from "@/src/components/MapCanvas";

const TABBAR = 92;

export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t, pick } = useI18n();
  const [category, setCategory] = useState("all");
  const [selected, setSelected] = useState<any>(null);
  const [granted, setGranted] = useState(false);

  const { data: cats } = useFetch<any[]>("/categories");
  const { data: destinations } = useFetch<any[]>("/destinations");

  const colorMap = useMemo(() => {
    const map: Record<string, { color: string; icon: string }> = {};
    (cats || []).forEach((c) => (map[c.key] = { color: c.color, icon: c.icon }));
    return map;
  }, [cats]);

  const filtered = useMemo(
    () => (destinations || []).filter((d) => category === "all" || d.category === category),
    [destinations, category]
  );

  const requestLocation = async () => {
    const { status, canAskAgain } = await Location.getForegroundPermissionsAsync();
    if (status === "granted") return setGranted(true);
    const res = await Location.requestForegroundPermissionsAsync();
    if (res.status === "granted") setGranted(true);
    else if (!res.canAskAgain || !canAskAgain) Linking.openSettings();
  };

  useEffect(() => {
    Location.getForegroundPermissionsAsync().then((r) => setGranted(r.status === "granted")).catch(() => {});
  }, []);

  const openDirections = (item: any) => {
    const url = Platform.select({
      ios: `maps://?daddr=${item.latitude},${item.longitude}`,
      android: `google.navigation:q=${item.latitude},${item.longitude}`,
      default: `https://www.google.com/maps/search/?api=1&query=${item.latitude},${item.longitude}`,
    });
    Linking.openURL(url as string);
  };

  const chips = (cats || []).map((c) => ({ key: c.key, name_ar: c.name_ar, icon: c.icon }));

  return (
    <View style={styles.root}>
      <MapCanvas destinations={filtered} colorMap={colorMap} selected={selected} granted={granted} onSelect={setSelected} />

      {/* Floating search + chips */}
      <View style={[styles.topWrap, { paddingTop: insets.top + SPACING.sm }]} pointerEvents="box-none">
        <Pressable style={[styles.search, SHADOW.card]} onPress={() => router.push("/search")} testID="map-search">
          <Ionicons name="search" size={20} color={COLORS.onSurfaceSecondary} />
          <Text style={styles.searchTxt}>{t("search_in_map")}</Text>
          <View style={styles.mapPin}><Ionicons name="map" size={16} color={COLORS.brand} /></View>
        </Pressable>
        <CategoryChips chips={chips} active={category} onChange={setCategory} />
      </View>

      {/* Locate button (native only) */}
      {supportsNativeMap && (
        <Pressable style={[styles.locate, { bottom: (selected ? 220 : TABBAR) + SPACING.md }]} onPress={requestLocation} testID="map-locate">
          <Ionicons name={granted ? "locate" : "locate-outline"} size={22} color={COLORS.brand} />
        </Pressable>
      )}

      {/* Preview card */}
      {selected ? (
        <View style={[styles.preview, SHADOW.card, { bottom: TABBAR + SPACING.sm }]} testID="map-preview">
          <Pressable style={styles.previewMain} onPress={() => router.push(`/destination/${selected.id}`)}>
            <Image source={selected.cover_image} style={styles.previewImg} contentFit="cover" />
            <View style={styles.previewBody}>
              <Text style={styles.previewTitle} numberOfLines={1}>{pick(selected, "name")}</Text>
              <View style={styles.previewMeta}>
                <Ionicons name="location-outline" size={13} color={COLORS.onSurfaceSecondary} />
                <Text style={styles.previewLoc} numberOfLines={1}>{pick(selected, "location")}</Text>
                <Stars rating={selected.rating} size={12} />
              </View>
              <Text style={styles.previewDesc} numberOfLines={2}>{pick(selected, "description")}</Text>
            </View>
            <FavoriteButton type="destination" id={selected.id} variant="plain" />
          </Pressable>
          <View style={styles.previewActions}>
            <Button title={t("details")} variant="ghost" icon="information-circle-outline" style={{ flex: 1, height: 44 }} onPress={() => router.push(`/destination/${selected.id}`)} testID="preview-details" />
            <Button title={t("directions")} icon="navigate" style={{ flex: 1, height: 44 }} onPress={() => openDirections(selected)} testID="preview-directions" />
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.surfaceSecondary },
  topWrap: { position: "absolute", top: 0, left: 0, right: 0, gap: SPACING.md },
  search: { flexDirection: "row", alignItems: "center", gap: SPACING.sm, marginHorizontal: SPACING.lg, backgroundColor: COLORS.surface, borderRadius: RADIUS.md, paddingHorizontal: SPACING.lg, height: 52 },
  searchTxt: { flex: 1, fontFamily: FONT.body, fontSize: FSIZE.base, color: COLORS.onSurfaceSecondary, textAlign: "right" },
  mapPin: { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.brandTertiary, alignItems: "center", justifyContent: "center" },
  locate: { position: "absolute", right: SPACING.lg, width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.surface, alignItems: "center", justifyContent: "center", ...SHADOW.card },
  preview: { position: "absolute", left: SPACING.lg, right: SPACING.lg, backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.md },
  previewMain: { flexDirection: "row", alignItems: "center", gap: SPACING.md },
  previewImg: { width: 76, height: 76, borderRadius: RADIUS.md, backgroundColor: COLORS.surfaceSecondary },
  previewBody: { flex: 1 },
  previewTitle: { fontFamily: FONT.bold, fontSize: FSIZE.lg, color: COLORS.onSurface, textAlign: "right" },
  previewMeta: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 2 },
  previewLoc: { fontFamily: FONT.body, fontSize: FSIZE.sm, color: COLORS.onSurfaceSecondary, flex: 1, textAlign: "right" },
  previewDesc: { fontFamily: FONT.body, fontSize: FSIZE.sm, color: COLORS.onSurfaceSecondary, marginTop: 2, textAlign: "right" },
  previewActions: { flexDirection: "row", gap: SPACING.sm, marginTop: SPACING.md },
});
