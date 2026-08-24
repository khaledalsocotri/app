import React, { useState } from "react";
import { View, Text, StyleSheet, FlatList, Pressable, Linking, Platform } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { COLORS, SPACING, RADIUS, FONT, FSIZE, SHADOW } from "@/src/theme/theme";
import { useFetch } from "@/src/hooks/useFetch";
import { useI18n } from "@/src/context/LanguageContext";
import { CategoryChips } from "@/src/components/CategoryChips";
import { LoadingState, ErrorState, EmptyState } from "@/src/components/States";
import { Stars } from "@/src/components/Stars";

const CAT_ICON: Record<string, string> = {
  health: "medkit", fuel: "car", bank: "card", guide: "compass", restaurant: "restaurant", shop: "cart",
};

export default function Services() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t, pick } = useI18n();
  const [category, setCategory] = useState("all");
  const { data, loading, error, reload } = useFetch<any[]>("/services");

  const cats = Array.from(new Set((data || []).map((s) => s.category))).map((k) => ({
    key: k, name_ar: k, icon: CAT_ICON[k] || "ellipse",
  }));
  const list = (data || []).filter((s) => category === "all" || s.category === category);

  const openDirections = (s: any) => {
    if (!s.latitude) return;
    const url = Platform.select({
      ios: `maps://?daddr=${s.latitude},${s.longitude}`,
      android: `google.navigation:q=${s.latitude},${s.longitude}`,
      default: `https://www.google.com/maps/search/?api=1&query=${s.latitude},${s.longitude}`,
    });
    Linking.openURL(url as string);
  };

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} testID="services-back">
          <Ionicons name="chevron-forward" size={24} color={COLORS.onSurface} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{t("services_title")}</Text>
          <Text style={styles.sub}>{t("services_sub")}</Text>
        </View>
      </View>
      {cats.length > 1 ? <CategoryChips chips={cats} active={category} onChange={setCategory} /> : null}

      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : (
        <FlatList
          data={list}
          keyExtractor={(i) => i.id}
          contentContainerStyle={{ padding: SPACING.lg, gap: SPACING.md, paddingBottom: SPACING.xxl }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<EmptyState icon="construct-outline" title={t("no_services")} />}
          renderItem={({ item }) => (
            <View style={[styles.card, SHADOW.soft]} testID={`service-${item.id}`}>
              <Image source={item.cover_image} style={styles.img} contentFit="cover" />
              <View style={{ flex: 1 }}>
                <Text style={styles.name} numberOfLines={1}>{pick(item, "name")}</Text>
                <Text style={styles.desc} numberOfLines={2}>{pick(item, "description")}</Text>
                <View style={styles.metaRow}>
                  <Ionicons name="location-outline" size={13} color={COLORS.onSurfaceSecondary} />
                  <Text style={styles.meta}>{pick(item, "location")}</Text>
                  <Stars rating={item.rating} size={12} />
                </View>
                <View style={styles.actions}>
                  {item.phone ? (
                    <Pressable style={styles.action} onPress={() => Linking.openURL(`tel:${item.phone}`)} testID={`call-${item.id}`}>
                      <Ionicons name="call" size={15} color={COLORS.brand} />
                      <Text style={styles.actionTxt}>{item.phone}</Text>
                    </Pressable>
                  ) : null}
                  {item.latitude ? (
                    <Pressable style={styles.action} onPress={() => openDirections(item)} testID={`dir-${item.id}`}>
                      <Ionicons name="navigate" size={15} color={COLORS.brand} />
                      <Text style={styles.actionTxt}>{t("directions")}</Text>
                    </Pressable>
                  ) : null}
                </View>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.surface },
  header: { flexDirection: "row", alignItems: "center", gap: SPACING.md, paddingHorizontal: SPACING.lg, paddingBottom: SPACING.md },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.surfaceSecondary, alignItems: "center", justifyContent: "center" },
  title: { fontFamily: FONT.displayBold, fontSize: FSIZE.xxl, color: COLORS.onSurface, textAlign: "right" },
  sub: { fontFamily: FONT.body, fontSize: FSIZE.sm, color: COLORS.onSurfaceSecondary, textAlign: "right" },
  card: { flexDirection: "row", gap: SPACING.md, backgroundColor: COLORS.surface, borderRadius: RADIUS.md, padding: SPACING.md, borderWidth: 1, borderColor: COLORS.border },
  img: { width: 80, height: 80, borderRadius: RADIUS.sm, backgroundColor: COLORS.surfaceSecondary },
  name: { fontFamily: FONT.bold, fontSize: FSIZE.lg, color: COLORS.onSurface, textAlign: "right" },
  desc: { fontFamily: FONT.body, fontSize: FSIZE.sm, color: COLORS.onSurfaceSecondary, textAlign: "right", marginTop: 2 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  meta: { fontFamily: FONT.body, fontSize: FSIZE.sm, color: COLORS.onSurfaceSecondary, flex: 1, textAlign: "right" },
  actions: { flexDirection: "row", gap: SPACING.md, marginTop: SPACING.sm },
  action: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: COLORS.brandTertiary, paddingHorizontal: SPACING.md, paddingVertical: 6, borderRadius: RADIUS.pill },
  actionTxt: { fontFamily: FONT.medium, fontSize: FSIZE.sm, color: COLORS.brand },
});
