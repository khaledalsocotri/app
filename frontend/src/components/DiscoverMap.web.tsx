import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { COLORS, SPACING, RADIUS, FONT, FSIZE, SHADOW } from "@/src/theme/theme";
import { useI18n } from "@/src/context/LanguageContext";
import { MapLocationCard } from "@/src/components/MapLocationCard";

const HERO = "https://images.unsplash.com/photo-1642425146676-992ad3f73e26?q=85&w=1200";

// Web: react-native-maps is native-only. Show a branded interactive-map banner
// with quick pins; tapping a pin reveals a rich, admin-controlled preview card.
export function DiscoverMap({ destinations, colorMap }: any) {
  const router = useRouter();
  const { t, pick } = useI18n();
  const [sel, setSel] = useState<any>(null);
  return (
    <View style={styles.wrap}>
      <Pressable style={[styles.hero, SHADOW.card]} onPress={() => router.push("/(tabs)/map")} testID="discover-map-expand">
        <Image source={HERO} style={StyleSheet.absoluteFill as any} contentFit="cover" />
        <LinearGradient colors={["rgba(10,35,38,0.2)", "rgba(10,35,38,0.85)"]} style={StyleSheet.absoluteFill as any} />
        <View style={styles.badge}><Ionicons name="leaf" size={13} color="#fff" /><Text style={styles.badgeTxt}>{t("discover_socotra")}</Text></View>
        <View style={styles.heroBody}>
          <Text style={styles.heroTitle}>{t("discover_socotra")}</Text>
          <View style={styles.openBtn}><Ionicons name="map" size={15} color={COLORS.brand} /><Text style={styles.openTxt}>{t("details")}</Text></View>
        </View>
      </Pressable>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rail}>
        {(destinations || []).slice(0, 12).map((d: any) => {
          const cfg = colorMap[d.category] || { color: COLORS.brand, icon: "location" };
          const active = sel?.id === d.id;
          return (
            <Pressable
              key={d.id}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => setSel(active ? null : d)}
              testID={`discover-pin-${d.id}`}
            >
              <View style={[styles.chipPin, { backgroundColor: cfg.color }]}>
                <Ionicons name={(d.marker_icon || cfg.icon) as any} size={12} color="#fff" />
              </View>
              <Text style={styles.chipTxt} numberOfLines={1}>{pick(d, "name")}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
      {sel ? (
        <View style={styles.cardWrap}>
          <MapLocationCard item={sel} onClose={() => setSel(null)} />
        </View>
      ) : null}
    </View>
  );
}

export const embedNativeMap = false;

const styles = StyleSheet.create({
  wrap: { marginTop: SPACING.lg },
  hero: { height: 200, marginHorizontal: SPACING.lg, borderRadius: RADIUS.lg, overflow: "hidden", backgroundColor: COLORS.surfaceSecondary },
  badge: { position: "absolute", top: SPACING.md, right: SPACING.md, flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: COLORS.brand, paddingHorizontal: 10, paddingVertical: 5, borderRadius: RADIUS.pill },
  badgeTxt: { fontFamily: FONT.bold, color: "#fff", fontSize: FSIZE.sm },
  heroBody: { position: "absolute", left: SPACING.lg, right: SPACING.lg, bottom: SPACING.lg, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  heroTitle: { fontFamily: FONT.displayBold, fontSize: FSIZE.xxl, color: "#fff" },
  openBtn: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#fff", paddingHorizontal: SPACING.md, paddingVertical: 8, borderRadius: RADIUS.pill },
  openTxt: { fontFamily: FONT.bold, color: COLORS.brand, fontSize: FSIZE.sm },
  rail: { paddingHorizontal: SPACING.lg, gap: SPACING.sm, paddingTop: SPACING.md },
  chip: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.pill, paddingHorizontal: SPACING.md, paddingVertical: 6, maxWidth: 180 },
  chipActive: { borderColor: COLORS.brand, backgroundColor: COLORS.brandTertiary },
  chipPin: { width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  chipTxt: { fontFamily: FONT.medium, fontSize: FSIZE.sm, color: COLORS.onSurface },
  cardWrap: { marginHorizontal: SPACING.lg, marginTop: SPACING.md },
});
