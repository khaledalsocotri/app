import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Redirect, useRouter } from "expo-router";
import { COLORS, SPACING, RADIUS, FONT, FSIZE } from "@/src/theme/theme";
import { useI18n } from "@/src/context/LanguageContext";
import { TextField } from "@/src/components/TextField";
import { Button } from "@/src/components/Button";
import { useAuth } from "@/src/context/AuthContext";
import { useToast } from "@/src/components/Toast";

const MAX_NAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 254;
const MAX_PASSWORD_LENGTH = 128;

export default function Register() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, register } = useAuth();
  const toast = useToast();
  const { t } = useI18n();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);

  if (user) return <Redirect href="/(tabs)" />;

  const validate = () => {
    const e: any = {};
    const normalizedName = name.trim();
    const normalizedEmail = email.trim();
    if (normalizedName.length < 2 || normalizedName.length > MAX_NAME_LENGTH) e.name = `الاسم يجب أن يكون بين حرفين و${MAX_NAME_LENGTH} حرفاً`;
    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail) || normalizedEmail.length > MAX_EMAIL_LENGTH) e.email = "بريد إلكتروني غير صالح";
    if (password.length < 6 || password.length > MAX_PASSWORD_LENGTH) e.password = `كلمة المرور يجب أن تكون بين 6 و${MAX_PASSWORD_LENGTH} حرفاً`;
    if (confirm !== password) e.confirm = "كلمتا المرور غير متطابقتين";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onRegister = async () => {
    if (!validate() || loading) return;
    setLoading(true);
    try {
      await register(name.trim(), email.trim(), password);
    } catch (e: any) {
      toast.show(e.message || "فشل إنشاء الحساب", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
        <Pressable onPress={() => router.back()} hitSlop={10} testID="register-back" style={styles.backBtn}>
          <Ionicons name="chevron-forward" size={24} color={COLORS.onSurface} />
        </Pressable>
        <Text style={styles.headerTitle}>{t("create_account")}</Text>
        <View style={{ width: 40 }} />
      </View>
      <KeyboardAwareScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + SPACING.xl }]}
        bottomOffset={20}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.lead}>انضم إلينا واكتشف كنوز سقطرى الطبيعية والثقافية</Text>

        <TextField testID="register-name" label={t("full_name")} icon="person-outline" placeholder="اسمك" maxLength={MAX_NAME_LENGTH} value={name} onChangeText={setName} error={errors.name} />
        <TextField testID="register-email" label={t("email")} icon="mail-outline" placeholder="example@email.com" autoCapitalize="none" keyboardType="email-address" maxLength={MAX_EMAIL_LENGTH} value={email} onChangeText={setEmail} error={errors.email} />
        <TextField testID="register-password" label={t("password")} icon="lock-closed-outline" placeholder="••••••••" secure maxLength={MAX_PASSWORD_LENGTH} value={password} onChangeText={setPassword} error={errors.password} />
        <TextField testID="register-confirm" label="تأكيد كلمة المرور" icon="lock-closed-outline" placeholder="••••••••" secure maxLength={MAX_PASSWORD_LENGTH} value={confirm} onChangeText={setConfirm} error={errors.confirm} />

        <Button testID="register-submit" title={t("create_account")} onPress={onRegister} loading={loading} style={{ marginTop: SPACING.sm }} />

        <Pressable style={styles.footer} onPress={() => router.replace("/(auth)/login")} testID="go-login">
          <Text style={styles.footerTxt}>
            {t("have_account")} <Text style={styles.footerLink}>{t("login")}</Text>
          </Text>
        </Pressable>
      </KeyboardAwareScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.surface },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: SPACING.lg, paddingBottom: SPACING.md },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.surfaceSecondary, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontFamily: FONT.displayBold, fontSize: FSIZE.xl, color: COLORS.onSurface },
  scroll: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.md },
  lead: { fontFamily: FONT.body, fontSize: FSIZE.base, color: COLORS.onSurfaceSecondary, textAlign: "right", marginBottom: SPACING.xl },
  footer: { alignItems: "center", marginTop: SPACING.xl },
  footerTxt: { fontFamily: FONT.body, fontSize: FSIZE.base, color: COLORS.onSurfaceSecondary },
  footerLink: { fontFamily: FONT.bold, color: COLORS.brandPrimary },
});
