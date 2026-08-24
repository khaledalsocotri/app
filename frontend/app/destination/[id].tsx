import React from "react";
import { View, Text, StyleSheet, ScrollView, Platform, Linking } from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS, SPACING, RADIUS, FONT, FSIZE } from "@/src/theme/theme";
import { useFetch } from "@/src/hooks/useFetch";
import { useI18n } from "@/src/context/LanguageContext";
import { DetailHero } from "@/src/components/DetailHero";
import { Stars } from "@/src/components/Stars";
import { DestinationRailCard } from "@/src/components/cards";
import { Rail } from "@/src/components/Section";
import { ReviewsSection } from "@/src/components/Reviews";
import { Button } from "@/src/components/Button";
import { LoadingState, ErrorState } from "@/src/components/States";

export default function DestinationDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { t, pick, lang } = useI18n();
  const { data: d, loading, error, reload } = useFetch<any>(`/destinations/${id}`, [id]);

  if (loading) return <View style={styles.root}><LoadingState /></View>;
  if (error || !d) return <View style={styles.root}><ErrorState message={error || undefined} onRetry={reload} /></View>;

  const info = [
    { icon: "calendar-outline", label: t("best_time"), value: d.best_time_ar },
    { icon: "time-outline", label: t("duration"), value: d.duration_ar },
    { icon: "trending-up-outline", label: t("difficulty"), value: d.difficulty_ar },
    { icon: "car-outline", label: t("vehicle"), value: d.vehicle_ar },
    { icon: "wifi-outline", label: t("internet"), value: d.internet_ar },
  ];

  const openDirections = () => {
    const url = Platform.select({
      ios: `maps://?daddr=${d.latitude},${d.longitude}`,
      android: `google.navigation:q=${d.latitude},${d.longitude}`,
      default: `https://www.google.com/maps/search/?api=1&query=${d.latitude},${d.longitude}`,
    });
    Linking.openURL(url as string);
  };

  return (
    <View style={styles.root}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 110 }}>
        <DetailHero images={d.images} favType="destination" favId={d.id} shareTitle={d.name_ar} />

        <View style={styles.body}>
          <Text style={styles.title}>{pick(d, "name")}</Text>
          <Text style={styles.subtitle}>{lang === "en" ? d.name_ar : d.name_en}</Text>
          <View style={styles.metaRow}>
            <View style={styles.locBox}>
              <Ionicons name="location" size={16} color={COLORS.brand} />
              <Text style={styles.locTxt}>{pick(d, "location")}</Text>
            </View>
            <View style={styles.ratingBox}>
              <Stars rating={d.rating} size={14} />
              <Text style={styles.reviews}>({d.reviews_count})</Text>
            </View>
          </View>

          <Text style={styles.desc}>{pick(d, "description")}</Text>

          {/* Info grid */}
          <View style={styles.infoGrid}>
            {info.map((it) => (
              <View key={it.label} style={styles.infoCard}>
                <Ionicons name={it.icon as any} size={20} color={COLORS.brand} />
                <Text style={styles.infoLabel}>{it.label}</Text>
                <Text style={styles.infoValue} numberOfLines={2}>{it.value}</Text>
              </View>
            ))}
          </View>

          <SectionTitle icon="navigate-outline" title={t("how_to_get")} />
          <Text style={styles.desc}>{d.how_to_get_ar}</Text>

          {d.activities?.length ? (
            <>
              <SectionTitle icon="bicycle-outline" title={t("available_activities")} />
              <View style={styles.chips}>
                {d.activities.map((a: string) => (
                  <View key={a} style={styles.chip}><Text style={styles.chipTxt}>{a}</Text></View>
                ))}
              </View>
            </>
          ) : null}

          {d.nearby_services?.length ? (
            <>
              <SectionTitle icon="business-outline" title={t("nearby_services")} />
              <View style={styles.chips}>
                {d.nearby_services.map((s: string) => (
                  <View key={s} style={[styles.chip, styles.chipAlt]}><Text style={styles.chipTxt}>{s}</Text></View>
                ))}
              </View>
            </>
          ) : null}

          <ReviewsSection itemType="destination" itemId={d.id} />

          {d.related?.length ? (
            <View style={{ marginTop: SPACING.xl, marginHorizontal: -SPACING.lg }}>
              <SectionTitle icon="compass-outline" title={t("similar_destinations")} style={{ marginHorizontal: SPACING.lg }} />
              <Rail>
                {d.related.map((r: any) => <DestinationRailCard key={r.id} item={r} />)}
              </Rail>
            </View>
          ) : null}
        </View>
      </ScrollView>

      {/* Sticky CTA */}
      <View style={[styles.cta, { paddingBottom: insets.bottom + SPACING.sm }]}>
        <BlurView intensity={Platform.OS === "ios" ? 50 : 100} tint="light" style={StyleSheet.absoluteFill as any} />
        <Button title={t("get_directions")} icon="navigate" onPress={openDirections} testID="get-directions" />
      </View>
    </View>
  );
}

