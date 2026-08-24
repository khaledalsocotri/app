import React from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS, SPACING, RADIUS, FONT, FSIZE, SHADOW } from "@/src/theme/theme";
import { useI18n } from "@/src/context/LanguageContext";
import { Stars } from "./Stars";

const TABBAR = 92;
const HERO = "https://images.unsplash.com/photo-1642425146676-992ad3f73e26?q=85&w=1200";

// Web experience: react-native-maps is native-only, so we render a branded,
// category-grouped "explore Socotra" layout instead of a plain list.
export function MapCanvas({ destinations, colorMap }: any) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t, pick } = useI18n();

  const groups: Record<string, any[]> = {};
  destinations.forEach((d: any) => {
    (groups[d.category] = groups[d.category] || []).push(d);
  });

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 150, paddingBottom: TABBAR + SPACING.xl }} showsVerticalScrollIndicator={false}>
        {/* Hero banner */}
        <View style={styles.hero}>
          <Image source={HERO} style={StyleSheet.absoluteFill as any} contentFit="cover" />
          <LinearGradient colors={["rgba(10,35,38,0.2)", "rgba(10,35,38,0.85)"]} style={StyleSheet.absoluteFill as any} />
          <View style={styles.heroBody}>
            <Text style={styles.heroTitle}>{t("discover_socotra")}</Text>
            <Text style={styles.heroSub}>{destinations.length} {t("location_label")}</Text>
          </View>
        </View>

        {Object.entries(groups).map(([cat, items]) => {
          const cfg = colorMap[cat] || { color: COLORS.brand, icon: "location" };
          return (
            <View key={cat} style={styles.group}>
              <View style={styles.groupHead}>
                <View style={[styles.groupDot, { backgroundColor: cfg.color }]}>
                  <Ionicons name={cfg.icon} size={14} color="#fff" />
                </View>
                <Text style={styles.groupTitle}>{items.length}</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rail}>
                {items.map((d: any) => (
                  <Pressable key={d.id} style={[styles.card, SHADOW.soft]} onPress={() => router.push(`/destination/${d.id}`)} testID={`web-map-${d.id}`}>
                    <Image source={d.cover_image} style={styles.cardImg} contentFit="cover" transition={200} />
                    <View style={[styles.pin, { backgroundColor: cfg.color }]}>
                      <Ionicons name={cfg.icon} size={13} color="#fff" />
                    </View>
                    <View style={styles.cardBody}>
                      <Text style={styles.name} numberOfLines={1}>{pick(d, "name")}</Text>
                      <View style={styles.metaRow}>
                        <Ionicons name="location-outline" size={11} color={COLORS.onSurfaceSecondary} />
                        <Text style={styles.loc} numberOfLines={1}>{pick(d, "location")}</Text>
                        <Stars rating={d.rating} size={11} />
                      </View>
                    </View>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

export const supportsNativeMap = false;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.surface },
  hero: { height: 150, marginHorizontal: SPACING.lg, borderRadius: RADIUS.lg, overflow: "hidden", backgroundColor: COLORS.surfaceSecondary },
  heroBody: { position: "absolute", bottom: SPACING.lg, left: SPACING.lg, right: SPACING.lg },
  heroTitle: { fontFamily: FONT.displayBold, fontSize: FSIZE.xxl, color: "#fff", textAlign: "right" },
  heroSub: { fontFamily: FONT.body, fontSize: FSIZE.base, color: "rgba(255,255,255,0.9)", textAlign: "right", marginTop: 2 },
  group: { marginTop: SPACING.xl },
  groupHead: { flexDirection: "row", alignItems: "center", gap: SPACING.sm, paddingHorizontal: SPACING.lg, marginBottom: SPACING.md },
  groupDot: { width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center" },
  groupTitle: { fontFamily: FONT.bold, fontSize: FSIZE.base, color: COLORS.onSurfaceSecondary },
  rail: { paddingHorizontal: SPACING.lg, gap: SPACING.md },
  card: { width: 200, borderRadius: RADIUS.md, backgroundColor: COLORS.surface, overflow: "hidden", borderWidth: 1, borderColor: COLORS.border },
  cardImg: { width: "100%", height: 110, backgroundColor: COLORS.surfaceSecondary },
  pin: { position: "absolute", top: SPACING.sm, right: SPACING.sm, width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "#fff" },
  cardBody: { padding: SPACING.md },
  name: { fontFamily: FONT.bold, fontSize: FSIZE.base, color: COLORS.onSurface, textAlign: "right" },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  loc: { fontFamily: FONT.body, fontSize: FSIZE.sm, color: COLORS.onSurfaceSecondary, flex: 1, textAlign: "right" },
});
