import React, { useMemo, useState, useEffect } from "react";
import { View, Text, StyleSheet, Pressable, Platform, Linking, Modal, FlatList } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { COLORS, SPACING, RADIUS, FONT, FSIZE, SHADOW } from "@/src/theme/theme";
import { useI18n } from "@/src/context/LanguageContext";
import { useToast } from "@/src/components/Toast";
import { useFetch } from "@/src/hooks/useFetch";
import { CategoryChips } from "@/src/components/CategoryChips";
import { FavoriteButton } from "@/src/components/FavoriteButton";
import { Stars } from "@/src/components/Stars";
import { Button } from "@/src/components/Button";
import { MapCanvas, supportsNativeMap } from "@/src/components/MapCanvas";
import { SOCOTRA_CENTER, SOCOTRA_ZOOM, MAP_TYPE_ORDER, MAP_TYPE_LABEL, MapType } from "@/src/components/mapStyle";

const TABBAR = 92;

export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t, pick } = useI18n();
  const toast = useToast();
  const [category, setCategory] = useState("all");
  const [selected, setSelected] = useState<any>(null);
  const [granted, setGranted] = useState(false);
  const [mapType, setMapType] = useState<MapType>("hybrid");
  const [camera, setCamera] = useState({ center: SOCOTRA_CENTER as [number, number], zoom: SOCOTRA_ZOOM, heading: 0 });
  const [listOpen, setListOpen] = useState(false);

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
    let ok = status === "granted";
    if (!ok) {
      const res = await Location.requestForegroundPermissionsAsync();
      ok = res.status === "granted";
      if (!ok && (!res.canAskAgain || !canAskAgain)) return Linking.openSettings();
    }
    if (!ok) return;
    setGranted(true);
    try {
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setCamera({ center: [pos.coords.longitude, pos.coords.latitude], zoom: 12, heading: 0 });
    } catch {}
  };

  const recenter = () => setCamera({ center: SOCOTRA_CENTER, zoom: SOCOTRA_ZOOM, heading: 0 });
  const cycleMapType = () => {
    const next = MAP_TYPE_ORDER[(MAP_TYPE_ORDER.indexOf(mapType) + 1) % MAP_TYPE_ORDER.length];
    setMapType(next);
    toast.show(MAP_TYPE_LABEL[next], "success");
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
      <MapCanvas destinations={filtered} colorMap={colorMap} selected={selected} granted={granted} onSelect={setSelected} mapType={mapType} camera={camera} />

      {/* Floating search + chips */}
      <View style={[styles.topWrap, { paddingTop: insets.top + SPACING.sm }]} pointerEvents="box-none">
        <View style={styles.brandRow}>
          <View style={styles.brandBadge}><Ionicons name="leaf" size={14} color="#fff" /></View>
          <Text style={styles.brandTitle}>{t("discover_socotra")}</Text>
        </View>
        <Pressable style={[styles.search, SHADOW.card]} onPress={() => router.push("/search")} testID="map-search">
          <Ionicons name="search" size={20} color={COLORS.onSurfaceSecondary} />
          <Text style={styles.searchTxt}>{t("search_in_map")}</Text>
          <View style={styles.mapPin}><Ionicons name="map" size={16} color={COLORS.brand} /></View>
        </Pressable>
        <CategoryChips chips={chips} active={category} onChange={setCategory} />
      </View>

      {/* Right-side floating controls (native map only) */}
      {supportsNativeMap && (
        <View style={[styles.controls, { top: insets.top + 170 }]} pointerEvents="box-none">
          <Pressable style={styles.ctrlBtn} onPress={recenter} testID="map-compass">
            <Ionicons name="compass-outline" size={22} color={COLORS.brand} />
          </Pressable>
          <Pressable style={styles.ctrlBtn} onPress={cycleMapType} testID="map-layers">
            <Ionicons name="layers-outline" size={21} color={COLORS.brand} />
          </Pressable>
          <Pressable style={styles.ctrlBtn} onPress={requestLocation} testID="map-locate">
            <Ionicons name={granted ? "locate" : "locate-outline"} size={22} color={COLORS.brand} />
          </Pressable>
          <Pressable style={styles.ctrlBtn} onPress={() => toast.show(t("download_offline"), "success")} testID="map-download">
            <Ionicons name="download-outline" size={21} color={COLORS.brand} />
          </Pressable>
        </View>
      )}

      {/* Bottom "Explore this area" button (native map only, hidden when a card is open) */}
      {supportsNativeMap && !selected && (
        <Pressable style={[styles.exploreBtn, SHADOW.card, { bottom: TABBAR + SPACING.md }]} onPress={() => setListOpen(true)} testID="map-explore">
          <Ionicons name="chevron-down" size={18} color="#fff" />
          <Text style={styles.exploreTxt}>{t("explore_region")}</Text>
        </Pressable>
      )}

      {/* Explore list sheet */}
      <Modal visible={listOpen} animationType="slide" transparent onRequestClose={() => setListOpen(false)}>
        <Pressable style={styles.sheetBackdrop} onPress={() => setListOpen(false)} />
        <View style={[styles.sheet, { paddingBottom: insets.bottom + SPACING.md }]}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>{t("places_here")} · {filtered.length}</Text>
          <FlatList
            data={filtered}
            keyExtractor={(d) => d.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: SPACING.lg }}
            renderItem={({ item }) => (
              <Pressable style={styles.sheetRow} onPress={() => { setListOpen(false); router.push(`/destination/${item.id}`); }} testID={`explore-row-${item.id}`}>
                <Image source={item.cover_image} style={styles.sheetImg} contentFit="cover" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.sheetName} numberOfLines={1}>{pick(item, "name")}</Text>
                  <View style={styles.sheetMeta}>
                    <Ionicons name="location-outline" size={12} color={COLORS.onSurfaceSecondary} />
                    <Text style={styles.sheetLoc} numberOfLines={1}>{pick(item, "location")}</Text>
                  </View>
                </View>
                <Ionicons name="chevron-back" size={18} color={COLORS.onSurfaceSecondary} />
              </Pressable>
            )}
          />
        </View>
      </Modal>

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
  brandRow: { flexDirection: "row", alignItems: "center", gap: SPACING.sm, paddingHorizontal: SPACING.lg },
  brandBadge: { width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.brand, alignItems: "center", justifyContent: "center" },
  brandTitle: { fontFamily: FONT.displayBold, fontSize: FSIZE.xl, color: COLORS.onSurface },
  search: { flexDirection: "row", alignItems: "center", gap: SPACING.sm, marginHorizontal: SPACING.lg, backgroundColor: COLORS.surface, borderRadius: RADIUS.md, paddingHorizontal: SPACING.lg, height: 52 },
  searchTxt: { flex: 1, fontFamily: FONT.body, fontSize: FSIZE.base, color: COLORS.onSurfaceSecondary, textAlign: "right" },
  mapPin: { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.brandTertiary, alignItems: "center", justifyContent: "center" },
  controls: { position: "absolute", right: SPACING.lg, gap: SPACING.sm },
  ctrlBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.surface, alignItems: "center", justifyContent: "center", ...SHADOW.card },
  exploreBtn: { position: "absolute", alignSelf: "center", flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: COLORS.brand, paddingHorizontal: SPACING.xl, height: 48, borderRadius: 24 },
  exploreTxt: { fontFamily: FONT.bold, fontSize: FSIZE.base, color: "#fff" },
  sheetBackdrop: { flex: 1, backgroundColor: "rgba(10,35,38,0.4)" },
  sheet: { position: "absolute", left: 0, right: 0, bottom: 0, maxHeight: "70%", backgroundColor: COLORS.surface, borderTopLeftRadius: RADIUS.lg, borderTopRightRadius: RADIUS.lg, paddingHorizontal: SPACING.lg, paddingTop: SPACING.md },
  sheetHandle: { alignSelf: "center", width: 44, height: 5, borderRadius: 3, backgroundColor: COLORS.border, marginBottom: SPACING.md },
  sheetTitle: { fontFamily: FONT.displayBold, fontSize: FSIZE.lg, color: COLORS.onSurface, textAlign: "right", marginBottom: SPACING.md },
  sheetRow: { flexDirection: "row", alignItems: "center", gap: SPACING.md, paddingVertical: SPACING.sm },
  sheetImg: { width: 56, height: 56, borderRadius: RADIUS.md, backgroundColor: COLORS.surfaceSecondary },
  sheetName: { fontFamily: FONT.bold, fontSize: FSIZE.base, color: COLORS.onSurface, textAlign: "right" },
  sheetMeta: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  sheetLoc: { flex: 1, fontFamily: FONT.body, fontSize: FSIZE.sm, color: COLORS.onSurfaceSecondary, textAlign: "right" },
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
