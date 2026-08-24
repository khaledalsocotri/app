import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, Pressable, Modal, TextInput, Switch } from "react-native";
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

type Field = { k: string; t: "text" | "number" | "bool" | "image"; label: string; multiline?: boolean };

const ENTITIES: Record<string, { label: string; fields: Field[] }> = {
  destinations: {
    label: "الوجهات",
    fields: [
      { k: "name_ar", t: "text", label: "الاسم بالعربية" },
      { k: "name_en", t: "text", label: "الاسم بالإنجليزية" },
      { k: "category", t: "text", label: "الفئة: nature / beaches / activities / accommodation / services / cultural / experiences" },
      { k: "location_ar", t: "text", label: "الموقع" },
      { k: "description_ar", t: "text", label: "الوصف", multiline: true },
      { k: "cover_image", t: "image", label: "الصورة" },
      { k: "latitude", t: "number", label: "خط العرض" },
      { k: "longitude", t: "number", label: "خط الطول" },
      { k: "rating", t: "number", label: "التقييم (1-5)" },
      { k: "featured", t: "bool", label: "مميّز" },
      { k: "popular", t: "bool", label: "شائع" },
    ],
  },
  trips: {
    label: "الرحلات",
    fields: [
      { k: "name_ar", t: "text", label: "الاسم بالعربية" },
      { k: "name_en", t: "text", label: "الاسم بالإنجليزية" },
      { k: "description_ar", t: "text", label: "الوصف", multiline: true },
      { k: "cover_image", t: "image", label: "الصورة" },
      { k: "price", t: "number", label: "السعر" },
      { k: "duration_days", t: "number", label: "عدد الأيام" },
      { k: "available_seats", t: "number", label: "المقاعد المتاحة" },
      { k: "rating", t: "number", label: "التقييم (1-5)" },
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
      if (f.t === "bool") v = !!v;
      payload[f.k] = v ?? (f.t === "text" || f.t === "image" ? "" : 0);
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

      <View style={styles.tabs}>
        {TABS.map((t) => (
          <Pressable key={t} style={[styles.tab, entity === t && styles.tabOn]} onPress={() => setEntity(t)} testID={`admin-tab-${t}`}>
            <Text style={[styles.tabTxt, entity === t && styles.tabTxtOn]}>{ENTITIES[t].label}</Text>
          </Pressable>
        ))}
      </View>

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
                    style={[styles.input, f.multiline && styles.inputMulti]}
                    placeholder={f.label}
                    placeholderTextColor={COLORS.onSurfaceSecondary}
                    value={form[f.k] !== undefined && form[f.k] !== null ? String(form[f.k]) : ""}
                    onChangeText={(v) => setForm((s: any) => ({ ...s, [f.k]: v }))}
                    keyboardType={f.t === "number" ? "numeric" : "default"}
                    multiline={f.multiline}
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
  tabs: { flexDirection: "row", gap: SPACING.sm, padding: SPACING.lg, paddingBottom: 0 },
  tab: { flex: 1, height: 40, borderRadius: RADIUS.pill, backgroundColor: COLORS.surface, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: COLORS.border },
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
  imageField: { flexDirection: "row", gap: SPACING.md, alignItems: "flex-start" },
  coverPreview: { width: 72, height: 72, borderRadius: RADIUS.md, backgroundColor: COLORS.surfaceSecondary },
});
