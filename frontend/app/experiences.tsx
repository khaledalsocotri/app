import React from "react";
import { View, Text, StyleSheet, FlatList, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { COLORS, SPACING, FONT, FSIZE } from "@/src/theme/theme";
import { useFetch } from "@/src/hooks/useFetch";
import { ExperienceCard } from "@/src/components/cards";
import { LoadingState, ErrorState, EmptyState } from "@/src/components/States";

export default function Experiences() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { data, loading, error, reload } = useFetch<any[]>("/experiences");

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} testID="experiences-back">
          <Ionicons name="chevron-forward" size={24} color={COLORS.onSurface} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>التجارب المحلية</Text>
          <Text style={styles.sub}>عش الثقافة السقطرية الأصيلة</Text>
        </View>
      </View>

      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : (
        <FlatList
          data={data || []}
          keyExtractor={(i) => i.id}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: "space-between" }}
          renderItem={({ item }) => <View style={{ width: "47%" }}><ExperienceCard item={item} /></View>}
          contentContainerStyle={{ padding: SPACING.lg, paddingBottom: SPACING.xxl }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<EmptyState icon="sparkles-outline" title="لا توجد تجارب" />}
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
});
