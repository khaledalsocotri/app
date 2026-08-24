import React from "react";
import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING, FONT, FSIZE } from "@/src/theme/theme";
import { useI18n } from "@/src/context/LanguageContext";

export function Section({
  title,
  subtitle,
  onSeeAll,
  children,
}: {
  title: string;
  subtitle?: string;
  onSeeAll?: () => void;
  children: React.ReactNode;
}) {
  const { t } = useI18n();
  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.sub}>{subtitle}</Text> : null}
        </View>
        {onSeeAll ? (
          <Pressable style={styles.seeAll} onPress={onSeeAll} testID={`see-all-${title}`}>
            <Text style={styles.seeAllTxt}>{t("see_all")}</Text>
            <Ionicons name="chevron-back" size={16} color={COLORS.brandPrimary} />
          </Pressable>
        ) : null}
      </View>
      {children}
    </View>
  );
}

export function Rail({ children }: { children: React.ReactNode }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.rail}
    >
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: SPACING.xl },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: SPACING.lg, marginBottom: SPACING.md },
  title: { fontFamily: FONT.displayBold, fontSize: FSIZE.xl, color: COLORS.onSurface, textAlign: "right" },
  sub: { fontFamily: FONT.body, fontSize: FSIZE.sm, color: COLORS.onSurfaceSecondary, textAlign: "right", marginTop: 2 },
  seeAll: { flexDirection: "row", alignItems: "center", gap: 2 },
  seeAllTxt: { fontFamily: FONT.medium, fontSize: FSIZE.base, color: COLORS.brandPrimary },
  rail: { paddingHorizontal: SPACING.lg, gap: SPACING.md },
});
