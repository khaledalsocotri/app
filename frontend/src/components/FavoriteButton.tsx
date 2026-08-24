import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/src/theme/theme";
import { useFavorites } from "@/src/context/FavoritesContext";

type Props = {
  type: "destination" | "experience" | "product" | "trip";
  id: string;
  size?: number;
  variant?: "overlay" | "plain";
};

export function FavoriteButton({ type, id, size = 20, variant = "overlay" }: Props) {
  const { isFav, toggle } = useFavorites();
  const active = isFav(type, id);
  return (
    <Pressable
      onPress={(e) => {
        // @ts-ignore stop parent card press
        e?.stopPropagation?.();
        toggle(type, id);
      }}
      hitSlop={8}
      testID={`favorite-${type}-${id}`}
      style={variant === "overlay" ? styles.overlay : styles.plain}
    >
      <Ionicons
        name={active ? "heart" : "heart-outline"}
        size={size}
        color={active ? COLORS.error : variant === "overlay" ? "#FFFFFF" : COLORS.onSurfaceSecondary}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  overlay: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(10,35,38,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  plain: { padding: 4 },
});
