import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import { COLORS, SPACING, RADIUS, FONT, FSIZE } from "@/src/theme/theme";
import { useI18n } from "@/src/context/LanguageContext";
import { apiFetch } from "@/src/api/client";
import { useAuth } from "@/src/context/AuthContext";
import { DestinationRailCard, ExperienceCard, ProductCard, TripCard } from "@/src/components/cards";
import { LoadingState, EmptyState } from "@/src/components/States";

const TABBAR = 92;
const TAB_KEYS = [
  { key: "destinations", t: "fav_destinations" },
  { key: "experiences", t: "fav_experiences" },
  { key: "products", t: "fav_products" },
  { key: "trips", t: "fav_trips" },
];

export default function Favorites() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { t } = useI18n();
  const TABS = TAB_KEYS.map((x) => ({ key: x.key, label: t(x.t) }));
  const [tab, setTab] = useState("destinations");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      const res = await apiFetch("/favorites");
      setData(res);
    } catch {
      setData({});
    } finally {
      setLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const items = (data && data[tab]) || [];

  const renderGrid = () => {
    if (tab === "products") {
      return (
        <View style={styles.grid}>
          {items.map((it: any) => <ProductCard key={it.id} item={it} width={"47%" as any} />)}
        </View>
      );
    }
    if (tab === "trips") {
      return <View style={{ gap: SPACING.lg }}>{items.map((it: any) => <TripCard key={it.id} item={it} />)}</View>;
    }
    if (tab === "experiences") {
      return (
        <View style={styles.grid}>
          {items.map((it: any) => <View key={it.id} style={{ width: "47%" }}><ExperienceCard item={it} /></View>)}
        </View>
      );
    }
    return (
      <View style={styles.grid}>
        {items.map((it: any) => <View key={it.id} style={{ width: "47%" }}><DestinationRailCard item={it} /></View>)}
      </View>
    );
  };

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
        <Text style={styles.title}>{t("favorites_title")}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
          {TABS.map((t) => {
            const on = tab === t.key;
            const count = (data && data[t.key]?.length) || 0;
            return (
              <Pressable key={t.key} onPress={() => setTab(t.key)} style={[styles.tab, on && styles.tabOn]} testID={`fav-tab-${t.key}`}>
                <Text style={[styles.tabTxt, on && styles.tabTxtOn]}>{t.label} {count > 0 ? `(${count})` : ""}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {loading ? (
        <LoadingState />
      ) : items.length === 0 ? (
        <EmptyState icon="heart-outline" title={t("no_favorites")} subtitle={t("no_favorites_sub")} />
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: SPACING.lg, paddingBottom: TABBAR + SPACING.xl }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={false} onRefresh={load} tintColor={COLORS.brandPrimary} />}
        >
          {renderGrid()}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.surface },
  header: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.sm },
  title: { fontFamily: FONT.displayBold, fontSize: FSIZE.xxl, color: COLORS.onSurface, textAlign: "right", marginBottom: SPACING.md },
  tabs: { gap: SPACING.sm },
  tab: { paddingHorizontal: SPACING.lg, height: 38, borderRadius: RADIUS.pill, backgroundColor: COLORS.surfaceSecondary, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  tabOn: { backgroundColor: COLORS.brand },
  tabTxt: { fontFamily: FONT.medium, fontSize: FSIZE.base, color: COLORS.onSurfaceSecondary },
  tabTxtOn: { color: COLORS.onBrandPrimary, fontFamily: FONT.bold },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
});
