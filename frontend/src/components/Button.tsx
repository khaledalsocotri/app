import React from "react";
import { Pressable, Text, StyleSheet, ActivityIndicator, View, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING, RADIUS, FONT, FSIZE } from "@/src/theme/theme";

type Props = {
  title: string;
  onPress?: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  icon?: any;
  testID?: string;
  style?: ViewStyle;
};

export function Button({ title, onPress, loading, disabled, variant = "primary", icon, testID, style }: Props) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        variant === "primary" && styles.primary,
        variant === "secondary" && styles.secondary,
        variant === "outline" && styles.outline,
        variant === "ghost" && styles.ghost,
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === "outline" || variant === "ghost" ? COLORS.brand : "#fff"} />
      ) : (
        <View style={styles.row}>
          {icon ? (
            <Ionicons
              name={icon}
              size={19}
              color={variant === "outline" || variant === "ghost" ? COLORS.brand : "#fff"}
            />
          ) : null}
          <Text
            style={[
              styles.txt,
              (variant === "outline" || variant === "ghost") && { color: COLORS.brand },
            ]}
          >
            {title}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { height: 54, borderRadius: RADIUS.md, alignItems: "center", justifyContent: "center", paddingHorizontal: SPACING.xl },
  row: { flexDirection: "row", alignItems: "center", gap: SPACING.sm },
  primary: { backgroundColor: COLORS.brand },
  secondary: { backgroundColor: COLORS.brandSecondary },
  outline: { backgroundColor: "transparent", borderWidth: 1.5, borderColor: COLORS.brand },
  ghost: { backgroundColor: COLORS.brandTertiary },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.85 },
  txt: { fontFamily: FONT.bold, fontSize: FSIZE.lg, color: "#fff" },
});