function SectionTitle({ icon, title, style }: { icon: any; title: string; style?: any }) {
  return (
    <View style={[styles.sectTitle, style]}>
      <Ionicons name={icon} size={18} color={COLORS.brand} />
      <Text style={styles.sectTitleTxt}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.surface },
  body: { padding: SPACING.lg, marginTop: -SPACING.xl, backgroundColor: COLORS.surface, borderTopLeftRadius: RADIUS.lg, borderTopRightRadius: RADIUS.lg },
  title: { fontFamily: FONT.displayBold, fontSize: FSIZE.xxxl, color: COLORS.onSurface, textAlign: "right" },
  subtitle: { fontFamily: FONT.body, fontSize: FSIZE.lg, color: COLORS.onSurfaceSecondary, textAlign: "right", marginTop: 2 },
  metaRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: SPACING.md },
  locBox: { flexDirection: "row", alignItems: "center", gap: 4 },
  locTxt: { fontFamily: FONT.medium, fontSize: FSIZE.base, color: COLORS.onSurface },
  ratingBox: { flexDirection: "row", alignItems: "center", gap: 4 },
  reviews: { fontFamily: FONT.body, fontSize: FSIZE.sm, color: COLORS.onSurfaceSecondary },
  desc: { fontFamily: FONT.body, fontSize: FSIZE.lg, lineHeight: 26, color: COLORS.onSurfaceSecondary, textAlign: "right", marginTop: SPACING.md },
  infoGrid: { flexDirection: "row", flexWrap: "wrap", gap: SPACING.sm, marginTop: SPACING.lg },
  infoCard: { width: "31.5%", backgroundColor: COLORS.surfaceSecondary, borderRadius: RADIUS.md, padding: SPACING.md, gap: 4, alignItems: "flex-end" },
  infoLabel: { fontFamily: FONT.body, fontSize: FSIZE.sm, color: COLORS.onSurfaceSecondary, textAlign: "right" },
  infoValue: { fontFamily: FONT.bold, fontSize: FSIZE.base, color: COLORS.onSurface, textAlign: "right" },
  sectTitle: { flexDirection: "row", alignItems: "center", gap: SPACING.sm, marginTop: SPACING.xl, marginBottom: SPACING.sm },
  sectTitleTxt: { fontFamily: FONT.displayBold, fontSize: FSIZE.xl, color: COLORS.onSurface },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: SPACING.sm },
  chip: { backgroundColor: COLORS.brandTertiary, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm, borderRadius: RADIUS.pill },
  chipAlt: { backgroundColor: COLORS.surfaceSecondary },
  chipTxt: { fontFamily: FONT.medium, fontSize: FSIZE.base, color: COLORS.onBrandTertiary },
  cta: { position: "absolute", left: 0, right: 0, bottom: 0, paddingHorizontal: SPACING.lg, paddingTop: SPACING.md, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: COLORS.border },
});
