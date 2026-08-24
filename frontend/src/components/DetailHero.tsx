import React from "react";
import { View, StyleSheet, Pressable, Share, Platform, useWindowDimensions, ScrollView } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS, SPACING } from "@/src/theme/theme";
import { FavoriteButton } from "./FavoriteButton";

const H = 320;

export function DetailHero({
  images,
  favType,
  favId,
  shareTitle,
}: {
  images: string[];
  favType?: "destination" | "experience" | "product" | "trip";
  favId?: string;
  shareTitle?: string;
}) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const imgs = images && images.length ? images : [];

  const onShare = async () => {
    try {
      await Share.share({ message: `${shareTitle || "اكتشف هذا المكان في سقطرى"} — سُقطرى إكسبلورر` });
    } catch {}
  };

  return (
    <View style={styles.wrap}>
      <ScrollGallery images={imgs} />
      <LinearGradient colors={["rgba(10,35,38,0.45)", "transparent"]} style={styles.topScrim} pointerEvents="none" />
      <LinearGradient colors={["transparent", "rgba(10,35,38,0.35)"]} style={styles.botScrim} pointerEvents="none" />
      <View style={[styles.header, { top: insets.top + SPACING.sm }]}>
        <Pressable style={styles.circle} onPress={() => router.back()} testID="detail-back">
          <Ionicons name="chevron-forward" size={24} color="#fff" />
        </Pressable>
        <View style={styles.headerRight}>
          <Pressable style={styles.circle} onPress={onShare} testID="detail-share">
            <Ionicons name="share-social-outline" size={20} color="#fff" />
          </Pressable>
          {favType && favId ? <FavoriteButton type={favType} id={favId} /> : null}
        </View>
      </View>
    </View>
  );
}

function ScrollGallery({ images }: { images: string[] }) {
  const { width } = useWindowDimensions();
  if (images.length <= 1) {
    return (
      <View style={{ height: H, width: "100%" }}>
        <Image source={images[0]} style={styles.img} contentFit="cover" transition={250} />
      </View>
    );
  }
  return (
    <ScrollView
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      style={{ height: H, width: "100%" }}
    >
      {images.map((src, i) => (
        <Image key={i} source={src} style={{ width, height: H }} contentFit="cover" transition={200} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { height: H, width: "100%", backgroundColor: COLORS.surfaceSecondary },
  gallery: { flexDirection: "row", width: "100%", height: "100%" },
  img: { width: "100%", height: "100%" },
  topScrim: { position: "absolute", top: 0, left: 0, right: 0, height: 120 },
  botScrim: { position: "absolute", bottom: 0, left: 0, right: 0, height: 80 },
  header: { position: "absolute", left: SPACING.lg, right: SPACING.lg, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  headerRight: { flexDirection: "row", gap: SPACING.sm },
  circle: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(10,35,38,0.4)", alignItems: "center", justifyContent: "center" },
});
