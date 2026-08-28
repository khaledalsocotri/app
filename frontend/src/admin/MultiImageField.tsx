import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, TextInput, ActivityIndicator } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { COLORS, SPACING, RADIUS, FONT, FSIZE } from "@/src/theme/theme";
import { uploadImageAsync } from "@/src/api/upload";
import { useToast } from "@/src/components/Toast";

// Manages a gallery of image URLs. First image is the cover. Supports upload
// from device, add by URL, delete, and set-as-cover.
export function MultiImageField({ value, onChange }: { value: string[]; onChange: (next: string[]) => void }) {
  const toast = useToast();
  const [url, setUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const images = Array.isArray(value) ? value : [];

  const add = (u: string) => {
    if (!u) return;
    onChange([...images, u]);
  };
  const remove = (i: number) => onChange(images.filter((_, idx) => idx !== i));
  const makeCover = (i: number) => {
    const next = [...images];
    const [it] = next.splice(i, 1);
    onChange([it, ...next]);
  };

  const pick = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (perm.status !== "granted") {
      toast.show("نحتاج إذن الوصول للصور", "info");
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 0.6, allowsMultipleSelection: true });
    if (res.canceled || !res.assets?.length) return;
    setUploading(true);
    try {
      const uploaded: string[] = [];
      for (const a of res.assets) uploaded.push(await uploadImageAsync(a.uri));
      onChange([...images, ...uploaded]);
    } catch (e: any) {
      toast.show(e.message || "فشل رفع الصورة", "error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <View>
      <View style={styles.grid}>
        {images.map((img, i) => (
          <View key={img + i} style={styles.thumbWrap} testID={`image-${i}`}>
            <Image source={img} style={styles.thumb} contentFit="cover" />
            {i === 0 ? (
              <View style={styles.coverBadge}><Text style={styles.coverTxt}>الغلاف</Text></View>
            ) : (
              <Pressable style={styles.coverBtn} onPress={() => makeCover(i)} testID={`make-cover-${i}`}>
                <Ionicons name="star-outline" size={13} color="#fff" />
              </Pressable>
            )}
            <Pressable style={styles.del} onPress={() => remove(i)} testID={`del-image-${i}`}>
              <Ionicons name="close" size={14} color="#fff" />
            </Pressable>
          </View>
        ))}
        <Pressable style={styles.addTile} onPress={pick} disabled={uploading} testID="add-image-upload">
          {uploading ? <ActivityIndicator color={COLORS.brand} /> : <Ionicons name="cloud-upload-outline" size={22} color={COLORS.brand} />}
          <Text style={styles.addTxt}>{uploading ? "جارٍ الرفع" : "رفع صور"}</Text>
        </Pressable>
      </View>
      <View style={styles.urlRow}>
        <TextInput
          style={styles.urlInput}
          placeholder="أو أضف رابط صورة"
          placeholderTextColor={COLORS.onSurfaceSecondary}
          value={url}
          onChangeText={setUrl}
          textAlign="right"
          testID="image-url-input"
        />
        <Pressable style={styles.urlBtn} onPress={() => { add(url.trim()); setUrl(""); }} testID="add-image-url">
          <Ionicons name="add" size={20} color="#fff" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: SPACING.sm },
  thumbWrap: { width: 92, height: 92, borderRadius: RADIUS.md, overflow: "hidden", backgroundColor: COLORS.surfaceSecondary },
  thumb: { width: "100%", height: "100%" },
  del: { position: "absolute", top: 4, left: 4, width: 24, height: 24, borderRadius: 12, backgroundColor: "rgba(184,58,58,0.9)", alignItems: "center", justifyContent: "center" },
  coverBtn: { position: "absolute", bottom: 4, right: 4, width: 24, height: 24, borderRadius: 12, backgroundColor: "rgba(15,107,118,0.9)", alignItems: "center", justifyContent: "center" },
  coverBadge: { position: "absolute", bottom: 4, right: 4, backgroundColor: COLORS.brand, borderRadius: RADIUS.sm, paddingHorizontal: 6, paddingVertical: 2 },
  coverTxt: { fontFamily: FONT.bold, fontSize: 10, color: "#fff" },
  addTile: { width: 92, height: 92, borderRadius: RADIUS.md, borderWidth: 1.5, borderStyle: "dashed", borderColor: COLORS.borderStrong, alignItems: "center", justifyContent: "center", gap: 4 },
  addTxt: { fontFamily: FONT.medium, fontSize: FSIZE.sm, color: COLORS.brand },
  urlRow: { flexDirection: "row", gap: SPACING.sm, marginTop: SPACING.sm, alignItems: "center" },
  urlInput: { flex: 1, backgroundColor: COLORS.surface, borderWidth: 1.5, borderColor: COLORS.border, borderRadius: RADIUS.md, paddingHorizontal: SPACING.md, height: 46, fontFamily: FONT.body, fontSize: FSIZE.base, color: COLORS.onSurface },
  urlBtn: { width: 46, height: 46, borderRadius: RADIUS.md, backgroundColor: COLORS.brand, alignItems: "center", justifyContent: "center" },
});
