import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS, FONT } from "@/src/theme/theme";

type Props = {
  size?: number;
  showName?: boolean;
  light?: boolean;
};

/** A lightweight, dependency-free Dragon Blood Tree mark for the Socotra brand. */
export function SocotraLogo({ size = 44, showName = false, light = false }: Props) {
  const canopy = size * 0.62;
  const trunkH = size * 0.34;
  const trunkW = Math.max(3, size * 0.08);
  const nameColor = light ? COLORS.onSurfaceInverse : COLORS.forest;

  return (
    <View style={styles.wrap}>
      <View style={{ width: size, height: size * 0.82, alignItems: "center", justifyContent: "flex-end" }}>
        <View
          style={{
            position: "absolute",
            top: size * 0.03,
            width: canopy,
            height: canopy * 0.42,
            borderRadius: canopy,
            backgroundColor: COLORS.dragonBlood,
          }}
        />
        <View
          style={{
            position: "absolute",
            top: size * 0.14,
            width: canopy * 0.72,
            height: canopy * 0.28,
            borderRadius: canopy,
            backgroundColor: COLORS.dragonBlood,
            opacity: 0.9,
          }}
        />
        <View style={{ width: trunkW, height: trunkH, borderRadius: trunkW, backgroundColor: COLORS.gold }} />
        <View style={[styles.branch, { width: size * 0.32, bottom: size * 0.18, transform: [{ rotate: "-28deg" }] }]} />
        <View style={[styles.branch, { width: size * 0.32, bottom: size * 0.18, transform: [{ rotate: "28deg" }] }]} />
        <View style={{ position: "absolute", bottom: 0, width: size * 0.48, height: 2, borderRadius: 2, backgroundColor: COLORS.forest }} />
      </View>
      {showName && <Text style={[styles.name, { color: nameColor, fontSize: Math.max(14, size * 0.42) }]}>سقطرى</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", justifyContent: "center" },
  branch: { position: "absolute", height: 2, borderRadius: 2, backgroundColor: COLORS.gold },
  name: { fontFamily: FONT.displayBold, marginTop: 2 },
});
