import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, Pressable, Modal, KeyboardAvoidingView, Platform, TextInput, ScrollView } from "react-native";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING, RADIUS, FONT, FSIZE, SHADOW } from "@/src/theme/theme";
import { useFetch } from "@/src/hooks/useFetch";
import { apiFetch } from "@/src/api/client";
import { useToast } from "@/src/components/Toast";
import { Button } from "@/src/components/Button";

type ItemType = "destination" | "experience" | "trip";

// Interactive 1–5 star picker.
function StarPicker({ value, onChange, size = 34 }: { value: number; onChange: (v: number) => void; size?: number }) {
  return (
    <View style={styles.pickerRow}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Pressable
          key={n}
          hitSlop={6}
          testID={`star-${n}`}
          onPress={() => {
            if (Platform.OS !== "web") Haptics.selectionAsync?.();
            onChange(n);
          }}
        >
          <Ionicons name={n <= value ? "star" : "star-outline"} size={size} color={n <= value ? COLORS.star : COLORS.borderStrong} />
        </Pressable>
      ))}
    </View>
  );
}

export function ReviewsSection({ itemType, itemId }: { itemType: ItemType; itemId: string }) {
  const toast = useToast();
  const { data: reviews, reload } = useFetch<any[]>(`/reviews?item_type=${itemType}&item_id=${itemId}`, [itemId]);
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const list = reviews || [];
  const avg = useMemo(() => (list.length ? list.reduce((s, r) => s + (r.rating || 0), 0) / list.length : 0), [list]);

  const submit = async () => {
    if (rating < 1) {
      toast.show("اختر عدد النجوم أولاً", "error");
      return;
    }
    setSubmitting(true);
    try {
      await apiFetch("/reviews", {
        method: "POST",
        body: { item_type: itemType, item_id: itemId, rating, comment: comment.trim() || null },
      });
      if (Platform.OS !== "web") Haptics.notificationAsync?.(Haptics.NotificationFeedbackType.Success);
      toast.show("شكراً لتقييمك ✓", "success");
      setOpen(false);
      setRating(0);
      setComment("");
      reload();
    } catch (e: any) {
      toast.show(e.message || "تعذّر إرسال التقييم", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.headerRow}>
        <View style={styles.titleRow}>
          <Ionicons name="chatbubble-ellipses-outline" size={18} color={COLORS.brand} />
          <Text style={styles.title}>التقييمات ({list.length})</Text>
        </View>
        <Pressable style={styles.addBtn} onPress={() => setOpen(true)} testID="add-review-button">
          <Ionicons name="create-outline" size={16} color={COLORS.onBrandPrimary} />
          <Text style={styles.addTxt}>أضف تقييمك</Text>
        </Pressable>
      </View>

      {list.length > 0 ? (
        <>
          <View style={styles.avgBox}>
            <Text style={styles.avgNum}>{avg.toFixed(1)}</Text>
            <View>
              <View style={styles.avgStars}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <Ionicons key={n} name={n <= Math.round(avg) ? "star" : "star-outline"} size={16} color={COLORS.star} />
                ))}
              </View>
              <Text style={styles.avgSub}>بناءً على {list.length} تقييم</Text>
            </View>
          </View>

          {list.map((r) => (
            <View key={r.id} style={styles.review} testID={`review-${r.id}`}>
              <View style={styles.reviewHead}>
                <View style={styles.reviewer}>
                  <View style={styles.avatar}><Text style={styles.avatarTxt}>{(r.user_name || "?")[0]}</Text></View>
                  <View>
                    <Text style={styles.reviewName}>{r.user_name || "زائر"}</Text>
                    <Text style={styles.reviewDate}>{(r.created_at || "").slice(0, 10)}</Text>
                  </View>
                </View>
                <View style={styles.reviewStars}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Ionicons key={n} name={n <= r.rating ? "star" : "star-outline"} size={13} color={COLORS.star} />
                  ))}
                </View>
              </View>
              {r.comment ? <Text style={styles.reviewTxt}>{r.comment}</Text> : null}
            </View>
          ))}
        </>
      ) : (
        <View style={styles.empty}>
          <Ionicons name="star-outline" size={28} color={COLORS.brandPrimary} />
          <Text style={styles.emptyTxt}>كن أول من يشارك تجربته</Text>
        </View>
      )}

      {/* Review modal */}
      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)} testID="review-backdrop" />
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.sheetWrap}>
          <View style={[styles.sheet, SHADOW.card]}>
            <View style={styles.grabber} />
            <Text style={styles.sheetTitle}>ما رأيك في هذا المكان؟</Text>
            <StarPicker value={rating} onChange={setRating} />
            <View style={styles.commentBox}>
              <TextInput
                testID="review-comment"
                style={styles.commentInput}
                placeholder="اكتب تجربتك (اختياري)"
                placeholderTextColor={COLORS.onSurfaceSecondary}
                value={comment}
                onChangeText={setComment}
                multiline
                textAlign="right"
              />
            </View>
            <Button title="إرسال التقييم" icon="send" loading={submitting} onPress={submit} testID="submit-review" />
            <Pressable style={styles.cancel} onPress={() => setOpen(false)} testID="cancel-review">
              <Text style={styles.cancelTxt}>إلغاء</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: SPACING.xl },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: SPACING.md },
  titleRow: { flexDirection: "row", alignItems: "center", gap: SPACING.sm },
  title: { fontFamily: FONT.displayBold, fontSize: FSIZE.xl, color: COLORS.onSurface },
  addBtn: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: COLORS.brand, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: RADIUS.pill },
  addTxt: { fontFamily: FONT.bold, fontSize: FSIZE.sm, color: COLORS.onBrandPrimary },
  avgBox: { flexDirection: "row", alignItems: "center", gap: SPACING.md, backgroundColor: COLORS.surfaceSecondary, borderRadius: RADIUS.md, padding: SPACING.lg, marginBottom: SPACING.md },
  avgNum: { fontFamily: FONT.displayBold, fontSize: 40, color: COLORS.onSurface },
  avgStars: { flexDirection: "row", gap: 2 },
  avgSub: { fontFamily: FONT.body, fontSize: FSIZE.sm, color: COLORS.onSurfaceSecondary, marginTop: 4, textAlign: "right" },
  review: { backgroundColor: COLORS.surfaceSecondary, borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.sm },
  reviewHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  reviewer: { flexDirection: "row", alignItems: "center", gap: SPACING.sm },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.brand, alignItems: "center", justifyContent: "center" },
  avatarTxt: { fontFamily: FONT.displayBold, fontSize: FSIZE.base, color: "#fff" },
  reviewName: { fontFamily: FONT.bold, fontSize: FSIZE.base, color: COLORS.onSurface, textAlign: "right" },
  reviewDate: { fontFamily: FONT.body, fontSize: FSIZE.sm, color: COLORS.onSurfaceSecondary, textAlign: "right" },
  reviewStars: { flexDirection: "row", gap: 1 },
  reviewTxt: { fontFamily: FONT.body, fontSize: FSIZE.base, color: COLORS.onSurfaceSecondary, textAlign: "right", marginTop: SPACING.sm, lineHeight: 22 },
  empty: { alignItems: "center", gap: SPACING.sm, backgroundColor: COLORS.surfaceSecondary, borderRadius: RADIUS.md, paddingVertical: SPACING.xl },
  emptyTxt: { fontFamily: FONT.medium, fontSize: FSIZE.base, color: COLORS.onSurfaceSecondary },
  backdrop: { flex: 1, backgroundColor: "rgba(10,35,38,0.5)" },
  sheetWrap: { position: "absolute", left: 0, right: 0, bottom: 0 },
  sheet: { backgroundColor: COLORS.surface, borderTopLeftRadius: RADIUS.lg, borderTopRightRadius: RADIUS.lg, padding: SPACING.xl, paddingBottom: SPACING.xxl, alignItems: "center", gap: SPACING.lg },
  grabber: { width: 44, height: 5, borderRadius: 3, backgroundColor: COLORS.border },
  sheetTitle: { fontFamily: FONT.displayBold, fontSize: FSIZE.xl, color: COLORS.onSurface, textAlign: "center" },
  pickerRow: { flexDirection: "row", gap: SPACING.sm },
  commentBox: { width: "100%", backgroundColor: COLORS.surfaceSecondary, borderRadius: RADIUS.md, padding: SPACING.md, minHeight: 90 },
  commentInput: { fontFamily: FONT.body, fontSize: FSIZE.lg, color: COLORS.onSurface, minHeight: 66, textAlignVertical: "top" },
  cancel: { paddingVertical: SPACING.sm },
  cancelTxt: { fontFamily: FONT.medium, fontSize: FSIZE.base, color: COLORS.onSurfaceSecondary },
});
