import React from "react";
import { View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SHADOW } from "@/src/theme/theme";

// Teardrop map pin: colored bubble with a white category icon and a pointer
// tail whose tip sits exactly on the coordinate (use marker anchor="bottom").
export function MapPin({ color = COLORS.brand, icon = "location", active = false }: { color?: string; icon?: any; active?: boolean }) {
  return (
    <View style={[styles.wrap, active && styles.wrapActive]}>
      <View style={[styles.bubble, { backgroundColor: color }]}>
        <Ionicons name={icon} size={17} color="#fff" />
      </View>
      <View style={[styles.tail, { borderTopColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center" },
  wrapActive: { transform: [{ scale: 1.22 }] },
  bubble: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", borderWidth: 2.5, borderColor: "#fff", ...SHADOW.card },
  tail: {
    width: 0,
    height: 0,
    marginTop: -3,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 9,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
  },
});
