import React from "react";
import { View, Text, StyleSheet, ScrollView, Platform } from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS, SPACING, RADIUS, FONT, FSIZE } from "@/src/theme/theme";
import { useFetch } from "@/src/hooks/useFetch";
import { useI18n } from "@/src/context/LanguageContext";
import { DetailHero } from "@/src/components/DetailHero";
import { Stars } from "@/src/components/Stars";
import { Button } from "@/src/components/Button";
import { LoadingState, ErrorState } from "@/src/components/States";
import { ReviewsSection } from "@/src/components/Reviews";

export default function TripDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t: tr, pick, lang } = useI18n();
  const { data: t, loading, error, reload } = useFetch<any>(`/trips/${id}`, [id]);

  if (loading) return <View style={styles.root}><LoadingState /></View>;
  if (error || !t) return <View style={styles.root}><ErrorState message={error || undefined} onRetry={reload} /></View>;

  const highlights = [
    { icon: "time-outline", label: `${t.duration_days} ${tr("days")}` },
    { icon: "people-outline", label: `${t.available_seats} ${tr("seats_available")}` },
    { icon: "star", label: `${t.rating?.toFixed(1)}` },
  ];

  return (
    <View style={styles.root}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <DetailHero images={t.images} favType="trip" favId={t.id} shareTitle={t.name_ar} />
        <View style={styles.body}>
          <Text style={styles.title}>{pick(t, "name")}</Text>
          <Text style={styles.subtitle}>{lang === "en" ? t.name_ar : t.name_en}</Text>

          <View style={styles.highlights}>
            {highlights.map((h) => (
              <View key={h.label} style={styles.hl}>
                <Ionicons name={h.icon as any} size={18} color={COLORS.brand} />
                <Text style={styles.hlTxt}>{h.label}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.desc}>{pick(t, "description")}</Text>

          <Sect icon="calendar-outline" title={tr("available_dates")} />
          <View style={styles.chips}>
            {(t.dates_ar || []).map((d: string) => (
              <View key={d} style={styles.dateChip}><Text style={styles.dateChipTxt}>{d}</Text></View>
            ))}
          </View>

          <Sect icon="list-outline" title={tr("itinerary")} />
          <View style={styles.timeline}>
            {(t.itinerary || []).map((step: any, i: number) => (
              <View key={i} style={styles.tlRow}>
                <View style={styles.tlLine}>
                  <View style={styles.tlDot}><Text style={styles.tlDotTxt}>{step.day}</Text></View>
                  {i < t.itinerary.length - 1 ? <View style={styles.tlBar} /> : null}
                </View>
                <View style={styles.tlBody}>
                  <Text style={styles.tlTitle}>{step.title_ar}</Text>
                  <Text style={styles.tlDesc}>{step.desc_ar}</Text>
                </View>
              </View>
            ))}
          </View>

          <Sect icon="checkmark-circle-outline" title={tr("includes")} />
          {(t.included || []).map((x: string) => (
            <View key={x} style={styles.incRow}>
              <Ionicons name="checkmark-circle" size={18} color={COLORS.success} />
              <Text style={styles.incTxt}>{x}</Text>
            </View>
          ))}

          <Sect icon="close-circle-outline" title={tr("excludes")} />
          {(t.excluded || []).map((x: string) => (
            <View key={x} style={styles.incRow}>
              <Ionicons name="close-circle" size={18} color={COLORS.error} />
              <Text style={styles.incTxt}>{x}</Text>
            </View>
          ))}

          <View style={styles.twoCol}>
            <View style={styles.colCard}>
              <Ionicons name="bed-outline" size={20} color={COLORS.brand} />
              <Text style={styles.colLabel}>{tr("accommodation")}</Text>
              <Text style={styles.colVal}>{t.accommodation_ar}</Text>
            </View>
            <View style={styles.colCard}>
              <Ionicons name="car-outline" size={20} color={COLORS.brand} />
              <Text style={styles.colLabel}>{tr("transportation")}</Text>
              <Text style={styles.colVal}>{t.transportation_ar}</Text>
            </View>
          </View>

          <ReviewsSection itemType="trip" itemId={t.id} />
        </View>
      </ScrollView>

      <View style={[styles.cta, { paddingBottom: insets.bottom + SPACING.sm }]}>
        <BlurView intensity={Platform.OS === "ios" ? 50 : 100} tint="light" style={StyleSheet.absoluteFill as any} />
        <View style={styles.priceCol}>
          <Text style={styles.priceLabel}>{tr("starting_from")}</Text>
          <Text style={styles.price}>${t.price}</Text>
        </View>
        <Button
          title={tr("book_now")}
          icon="airplane"
          style={{ flex: 1 }}
          onPress={() => router.push({ pathname: "/booking", params: { type: "trip", id: t.id } })}
          testID="book-trip"
        />
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
  subtitle: { fontFamily: FONT.body, fontSize: FSIZE.lg, color: COLORS.onSurfaceSecondary, textAlign: "right", marginTop: 2 },
  highlights: { flexDirection: "row", gap: SPACING.sm, marginTop: SPACING.md },
  hl: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, backgroundColor: COLORS.surfaceSecondary, borderRadius: RADIUS.md, paddingVertical: SPACING.md },
  hlTxt: { fontFamily: FONT.bold, fontSize: FSIZE.base, color: COLORS.onSurface },
  desc: { fontFamily: FONT.body, fontSize: FSIZE.lg, lineHeight: 26, color: COLORS.onSurfaceSecondary, textAlign: "right", marginTop: SPACING.lg },
  sect: { flexDirection: "row", alignItems: "center", gap: SPACING.sm, marginTop: SPACING.xl, marginBottom: SPACING.sm },
  sectTxt: { fontFamily: FONT.displayBold, fontSize: FSIZE.xl, color: COLORS.onSurface },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: SPACING.sm },
  dateChip: { backgroundColor: COLORS.brandTertiary, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm, borderRadius: RADIUS.pill },
  dateChipTxt: { fontFamily: FONT.medium, fontSize: FSIZE.base, color: COLORS.onBrandTertiary },
  timeline: { marginTop: SPACING.sm },
  tlRow: { flexDirection: "row", gap: SPACING.md },
  tlLine: { alignItems: "center", width: 40 },
  tlDot: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.brand, alignItems: "center", justifyContent: "center" },
  tlDotTxt: { fontFamily: FONT.bold, color: "#fff", fontSize: FSIZE.base },
  tlBar: { width: 2, flex: 1, backgroundColor: COLORS.border, marginVertical: 4 },
  tlBody: { flex: 1, paddingBottom: SPACING.lg },
  tlTitle: { fontFamily: FONT.bold, fontSize: FSIZE.lg, color: COLORS.onSurface, textAlign: "right" },
  tlDesc: { fontFamily: FONT.body, fontSize: FSIZE.base, color: COLORS.onSurfaceSecondary, textAlign: "right", marginTop: 2 },
  incRow: { flexDirection: "row", alignItems: "center", gap: SPACING.sm, marginBottom: SPACING.sm },
  incTxt: { fontFamily: FONT.body, fontSize: FSIZE.lg, color: COLORS.onSurface, textAlign: "right", flex: 1 },
  twoCol: { flexDirection: "row", gap: SPACING.md, marginTop: SPACING.lg },
  colCard: { flex: 1, backgroundColor: COLORS.surfaceSecondary, borderRadius: RADIUS.md, padding: SPACING.lg, gap: 4, alignItems: "flex-end" },
  colLabel: { fontFamily: FONT.body, fontSize: FSIZE.sm, color: COLORS.onSurfaceSecondary },
  colVal: { fontFamily: FONT.bold, fontSize: FSIZE.base, color: COLORS.onSurface, textAlign: "right" },
  cta: { position: "absolute", left: 0, right: 0, bottom: 0, flexDirection: "row", alignItems: "center", gap: SPACING.md, paddingHorizontal: SPACING.lg, paddingTop: SPACING.md, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: COLORS.border },
  priceCol: { alignItems: "flex-start" },
  priceLabel: { fontFamily: FONT.body, fontSize: FSIZE.sm, color: COLORS.onSurfaceSecondary },
  price: { fontFamily: FONT.displayBold, fontSize: FSIZE.xxl, color: COLORS.brandPrimary },
});
