import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { COLORS, SPACING, RADIUS, FONT, FSIZE, SHADOW } from "@/src/theme/theme";
import { FavoriteButton } from "./FavoriteButton";
import { Stars } from "./Stars";

const BLUR = "L6Pj0^jE.AyE_3t7t7R**0o#DgR4";

// ---------- Destination (full-width hero card) ----------
export function DestinationCard({ item }: { item: any }) {
  const router = useRouter();
  return (
    <Pressable
      testID={`destination-card-${item.id}`}
      style={[styles.hero, SHADOW.card]}
      onPress={() => router.push(`/destination/${item.id}`)}
    >
      <Image source={item.cover_image} style={styles.heroImg} placeholder={BLUR} contentFit="cover" transition={250} />
      <LinearGradient colors={["transparent", "rgba(10,35,38,0.85)"]} style={styles.heroScrim} />
      <View style={styles.heroFav}>
        <FavoriteButton type="destination" id={item.id} />
      </View>
      <View style={styles.heroBody}>
        <View style={styles.locRow}>
          <Ionicons name="location" size={13} color="#fff" />
          <Text style={styles.locTxt}>{item.location_ar}</Text>
        </View>
        <Text style={styles.heroTitle} numberOfLines={1}>{item.name_ar}</Text>
        <View style={styles.heroMeta}>
          <Stars rating={item.rating} size={13} />
          <Text style={styles.heroMetaTxt}>· {item.name_en}</Text>
        </View>
      </View>
    </Pressable>
  );
}

// ---------- Destination (rail card) ----------
export function DestinationRailCard({ item }: { item: any }) {
  const router = useRouter();
  return (
    <Pressable
      testID={`destination-rail-${item.id}`}
      style={styles.rail}
      onPress={() => router.push(`/destination/${item.id}`)}
    >
      <View style={styles.railImgWrap}>
        <Image source={item.cover_image} style={styles.railImg} placeholder={BLUR} contentFit="cover" transition={250} />
        <View style={styles.railFav}>
          <FavoriteButton type="destination" id={item.id} size={16} />
        </View>
      </View>
      <Text style={styles.railTitle} numberOfLines={1}>{item.name_ar}</Text>
      <View style={styles.railMeta}>
        <Ionicons name="location-outline" size={12} color={COLORS.onSurfaceSecondary} />
        <Text style={styles.railSub} numberOfLines={1}>{item.location_ar}</Text>
        <View style={{ flex: 1 }} />
        <Stars rating={item.rating} size={12} />
      </View>
    </Pressable>
  );
}

// ---------- Experience card (rail) ----------
export function ExperienceCard({ item }: { item: any }) {
  const router = useRouter();
  return (
    <Pressable testID={`experience-card-${item.id}`} style={styles.rail} onPress={() => router.push(`/experience/${item.id}`)}>
      <View style={styles.railImgWrap}>
        <Image source={item.cover_image} style={styles.railImg} placeholder={BLUR} contentFit="cover" transition={250} />
        <View style={styles.railFav}>
          <FavoriteButton type="experience" id={item.id} size={16} />
        </View>
        <View style={styles.priceTag}>
          <Text style={styles.priceTagTxt}>${item.price}</Text>
        </View>
      </View>
      <Text style={styles.railTitle} numberOfLines={1}>{item.name_ar}</Text>
      <View style={styles.railMeta}>
        <Ionicons name="time-outline" size={12} color={COLORS.onSurfaceSecondary} />
        <Text style={styles.railSub} numberOfLines={1}>{item.duration_ar}</Text>
        <View style={{ flex: 1 }} />
        <Stars rating={item.rating} size={12} />
      </View>
    </Pressable>
  );
}

// ---------- Product card (grid 2-col) ----------
export function ProductCard({ item, width }: { item: any; width: number }) {
  const router = useRouter();
  return (
    <Pressable
      testID={`product-card-${item.id}`}
      style={[styles.product, { width }]}
      onPress={() => router.push(`/product/${item.id}`)}
    >
      <View style={styles.productImgWrap}>
        <Image source={item.cover_image} style={styles.productImg} placeholder={BLUR} contentFit="cover" transition={250} />
        <View style={styles.railFav}>
          <FavoriteButton type="product" id={item.id} size={16} />
        </View>
      </View>
      <Text style={styles.railTitle} numberOfLines={2}>{item.name_ar}</Text>
      <View style={styles.sellerRow}>
        <Ionicons name="storefront-outline" size={12} color={COLORS.onSurfaceSecondary} />
        <Text style={styles.railSub} numberOfLines={1}>{item.seller_ar}</Text>
      </View>
      <Text style={styles.price}>${item.price}</Text>
    </Pressable>
  );
}

// ---------- Trip card (full-width) ----------
export function TripCard({ item }: { item: any }) {
  const router = useRouter();
  return (
    <Pressable testID={`trip-card-${item.id}`} style={[styles.tripCard, SHADOW.card]} onPress={() => router.push(`/trip/${item.id}`)}>
      <Image source={item.cover_image} style={styles.tripImg} placeholder={BLUR} contentFit="cover" transition={250} />
      <LinearGradient colors={["transparent", "rgba(10,35,38,0.7)"]} style={styles.tripScrim} />
      <View style={styles.tripFav}>
        <FavoriteButton type="trip" id={item.id} />
      </View>
      <View style={styles.tripBadge}>
        <Ionicons name="calendar-outline" size={13} color={COLORS.onBrandPrimary} />
        <Text style={styles.tripBadgeTxt}>{item.duration_days} أيام</Text>
      </View>
      <View style={styles.tripBody}>
        <Text style={styles.heroTitle} numberOfLines={1}>{item.name_ar}</Text>
        <View style={styles.tripMetaRow}>
          <Stars rating={item.rating} size={13} />
          <Text style={styles.heroMetaTxt}>· {item.available_seats} مقاعد متاحة</Text>
          <View style={{ flex: 1 }} />
          <Text style={styles.tripPrice}>${item.price}</Text>
        </View>
      </View>
    </Pressable>
  );
}

