import React, { useState } from "react";
import { View, Text, StyleSheet, FlatList, Pressable, useWindowDimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { COLORS, SPACING, FONT, FSIZE } from "@/src/theme/theme";
import { useI18n } from "@/src/context/LanguageContext";
import { useFetch } from "@/src/hooks/useFetch";
import { CategoryChips } from "@/src/components/CategoryChips";
import { ProductCard } from "@/src/components/cards";
import { useCart } from "@/src/context/CartContext";
import { LoadingState, ErrorState, EmptyState } from "@/src/components/States";

const COL_GAP = SPACING.md;

export default function Marketplace() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { t } = useI18n();
  const COL_W = (Math.min(width, 640) - SPACING.lg * 2 - COL_GAP) / 2;
  const [category, setCategory] = useState("all");
  const cart = useCart();
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
            <Text style={styles.title}>{t("local_market")}</Text>
            <Text style={styles.sub}>{t("market_sub")}</Text>
          </View>
          <Pressable style={styles.cartBtn} onPress={() => router.push("/cart")} testID="marketplace-cart">
            <Ionicons name="cart-outline" size={24} color={COLORS.onSurface} />
            {cart.count > 0 ? (
              <View style={styles.cartBadge}><Text style={styles.cartBadgeTxt}>{cart.count}</Text></View>
            ) : null}
          </Pressable>
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
          ListEmptyComponent={<EmptyState icon="basket-outline" title={t("no_products")} subtitle={t("try_other_cat")} />}
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
  cartBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.surfaceSecondary, alignItems: "center", justifyContent: "center" },
  cartBadge: { position: "absolute", top: 2, left: 2, minWidth: 18, height: 18, borderRadius: 9, backgroundColor: COLORS.error, alignItems: "center", justifyContent: "center", paddingHorizontal: 4 },
  cartBadgeTxt: { fontFamily: FONT.bold, fontSize: 10, color: "#fff" },
  title: { fontFamily: FONT.displayBold, fontSize: FSIZE.xxl, color: COLORS.onSurface, textAlign: "right" },
  sub: { fontFamily: FONT.body, fontSize: FSIZE.sm, color: COLORS.onSurfaceSecondary, textAlign: "right" },
});
