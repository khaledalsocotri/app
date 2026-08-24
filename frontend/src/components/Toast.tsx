import React, { createContext, useCallback, useContext, useRef, useState } from "react";
import { Animated, StyleSheet, Text, View, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING, RADIUS, FONT, FSIZE, SHADOW } from "@/src/theme/theme";

type ToastKind = "success" | "error" | "info";
type ToastCtx = { show: (msg: string, kind?: ToastKind) => void };

const Ctx = createContext<ToastCtx>({ show: () => {} });
export const useToast = () => useContext(Ctx);

const ICONS: Record<ToastKind, any> = {
  success: "checkmark-circle",
  error: "alert-circle",
  info: "information-circle",
};
const TINT: Record<ToastKind, string> = {
  success: COLORS.success,
  error: COLORS.error,
  info: COLORS.brandPrimary,
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  const [msg, setMsg] = useState("");
  const [kind, setKind] = useState<ToastKind>("info");
  const [visible, setVisible] = useState(false);
  const opacity = useRef(new Animated.Value(0)).current;
  const timer = useRef<any>(null);

  const show = useCallback(
    (m: string, k: ToastKind = "info") => {
      setMsg(m);
      setKind(k);
      setVisible(true);
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: Platform.OS !== "web" }).start();
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        Animated.timing(opacity, { toValue: 0, duration: 250, useNativeDriver: Platform.OS !== "web" }).start(() =>
          setVisible(false)
        );
      }, 2600);
    },
    [opacity]
  );

  return (
    <Ctx.Provider value={{ show }}>
      {children}
      {visible ? (
        <Animated.View
          pointerEvents="none"
          style={[styles.wrap, { top: insets.top + SPACING.md, opacity }]}
          testID="toast"
        >
          <View style={[styles.toast, SHADOW.card]}>
            <Ionicons name={ICONS[kind]} size={20} color={TINT[kind]} />
            <Text style={styles.txt}>{msg}</Text>
          </View>
        </Animated.View>
      ) : null}
    </Ctx.Provider>
  );
}

const styles = StyleSheet.create({
  wrap: { position: "absolute", left: SPACING.lg, right: SPACING.lg, alignItems: "center", zIndex: 9999 },
  toast: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    maxWidth: 420,
  },
  txt: { fontFamily: FONT.medium, fontSize: FSIZE.base, color: COLORS.onSurface, flexShrink: 1, textAlign: "right" },
});
