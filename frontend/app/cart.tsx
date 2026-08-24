import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { COLORS, SPACING, RADIUS, FONT, FSIZE, SHADOW } from "@/src/theme/theme";
import { useCart } from "@/src/context/CartContext";
import { apiFetch } from "@/src/api/client";
import { TextField } from "@/src/components/TextField";
import { Button } from "@/src/components/Button";
import { EmptyState } from "@/src/components/States";
import { useToast } from "@/src/components/Toast";
import { useAuth } from "@/src/context/AuthContext";

export default function Cart() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const toast = useToast();
  const { user } = useAuth();
  const { items, total, count, setQty, remove, clear } = useCart();

  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<any>({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const e: any = {};
    if (name.trim().length < 2) e.name = "الاسم مطلوب";
    if (phone.trim().length < 6) e.phone = "رقم هاتف غير صالح";
    if (address.trim().length < 3) e.address = "العنوان مطلوب";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const checkout = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      await apiFetch("/orders", {
        method: "POST",
        body: {
          items: items.map((i) => ({ product_id: i.id, quantity: i.quantity })),
          full_name: name.trim(),
          phone: phone.trim(),
          address: address.trim(),
          notes,
        },
      });
      clear();
      toast.show("تم إرسال طلبك بنجاح ✓", "success");
      router.back();
    } catch (e: any) {
      toast.show(e.message || "فشل إرسال الطلب", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} testID="cart-back">
          <Ionicons name="chevron-forward" size={24} color={COLORS.onSurface} />
        </Pressable>
        <Text style={styles.headerTitle}>سلة التسوق</Text>
        <View style={{ width: 40 }} />
      </View>

      {count === 0 ? (
        <View style={{ flex: 1 }}>
          <EmptyState icon="cart-outline" title="سلتك فارغة" subtitle="أضف منتجات من التسويق المحلي" />
          <View style={{ paddingHorizontal: SPACING.lg }}>
            <Button title="تصفح المنتجات" icon="storefront" onPress={() => router.replace("/marketplace")} testID="browse-products" />
          </View>
        </View>
      ) : (
        <>
          <KeyboardAwareScrollView
            contentContainerStyle={{ padding: SPACING.lg, paddingBottom: insets.bottom + 130 }}
            bottomOffset={20}
            showsVerticalScrollIndicator={false}
          >
            {items.map((it) => (
              <View key={it.id} style={[styles.item, SHADOW.soft]} testID={`cart-item-${it.id}`}>
                <Image source={it.cover_image} style={styles.itemImg} contentFit="cover" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemName} numberOfLines={2}>{it.name_ar}</Text>
                  <Text style={styles.itemPrice}>${it.price}</Text>
                  <View style={styles.stepper}>
                    <Pressable style={styles.stepBtn} onPress={() => setQty(it.id, it.quantity - 1)} testID={`cart-minus-${it.id}`}>
                      <Ionicons name="remove" size={18} color={COLORS.brand} />
                    </Pressable>
                    <Text style={styles.stepVal}>{it.quantity}</Text>
                    <Pressable style={styles.stepBtn} onPress={() => setQty(it.id, it.quantity + 1)} testID={`cart-plus-${it.id}`}>
                      <Ionicons name="add" size={18} color={COLORS.brand} />
                    </Pressable>
                  </View>
                </View>
                <Pressable onPress={() => remove(it.id)} hitSlop={8} testID={`cart-remove-${it.id}`}>
                  <Ionicons name="trash-outline" size={20} color={COLORS.error} />
                </Pressable>
              </View>
            ))}

            <Text style={styles.sectionTitle}>معلومات التوصيل</Text>
            <TextField testID="cart-name" label="الاسم الكامل" icon="person-outline" placeholder="اسمك" value={name} onChangeText={setName} error={errors.name} />
            <TextField testID="cart-phone" label="رقم الهاتف" icon="call-outline" placeholder="+967..." keyboardType="phone-pad" value={phone} onChangeText={setPhone} error={errors.phone} />
            <TextField testID="cart-address" label="عنوان التوصيل" icon="location-outline" placeholder="المدينة، الحي" value={address} onChangeText={setAddress} error={errors.address} />
            <TextField testID="cart-notes" label="ملاحظات (اختياري)" icon="chatbox-outline" placeholder="أي تفاصيل إضافية" value={notes} onChangeText={setNotes} multiline />

            <View style={styles.paymentNote}>
              <Ionicons name="information-circle-outline" size={18} color={COLORS.info} />
              <Text style={styles.paymentTxt}>سيتم تسجيل طلبك وسنتواصل معك للتأكيد والدفع عند الاستلام.</Text>
            </View>
          </KeyboardAwareScrollView>

          <View style={[styles.cta, { paddingBottom: insets.bottom + SPACING.sm }]}>
            <View style={styles.totalCol}>
              <Text style={styles.totalLabel}>الإجمالي ({count})</Text>
              <Text style={styles.total}>${total.toFixed(2)}</Text>
            </View>
            <Button title="إتمام الطلب" icon="checkmark-circle" style={{ flex: 1 }} loading={submitting} onPress={checkout} testID="checkout-button" />
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.surface },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: SPACING.lg, paddingBottom: SPACING.md, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: COLORS.divider },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.surfaceSecondary, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontFamily: FONT.displayBold, fontSize: FSIZE.xl, color: COLORS.onSurface },
  item: { flexDirection: "row", alignItems: "center", gap: SPACING.md, backgroundColor: COLORS.surface, borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.md, borderWidth: 1, borderColor: COLORS.border },
  itemImg: { width: 76, height: 76, borderRadius: RADIUS.sm, backgroundColor: COLORS.surfaceSecondary },
  itemName: { fontFamily: FONT.bold, fontSize: FSIZE.base, color: COLORS.onSurface, textAlign: "right" },
  itemPrice: { fontFamily: FONT.displayBold, fontSize: FSIZE.base, color: COLORS.brandPrimary, textAlign: "right", marginTop: 2 },
  stepper: { flexDirection: "row", alignItems: "center", gap: SPACING.md, marginTop: SPACING.sm },
  stepBtn: { width: 34, height: 34, borderRadius: RADIUS.sm, backgroundColor: COLORS.surfaceSecondary, alignItems: "center", justifyContent: "center" },
  stepVal: { fontFamily: FONT.bold, fontSize: FSIZE.lg, color: COLORS.onSurface, minWidth: 20, textAlign: "center" },
  sectionTitle: { fontFamily: FONT.displayBold, fontSize: FSIZE.xl, color: COLORS.onSurface, textAlign: "right", marginTop: SPACING.lg, marginBottom: SPACING.md },
  paymentNote: { flexDirection: "row", gap: SPACING.sm, backgroundColor: COLORS.surfaceSecondary, borderRadius: RADIUS.md, padding: SPACING.md, marginTop: SPACING.sm },
  paymentTxt: { flex: 1, fontFamily: FONT.body, fontSize: FSIZE.sm, color: COLORS.onSurfaceSecondary, textAlign: "right", lineHeight: 20 },
  cta: { position: "absolute", left: 0, right: 0, bottom: 0, flexDirection: "row", alignItems: "center", gap: SPACING.md, backgroundColor: COLORS.surface, paddingHorizontal: SPACING.lg, paddingTop: SPACING.md, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: COLORS.border },
  totalCol: { alignItems: "flex-start" },
  totalLabel: { fontFamily: FONT.body, fontSize: FSIZE.sm, color: COLORS.onSurfaceSecondary },
  total: { fontFamily: FONT.displayBold, fontSize: FSIZE.xxl, color: COLORS.brandPrimary },
});
