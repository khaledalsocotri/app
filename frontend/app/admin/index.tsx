import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { COLORS, SPACING, RADIUS, FONT, FSIZE, SHADOW } from "@/src/theme/theme";
import { useFetch } from "@/src/hooks/useFetch";

const STAT_META: Record<string, { label: string; icon: string; color: string }> = {
  users: { label: "المستخدمون", icon: "people", color: "#4A6E8C" },
  destinations: { label: "الوجهات", icon: "location", color: "#158C9B" },
  trips: { label: "الرحلات", icon: "airplane", color: "#0F6B76" },
  products: { label: "المنتجات", icon: "cube", color: "#C39158" },
  experiences: { label: "التجارب", icon: "sparkles", color: "#2D7A5D" },
  bookings: { label: "الحجوزات", icon: "receipt", color: "#B87F28" },
};

export default function AdminDashboard() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { data: stats } = useFetch<any>("/admin/stats");

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} testID="admin-back">
          <Ionicons name="chevron-forward" size={24} color={COLORS.onSurface} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>لوحة الإدارة</Text>
          <Text style={styles.sub}>إدارة محتوى وحجوزات سقطرى</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: SPACING.lg, paddingBottom: SPACING.xxl }} showsVerticalScrollIndicator={false}>
        <View style={styles.grid}>
          {Object.entries(STAT_META).map(([key, m]) => (
            <View key={key} style={[styles.statCard, SHADOW.soft]} testID={`stat-${key}`}>
              <View style={[styles.statIcon, { backgroundColor: m.color }]}>
                <Ionicons name={m.icon as any} size={20} color="#fff" />
              </View>
              <Text style={styles.statNum}>{stats?.[key] ?? "—"}</Text>
              <Text style={styles.statLabel}>{m.label}</Text>
            </View>
          ))}
        </View>

        <Pressable style={[styles.action, SHADOW.soft]} onPress={() => router.push("/admin/bookings")} testID="admin-manage-bookings">
          <View style={[styles.actionIcon, { backgroundColor: COLORS.brand }]}><Ionicons name="receipt-outline" size={22} color="#fff" /></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.actionTitle}>إدارة الحجوزات</Text>
            <Text style={styles.actionSub}>تأكيد أو إلغاء طلبات الحجز</Text>
          </View>
          <Ionicons name="chevron-back" size={22} color={COLORS.borderStrong} />
        </Pressable>

        <Pressable style={[styles.action, SHADOW.soft]} onPress={() => router.push("/admin/content")} testID="admin-manage-content">
          <View style={[styles.actionIcon, { backgroundColor: COLORS.brandSecondary }]}><Ionicons name="create-outline" size={22} color="#fff" /></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.actionTitle}>إدارة المحتوى</Text>
            <Text style={styles.actionSub}>إضافة وتعديل الوجهات والرحلات والعروض</Text>
          </View>
          <Ionicons name="chevron-back" size={22} color={COLORS.borderStrong} />
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.surfaceSecondary },
  header: { flexDirection: "row", alignItems: "center", gap: SPACING.md, paddingHorizontal: SPACING.lg, paddingBottom: SPACING.md, backgroundColor: COLORS.surface },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.surfaceSecondary, alignItems: "center", justifyContent: "center" },
  title: { fontFamily: FONT.displayBold, fontSize: FSIZE.xxl, color: COLORS.onSurface, textAlign: "right" },
  sub: { fontFamily: FONT.body, fontSize: FSIZE.sm, color: COLORS.onSurfaceSecondary, textAlign: "right" },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: SPACING.md },
  statCard: { width: "31%", backgroundColor: COLORS.surface, borderRadius: RADIUS.md, padding: SPACING.md, alignItems: "flex-end", gap: 4, marginBottom: SPACING.md },
  statIcon: { width: 40, height: 40, borderRadius: RADIUS.md, alignItems: "center", justifyContent: "center" },
  statNum: { fontFamily: FONT.displayBold, fontSize: FSIZE.xxl, color: COLORS.onSurface },
  statLabel: { fontFamily: FONT.body, fontSize: FSIZE.sm, color: COLORS.onSurfaceSecondary },
  action: { flexDirection: "row", alignItems: "center", gap: SPACING.md, backgroundColor: COLORS.surface, borderRadius: RADIUS.md, padding: SPACING.lg, marginTop: SPACING.md },
  actionIcon: { width: 48, height: 48, borderRadius: RADIUS.md, alignItems: "center", justifyContent: "center" },
  actionTitle: { fontFamily: FONT.bold, fontSize: FSIZE.lg, color: COLORS.onSurface, textAlign: "right" },
  actionSub: { fontFamily: FONT.body, fontSize: FSIZE.sm, color: COLORS.onSurfaceSecondary, textAlign: "right" },
});
