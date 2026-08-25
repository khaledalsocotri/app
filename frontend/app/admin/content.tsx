import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, Pressable, Modal, TextInput, Switch, ScrollView } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect, useRouter } from "expo-router";
import { COLORS, SPACING, RADIUS, FONT, FSIZE, SHADOW } from "@/src/theme/theme";
import { apiFetch } from "@/src/api/client";
import { uploadImageAsync } from "@/src/api/upload";
import { Button } from "@/src/components/Button";
import { LoadingState, EmptyState } from "@/src/components/States";
import { useToast } from "@/src/components/Toast";

type Field = { k: string; t: "text" | "number" | "bool" | "image" | "list" | "icon"; label: string; multiline?: boolean };

// Preset map marker icons the admin can choose from (Ionicons names).
const MARKER_ICONS: { key: string; label: string }[] = [
  { key: "leaf", label: "طبيعة" },
  { key: "umbrella", label: "شاطئ" },
  { key: "triangle", label: "جبل" },
  { key: "bonfire", label: "كهف / مغامرة" },
  { key: "water", label: "وادٍ / ماء" },
  { key: "boat", label: "قارب / جزيرة" },
  { key: "business", label: "ثقافي" },
  { key: "bed", label: "إقامة" },
  { key: "construct", label: "خدمات" },
  { key: "sparkles", label: "تجربة" },
];

const ENTITIES: Record<string, { label: string; fields: Field[] }> = {
  destinations: {
    label: "الوجهات",
    fields: [
      { k: "name_ar", t: "text", label: "الاسم بالعربية" },
      { k: "name_en", t: "text", label: "الاسم بالإنجليزية" },
      { k: "category", t: "text", label: "الفئة: nature / beaches / activities / accommodation / services / cultural / experiences" },
      { k: "location_ar", t: "text", label: "الموقع (عربي)" },
      { k: "location_en", t: "text", label: "الموقع (إنجليزي)" },
      { k: "description_ar", t: "text", label: "الوصف (عربي)", multiline: true },
      { k: "description_en", t: "text", label: "الوصف (إنجليزي)", multiline: true },
      { k: "cover_image", t: "image", label: "الصورة" },
      { k: "marker_icon", t: "icon", label: "أيقونة العلامة على الخريطة" },
      { k: "latitude", t: "number", label: "خط العرض" },
      { k: "longitude", t: "number", label: "خط الطول" },
      { k: "rating", t: "number", label: "التقييم (1-5)" },
      { k: "story_ar", t: "text", label: "معرفة محلية / قصة المكان (عربي)", multiline: true },
      { k: "story_en", t: "text", label: "معرفة محلية / قصة المكان (إنجليزي)", multiline: true },
      { k: "facts_ar", t: "text", label: "حقائق ممتعة (عربي) — سطر لكل حقيقة", multiline: true },
      { k: "facts_en", t: "text", label: "حقائق ممتعة (إنجليزي) — سطر لكل حقيقة", multiline: true },
      { k: "warnings_ar", t: "text", label: "تنبيهات وسلامة (عربي) — سطر لكل تنبيه", multiline: true },
      { k: "warnings_en", t: "text", label: "تنبيهات وسلامة (إنجليزي) — سطر لكل تنبيه", multiline: true },
      { k: "best_time_ar", t: "text", label: "أفضل وقت للزيارة" },
      { k: "duration_ar", t: "text", label: "المدة" },
      { k: "difficulty_ar", t: "text", label: "الصعوبة" },
      { k: "how_to_get_ar", t: "text", label: "كيفية الوصول", multiline: true },
      { k: "activities", t: "list", label: "الأنشطة (افصل بينها بفاصلة)" },
      { k: "nearby_services", t: "list", label: "الأماكن / الخدمات القريبة (افصل بينها بفاصلة)" },
      { k: "featured", t: "bool", label: "مميّز" },
      { k: "popular", t: "bool", label: "شائع" },
    ],
  },
  services: {
    label: "الخدمات",
    fields: [
      { k: "name_ar", t: "text", label: "الاسم بالعربية" },
      { k: "name_en", t: "text", label: "الاسم بالإنجليزية" },
      { k: "category", t: "text", label: "الفئة: health / fuel / bank / guide / restaurant / shop" },
      { k: "description_ar", t: "text", label: "الوصف", multiline: true },
      { k: "cover_image", t: "image", label: "الصورة" },
      { k: "location_ar", t: "text", label: "الموقع" },
      { k: "phone", t: "text", label: "الهاتف" },
      { k: "latitude", t: "number", label: "خط العرض" },
      { k: "longitude", t: "number", label: "خط الطول" },
      { k: "rating", t: "number", label: "التقييم (1-5)" },
    ],
  },
  events: {
    label: "الفعاليات",
    fields: [
      { k: "name_ar", t: "text", label: "الاسم بالعربية" },
      { k: "name_en", t: "text", label: "الاسم بالإنجليزية" },
      { k: "description_ar", t: "text", label: "الوصف", multiline: true },
      { k: "cover_image", t: "image", label: "الصورة" },
      { k: "date_ar", t: "text", label: "التاريخ" },
      { k: "location_ar", t: "text", label: "الموقع" },
      { k: "price", t: "number", label: "السعر (0 = مجاني)" },
    ],
  },
  offers: {
    label: "العروض",
    fields: [
      { k: "name_ar", t: "text", label: "الاسم بالعربية" },
      { k: "name_en", t: "text", label: "الاسم بالإنجليزية" },
      { k: "description_ar", t: "text", label: "الوصف", multiline: true },
      { k: "cover_image", t: "image", label: "الصورة" },
      { k: "discount", t: "number", label: "نسبة الخصم %" },
      { k: "valid_until_ar", t: "text", label: "صالح حتى" },
    ],
  },
  products: {
    label: "المنتجات",
    fields: [
      { k: "name_ar", t: "text", label: "الاسم بالعربية" },
      { k: "name_en", t: "text", label: "الاسم بالإنجليزية" },
      { k: "category", t: "text", label: "الفئة: crafts / culture / food / nature / services / experiences / offers" },
      { k: "description_ar", t: "text", label: "الوصف", multiline: true },
      { k: "cover_image", t: "image", label: "الصورة" },
      { k: "price", t: "number", label: "السعر" },
      { k: "seller_ar", t: "text", label: "البائع / المزوّد" },
      { k: "availability_ar", t: "text", label: "التوفر" },
      { k: "rating", t: "number", label: "التقييم (1-5)" },
      { k: "in_stock", t: "bool", label: "متوفر" },
    ],
  },
  experiences: {
    label: "التجارب",
    fields: [
      { k: "name_ar", t: "text", label: "الاسم بالعربية" },
      { k: "name_en", t: "text", label: "الاسم بالإنجليزية" },
      { k: "description_ar", t: "text", label: "الوصف", multiline: true },
      { k: "cover_image", t: "image", label: "الصورة" },
      { k: "price", t: "number", label: "السعر للشخص" },
      { k: "duration_ar", t: "text", label: "المدة" },
      { k: "location_ar", t: "text", label: "الموقع" },
      { k: "provider_ar", t: "text", label: "المزوّد" },
      { k: "availability_ar", t: "text", label: "التوفر" },
      { k: "rating", t: "number", label: "التقييم (1-5)" },
    ],
  },
};

