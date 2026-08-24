import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, useWindowDimensions } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { COLORS, SPACING, RADIUS, FONT, FSIZE, SHADOW } from "@/src/theme/theme";
import { useFetch } from "@/src/hooks/useFetch";
import { useAuth } from "@/src/context/AuthContext";
import { useI18n } from "@/src/context/LanguageContext";
import { Section, Rail } from "@/src/components/Section";
import { DestinationRailCard, ExperienceCard, ProductCard, TripCard, PromoCard } from "@/src/components/cards";
import { FavoriteButton } from "@/src/components/FavoriteButton";
import { Stars } from "@/src/components/Stars";
import { LoadingState, ErrorState } from "@/src/components/States";

const TABBAR = 92;

const QUICK = [
  { key: "marketplace", tkey: "q_marketplace", icon: "storefront", color: "#C39158", route: "/marketplace" },
  { key: "experiences", tkey: "q_experiences", icon: "sparkles", color: "#0F6B76", route: "/experiences" },
  { key: "map", tkey: "q_map", icon: "map", color: "#158C9B", route: "/(tabs)/map" },
  { key: "trips", tkey: "q_trips", icon: "airplane", color: "#4A6E8C", route: "/(tabs)/trips" },
];

export default function Discover() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const { t, pick } = useI18n();
  const { width } = useWindowDimensions();
  const HERO_W = Math.min(width, 640) - SPACING.lg * 2;
  const { data, loading, error, reload } = useFetch<any>("/discover");

  return (
    <View style={styles.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: insets.top + SPACING.sm, paddingBottom: TABBAR + SPACING.xl }}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.hi}>{t("hello")} {user?.name?.split(" ")[0] || ""} 👋</Text>
            <Text style={styles.headTitle}>{t("discover_socotra")}</Text>
          </View>
          <Pressable style={styles.bell} onPress={() => router.push("/(tabs)/account")} testID="header-avatar">
            <Ionicons name="notifications-outline" size={22} color={COLORS.onSurface} />
          </Pressable>
        </View>

        {/* Search */}
        <Pressable style={styles.search} onPress={() => router.push("/search")} testID="discover-search">
          <Ionicons name="search" size={20} color={COLORS.onSurfaceSecondary} />
          <Text style={styles.searchTxt}>{t("search_placeholder")}</Text>
        </Pressable>

        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : (
          <>
            {/* Featured hero carousel */}
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              snapToInterval={HERO_W + SPACING.md}
              decelerationRate="fast"
              contentContainerStyle={styles.heroRail}
              style={{ marginTop: SPACING.lg }}
            >
              {(data.featured_destinations || []).map((item: any) => (
                <Pressable
                  key={item.id}
                  style={[styles.hero, { width: HERO_W }, SHADOW.card]}
                  onPress={() => router.push(`/destination/${item.id}`)}
                  testID={`hero-${item.id}`}
                >
                  <Image source={item.cover_image} style={StyleSheet.absoluteFill as any} contentFit="cover" transition={250} />
                  <LinearGradient colors={["transparent", "rgba(10,35,38,0.9)"]} style={styles.heroScrim} />
                  <View style={styles.heroFav}><FavoriteButton type="destination" id={item.id} /></View>
                  <View style={styles.featBadge}>
                    <Ionicons name="star" size={12} color="#fff" />
                    <Text style={styles.featBadgeTxt}>{t("featured")}</Text>
                  </View>
                  <View style={styles.heroBody}>
                    <View style={styles.locRow}>
                      <Ionicons name="location" size={13} color="#fff" />
                      <Text style={styles.locTxt}>{pick(item, "location")}</Text>
                    </View>
                    <Text style={styles.heroTitle} numberOfLines={1}>{pick(item, "name")}</Text>
                    <View style={styles.heroMeta}>
                      <Stars rating={item.rating} size={13} />
                      <Text style={styles.heroMetaTxt}>· {item.name_en}</Text>
                    </View>
                  </View>
                </Pressable>
              ))}
            </ScrollView>

            {/* Quick access */}
            <View style={styles.quickRow}>
              {QUICK.map((q) => (
                <Pressable key={q.key} style={styles.quick} onPress={() => router.push(q.route as any)} testID={`quick-${q.key}`}>
                  <View style={[styles.quickIcon, { backgroundColor: q.color }]}>
                    <Ionicons name={q.icon as any} size={22} color="#fff" />
                  </View>
                  <Text style={styles.quickLabel}>{t(q.tkey)}</Text>
                </Pressable>
              ))}
            </View>

            <Section title={t("sec_popular")} subtitle={t("sec_popular_sub")} onSeeAll={() => router.push("/(tabs)/map")}>
              <Rail>
                {(data.popular_places || []).map((it: any) => <DestinationRailCard key={it.id} item={it} />)}
              </Rail>
            </Section>

            <Section title={t("sec_local_exp")} subtitle={t("sec_local_exp_sub")} onSeeAll={() => router.push("/experiences")}>
              <Rail>
                {(data.experiences || []).map((it: any) => <ExperienceCard key={it.id} item={it} />)}
              </Rail>
            </Section>

            <Section title={t("sec_local_prod")} subtitle={t("sec_local_prod_sub")} onSeeAll={() => router.push("/marketplace")}>
              <Rail>
                {(data.products || []).map((it: any) => (
                  <View key={it.id} style={{ width: 160 }}>
                    <ProductCard item={it} width={160} />
                  </View>
                ))}
              </Rail>
            </Section>

            {(data.offers || []).length > 0 && (
              <Section title={t("sec_offers")} subtitle={t("sec_offers_sub")}>
                <Rail>
                  {(data.offers || []).map((it: any) => <PromoCard key={it.id} item={it} kind="offer" />)}
                </Rail>
              </Section>
            )}

            {(data.events || []).length > 0 && (
              <Section title={t("sec_events")}>
                <Rail>
                  {(data.events || []).map((it: any) => <PromoCard key={it.id} item={it} kind="event" />)}
                </Rail>
              </Section>
            )}

            <Section title={t("sec_trips")} subtitle={t("sec_trips_sub")} onSeeAll={() => router.push("/(tabs)/trips")}>
              <View style={styles.trips}>
                {(data.trips || []).slice(0, 2).map((it: any) => <TripCard key={it.id} item={it} />)}
              </View>
            </Section>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.surface },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: SPACING.lg },
  hi: { fontFamily: FONT.body, fontSize: FSIZE.base, color: COLORS.onSurfaceSecondary, textAlign: "right" },
  headTitle: { fontFamily: FONT.displayBold, fontSize: FSIZE.xxl, color: COLORS.onSurface, textAlign: "right" },
  bell: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.surfaceSecondary, alignItems: "center", justifyContent: "center" },
  search: { flexDirection: "row", alignItems: "center", gap: SPACING.sm, marginHorizontal: SPACING.lg, marginTop: SPACING.lg, backgroundColor: COLORS.surfaceSecondary, borderRadius: RADIUS.md, paddingHorizontal: SPACING.lg, height: 50 },
  searchTxt: { fontFamily: FONT.body, fontSize: FSIZE.base, color: COLORS.onSurfaceSecondary },

  heroRail: { paddingHorizontal: SPACING.lg, gap: SPACING.md },
  hero: { height: 230, borderRadius: RADIUS.lg, overflow: "hidden", backgroundColor: COLORS.surfaceSecondary },
  heroScrim: { position: "absolute", left: 0, right: 0, bottom: 0, height: 150 },
  heroFav: { position: "absolute", top: SPACING.md, right: SPACING.md },
  featBadge: { position: "absolute", top: SPACING.md, left: SPACING.md, flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: COLORS.brandSecondary, paddingHorizontal: 10, paddingVertical: 5, borderRadius: RADIUS.pill },
  featBadgeTxt: { fontFamily: FONT.bold, color: "#fff", fontSize: FSIZE.sm },
  heroBody: { position: "absolute", left: SPACING.lg, right: SPACING.lg, bottom: SPACING.lg },
  locRow: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 4 },
  locTxt: { fontFamily: FONT.medium, color: "#fff", fontSize: FSIZE.sm },
  heroTitle: { fontFamily: FONT.displayBold, color: "#fff", fontSize: FSIZE.xxl },
  heroMeta: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  heroMetaTxt: { fontFamily: FONT.body, color: "rgba(255,255,255,0.85)", fontSize: FSIZE.sm },

  quickRow: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: SPACING.lg, marginTop: SPACING.xl },
  quick: { alignItems: "center", gap: SPACING.sm, flex: 1 },
  quickIcon: { width: 58, height: 58, borderRadius: RADIUS.lg, alignItems: "center", justifyContent: "center", ...SHADOW.soft },
  quickLabel: { fontFamily: FONT.medium, fontSize: FSIZE.sm, color: COLORS.onSurface },

  trips: { paddingHorizontal: SPACING.lg, gap: SPACING.lg },
});
