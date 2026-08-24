import React from "react";
import { View, Text, ActivityIndicator, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING, FONT, FSIZE, RADIUS } from "@/src/theme/theme";

export function LoadingState({ label = "جارٍ التحميل..." }: { label?: string }) {
  return (
    <View style={styles.center} testID="loading-state">
      <ActivityIndicator size="large" color={COLORS.brandPrimary} />
      <Text style={styles.muted}>{label}</Text>
    </View>
  );
}

export function EmptyState({
  icon = "sad-outline",
  title = "لا توجد نتائج",
  subtitle,
}: {
  icon?: any;
  title?: string;
  subtitle?: string;
}) {
  return (
    <View style={styles.center} testID="empty-state">
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={40} color={COLORS.brandPrimary} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.muted}>{subtitle}</Text> : null}
    </View>
  );
}

export function ErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <View style={styles.center} testID="error-state">
      <View style={[styles.iconWrap, { backgroundColor: "#FBEAEA" }]}>
        <Ionicons name="cloud-offline-outline" size={40} color={COLORS.error} />
      </View>
      <Text style={styles.title}>تعذّر تحميل المحتوى</Text>
      <Text style={styles.muted}>{message || "تحقق من اتصالك بالإنترنت"}</Text>
      {onRetry ? (
        <Pressable style={styles.retry} onPress={onRetry} testID="retry-button">
          <Ionicons name="refresh" size={18} color={COLORS.onBrandPrimary} />
          <Text style={styles.retryTxt}>إعادة المحاولة</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: SPACING.xl,
    gap: SPACING.md,
    minHeight: 280,
  },
  iconWrap: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: COLORS.brandTertiary,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontFamily: FONT.bold, fontSize: FSIZE.lg, color: COLORS.onSurface, textAlign: "center" },
  muted: { fontFamily: FONT.body, fontSize: FSIZE.base, color: COLORS.onSurfaceSecondary, textAlign: "center" },
  retry: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    backgroundColor: COLORS.brandPrimary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.pill,
    marginTop: SPACING.sm,
  },
  retryTxt: { fontFamily: FONT.bold, color: COLORS.onBrandPrimary, fontSize: FSIZE.base },
});
