import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, useWindowDimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { COLORS, SPACING, RADIUS, FONT, FSIZE, SHADOW } from "@/src/theme/theme";
import { useFetch } from "@/src/hooks/useFetch";

const STAT_META: { key: string; label: string; icon: string; color: string; route?: string }[] = [
  { key: "destinations", label: "الأماكن", icon: "location", color: "#158C9B", route: "/admin/places" },
  { key: "trips", label: "الرحلات", icon: "airplane", color: "#0F6B76", route: "/admin/trips" },
  { key: "experiences", label: "التجارب", icon: "sparkles", color: "#2D7A5D", route: "/admin/experiences" },
  { key: "products", label: "المنتجات", icon: "cube", color: "#C39158", route: "/admin/products" },
  { key: "offers", label: "العروض", icon: "pricetag", color: "#B87F28", route: "/admin/offers" },
  { key: "events", label: "الفعاليات", icon: "calendar", color: "#4A6E8C", route: "/admin/events" },
  { key: "services", label: "الخدمات", icon: "construct", color: "#38484A", route: "/admin/services" },
  { key: "bookings", label: "الحجوزات", icon: "receipt", color: "#0F6B76", route: "/admin/bookings" },
  { key: "orders", label: "الطلبات", icon: "bag-handle", color: "#C39158" },
  { key: "users", label: "المستخدمون", icon: "people", color: "#4A6E8C" },
];

const QUICK: { label: string; sub: string; icon: string; color: string; route: string }[] = [
  { label: "إضافة مكان", sub: "أضف وجهة جديدة على الخريطة", icon: "add-circle", color: "#158C9B", route: "/admin/places" },
  { label: "إدارة المتجر", sub: "المنتجات والأسعار", icon: "cube", color: "#C39158", route: "/admin/products" },
  { label: "العروض والإعلانات", sub: "أنشئ عرضاً ترويجياً", icon: "pricetag", color: "#B87F28", route: "/admin/offers" },
  { label: "الفئات", sub: "نظّم تصنيفات المحتوى", icon: "grid", color: "#0F6B76", route: "/admin/categories" },
];

export default function AdminDashboard() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { data: stats } = useFetch<any>("/admin/stats");
  const cols = width >= 1100 ? 5 : width >= 760 ? 4 : width >= 480 ? 3 : 2;
  const cardW = `${100 / cols - 2}%` as any;

  return (
    <ScrollView style={styles.root} contentContainerStyle={{ padding: SPACING.lg, paddingBottom: SPACING.xxl }} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>لوحة التحكم</Text>
      <Text style={styles.sub}>نظرة عامة على محتوى تطبيق سقطرى</Text>

      <View style={styles.grid}>
        {STAT_META.map((m) => (
          <Pressable key={m.key} style={[styles.statCard, { width: cardW }, SHADOW.soft]} onPress={() => m.route && router.push(m.route as any)} testID={`stat-${m.key}`}>
            <View style={[styles.statIcon, { backgroundColor: m.color }]}><Ionicons name={m.icon as any} size={20} color="#fff" /></View>
            <Text style={styles.statNum}>{stats?.[m.key] ?? "—"}</Text>
            <Text style={styles.statLabel}>{m.label}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.sectionTitle}>إجراءات سريعة</Text>
      <View style={styles.quickGrid}>
        {QUICK.map((q) => (
          <Pressable key={q.route} style={[styles.quickCard, { width: width >= 760 ? "48%" : "100%" }, SHADOW.soft]} onPress={() => router.push(q.route as any)} testID={`quick-${q.route.split("/").pop()}`}>
            <View style={[styles.quickIcon, { backgroundColor: q.color }]}><Ionicons name={q.icon as any} size={22} color="#fff" /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.quickLabel}>{q.label}</Text>
              <Text style={styles.quickSub}>{q.sub}</Text>
            </View>
            <Ionicons name="chevron-back" size={20} color={COLORS.borderStrong} />
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.surfaceSecondary },
  title: { fontFamily: FONT.displayBold, fontSize: FSIZE.xxxl, color: COLORS.onSurface, textAlign: "right", marginTop: SPACING.sm },
  sub: { fontFamily: FONT.body, fontSize: FSIZE.base, color: COLORS.onSurfaceSecondary, textAlign: "right", marginBottom: SPACING.lg },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: SPACING.md, justifyContent: "flex-start" },
  statCard: { backgroundColor: COLORS.surface, borderRadius: RADIUS.md, padding: SPACING.md, alignItems: "flex-end", gap: 4 },
  statIcon: { width: 40, height: 40, borderRadius: RADIUS.md, alignItems: "center", justifyContent: "center" },
  statNum: { fontFamily: FONT.displayBold, fontSize: FSIZE.xxl, color: COLORS.onSurface },
  statLabel: { fontFamily: FONT.body, fontSize: FSIZE.sm, color: COLORS.onSurfaceSecondary },
  sectionTitle: { fontFamily: FONT.displayBold, fontSize: FSIZE.xl, color: COLORS.onSurface, textAlign: "right", marginTop: SPACING.xl, marginBottom: SPACING.md },
  quickGrid: { flexDirection: "row", flexWrap: "wrap", gap: SPACING.md },
  quickCard: { flexDirection: "row", alignItems: "center", gap: SPACING.md, backgroundColor: COLORS.surface, borderRadius: RADIUS.md, padding: SPACING.lg },
  quickIcon: { width: 48, height: 48, borderRadius: RADIUS.md, alignItems: "center", justifyContent: "center" },
  quickLabel: { fontFamily: FONT.bold, fontSize: FSIZE.lg, color: COLORS.onSurface, textAlign: "right" },
  quickSub: { fontFamily: FONT.body, fontSize: FSIZE.sm, color: COLORS.onSurfaceSecondary, textAlign: "right" },
});
