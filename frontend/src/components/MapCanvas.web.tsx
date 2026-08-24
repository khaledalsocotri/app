import React from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS, SPACING, RADIUS, FONT, FSIZE, SHADOW } from "@/src/theme/theme";
import { Stars } from "./Stars";

const TABBAR = 92;

// Web fallback: react-native-maps is native-only. We render a location list
// with the same data. Tapping opens the destination detail.
export function MapCanvas({ destinations, colorMap }: any) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 130, paddingBottom: TABBAR + SPACING.xl, paddingHorizontal: SPACING.lg, gap: SPACING.md }}>
        <View style={styles.note}>
          <Ionicons name="information-circle" size={18} color={COLORS.brand} />
          <Text style={styles.noteTxt}>الخريطة التفاعلية تعمل على تطبيق الجوال. هذه قائمة المواقع.</Text>
        </View>
        {destinations.map((d: any) => {
          const cfg = colorMap[d.category] || { color: COLORS.brand, icon: "location" };
          return (
            <Pressable key={d.id} style={[styles.card, SHADOW.soft]} onPress={() => router.push(`/destination/${d.id}`)} testID={`web-map-${d.id}`}>
              <View style={[styles.marker, { backgroundColor: cfg.color }]}>
                <Ionicons name={cfg.icon} size={20} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.title} numberOfLines={1}>{d.name_ar}</Text>
                <Text style={styles.loc}>{d.location_ar} · {d.latitude.toFixed(3)}, {d.longitude.toFixed(3)}</Text>
              </View>
              <Stars rating={d.rating} size={13} />
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

export const supportsNativeMap = false;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.surface },
  note: { flexDirection: "row", alignItems: "center", gap: SPACING.sm, backgroundColor: COLORS.brandTertiary, padding: SPACING.md, borderRadius: RADIUS.md },
  noteTxt: { flex: 1, fontFamily: FONT.body, fontSize: FSIZE.sm, color: COLORS.onBrandTertiary, textAlign: "right" },
  card: { flexDirection: "row", alignItems: "center", gap: SPACING.md, backgroundColor: COLORS.surface, borderRadius: RADIUS.md, padding: SPACING.md, borderWidth: 1, borderColor: COLORS.border },
  marker: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "#fff" },
  title: { fontFamily: FONT.bold, fontSize: FSIZE.lg, color: COLORS.onSurface, textAlign: "right" },
  loc: { fontFamily: FONT.body, fontSize: FSIZE.sm, color: COLORS.onSurfaceSecondary, textAlign: "right" },
});
