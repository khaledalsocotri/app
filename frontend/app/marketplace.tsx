import React, { useState } from "react";
import { View, Text, StyleSheet, FlatList, Pressable, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { COLORS, SPACING, FONT, FSIZE } from "@/src/theme/theme";
import { useFetch } from "@/src/hooks/useFetch";
import { CategoryChips } from "@/src/components/CategoryChips";
import { ProductCard } from "@/src/components/cards";
import { LoadingState, ErrorState, EmptyState } from "@/src/components/States";

const { width } = Dimensions.get("window");
const COL_W = (width - SPACING.lg * 2 - SPACING.md) / 2;

export default function Marketplace() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [category, setCategory] = useState("all");
  const { data: cats } = useFetch<any[]>("/marketplace/categories");
  const { data: products, loading, error, reload } = useFetch<any[]>(
    `/products${category !== "all" ? `?category=${category}` : ""}`,
    [category]
  );

  const chips = (cats || []).map((c) => ({ key: c.key, name_ar: c.name_ar, icon: c.icon }));

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} style={styles.backBtn} testID="marketplace-back">
            <Ionicons name="chevron-forward" size={24} color={COLORS.onSurface} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>التسويق المحلي</Text>
            <Text style={styles.sub}>حرف ومنتجات وتجارب سقطرية أصيلة</Text>
          </View>
        </View>
        <CategoryChips chips={chips} active={category} onChange={setCategory} />
      </View>

      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : (
        <FlatList
          data={products || []}
          keyExtractor={(i) => i.id}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: "space-between" }}
          renderItem={({ item }) => <ProductCard item={item} width={COL_W} />}
          contentContainerStyle={{ padding: SPACING.lg, paddingBottom: SPACING.xxl }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<EmptyState icon="basket-outline" title="لا توجد منتجات" subtitle="جرّب فئة أخرى" />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.surface },
  header: { paddingBottom: SPACING.sm, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: COLORS.divider },
  headerRow: { flexDirection: "row", alignItems: "center", gap: SPACING.md, paddingHorizontal: SPACING.lg, marginBottom: SPACING.md },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.surfaceSecondary, alignItems: "center", justifyContent: "center" },
  title: { fontFamily: FONT.displayBold, fontSize: FSIZE.xxl, color: COLORS.onSurface, textAlign: "right" },
  sub: { fontFamily: FONT.body, fontSize: FSIZE.sm, color: COLORS.onSurfaceSecondary, textAlign: "right" },
});
