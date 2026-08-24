import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, FONT, FSIZE } from "@/src/theme/theme";

export function Stars({ rating, size = 13, showValue = true }: { rating?: number; size?: number; showValue?: boolean }) {
  const r = rating || 0;
  return (
    <View style={styles.row}>
      <Ionicons name="star" size={size} color={COLORS.star} />
      {showValue ? <Text style={[styles.val, { fontSize: size }]}>{r.toFixed(1)}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 3 },
  val: { fontFamily: FONT.bold, color: COLORS.onSurface },
});
