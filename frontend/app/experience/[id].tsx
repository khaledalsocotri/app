import React from "react";
import { View, Text, StyleSheet, ScrollView, Platform } from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS, SPACING, RADIUS, FONT, FSIZE } from "@/src/theme/theme";
import { useFetch } from "@/src/hooks/useFetch";
import { DetailHero } from "@/src/components/DetailHero";
import { Stars } from "@/src/components/Stars";
import { Button } from "@/src/components/Button";
import { LoadingState, ErrorState } from "@/src/components/States";

export default function ExperienceDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { data: e, loading, error, reload } = useFetch<any>(`/experiences/${id}`, [id]);
  const { data: reviews } = useFetch<any[]>(`/reviews?item_type=experience&item_id=${id}`, [id]);

  if (loading) return <View style={styles.root}><LoadingState /></View>;
  if (error || !e) return <View style={styles.root}><ErrorState message={error || undefined} onRetry={reload} /></View>;

  const info = [
    { icon: "time-outline", label: "المدة", value: e.duration_ar },
    { icon: "location-outline", label: "الموقع", value: e.location_ar },
    { icon: "checkmark-circle-outline", label: "التوفر", value: e.availability_ar },
  ];

  return (
    <View style={styles.root}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <DetailHero images={e.images} favType="experience" favId={e.id} shareTitle={e.name_ar} />
        <View style={styles.body}>
          <Text style={styles.title}>{e.name_ar}</Text>
          <View style={styles.metaRow}>
            <View style={styles.providerBox}>
              <Ionicons name="person-circle-outline" size={18} color={COLORS.brand} />
              <Text style={styles.provider}>{e.provider_ar}</Text>
            </View>
            <View style={styles.ratingBox}>
              <Stars rating={e.rating} size={14} />
              <Text style={styles.reviews}>({e.reviews_count})</Text>
            </View>
          </View>

          <Text style={styles.desc}>{e.description_ar}</Text>

          <View style={styles.infoGrid}>
            {info.map((it) => (
              <View key={it.label} style={styles.infoCard}>
                <Ionicons name={it.icon as any} size={20} color={COLORS.brand} />
                <Text style={styles.infoLabel}>{it.label}</Text>
                <Text style={styles.infoValue} numberOfLines={2}>{it.value}</Text>
              </View>
            ))}
          </View>

          {e.included?.length ? (
            <>
              <Sect icon="gift-outline" title="يشمل" />
              <View style={styles.chips}>
                {e.included.map((x: string) => <View key={x} style={styles.chip}><Text style={styles.chipTxt}>{x}</Text></View>)}
              </View>
            </>
          ) : null}

          <Sect icon="chatbubble-ellipses-outline" title={`التقييمات (${reviews?.length || 0})`} />
          {reviews && reviews.length > 0 ? (
            reviews.map((r) => (
              <View key={r.id} style={styles.review}>
                <View style={styles.reviewHead}>
                  <Text style={styles.reviewName}>{r.user_name}</Text>
                  <Stars rating={r.rating} size={12} />
                </View>
                {r.comment ? <Text style={styles.reviewTxt}>{r.comment}</Text> : null}
              </View>
            ))
          ) : (
            <Text style={styles.noReviews}>كن أول من يقيّم هذه التجربة</Text>
          )}
        </View>
      </ScrollView>

      <View style={[styles.cta, { paddingBottom: insets.bottom + SPACING.sm }]}>
        <BlurView intensity={Platform.OS === "ios" ? 50 : 100} tint="light" style={StyleSheet.absoluteFill as any} />
        <View style={styles.priceCol}>
          <Text style={styles.priceLabel}>السعر للشخص</Text>
          <Text style={styles.price}>${e.price}</Text>
        </View>
        <Button title="احجز التجربة" icon="sparkles" style={{ flex: 1 }} onPress={() => router.push({ pathname: "/booking", params: { type: "experience", id: e.id } })} testID="book-experience" />
      </View>
    </View>
  );
}

function Sect({ icon, title }: { icon: any; title: string }) {
  return (
    <View style={styles.sect}>
      <Ionicons name={icon} size={18} color={COLORS.brand} />
      <Text style={styles.sectTxt}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.surface },
  body: { padding: SPACING.lg, marginTop: -SPACING.xl, backgroundColor: COLORS.surface, borderTopLeftRadius: RADIUS.lg, borderTopRightRadius: RADIUS.lg },
  title: { fontFamily: FONT.displayBold, fontSize: FSIZE.xxxl, color: COLORS.onSurface, textAlign: "right" },
  metaRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: SPACING.md },
  providerBox: { flexDirection: "row", alignItems: "center", gap: 4 },
  provider: { fontFamily: FONT.medium, fontSize: FSIZE.base, color: COLORS.onSurface },
  ratingBox: { flexDirection: "row", alignItems: "center", gap: 4 },
  reviews: { fontFamily: FONT.body, fontSize: FSIZE.sm, color: COLORS.onSurfaceSecondary },
  desc: { fontFamily: FONT.body, fontSize: FSIZE.lg, lineHeight: 26, color: COLORS.onSurfaceSecondary, textAlign: "right", marginTop: SPACING.md },
  infoGrid: { flexDirection: "row", gap: SPACING.sm, marginTop: SPACING.lg },
  infoCard: { flex: 1, backgroundColor: COLORS.surfaceSecondary, borderRadius: RADIUS.md, padding: SPACING.md, gap: 4, alignItems: "flex-end" },
  infoLabel: { fontFamily: FONT.body, fontSize: FSIZE.sm, color: COLORS.onSurfaceSecondary, textAlign: "right" },
  infoValue: { fontFamily: FONT.bold, fontSize: FSIZE.base, color: COLORS.onSurface, textAlign: "right" },
  sect: { flexDirection: "row", alignItems: "center", gap: SPACING.sm, marginTop: SPACING.xl, marginBottom: SPACING.sm },
  sectTxt: { fontFamily: FONT.displayBold, fontSize: FSIZE.xl, color: COLORS.onSurface },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: SPACING.sm },
  chip: { backgroundColor: COLORS.brandTertiary, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm, borderRadius: RADIUS.pill },
  chipTxt: { fontFamily: FONT.medium, fontSize: FSIZE.base, color: COLORS.onBrandTertiary },
  review: { backgroundColor: COLORS.surfaceSecondary, borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.sm },
  reviewHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  reviewName: { fontFamily: FONT.bold, fontSize: FSIZE.base, color: COLORS.onSurface },
  reviewTxt: { fontFamily: FONT.body, fontSize: FSIZE.base, color: COLORS.onSurfaceSecondary, textAlign: "right", marginTop: 4 },
  noReviews: { fontFamily: FONT.body, fontSize: FSIZE.base, color: COLORS.onSurfaceSecondary, textAlign: "right" },
  cta: { position: "absolute", left: 0, right: 0, bottom: 0, flexDirection: "row", alignItems: "center", gap: SPACING.md, paddingHorizontal: SPACING.lg, paddingTop: SPACING.md, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: COLORS.border },
  priceCol: { alignItems: "flex-start" },
  priceLabel: { fontFamily: FONT.body, fontSize: FSIZE.sm, color: COLORS.onSurfaceSecondary },
  price: { fontFamily: FONT.displayBold, fontSize: FSIZE.xxl, color: COLORS.brandPrimary },
});
