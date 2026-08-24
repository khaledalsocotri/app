import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { COLORS, SPACING, RADIUS, FONT, FSIZE, SHADOW } from "@/src/theme/theme";
import { useFetch } from "@/src/hooks/useFetch";
import { apiFetch } from "@/src/api/client";
import { TextField } from "@/src/components/TextField";
import { Button } from "@/src/components/Button";
import { LoadingState } from "@/src/components/States";
import { useToast } from "@/src/components/Toast";
import { useAuth } from "@/src/context/AuthContext";

export default function Booking() {
  const { type, id } = useLocalSearchParams<{ type: string; id: string }>();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const toast = useToast();
  const { user } = useAuth();
  const isTrip = type === "trip";
  const { data: item, loading } = useFetch<any>(`/${isTrip ? "trips" : "experiences"}/${id}`, [id]);

  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState("");
  const [guests, setGuests] = useState(1);
  const [date, setDate] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<any>({});
  const [submitting, setSubmitting] = useState(false);

  if (loading || !item) return <View style={styles.root}><LoadingState /></View>;

  const validate = () => {
    const e: any = {};
    if (name.trim().length < 2) e.name = "الاسم مطلوب";
    if (phone.trim().length < 6) e.phone = "رقم هاتف غير صالح";
    if (isTrip && (item.dates_ar || []).length > 0 && !date) e.date = "اختر تاريخاً";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      await apiFetch("/bookings", {
        method: "POST",
        body: { booking_type: type, item_id: id, date, guests, full_name: name.trim(), phone: phone.trim(), notes },
      });
      toast.show("تم إرسال طلب الحجز بنجاح ✓", "success");
      router.back();
      setTimeout(() => router.push("/(tabs)/account"), 300);
    } catch (e: any) {
      toast.show(e.message || "فشل إرسال الحجز", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const total = (item.price || 0) * guests;

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} testID="booking-close">
          <Ionicons name="close" size={24} color={COLORS.onSurface} />
        </Pressable>
        <Text style={styles.headerTitle}>تأكيد الحجز</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAwareScrollView
        contentContainerStyle={{ padding: SPACING.lg, paddingBottom: insets.bottom + 120 }}
        bottomOffset={20}
        showsVerticalScrollIndicator={false}
      >
        {/* Summary */}
        <View style={[styles.summary, SHADOW.soft]}>
          <Image source={item.cover_image} style={styles.summaryImg} contentFit="cover" />
          <View style={{ flex: 1 }}>
            <Text style={styles.summaryTitle} numberOfLines={2}>{item.name_ar}</Text>
            <Text style={styles.summaryType}>{isTrip ? `رحلة · ${item.duration_days} أيام` : `تجربة · ${item.duration_ar}`}</Text>
            <Text style={styles.summaryPrice}>${item.price} / للشخص</Text>
          </View>
        </View>

        {/* Dates (trips) */}
        {isTrip && (item.dates_ar || []).length > 0 ? (
          <>
            <Text style={styles.label}>اختر التاريخ</Text>
            <View style={styles.dates}>
              {item.dates_ar.map((d: string) => {
                const on = date === d;
                return (
                  <Pressable key={d} style={[styles.dateChip, on && styles.dateChipOn]} onPress={() => setDate(d)} testID={`date-${d}`}>
                    <Text style={[styles.dateChipTxt, on && styles.dateChipTxtOn]}>{d}</Text>
                  </Pressable>
                );
              })}
            </View>
            {errors.date ? <Text style={styles.err}>{errors.date}</Text> : null}
          </>
        ) : null}

        {/* Guests */}
        <Text style={styles.label}>عدد الأشخاص</Text>
        <View style={styles.stepper}>
          <Pressable style={styles.stepBtn} onPress={() => setGuests((g) => Math.max(1, g - 1))} testID="guests-minus">
            <Ionicons name="remove" size={22} color={COLORS.brand} />
          </Pressable>
          <Text style={styles.stepVal}>{guests}</Text>
          <Pressable style={styles.stepBtn} onPress={() => setGuests((g) => g + 1)} testID="guests-plus">
            <Ionicons name="add" size={22} color={COLORS.brand} />
          </Pressable>
        </View>

        <View style={{ marginTop: SPACING.lg }}>
          <TextField testID="booking-name" label="الاسم الكامل" icon="person-outline" placeholder="اسمك" value={name} onChangeText={setName} error={errors.name} />
          <TextField testID="booking-phone" label="رقم الهاتف" icon="call-outline" placeholder="+967..." keyboardType="phone-pad" value={phone} onChangeText={setPhone} error={errors.phone} />
          <TextField testID="booking-notes" label="ملاحظات (اختياري)" icon="chatbox-outline" placeholder="أي طلبات خاصة" value={notes} onChangeText={setNotes} multiline />
        </View>

        <View style={styles.paymentNote}>
          <Ionicons name="information-circle-outline" size={18} color={COLORS.info} />
          <Text style={styles.paymentTxt}>سيتم تسجيل طلبك وسنتواصل معك للتأكيد. الدفع غير مطلوب الآن.</Text>
        </View>
      </KeyboardAwareScrollView>

      <View style={[styles.cta, { paddingBottom: insets.bottom + SPACING.sm }]}>
        <View style={styles.totalCol}>
          <Text style={styles.totalLabel}>الإجمالي</Text>
          <Text style={styles.total}>${total}</Text>
        </View>
        <Button title="تأكيد الحجز" icon="checkmark-circle" style={{ flex: 1 }} loading={submitting} onPress={submit} testID="confirm-booking" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.surface },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: SPACING.lg, paddingBottom: SPACING.md, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: COLORS.divider },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.surfaceSecondary, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontFamily: FONT.displayBold, fontSize: FSIZE.xl, color: COLORS.onSurface },
  summary: { flexDirection: "row", gap: SPACING.md, backgroundColor: COLORS.surface, borderRadius: RADIUS.md, padding: SPACING.md, borderWidth: 1, borderColor: COLORS.border },
  summaryImg: { width: 80, height: 80, borderRadius: RADIUS.sm, backgroundColor: COLORS.surfaceSecondary },
  summaryTitle: { fontFamily: FONT.bold, fontSize: FSIZE.lg, color: COLORS.onSurface, textAlign: "right" },
  summaryType: { fontFamily: FONT.body, fontSize: FSIZE.sm, color: COLORS.onSurfaceSecondary, textAlign: "right", marginTop: 2 },
  summaryPrice: { fontFamily: FONT.displayBold, fontSize: FSIZE.lg, color: COLORS.brandPrimary, textAlign: "right", marginTop: 4 },
  label: { fontFamily: FONT.bold, fontSize: FSIZE.lg, color: COLORS.onSurface, textAlign: "right", marginTop: SPACING.xl, marginBottom: SPACING.sm },
  dates: { flexDirection: "row", flexWrap: "wrap", gap: SPACING.sm },
  dateChip: { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, borderRadius: RADIUS.md, backgroundColor: COLORS.surfaceSecondary, borderWidth: 1.5, borderColor: "transparent" },
  dateChipOn: { borderColor: COLORS.brand, backgroundColor: COLORS.brandTertiary },
  dateChipTxt: { fontFamily: FONT.medium, fontSize: FSIZE.base, color: COLORS.onSurfaceSecondary },
  dateChipTxtOn: { color: COLORS.brand, fontFamily: FONT.bold },
  err: { fontFamily: FONT.body, fontSize: FSIZE.sm, color: COLORS.error, textAlign: "right", marginTop: 4 },
  stepper: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: COLORS.surfaceSecondary, borderRadius: RADIUS.md, padding: SPACING.sm, width: 160 },
  stepBtn: { width: 44, height: 44, borderRadius: RADIUS.sm, backgroundColor: COLORS.surface, alignItems: "center", justifyContent: "center", ...SHADOW.soft },
  stepVal: { fontFamily: FONT.displayBold, fontSize: FSIZE.xl, color: COLORS.onSurface },
  paymentNote: { flexDirection: "row", gap: SPACING.sm, backgroundColor: COLORS.surfaceSecondary, borderRadius: RADIUS.md, padding: SPACING.md, marginTop: SPACING.lg },
  paymentTxt: { flex: 1, fontFamily: FONT.body, fontSize: FSIZE.sm, color: COLORS.onSurfaceSecondary, textAlign: "right", lineHeight: 20 },
  cta: { position: "absolute", left: 0, right: 0, bottom: 0, flexDirection: "row", alignItems: "center", gap: SPACING.md, backgroundColor: COLORS.surface, paddingHorizontal: SPACING.lg, paddingTop: SPACING.md, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: COLORS.border },
  totalCol: { alignItems: "flex-start" },
  totalLabel: { fontFamily: FONT.body, fontSize: FSIZE.sm, color: COLORS.onSurfaceSecondary },
  total: { fontFamily: FONT.displayBold, fontSize: FSIZE.xxl, color: COLORS.brandPrimary },
});
