import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Constants from "expo-constants";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING, RADIUS, FONT, FSIZE } from "@/src/theme/theme";
import { useI18n } from "@/src/context/LanguageContext";

// MapLibre native views only render in a real dev/production build, not in
// Expo Go. Detect Expo Go so we can show a friendly placeholder instead of a
// native crash.
export const isExpoGo = Constants.appOwnership === "expo";

export function MapFallback({ style }: { style?: any }) {
  const { lang } = useI18n();
  const ar = lang === "ar";
  return (
    <View style={[styles.wrap, style]}>
      <View style={styles.badge}><Ionicons name="map" size={28} color="#fff" /></View>
      <Text style={styles.title}>{ar ? "الخريطة التفاعلية" : "Interactive map"}</Text>
      <Text style={styles.msg}>
        {ar
          ? "تظهر خريطة سقطرى بالأقمار الصناعية داخل نسخة التطبيق المبنية (iOS/Android). قم بالنشر وإنشاء نسخة لتجربتها."
          : "The Socotra satellite map appears in the built app (iOS/Android). Publish and generate a build to try it."}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#0A2326", padding: SPACING.xl, gap: SPACING.md },
  badge: { width: 64, height: 64, borderRadius: 32, backgroundColor: COLORS.brand, alignItems: "center", justifyContent: "center" },
  title: { fontFamily: FONT.displayBold, fontSize: FSIZE.xl, color: "#fff", textAlign: "center" },
  msg: { fontFamily: FONT.body, fontSize: FSIZE.base, color: "rgba(255,255,255,0.75)", textAlign: "center", lineHeight: 22, maxWidth: 320, borderRadius: RADIUS.md },
});
