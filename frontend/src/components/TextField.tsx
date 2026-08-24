import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, Pressable, TextInputProps } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING, RADIUS, FONT, FSIZE } from "@/src/theme/theme";

type Props = TextInputProps & {
  label?: string;
  icon?: any;
  error?: string;
  secure?: boolean;
  testID?: string;
};

export function TextField({ label, icon, error, secure, testID, ...rest }: Props) {
  const [hidden, setHidden] = useState(!!secure);
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.wrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.field, focused && styles.fieldFocused, error && styles.fieldError]}>
        {icon ? <Ionicons name={icon} size={19} color={COLORS.onSurfaceSecondary} /> : null}
        <TextInput
          testID={testID}
          style={styles.input}
          placeholderTextColor={COLORS.onSurfaceSecondary}
          secureTextEntry={hidden}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...rest}
        />
        {secure ? (
          <Pressable onPress={() => setHidden((h) => !h)} hitSlop={8} testID={`${testID}-toggle`}>
            <Ionicons name={hidden ? "eye-outline" : "eye-off-outline"} size={19} color={COLORS.onSurfaceSecondary} />
          </Pressable>
        ) : null}
      </View>
      {error ? <Text style={styles.errorTxt}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: SPACING.lg },
  label: { fontFamily: FONT.medium, fontSize: FSIZE.base, color: COLORS.onSurface, marginBottom: SPACING.sm, textAlign: "right" },
  field: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.lg,
    height: 54,
  },
  fieldFocused: { borderColor: COLORS.brandPrimary },
  fieldError: { borderColor: COLORS.error },
  input: { flex: 1, fontFamily: FONT.body, fontSize: FSIZE.lg, color: COLORS.onSurface, textAlign: "right", height: "100%" },
  errorTxt: { fontFamily: FONT.body, fontSize: FSIZE.sm, color: COLORS.error, marginTop: SPACING.xs, textAlign: "right" },
});
