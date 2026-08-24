import React from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS, SPACING, FONT, FSIZE } from "@/src/theme/theme";
import { useI18n } from "@/src/context/LanguageContext";
import { useFetch } from "@/src/hooks/useFetch";
import { TripCard } from "@/src/components/cards";
import { LoadingState, ErrorState, EmptyState } from "@/src/components/States";

const TABBAR = 92;

export default function Trips() {
  const insets = useSafeAreaInsets();
  const { t } = useI18n();
  const { data, loading, error, reload } = useFetch<any[]>("/trips");

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
        <Text style={styles.title}>{t("trips_title")}</Text>
        <Text style={styles.sub}>{t("trips_sub")}</Text>
      </View>
      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : (
        <FlatList
          data={data || []}
          keyExtractor={(i) => i.id}
          renderItem={({ item }) => <TripCard item={item} />}
          contentContainerStyle={{ padding: SPACING.lg, gap: SPACING.lg, paddingBottom: TABBAR + SPACING.xl }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<EmptyState icon="airplane-outline" title={t("no_trips")} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.surface },
  header: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.sm },
  title: { fontFamily: FONT.displayBold, fontSize: FSIZE.xxl, color: COLORS.onSurface, textAlign: "right" },
  sub: { fontFamily: FONT.body, fontSize: FSIZE.base, color: COLORS.onSurfaceSecondary, textAlign: "right", marginTop: 2 },
});
