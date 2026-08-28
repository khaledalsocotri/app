import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, Pressable, Modal, TextInput, Switch, ScrollView, useWindowDimensions } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useFocusEffect } from "expo-router";
import { COLORS, SPACING, RADIUS, FONT, FSIZE, SHADOW } from "@/src/theme/theme";
import { apiFetch } from "@/src/api/client";
import { Button } from "@/src/components/Button";
import { LoadingState, EmptyState } from "@/src/components/States";
import { useToast } from "@/src/components/Toast";
import { ENTITIES, ICON_PRESETS, AdminField } from "@/src/admin/entities";
import { MultiImageField } from "@/src/admin/MultiImageField";

export function EntityScreen({ entityKey }: { entityKey: string }) {
  const cfg = ENTITIES[entityKey];
  const toast = useToast();
  const { width } = useWindowDimensions();
  const wide = width >= 760;

  const [list, setList] = useState<any[] | null>(null);
  const [q, setQ] = useState("");
  const [cats, setCats] = useState<any[]>([]);
  const [pcats, setPcats] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [openSelect, setOpenSelect] = useState<string | null>(null);
  const [confirmDel, setConfirmDel] = useState<any>(null);

  const load = useCallback(async () => {
    setList(null);
    try {
      setList(await apiFetch(cfg.listPath));
    } catch {
      setList([]);
    }
    try { setCats(await apiFetch("/categories")); } catch {}
    try { setPcats(await apiFetch("/marketplace/categories")); } catch {}
  }, [cfg.listPath]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const openCreate = () => { setEditing(null); setForm({}); setOpenSelect(null); setModalOpen(true); };
  const openEdit = (item: any) => { setEditing(item); setForm({ ...item }); setOpenSelect(null); setModalOpen(true); };

  const optionsFor = (f: AdminField): { value: string; label: string }[] => {
    if (f.options) return f.options.map((o) => ({ value: o, label: o }));
    if (f.optionsFrom === "categories") return cats.map((c) => ({ value: c.key, label: `${c.name_ar} (${c.key})` }));
    if (f.optionsFrom === "product_categories") return pcats.map((c) => ({ value: c.key, label: `${c.name_ar} (${c.key})` }));
    return [];
  };

  const save = async () => {
    const requireImages = cfg.hasImages;
    if (!form.name_ar) { toast.show("الاسم بالعربية مطلوب", "error"); return; }
    if (cfg.entity === "categories" || cfg.entity === "product_categories") {
      if (!form.key) { toast.show("المعرّف (key) مطلوب", "error"); return; }
    }
    if (requireImages && !(Array.isArray(form.images) && form.images.length)) {
      toast.show("أضف صورة واحدة على الأقل", "error"); return;
    }
    const payload: any = {};
    cfg.fields.forEach((f) => {
      let v = form[f.k];
      if (f.t === "number") v = v === undefined || v === "" ? 0 : parseFloat(v);
      else if (f.t === "bool") v = !!v;
      else if (f.t === "list") v = Array.isArray(v) ? v : String(v || "").split(/[,،\n]/).map((s) => s.trim()).filter(Boolean);
      else if (f.t === "images") v = Array.isArray(v) ? v : [];
      const fallback = f.t === "list" || f.t === "images" ? [] : f.t === "number" ? 0 : "";
      payload[f.k] = v ?? fallback;
    });
    if (cfg.hasImages) payload.cover_image = (payload.images && payload.images[0]) || "";
    setSaving(true);
    try {
      if (editing) {
        await apiFetch(`/admin/${cfg.entity}/${editing.id}`, { method: "PUT", body: payload });
        toast.show("تم التحديث بنجاح", "success");
      } else {
        await apiFetch(`/admin/${cfg.entity}`, { method: "POST", body: payload });
        toast.show("تمت الإضافة بنجاح", "success");
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
      await apiFetch(`/admin/${cfg.entity}/${item.id}`, { method: "DELETE" });
      toast.show("تم الحذف", "success");
      setConfirmDel(null);
      load();
    } catch (e: any) {
      toast.show(e.message || "فشل الحذف", "error");
    }
  };

  const filtered = (list || []).filter((it) => {
    if (!q) return true;
    const hay = `${it.name_ar || ""} ${it.name_en || ""} ${it.key || ""} ${it.location_ar || ""}`.toLowerCase();
    return hay.includes(q.toLowerCase());
  });

  const renderField = (f: AdminField) => {
    if (f.t === "bool") {
      return (
        <View style={styles.switchRow}>
          <Switch testID={`field-${f.k}`} value={!!form[f.k]} onValueChange={(v) => setForm((s: any) => ({ ...s, [f.k]: v }))}
            trackColor={{ true: COLORS.brand, false: COLORS.border }} thumbColor="#fff" />
        </View>
      );
    }
    if (f.t === "images") {
      return <MultiImageField value={form.images || []} onChange={(next) => setForm((s: any) => ({ ...s, images: next }))} />;
    }
    if (f.t === "icon") {
      return (
        <View>
          <View style={styles.iconPreviewRow}>
            <View style={styles.iconPreview}><Ionicons name={(form[f.k] || "help") as any} size={20} color="#fff" /></View>
            <TextInput style={[styles.input, { flex: 1 }]} placeholder="اسم الأيقونة (Ionicons)" placeholderTextColor={COLORS.onSurfaceSecondary}
              value={form[f.k] || ""} onChangeText={(v) => setForm((s: any) => ({ ...s, [f.k]: v }))} testID={`field-${f.k}`} textAlign="right" />
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.iconRow}>
            {ICON_PRESETS.map((ic) => {
              const on = form[f.k] === ic;
              return (
                <Pressable key={ic} testID={`icon-${ic}`} style={[styles.iconChip, on && styles.iconChipOn]} onPress={() => setForm((s: any) => ({ ...s, [f.k]: ic }))}>
                  <Ionicons name={ic as any} size={18} color={on ? "#fff" : COLORS.brand} />
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      );
    }
    if (f.t === "select") {
      const opts = optionsFor(f);
      const cur = opts.find((o) => o.value === form[f.k]);
      return (
        <View>
          <Pressable style={styles.select} onPress={() => setOpenSelect(openSelect === f.k ? null : f.k)} testID={`field-${f.k}`}>
            <Ionicons name={openSelect === f.k ? "chevron-up" : "chevron-down"} size={18} color={COLORS.onSurfaceSecondary} />
            <Text style={[styles.selectTxt, !cur && { color: COLORS.onSurfaceSecondary }]}>{cur ? cur.label : "اختر..."}</Text>
          </Pressable>
          {openSelect === f.k ? (
            <View style={styles.options}>
              {opts.length === 0 ? <Text style={styles.optEmpty}>لا توجد فئات — أضفها من قسم الفئات</Text> : null}
              {opts.map((o) => (
                <Pressable key={o.value} style={styles.opt} onPress={() => { setForm((s: any) => ({ ...s, [f.k]: o.value })); setOpenSelect(null); }} testID={`opt-${o.value}`}>
                  <Text style={styles.optTxt}>{o.label}</Text>
                  {form[f.k] === o.value ? <Ionicons name="checkmark" size={16} color={COLORS.brand} /> : null}
                </Pressable>
              ))}
            </View>
          ) : null}
        </View>
      );
    }
    // text / number / list
    const isList = f.t === "list";
    return (
      <TextInput
        testID={`field-${f.k}`}
        style={[styles.input, (f.multiline || isList) && styles.inputMulti]}
        placeholder={f.label}
        placeholderTextColor={COLORS.onSurfaceSecondary}
        value={isList ? (Array.isArray(form[f.k]) ? form[f.k].join("، ") : form[f.k] || "") : (form[f.k] !== undefined && form[f.k] !== null ? String(form[f.k]) : "")}
        onChangeText={(v) => setForm((s: any) => ({ ...s, [f.k]: v }))}
        keyboardType={f.t === "number" ? "numeric" : "default"}
        multiline={f.multiline || isList}
        textAlign="right"
      />
    );
  };

  return (
    <View style={styles.root}>
      <View style={styles.pageHead}>
        <View style={{ flex: 1 }}>
          <Text style={styles.pageTitle}>{cfg.label}</Text>
          <Text style={styles.pageSub}>{list ? `${filtered.length} عنصر` : "..."}</Text>
        </View>
        <Button title={`إضافة ${cfg.labelSingular}`} icon="add" onPress={openCreate} style={{ height: 44, paddingHorizontal: SPACING.lg }} testID="entity-add" />
      </View>

      <View style={styles.searchBox}>
        <Ionicons name="search" size={18} color={COLORS.onSurfaceSecondary} />
        <TextInput style={styles.searchInput} placeholder="بحث..." placeholderTextColor={COLORS.onSurfaceSecondary} value={q} onChangeText={setQ} textAlign="right" testID="entity-search" />
      </View>

      {list === null ? (
        <LoadingState />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(i) => i.id}
          contentContainerStyle={{ padding: SPACING.lg, gap: SPACING.sm, paddingBottom: SPACING.xxl }}
          ListEmptyComponent={<EmptyState icon="folder-open-outline" title="لا يوجد محتوى بعد" />}
          renderItem={({ item }) => (
            <View style={[styles.rowCard, SHADOW.soft]} testID={`row-${item.id}`}>
              {cfg.hasImages ? (
                <Image source={item.cover_image} style={styles.rowImg} contentFit="cover" />
              ) : (
                <View style={[styles.rowIcon, { backgroundColor: cfg.color }]}><Ionicons name={(item.icon || cfg.icon) as any} size={20} color="#fff" /></View>
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.rowName} numberOfLines={1}>{item.name_ar || item.key}</Text>
                <Text style={styles.rowSub} numberOfLines={1}>
                  {item.name_en || item.location_ar || item.key || ""}
                  {item.price !== undefined ? `  ·  $${item.price}` : ""}
                  {item.category ? `  ·  ${item.category}` : ""}
                </Text>
              </View>
              {wide && item.featured ? <View style={styles.tag}><Text style={styles.tagTxt}>مميّز</Text></View> : null}
              <Pressable onPress={() => openEdit(item)} hitSlop={8} style={styles.iconBtn} testID={`edit-${item.id}`}>
                <Ionicons name="create-outline" size={20} color={COLORS.brand} />
              </Pressable>
              <Pressable onPress={() => setConfirmDel(item)} hitSlop={8} style={styles.iconBtn} testID={`delete-${item.id}`}>
                <Ionicons name="trash-outline" size={20} color={COLORS.error} />
              </Pressable>
            </View>
          )}
        />
      )}

      <Modal visible={!!confirmDel} animationType="fade" transparent onRequestClose={() => setConfirmDel(null)}>
        <View style={styles.confirmRoot}>
          <View style={[styles.confirmCard, SHADOW.card]}>
            <View style={styles.confirmIcon}><Ionicons name="trash" size={24} color={COLORS.error} /></View>
            <Text style={styles.confirmTitle}>تأكيد الحذف</Text>
            <Text style={styles.confirmMsg}>هل أنت متأكد من حذف «{confirmDel?.name_ar || confirmDel?.key}»؟ لا يمكن التراجع عن هذا الإجراء.</Text>
            <View style={styles.confirmActions}>
              <Pressable style={[styles.confirmBtn, styles.confirmCancel]} onPress={() => setConfirmDel(null)} testID="confirm-cancel">
                <Text style={styles.confirmCancelTxt}>إلغاء</Text>
              </Pressable>
              <Pressable style={[styles.confirmBtn, styles.confirmDelete]} onPress={() => del(confirmDel)} testID="confirm-delete">
                <Text style={styles.confirmDeleteTxt}>حذف</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={modalOpen} animationType="slide" onRequestClose={() => setModalOpen(false)}>
        <View style={styles.modalRoot}>
          <View style={styles.modalHead}>
            <Pressable onPress={() => setModalOpen(false)} style={styles.closeBtn} testID="form-close">
              <Ionicons name="close" size={22} color={COLORS.onSurface} />
            </Pressable>
            <Text style={styles.modalTitle}>{editing ? "تعديل" : "إضافة"} {cfg.labelSingular}</Text>
            <View style={{ width: 40 }} />
          </View>
          <KeyboardAwareScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: SPACING.lg, paddingBottom: SPACING.xxl, alignItems: "center" }} bottomOffset={20}>
            <View style={{ width: "100%", maxWidth: 680 }}>
              {cfg.fields.map((f) => (
                <View key={f.k} style={{ marginBottom: SPACING.lg, zIndex: openSelect === f.k ? 10 : 1 }}>
                  <Text style={styles.fieldLabel}>{f.label}</Text>
                  {f.hint ? <Text style={styles.fieldHint}>{f.hint}</Text> : null}
                  {renderField(f)}
                </View>
              ))}
              <Button title={editing ? "حفظ التعديلات" : "إضافة"} icon="checkmark-circle" loading={saving} onPress={save} testID="entity-save" />
            </View>
          </KeyboardAwareScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.surfaceSecondary },
  pageHead: { flexDirection: "row", alignItems: "center", gap: SPACING.md, paddingHorizontal: SPACING.lg, paddingTop: SPACING.lg },
  pageTitle: { fontFamily: FONT.displayBold, fontSize: FSIZE.xxl, color: COLORS.onSurface, textAlign: "right" },
  pageSub: { fontFamily: FONT.body, fontSize: FSIZE.sm, color: COLORS.onSurfaceSecondary, textAlign: "right" },
  searchBox: { flexDirection: "row", alignItems: "center", gap: SPACING.sm, marginHorizontal: SPACING.lg, marginTop: SPACING.md, backgroundColor: COLORS.surface, borderRadius: RADIUS.md, paddingHorizontal: SPACING.md, height: 46, borderWidth: 1, borderColor: COLORS.border },
  searchInput: { flex: 1, fontFamily: FONT.body, fontSize: FSIZE.base, color: COLORS.onSurface },
  rowCard: { flexDirection: "row", alignItems: "center", gap: SPACING.md, backgroundColor: COLORS.surface, borderRadius: RADIUS.md, padding: SPACING.md },
  rowImg: { width: 54, height: 54, borderRadius: RADIUS.sm, backgroundColor: COLORS.surfaceSecondary },
  rowIcon: { width: 54, height: 54, borderRadius: RADIUS.sm, alignItems: "center", justifyContent: "center" },
  rowName: { fontFamily: FONT.bold, fontSize: FSIZE.base, color: COLORS.onSurface, textAlign: "right" },
  rowSub: { fontFamily: FONT.body, fontSize: FSIZE.sm, color: COLORS.onSurfaceSecondary, textAlign: "right", marginTop: 1 },
  tag: { backgroundColor: COLORS.brandTertiary, borderRadius: RADIUS.sm, paddingHorizontal: 8, paddingVertical: 3 },
  tagTxt: { fontFamily: FONT.bold, fontSize: FSIZE.sm, color: COLORS.onBrandTertiary },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.surfaceSecondary, alignItems: "center", justifyContent: "center" },

  modalRoot: { flex: 1, backgroundColor: COLORS.surface },
  modalHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  closeBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.surfaceSecondary, alignItems: "center", justifyContent: "center" },
  modalTitle: { fontFamily: FONT.displayBold, fontSize: FSIZE.xl, color: COLORS.onSurface },
  fieldLabel: { fontFamily: FONT.medium, fontSize: FSIZE.sm, color: COLORS.onSurfaceSecondary, textAlign: "right", marginBottom: 4 },
  fieldHint: { fontFamily: FONT.body, fontSize: FSIZE.sm, color: COLORS.brand, textAlign: "right", marginBottom: SPACING.sm },
  input: { backgroundColor: COLORS.surface, borderWidth: 1.5, borderColor: COLORS.border, borderRadius: RADIUS.md, paddingHorizontal: SPACING.lg, height: 50, fontFamily: FONT.body, fontSize: FSIZE.lg, color: COLORS.onSurface },
  inputMulti: { height: 100, paddingTop: SPACING.md, textAlignVertical: "top" },
  switchRow: { alignItems: "flex-end" },
  iconPreviewRow: { flexDirection: "row", gap: SPACING.sm, alignItems: "center" },
  iconPreview: { width: 50, height: 50, borderRadius: RADIUS.md, backgroundColor: COLORS.brand, alignItems: "center", justifyContent: "center" },
  iconRow: { flexDirection: "row", gap: SPACING.sm, paddingVertical: SPACING.sm },
  iconChip: { width: 42, height: 42, borderRadius: RADIUS.md, backgroundColor: COLORS.surface, borderWidth: 1.5, borderColor: COLORS.border, alignItems: "center", justifyContent: "center" },
  iconChipOn: { backgroundColor: COLORS.brand, borderColor: COLORS.brand },
  select: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: COLORS.surface, borderWidth: 1.5, borderColor: COLORS.border, borderRadius: RADIUS.md, paddingHorizontal: SPACING.lg, height: 50 },
  selectTxt: { fontFamily: FONT.body, fontSize: FSIZE.lg, color: COLORS.onSurface, textAlign: "right" },
  options: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.md, marginTop: 4, overflow: "hidden" },
  opt: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.divider },
  optTxt: { fontFamily: FONT.body, fontSize: FSIZE.base, color: COLORS.onSurface, textAlign: "right" },
  optEmpty: { fontFamily: FONT.body, fontSize: FSIZE.sm, color: COLORS.onSurfaceSecondary, padding: SPACING.md, textAlign: "right" },
  confirmRoot: { flex: 1, backgroundColor: "rgba(10,35,38,0.5)", alignItems: "center", justifyContent: "center", padding: SPACING.xl },
  confirmCard: { width: 400, maxWidth: "100%", backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.xl, alignItems: "center" },
  confirmIcon: { width: 56, height: 56, borderRadius: 28, backgroundColor: "#FBEAEA", alignItems: "center", justifyContent: "center", marginBottom: SPACING.md },
  confirmTitle: { fontFamily: FONT.displayBold, fontSize: FSIZE.xl, color: COLORS.onSurface, textAlign: "center" },
  confirmMsg: { fontFamily: FONT.body, fontSize: FSIZE.base, color: COLORS.onSurfaceSecondary, textAlign: "center", marginTop: SPACING.sm, marginBottom: SPACING.lg, lineHeight: 22 },
  confirmActions: { flexDirection: "row", gap: SPACING.md, alignSelf: "stretch" },
  confirmBtn: { flex: 1, height: 48, borderRadius: RADIUS.md, alignItems: "center", justifyContent: "center" },
  confirmCancel: { backgroundColor: COLORS.surfaceSecondary },
  confirmCancelTxt: { fontFamily: FONT.bold, fontSize: FSIZE.base, color: COLORS.onSurface },
  confirmDelete: { backgroundColor: COLORS.error },
  confirmDeleteTxt: { fontFamily: FONT.bold, fontSize: FSIZE.base, color: "#fff" },
});
