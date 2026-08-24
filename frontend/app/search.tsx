import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { COLORS, SPACING, RADIUS, FONT, FSIZE } from "@/src/theme/theme";
import { useI18n } from "@/src/context/LanguageContext";
import { apiFetch } from "@/src/api/client";
import { DestinationRailCard, ExperienceCard, ProductCard, TripCard } from "@/src/components/cards";
import { Rail, Section } from "@/src/components/Section";
import { EmptyState } from "@/src/components/States";

export default function Search() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useI18n();
  const [q, setQ] = useState("");
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (q.trim().length < 2) {
      setResults(null);
      return;
    }
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const res = await apiFetch(`/search?q=${encodeURIComponent(q.trim())}`);
        setResults(res);
      } catch {
        setResults(null);
      } finally {
        setLoading(false);
      }
    }, 350);
    return () => clearTimeout(t);
  }, [q]);

  const total = results
    ? results.destinations.length + results.trips.length + results.experiences.length + results.products.length
    : 0;

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} testID="search-back">
          <Ionicons name="chevron-forward" size={24} color={COLORS.onSurface} />
        </Pressable>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color={COLORS.onSurfaceSecondary} />
          <TextInput
            testID="search-input"
            style={styles.input}
            placeholder={t("search_global_placeholder")}
            placeholderTextColor={COLORS.onSurfaceSecondary}
            value={q}
            onChangeText={setQ}
            autoFocus
            returnKeyType="search"
          />
          {q.length > 0 ? (
            <Pressable onPress={() => setQ("")} hitSlop={8} testID="search-clear">
              <Ionicons name="close-circle" size={20} color={COLORS.onSurfaceSecondary} />
            </Pressable>
          ) : null}
        </View>
      </View>

      {loading ? (
        <View style={{ paddingTop: SPACING.xxxl }}><ActivityIndicator size="large" color={COLORS.brandPrimary} /></View>
      ) : !results ? (
        <View style={{ flex: 1, paddingTop: SPACING.xxl }}>
          <EmptyState icon="search-outline" title={t("search_anything")} subtitle={t("search_anything_sub")} />
        </View>
      ) : total === 0 ? (
        <View style={{ flex: 1, paddingTop: SPACING.xxl }}>
          <EmptyState icon="sad-outline" title={t("no_search_results")} subtitle={`"${q}"`} />
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: SPACING.xxl }} keyboardShouldPersistTaps="handled">
          {results.destinations.length > 0 && (
            <Section title={t("fav_destinations")}><Rail>{results.destinations.map((i: any) => <DestinationRailCard key={i.id} item={i} />)}</Rail></Section>
          )}
          {results.experiences.length > 0 && (
            <Section title={t("fav_experiences")}><Rail>{results.experiences.map((i: any) => <ExperienceCard key={i.id} item={i} />)}</Rail></Section>
          )}
          {results.products.length > 0 && (
            <Section title={t("fav_products")}><Rail>{results.products.map((i: any) => <View key={i.id} style={{ width: 160 }}><ProductCard item={i} width={160} /></View>)}</Rail></Section>
          )}
          {results.trips.length > 0 && (
            <Section title={t("fav_trips")}><View style={{ paddingHorizontal: SPACING.lg, gap: SPACING.lg }}>{results.trips.map((i: any) => <TripCard key={i.id} item={i} />)}</View></Section>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.surface },
  header: { flexDirection: "row", alignItems: "center", gap: SPACING.md, paddingHorizontal: SPACING.lg, paddingBottom: SPACING.md },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.surfaceSecondary, alignItems: "center", justifyContent: "center" },
  searchBox: { flex: 1, flexDirection: "row", alignItems: "center", gap: SPACING.sm, backgroundColor: COLORS.surfaceSecondary, borderRadius: RADIUS.md, paddingHorizontal: SPACING.lg, height: 48 },
  input: { flex: 1, fontFamily: FONT.body, fontSize: FSIZE.base, color: COLORS.onSurface, textAlign: "right", height: "100%" },
});