// ---------- Offer / Event small card ----------
export function PromoCard({ item, kind }: { item: any; kind: "offer" | "event" }) {
  return (
    <View style={styles.promo}>
      <Image source={item.cover_image} style={styles.promoImg} placeholder={BLUR} contentFit="cover" transition={250} />
      <LinearGradient colors={["transparent", "rgba(10,35,38,0.88)"]} style={StyleSheet.absoluteFill as any} />
      {kind === "offer" ? (
        <View style={styles.discount}>
          <Text style={styles.discountTxt}>-{item.discount}%</Text>
        </View>
      ) : null}
      <View style={styles.promoBody}>
        <Text style={styles.promoTitle} numberOfLines={2}>{item.name_ar}</Text>
        <Text style={styles.promoSub} numberOfLines={1}>
          {kind === "event" ? item.date_ar : item.valid_until_ar}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { height: 220, borderRadius: RADIUS.lg, overflow: "hidden", backgroundColor: COLORS.surfaceSecondary },
  heroImg: { ...StyleSheet.absoluteFillObject } as any,
  heroScrim: { position: "absolute", left: 0, right: 0, bottom: 0, height: 130 },
  heroFav: { position: "absolute", top: SPACING.md, right: SPACING.md },
  heroBody: { position: "absolute", left: SPACING.lg, right: SPACING.lg, bottom: SPACING.lg },
  locRow: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 4 },
  locTxt: { fontFamily: FONT.medium, color: "#fff", fontSize: FSIZE.sm },
  heroTitle: { fontFamily: FONT.displayBold, color: "#fff", fontSize: FSIZE.xl },
  heroMeta: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  heroMetaTxt: { fontFamily: FONT.body, color: "rgba(255,255,255,0.85)", fontSize: FSIZE.sm },

  rail: { width: 200 },
  railImgWrap: { width: "100%", height: 130, borderRadius: RADIUS.md, overflow: "hidden", backgroundColor: COLORS.surfaceSecondary },
  railImg: { width: "100%", height: "100%" },
  railFav: { position: "absolute", top: SPACING.sm, right: SPACING.sm },
  railTitle: { fontFamily: FONT.bold, fontSize: FSIZE.base, color: COLORS.onSurface, marginTop: SPACING.sm, textAlign: "right" },
  railMeta: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  railSub: { fontFamily: FONT.body, fontSize: FSIZE.sm, color: COLORS.onSurfaceSecondary, maxWidth: 110 },

  priceTag: { position: "absolute", bottom: SPACING.sm, left: SPACING.sm, backgroundColor: COLORS.brandSecondary, paddingHorizontal: 10, paddingVertical: 3, borderRadius: RADIUS.pill },
  priceTagTxt: { fontFamily: FONT.bold, color: "#fff", fontSize: FSIZE.sm },

  product: { marginBottom: SPACING.lg },
  productImgWrap: { width: "100%", aspectRatio: 1, borderRadius: RADIUS.md, overflow: "hidden", backgroundColor: COLORS.surfaceSecondary },
  productImg: { width: "100%", height: "100%" },
  sellerRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  price: { fontFamily: FONT.displayBold, color: COLORS.brandPrimary, fontSize: FSIZE.lg, marginTop: 4, textAlign: "right" },

  tripCard: { height: 210, borderRadius: RADIUS.lg, overflow: "hidden", backgroundColor: COLORS.surfaceSecondary },
  tripImg: { ...StyleSheet.absoluteFillObject } as any,
  tripScrim: { position: "absolute", left: 0, right: 0, bottom: 0, top: 0 },
  tripFav: { position: "absolute", top: SPACING.md, right: SPACING.md },
  tripBadge: { position: "absolute", top: SPACING.md, left: SPACING.md, flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: COLORS.brand, paddingHorizontal: 10, paddingVertical: 5, borderRadius: RADIUS.pill },
  tripBadgeTxt: { fontFamily: FONT.bold, color: COLORS.onBrandPrimary, fontSize: FSIZE.sm },
  tripBody: { position: "absolute", left: SPACING.lg, right: SPACING.lg, bottom: SPACING.lg },
  tripMetaRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 6 },
  tripPrice: { fontFamily: FONT.displayBold, color: "#fff", fontSize: FSIZE.xl },

  promo: { width: 260, height: 140, borderRadius: RADIUS.lg, overflow: "hidden", backgroundColor: COLORS.surfaceSecondary },
  promoImg: { ...StyleSheet.absoluteFillObject } as any,
  discount: { position: "absolute", top: SPACING.sm, right: SPACING.sm, backgroundColor: COLORS.error, paddingHorizontal: 10, paddingVertical: 4, borderRadius: RADIUS.pill },
  discountTxt: { fontFamily: FONT.bold, color: "#fff", fontSize: FSIZE.sm },
  promoBody: { position: "absolute", left: SPACING.md, right: SPACING.md, bottom: SPACING.md },
  promoTitle: { fontFamily: FONT.bold, color: "#fff", fontSize: FSIZE.lg, textAlign: "right" },
  promoSub: { fontFamily: FONT.body, color: "rgba(255,255,255,0.85)", fontSize: FSIZE.sm, textAlign: "right", marginTop: 2 },
});
