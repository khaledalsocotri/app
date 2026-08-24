import React from "react";
import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING, RADIUS, FONT, FSIZE } from "@/src/theme/theme";

export type Chip = { key: string; name_ar: string; icon?: string };

export function CategoryChips({
  chips,
  active,
  onChange,
  includeAll = true,
}: {
  chips: Chip[];
  active: string;
  onChange: (key: string) => void;
  includeAll?: boolean;
}) {
  const all: Chip[] = includeAll ? [{ key: "all", name_ar: "الكل", icon: "apps" }, ...chips] : chips;
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      style={styles.wrap}
    >
      {all.map((c) => {
        const on = active === c.key;
        return (
          <Pressable
            key={c.key}
            testID={`chip-${c.key}`}
            onPress={() => {
              Haptics.selectionAsync?.();
              onChange(c.key);
            }}
            style={[styles.chip, on && styles.chipOn]}
          >
            {c.icon ? (
              <Ionicons name={c.icon as any} size={15} color={on ? COLORS.onBrandPrimary : COLORS.brand} />
            ) : null}
            <Text style={[styles.txt, on && styles.txtOn]}>{c.name_ar}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { flexGrow: 0 },
  row: { gap: SPACING.sm, paddingHorizontal: SPACING.lg, alignItems: "center", height: 56 },
  chip: {
    flexShrink: 0,
    height: 38,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipOn: { backgroundColor: COLORS.brand, borderColor: COLORS.brand },
  txt: { fontFamily: FONT.medium, fontSize: FSIZE.base, color: COLORS.onSurfaceSecondary },
  txtOn: { color: COLORS.onBrandPrimary, fontFamily: FONT.bold },
});