const TABS = Object.keys(ENTITIES);

export default function AdminContent() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const toast = useToast();
  const [entity, setEntity] = useState("destinations");
  const [list, setList] = useState<any[] | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    setList(null);
    try {
      setList(await apiFetch(`/${entity}`));
    } catch {
      setList([]);
    }
  }, [entity]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const openCreate = () => {
    setEditing(null);
    setForm({});
    setModalOpen(true);
  };
  const openEdit = (item: any) => {
    setEditing(item);
    setForm({ ...item });
    setModalOpen(true);
  };

  const uploadCover = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (perm.status !== "granted") {
      toast.show("نحتاج إذن الصور", "info");
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 0.6, allowsEditing: true });
    if (res.canceled || !res.assets?.length) return;
    setUploading(true);
    try {
      const url = await uploadImageAsync(res.assets[0].uri);
      setForm((f: any) => ({ ...f, cover_image: url }));
    } catch (e: any) {
      toast.show(e.message || "فشل الرفع", "error");
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    const fields = ENTITIES[entity].fields;
    if (!form.name_ar || !form.cover_image) {
      toast.show("الاسم والصورة مطلوبان", "error");
      return;
    }
    const payload: any = {};
    fields.forEach((f) => {
      let v = form[f.k];
      if (f.t === "number") v = v === undefined || v === "" ? 0 : parseFloat(v);
      else if (f.t === "bool") v = !!v;
      else if (f.t === "list") v = Array.isArray(v) ? v : String(v || "").split(/[,،\n]/).map((s) => s.trim()).filter(Boolean);
      const fallback = f.t === "list" ? [] : f.t === "number" ? 0 : "";
      payload[f.k] = v ?? fallback;
    });
    payload.images = [form.cover_image];
    setSaving(true);
    try {
      if (editing) {
        await apiFetch(`/admin/${entity}/${editing.id}`, { method: "PUT", body: payload });
        toast.show("تم التحديث", "success");
      } else {
        await apiFetch(`/admin/${entity}`, { method: "POST", body: payload });
        toast.show("تمت الإضافة", "success");
      }
      setModalOpen(false);
      load();
    } catch (e: any) {
      toast.show(e.message || "فشل الحفظ", "error");
    } finally {
      setSaving(false);
    }
  };

  const del = async (item: any) => {
    try {
      await apiFetch(`/admin/${entity}/${item.id}`, { method: "DELETE" });
      toast.show("تم الحذف", "success");
      load();
    } catch (e: any) {
      toast.show(e.message || "فشل الحذف", "error");
    }
  };

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} testID="admin-content-back">
          <Ionicons name="chevron-forward" size={24} color={COLORS.onSurface} />
        </Pressable>
        <Text style={styles.title}>إدارة المحتوى</Text>
        <Pressable onPress={openCreate} style={styles.addBtn} testID="admin-add-item">
          <Ionicons name="add" size={22} color="#fff" />
        </Pressable>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsWrap} contentContainerStyle={styles.tabs}>
        {TABS.map((t) => (
          <Pressable key={t} style={[styles.tab, entity === t && styles.tabOn]} onPress={() => setEntity(t)} testID={`admin-tab-${t}`}>
            <Text style={[styles.tabTxt, entity === t && styles.tabTxtOn]}>{ENTITIES[t].label}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {list === null ? (
        <LoadingState />
      ) : (
        <FlatList
          data={list}
          keyExtractor={(i) => i.id}
          contentContainerStyle={{ padding: SPACING.lg, gap: SPACING.md, paddingBottom: SPACING.xxl }}
          ListEmptyComponent={<EmptyState icon="folder-open-outline" title="لا يوجد محتوى" />}
          renderItem={({ item }) => (
            <View style={[styles.card, SHADOW.soft]} testID={`admin-item-${item.id}`}>
              <Image source={item.cover_image} style={styles.cardImg} contentFit="cover" />
              <View style={{ flex: 1 }}>
                <Text style={styles.cardName} numberOfLines={1}>{item.name_ar}</Text>
                <Text style={styles.cardSub} numberOfLines={1}>{item.name_en || item.location_ar || ""}</Text>
              </View>
              <Pressable onPress={() => openEdit(item)} hitSlop={8} style={styles.iconBtn} testID={`edit-${item.id}`}>
                <Ionicons name="create-outline" size={20} color={COLORS.brand} />
              </Pressable>
              <Pressable onPress={() => del(item)} hitSlop={8} style={styles.iconBtn} testID={`delete-${item.id}`}>
                <Ionicons name="trash-outline" size={20} color={COLORS.error} />
              </Pressable>
            </View>
          )}
        />
      )}

      {/* Form modal */}
      <Modal visible={modalOpen} animationType="slide" onRequestClose={() => setModalOpen(false)}>
        <View style={styles.root}>
          <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
            <Pressable onPress={() => setModalOpen(false)} style={styles.backBtn} testID="admin-form-close">
              <Ionicons name="close" size={24} color={COLORS.onSurface} />
            </Pressable>
            <Text style={styles.title}>{editing ? "تعديل" : "إضافة"} {ENTITIES[entity].label}</Text>
            <View style={{ width: 40 }} />
          </View>
          <KeyboardAwareScrollView contentContainerStyle={{ padding: SPACING.lg, paddingBottom: insets.bottom + SPACING.xxl }} bottomOffset={20}>
            {ENTITIES[entity].fields.map((f) => (
              <View key={f.k} style={{ marginBottom: SPACING.lg }}>
                <Text style={styles.fieldLabel}>{f.label}</Text>
                {f.t === "bool" ? (
                  <View style={styles.switchRow}>
                    <Switch
                      testID={`field-${f.k}`}
                      value={!!form[f.k]}
                      onValueChange={(v) => setForm((s: any) => ({ ...s, [f.k]: v }))}
                      trackColor={{ true: COLORS.brand, false: COLORS.border }}
                      thumbColor="#fff"
                    />
                  </View>
                ) : f.t === "icon" ? (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.iconRow}>
                    {MARKER_ICONS.map((mi) => {
                      const on = form[f.k] === mi.key;
                      return (
                        <Pressable
                          key={mi.key}
                          testID={`marker-${mi.key}`}
                          style={[styles.iconChip, on && styles.iconChipOn]}
                          onPress={() => setForm((s: any) => ({ ...s, [f.k]: mi.key }))}
                        >
                          <Ionicons name={mi.key as any} size={20} color={on ? "#fff" : COLORS.brand} />
                          <Text style={[styles.iconChipTxt, on && { color: "#fff" }]}>{mi.label}</Text>
                        </Pressable>
                      );
                    })}
                  </ScrollView>
                ) : f.t === "image" ? (
                  <View style={styles.imageField}>
                    {form.cover_image ? <Image source={form.cover_image} style={styles.coverPreview} contentFit="cover" /> : null}
                    <View style={{ flex: 1, gap: SPACING.sm }}>
                      <TextInput
                        testID={`field-${f.k}`}
                        style={styles.input}
                        placeholder="رابط الصورة أو ارفعها"
                        placeholderTextColor={COLORS.onSurfaceSecondary}
                        value={form.cover_image || ""}
                        onChangeText={(v) => setForm((s: any) => ({ ...s, cover_image: v }))}
                      />
                      <Button title={uploading ? "جارٍ الرفع" : "رفع صورة"} variant="ghost" icon="cloud-upload-outline" onPress={uploadCover} loading={uploading} style={{ height: 44 }} testID="upload-cover" />
                    </View>
                  </View>
                ) : (
                  <TextInput
                    testID={`field-${f.k}`}
                    style={[styles.input, (f.multiline || f.t === "list") && styles.inputMulti]}
                    placeholder={f.label}
                    placeholderTextColor={COLORS.onSurfaceSecondary}
                    value={
                      f.t === "list"
                        ? Array.isArray(form[f.k]) ? form[f.k].join("، ") : form[f.k] || ""
                        : form[f.k] !== undefined && form[f.k] !== null ? String(form[f.k]) : ""
                    }
                    onChangeText={(v) => setForm((s: any) => ({ ...s, [f.k]: v }))}
                    keyboardType={f.t === "number" ? "numeric" : "default"}
                    multiline={f.multiline || f.t === "list"}
                    textAlign="right"
                  />
                )}
              </View>
            ))}
            <Button title={editing ? "حفظ التعديلات" : "إضافة"} icon="checkmark-circle" loading={saving} onPress={save} testID="admin-save" />
          </KeyboardAwareScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.surfaceSecondary },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: SPACING.lg, paddingBottom: SPACING.md, backgroundColor: COLORS.surface },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.surfaceSecondary, alignItems: "center", justifyContent: "center" },
  title: { fontFamily: FONT.displayBold, fontSize: FSIZE.xl, color: COLORS.onSurface },
  addBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.brand, alignItems: "center", justifyContent: "center" },
  tabsWrap: { flexGrow: 0, backgroundColor: COLORS.surface },
  tabs: { flexDirection: "row", gap: SPACING.sm, padding: SPACING.lg, paddingBottom: SPACING.md },
  tab: { flexShrink: 0, height: 40, paddingHorizontal: SPACING.xl, borderRadius: RADIUS.pill, backgroundColor: COLORS.surface, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: COLORS.border },
  tabOn: { backgroundColor: COLORS.brand, borderColor: COLORS.brand },
  tabTxt: { fontFamily: FONT.medium, fontSize: FSIZE.base, color: COLORS.onSurfaceSecondary },
  tabTxtOn: { color: "#fff", fontFamily: FONT.bold },
  card: { flexDirection: "row", alignItems: "center", gap: SPACING.md, backgroundColor: COLORS.surface, borderRadius: RADIUS.md, padding: SPACING.md },
  cardImg: { width: 56, height: 56, borderRadius: RADIUS.sm, backgroundColor: COLORS.surfaceSecondary },
  cardName: { fontFamily: FONT.bold, fontSize: FSIZE.base, color: COLORS.onSurface, textAlign: "right" },
  cardSub: { fontFamily: FONT.body, fontSize: FSIZE.sm, color: COLORS.onSurfaceSecondary, textAlign: "right" },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.surfaceSecondary, alignItems: "center", justifyContent: "center" },
  fieldLabel: { fontFamily: FONT.medium, fontSize: FSIZE.sm, color: COLORS.onSurfaceSecondary, textAlign: "right", marginBottom: SPACING.sm },
  input: { backgroundColor: COLORS.surface, borderWidth: 1.5, borderColor: COLORS.border, borderRadius: RADIUS.md, paddingHorizontal: SPACING.lg, height: 52, fontFamily: FONT.body, fontSize: FSIZE.lg, color: COLORS.onSurface, textAlign: "right" },
  inputMulti: { height: 100, paddingTop: SPACING.md, textAlignVertical: "top" },
  switchRow: { alignItems: "flex-end" },
  iconRow: { flexDirection: "row", gap: SPACING.sm, paddingVertical: 2 },
  iconChip: { alignItems: "center", justifyContent: "center", gap: 4, minWidth: 76, paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md, borderRadius: RADIUS.md, backgroundColor: COLORS.surface, borderWidth: 1.5, borderColor: COLORS.border },
  iconChipOn: { backgroundColor: COLORS.brand, borderColor: COLORS.brand },
  iconChipTxt: { fontFamily: FONT.medium, fontSize: FSIZE.sm, color: COLORS.onSurfaceSecondary, textAlign: "center" },
  imageField: { flexDirection: "row", gap: SPACING.md, alignItems: "flex-start" },
  coverPreview: { width: 72, height: 72, borderRadius: RADIUS.md, backgroundColor: COLORS.surfaceSecondary },
});
