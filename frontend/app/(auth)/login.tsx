import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, Dimensions } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
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

const BG = "https://images.unsplash.com/photo-1642425146676-992ad3f73e26?q=85&w=1200";
const { height } = Dimensions.get("window");

export default function Login() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, login, loginWithGoogle } = useAuth();
  const toast = useToast();
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);
  const [gLoading, setGLoading] = useState(false);

  if (user) return <Redirect href="/(tabs)" />;

  const validate = () => {
    const e: typeof errors = {};
    if (!/^\S+@\S+\.\S+$/.test(email)) e.email = "بريد إلكتروني غير صالح";
    if (password.length < 6) e.password = "كلمة المرور 6 أحرف على الأقل";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (e: any) {
      toast.show(e.message || "فشل تسجيل الدخول", "error");
    } finally {
      setLoading(false);
    }
  };

  const onGoogle = async () => {
    setGLoading(true);
    try {
      await loginWithGoogle();
    } catch (e: any) {
      toast.show("تعذّر تسجيل الدخول عبر Google", "error");
    } finally {
      setGLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <Image source={BG} style={styles.bg} contentFit="cover" />
      <LinearGradient
        colors={["rgba(10,35,38,0.35)", "rgba(10,35,38,0.85)", COLORS.surfaceInverse]}
        locations={[0, 0.55, 1]}
        style={StyleSheet.absoluteFill as any}
      />
      <KeyboardAwareScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + height * 0.16, paddingBottom: insets.bottom + SPACING.xl }]}
        bottomOffset={20}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.brandWrap}>
          <View style={styles.logo}>
            <Ionicons name="leaf" size={26} color="#fff" />
          </View>
          <Text style={styles.brand}>سُقطرى إكسبلورر</Text>
          <Text style={styles.tagline}>{t("tagline")}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>{t("login")}</Text>
          <Text style={styles.subtitle}>{t("welcome_back")}</Text>

          <TextField
            testID="login-email"
            label={t("email")}
            icon="mail-outline"
            placeholder="example@email.com"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            error={errors.email}
          />
          <TextField
            testID="login-password"
            label={t("password")}
            icon="lock-closed-outline"
            placeholder="••••••••"
            secure
            value={password}
            onChangeText={setPassword}
            error={errors.password}
          />

          <Button testID="login-submit" title={t("login_cta")} onPress={onLogin} loading={loading} />

          <View style={styles.divider}>
            <View style={styles.line} />
            <Text style={styles.or}>{t("or")}</Text>
            <View style={styles.line} />
          </View>

          <Pressable testID="login-google" style={styles.google} onPress={onGoogle} disabled={gLoading}>
            <Ionicons name="logo-google" size={20} color="#DB4437" />
            <Text style={styles.googleTxt}>{gLoading ? "..." : t("continue_google")}</Text>
          </Pressable>

          <Pressable style={styles.footer} onPress={() => router.push("/(auth)/register")} testID="go-register">
            <Text style={styles.footerTxt}>
              {t("no_account")} <Text style={styles.footerLink}>{t("create_account")}</Text>
            </Text>
          </Pressable>
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.surfaceInverse },
  bg: { ...StyleSheet.absoluteFillObject, height: height * 0.55 } as any,
  scroll: { flexGrow: 1, paddingHorizontal: SPACING.lg },
  brandWrap: { alignItems: "center", marginBottom: SPACING.xl },
  logo: { width: 60, height: 60, borderRadius: 18, backgroundColor: COLORS.brand, alignItems: "center", justifyContent: "center", marginBottom: SPACING.md },
  brand: { fontFamily: FONT.displayBold, fontSize: FSIZE.xxl, color: "#fff" },
  tagline: { fontFamily: FONT.body, fontSize: FSIZE.base, color: "rgba(255,255,255,0.85)", marginTop: 4, textAlign: "center" },
  card: { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.xl },
  title: { fontFamily: FONT.displayBold, fontSize: FSIZE.xxl, color: COLORS.onSurface, textAlign: "right" },
  subtitle: { fontFamily: FONT.body, fontSize: FSIZE.base, color: COLORS.onSurfaceSecondary, textAlign: "right", marginBottom: SPACING.xl, marginTop: 4 },
  divider: { flexDirection: "row", alignItems: "center", gap: SPACING.md, marginVertical: SPACING.lg },
  line: { flex: 1, height: 1, backgroundColor: COLORS.border },
  or: { fontFamily: FONT.body, color: COLORS.onSurfaceSecondary, fontSize: FSIZE.sm },
  google: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: SPACING.sm, height: 54, borderRadius: RADIUS.md, borderWidth: 1.5, borderColor: COLORS.border },
  googleTxt: { fontFamily: FONT.bold, fontSize: FSIZE.lg, color: COLORS.onSurface },
  footer: { alignItems: "center", marginTop: SPACING.xl },
  footerTxt: { fontFamily: FONT.body, fontSize: FSIZE.base, color: COLORS.onSurfaceSecondary },
  footerLink: { fontFamily: FONT.bold, color: COLORS.brandPrimary },
});
