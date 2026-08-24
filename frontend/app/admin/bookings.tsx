import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, Pressable } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect, useRouter } from "expo-router";
import { COLORS, SPACING, RADIUS, FONT, FSIZE, SHADOW } from "@/src/theme/theme";
import { apiFetch } from "@/src/api/client";
import { LoadingState, EmptyState } from "@/src/components/States";
import { useToast } from "@/src/components/Toast";

const STATUS_AR: Record<string, string> = { pending: "قيد المراجعة", confirmed: "مؤكد", cancelled: "ملغى" };
const STATUS_COLOR: Record<string, string> = { pending: COLORS.warning, confirmed: COLORS.success, cancelled: COLORS.error };

export default function AdminBookings() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const toast = useToast();
  const [bookings, setBookings] = useState<any[] | null>(null);

  const load = useCallback(async () => {
    try {
      setBookings(await apiFetch("/admin/bookings"));
    } catch {
      setBookings([]);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const setStatus = async (id: string, status: string) => {
    try {
      await apiFetch(`/admin/bookings/${id}/status`, { method: "PUT", body: { status } });
      toast.show(status === "confirmed" ? "تم تأكيد الحجز" : "تم إلغاء الحجز", "success");
      load();
    } catch (e: any) {
      toast.show(e.message || "خطأ", "error");
    }
  };

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} testID="admin-bookings-back">
          <Ionicons name="chevron-forward" size={24} color={COLORS.onSurface} />
        </Pressable>
        <Text style={styles.title}>إدارة الحجوزات</Text>
      </View>

      {bookings === null ? (
        <LoadingState />
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(i) => i.id}
          contentContainerStyle={{ padding: SPACING.lg, gap: SPACING.md, paddingBottom: SPACING.xxl }}
          ListEmptyComponent={<EmptyState icon="receipt-outline" title="لا توجد حجوزات" />}
          renderItem={({ item: b }) => (
            <View style={[styles.card, SHADOW.soft]} testID={`admin-booking-${b.id}`}>
              <View style={styles.row}>
                {b.item_image ? <Image source={b.item_image} style={styles.img} contentFit="cover" /> : null}
                <View style={{ flex: 1 }}>
                  <Text style={styles.name} numberOfLines={1}>{b.item_name_ar}</Text>
                  <Text style={styles.meta}>{b.full_name} · {b.phone}</Text>
                  <Text style={styles.meta}>{b.booking_type === "trip" ? "رحلة" : "تجربة"} · {b.guests} أشخاص{b.date ? ` · ${b.date}` : ""}</Text>
                  <View style={styles.statusRow}>
                    <View style={[styles.dot, { backgroundColor: STATUS_COLOR[b.status] }]} />
                    <Text style={[styles.status, { color: STATUS_COLOR[b.status] }]}>{STATUS_AR[b.status]}</Text>
                  </View>
                </View>
              </View>
              {b.status === "pending" ? (
                <View style={styles.actions}>
                  <Pressable style={[styles.btn, styles.confirm]} onPress={() => setStatus(b.id, "confirmed")} testID={`confirm-${b.id}`}>
                    <Ionicons name="checkmark" size={16} color="#fff" />
                    <Text style={styles.btnTxt}>تأكيد</Text>
                  </Pressable>
                  <Pressable style={[styles.btn, styles.cancel]} onPress={() => setStatus(b.id, "cancelled")} testID={`cancel-${b.id}`}>
                    <Ionicons name="close" size={16} color={COLORS.error} />
                    <Text style={[styles.btnTxt, { color: COLORS.error }]}>إلغاء</Text>
                  </Pressable>
                </View>
              ) : null}
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.surfaceSecondary },
  header: { flexDirection: "row", alignItems: "center", gap: SPACING.md, paddingHorizontal: SPACING.lg, paddingBottom: SPACING.md, backgroundColor: COLORS.surface },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.surfaceSecondary, alignItems: "center", justifyContent: "center" },
  title: { fontFamily: FONT.displayBold, fontSize: FSIZE.xl, color: COLORS.onSurface },
  card: { backgroundColor: COLORS.surface, borderRadius: RADIUS.md, padding: SPACING.md },
  row: { flexDirection: "row", gap: SPACING.md },
  img: { width: 64, height: 64, borderRadius: RADIUS.sm, backgroundColor: COLORS.surfaceSecondary },
  name: { fontFamily: FONT.bold, fontSize: FSIZE.lg, color: COLORS.onSurface, textAlign: "right" },
  meta: { fontFamily: FONT.body, fontSize: FSIZE.sm, color: COLORS.onSurfaceSecondary, textAlign: "right", marginTop: 1 },
  statusRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  status: { fontFamily: FONT.bold, fontSize: FSIZE.sm },
  actions: { flexDirection: "row", gap: SPACING.sm, marginTop: SPACING.md },
  btn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4, height: 42, borderRadius: RADIUS.sm },
  confirm: { backgroundColor: COLORS.success },
  cancel: { backgroundColor: "#FBEAEA" },
  btnTxt: { fontFamily: FONT.bold, fontSize: FSIZE.base, color: "#fff" },
});
