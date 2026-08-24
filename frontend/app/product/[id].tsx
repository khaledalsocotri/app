import React from "react";
import { View, Text, StyleSheet, ScrollView, Platform } from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS, SPACING, RADIUS, FONT, FSIZE } from "@/src/theme/theme";
import { useFetch } from "@/src/hooks/useFetch";
import { DetailHero } from "@/src/components/DetailHero";
import { Stars } from "@/src/components/Stars";
import { Button } from "@/src/components/Button";
import { LoadingState, ErrorState } from "@/src/components/States";
import { useToast } from "@/src/components/Toast";
import { useCart } from "@/src/context/CartContext";
import { useI18n } from "@/src/context/LanguageContext";

export default function ProductDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const cart = useCart();
  const { t, pick, lang } = useI18n();
  const { data: p, loading, error, reload } = useFetch<any>(`/products/${id}`, [id]);

  if (loading) return <View style={styles.root}><LoadingState /></View>;
  if (error || !p) return <View style={styles.root}><ErrorState message={error || undefined} onRetry={reload} /></View>;

  return (
    <View style={styles.root}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <DetailHero images={p.images} favType="product" favId={p.id} shareTitle={p.name_ar} />
        <View style={styles.body}>
          <Text style={styles.title}>{pick(p, "name")}</Text>
          <Text style={styles.subtitle}>{lang === "en" ? p.name_ar : p.name_en}</Text>

          <View style={styles.metaRow}>
            <View style={styles.sellerBox}>
              <Ionicons name="storefront-outline" size={18} color={COLORS.brand} />
              <Text style={styles.seller}>{pick(p, "seller")}</Text>
            </View>
            <Stars rating={p.rating} size={14} />
          </View>

          <View style={styles.avail}>
            <Ionicons name={p.in_stock ? "checkmark-circle" : "close-circle"} size={16} color={p.in_stock ? COLORS.success : COLORS.error} />
            <Text style={[styles.availTxt, { color: p.in_stock ? COLORS.success : COLORS.error }]}>{p.availability_ar}</Text>
          </View>

          <Text style={styles.desc}>{pick(p, "description")}</Text>
        </View>
      </ScrollView>

      <View style={[styles.cta, { paddingBottom: insets.bottom + SPACING.sm }]}>
        <BlurView intensity={Platform.OS === "ios" ? 50 : 100} tint="light" style={StyleSheet.absoluteFill as any} />
        <View style={styles.priceCol}>
          <Text style={styles.priceLabel}>{t("price")}</Text>
          <Text style={styles.price}>${p.price}</Text>
        </View>
        <Button title={t("add_to_cart")} icon="cart" style={{ flex: 1 }} onPress={() => { cart.add(p); toast.show(t("added_to_cart"), "success"); }} testID="add-to-cart" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.surface },
  body: { padding: SPACING.lg, marginTop: -SPACING.xl, backgroundColor: COLORS.surface, borderTopLeftRadius: RADIUS.lg, borderTopRightRadius: RADIUS.lg },
  title: { fontFamily: FONT.displayBold, fontSize: FSIZE.xxxl, color: COLORS.onSurface, textAlign: "right" },
  subtitle: { fontFamily: FONT.body, fontSize: FSIZE.lg, color: COLORS.onSurfaceSecondary, textAlign: "right", marginTop: 2 },
  metaRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: SPACING.md },
  sellerBox: { flexDirection: "row", alignItems: "center", gap: 4 },
  seller: { fontFamily: FONT.medium, fontSize: FSIZE.base, color: COLORS.onSurface },
  avail: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: SPACING.md },
  availTxt: { fontFamily: FONT.bold, fontSize: FSIZE.base },
  desc: { fontFamily: FONT.body, fontSize: FSIZE.lg, lineHeight: 26, color: COLORS.onSurfaceSecondary, textAlign: "right", marginTop: SPACING.lg },
  cta: { position: "absolute", left: 0, right: 0, bottom: 0, flexDirection: "row", alignItems: "center", gap: SPACING.md, paddingHorizontal: SPACING.lg, paddingTop: SPACING.md, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: COLORS.border },
  priceCol: { alignItems: "flex-start" },
  priceLabel: { fontFamily: FONT.body, fontSize: FSIZE.sm, color: COLORS.onSurfaceSecondary },
  price: { fontFamily: FONT.displayBold, fontSize: FSIZE.xxl, color: COLORS.brandPrimary },
});
