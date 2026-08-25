import React from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { COLORS, SPACING, RADIUS, FONT, FSIZE, SHADOW } from "@/src/theme/theme";
import { useI18n } from "@/src/context/LanguageContext";

const toLines = (v?: string) =>
  (v || "")
    .split(/[\n•·]/)
    .map((s) => s.trim().replace(/^[-–*]\s*/, ""))
    .filter(Boolean);

// Rich preview card for a map location. Shows admin-controlled story, facts and
// safety notes (bilingual via pick), plus a details CTA. Reused on native map
// popup and web explore layout.
export function MapLocationCard({ item, onClose, style }: { item: any; onClose?: () => void; style?: any }) {
  const router = useRouter();
  const { t, pick } = useI18n();
  if (!item) return null;

  const story = pick(item, "story");
  const facts = toLines(pick(item, "facts"));
  const warnings = toLines(pick(item, "warnings"));

  return (
    <View style={[styles.card, SHADOW.card, style]} testID="map-location-card">
      {onClose ? (
        <Pressable style={styles.close} onPress={onClose} hitSlop={8} testID="map-card-close">
          <Ionicons name="close" size={16} color={COLORS.onSurfaceSecondary} />
        </Pressable>
      ) : null}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: SPACING.md }}>
        <Text style={styles.name} numberOfLines={1}>{pick(item, "name")}</Text>
        <View style={styles.locRow}>
          <Ionicons name="location" size={13} color={COLORS.brand} />
          <Text style={styles.loc} numberOfLines={1}>{pick(item, "location")}</Text>
        </View>

        {story ? (
          <View style={styles.block}>
            <View style={styles.blockHead}>
              <Ionicons name="book-outline" size={14} color={COLORS.brand} />
              <Text style={styles.blockTitle}>{t("local_knowledge")}</Text>
            </View>
            <Text style={styles.body} numberOfLines={4}>{story}</Text>
          </View>
        ) : null}

        {facts.length ? (
          <View style={styles.block}>
            <View style={styles.blockHead}>
              <Ionicons name="bulb-outline" size={14} color={COLORS.brandSecondary} />
              <Text style={styles.blockTitle}>{t("interesting_facts")}</Text>
            </View>
            {facts.slice(0, 3).map((f, i) => (
              <View key={i} style={styles.bulletRow}>
                <View style={styles.dot} />
                <Text style={styles.body}>{f}</Text>
              </View>
            ))}
          </View>
        ) : null}

        {warnings.length ? (
          <View style={[styles.block, styles.warnBox]}>
            <View style={styles.blockHead}>
              <Ionicons name="warning-outline" size={14} color={COLORS.error} />
              <Text style={[styles.blockTitle, { color: COLORS.error }]}>{t("safety_notes")}</Text>
            </View>
            {warnings.slice(0, 3).map((w, i) => (
              <View key={i} style={styles.bulletRow}>
                <View style={[styles.dot, { backgroundColor: COLORS.error }]} />
                <Text style={styles.body}>{w}</Text>
              </View>
            ))}
          </View>
        ) : null}

        <Pressable style={styles.cta} onPress={() => router.push(`/destination/${item.id}`)} testID="map-card-details">
          <Text style={styles.ctaTxt}>{t("view_details")}</Text>
          <Ionicons name="chevron-back" size={16} color="#fff" />
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: "#fff", borderRadius: RADIUS.md, maxHeight: 260, overflow: "hidden" },
  close: { position: "absolute", top: 8, left: 8, zIndex: 2, width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.surfaceSecondary, alignItems: "center", justifyContent: "center" },
  name: { fontFamily: FONT.bold, fontSize: FSIZE.lg, color: COLORS.onSurface, textAlign: "right" },
  locRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2, justifyContent: "flex-end" },
  loc: { fontFamily: FONT.body, fontSize: FSIZE.sm, color: COLORS.onSurfaceSecondary },
  block: { marginTop: SPACING.md },
  warnBox: { backgroundColor: "rgba(214,69,65,0.06)", borderRadius: RADIUS.sm, padding: SPACING.sm },
  blockHead: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4, justifyContent: "flex-end" },
  blockTitle: { fontFamily: FONT.bold, fontSize: FSIZE.sm, color: COLORS.onSurface },
  body: { flex: 1, fontFamily: FONT.body, fontSize: FSIZE.sm, lineHeight: 20, color: COLORS.onSurfaceSecondary, textAlign: "right" },
  bulletRow: { flexDirection: "row-reverse", alignItems: "flex-start", gap: 6, marginBottom: 2 },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: COLORS.brand, marginTop: 7 },
  cta: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4, backgroundColor: COLORS.brand, borderRadius: RADIUS.pill, height: 40, marginTop: SPACING.md },
  ctaTxt: { fontFamily: FONT.bold, fontSize: FSIZE.base, color: "#fff" },
});
