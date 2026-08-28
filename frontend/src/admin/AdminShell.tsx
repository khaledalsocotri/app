import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, ActivityIndicator, TextInput, useWindowDimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, usePathname } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS, SPACING, RADIUS, FONT, FSIZE, SHADOW } from "@/src/theme/theme";
import { useAuth } from "@/src/context/AuthContext";
import { Button } from "@/src/components/Button";
import { NAV } from "@/src/admin/entities";

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.brandPrimary} /></View>;
  }
  if (!user) return <AdminLogin />;
  if (!user.is_admin) return <AccessDenied />;
  return <Dashboard>{children}</Dashboard>;
}

function Dashboard({ children }: { children: React.ReactNode }) {
  const { width } = useWindowDimensions();
  const wide = width >= 900;
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const NavList = ({ onNavigate }: { onNavigate?: () => void }) => (
    <>
      {NAV.map((n) => {
        const active = n.route === "/admin" ? pathname === "/admin" : pathname === n.route;
        return (
          <Pressable
            key={n.route}
            style={[styles.navItem, active && styles.navItemActive]}
            onPress={() => { router.push(n.route as any); onNavigate?.(); }}
            testID={`nav-${n.route.replace("/admin", "").replace("/", "") || "home"}`}
          >
            <Ionicons name={n.icon as any} size={20} color={active ? "#fff" : COLORS.onSurfaceSecondary} />
            <Text style={[styles.navTxt, active && styles.navTxtActive]}>{n.label}</Text>
          </Pressable>
        );
      })}
    </>
  );

  if (wide) {
    return (
      <View style={styles.wideRoot}>
        <View style={[styles.sidebar, { paddingTop: insets.top + SPACING.lg }]}>
          <View style={styles.brand}>
            <View style={styles.brandLogo}><Ionicons name="leaf" size={20} color="#fff" /></View>
            <View>
              <Text style={styles.brandTitle}>لوحة تحكم سقطرى</Text>
              <Text style={styles.brandSub}>إدارة المحتوى</Text>
            </View>
          </View>
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ gap: 4, paddingBottom: SPACING.lg }} showsVerticalScrollIndicator={false}>
            <NavList />
          </ScrollView>
          <View style={styles.userBox}>
            <View style={styles.avatar}><Text style={styles.avatarTxt}>{(user?.name || "A").charAt(0)}</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.userName} numberOfLines={1}>{user?.name}</Text>
              <Text style={styles.userMail} numberOfLines={1}>{user?.email}</Text>
            </View>
            <Pressable onPress={logout} hitSlop={8} testID="admin-logout"><Ionicons name="log-out-outline" size={22} color={COLORS.error} /></Pressable>
          </View>
        </View>
        <View style={styles.content}>{children}</View>
      </View>
    );
  }

  // Narrow / mobile: top bar + horizontally scrollable nav.
  return (
    <View style={styles.narrowRoot}>
      <View style={[styles.topbar, { paddingTop: insets.top + SPACING.sm }]}>
        <View style={styles.brand}>
          <View style={styles.brandLogo}><Ionicons name="leaf" size={18} color="#fff" /></View>
          <Text style={styles.brandTitle}>لوحة التحكم</Text>
        </View>
        <Pressable onPress={logout} hitSlop={8} style={styles.topLogout} testID="admin-logout"><Ionicons name="log-out-outline" size={20} color={COLORS.error} /></Pressable>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.navScroll} contentContainerStyle={styles.navScrollInner}>
        <NavList />
      </ScrollView>
      <View style={{ flex: 1 }}>{children}</View>
    </View>
  );
}

function AdminLogin() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setErr("");
    setBusy(true);
    try {
      await login(email.trim(), password);
    } catch (e: any) {
      setErr(e.message || "فشل تسجيل الدخول");
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.authRoot}>
      <View style={[styles.authCard, SHADOW.card]}>
        <View style={styles.authLogo}><Ionicons name="shield-checkmark" size={28} color="#fff" /></View>
        <Text style={styles.authTitle}>لوحة تحكم المشرف</Text>
        <Text style={styles.authSub}>هذه المنطقة مخصصة للمشرفين فقط</Text>
        {err ? <View style={styles.errBox}><Text style={styles.errTxt}>{err}</Text></View> : null}
        <Text style={styles.authLabel}>البريد الإلكتروني</Text>
        <TextInput style={styles.authInput} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address"
          placeholder="admin@socotra.app" placeholderTextColor={COLORS.onSurfaceSecondary} textAlign="right" testID="admin-login-email" />
        <Text style={styles.authLabel}>كلمة المرور</Text>
        <TextInput style={styles.authInput} value={password} onChangeText={setPassword} secureTextEntry
          placeholder="••••••••" placeholderTextColor={COLORS.onSurfaceSecondary} textAlign="right" testID="admin-login-password"
          onSubmitEditing={submit} />
        <Button title="تسجيل الدخول" icon="log-in" loading={busy} onPress={submit} style={{ marginTop: SPACING.lg }} testID="admin-login-submit" />
      </View>
    </View>
  );
}

function AccessDenied() {
  const { logout, user } = useAuth();
  return (
    <View style={styles.authRoot}>
      <View style={[styles.authCard, SHADOW.card]}>
        <View style={[styles.authLogo, { backgroundColor: COLORS.error }]}><Ionicons name="lock-closed" size={28} color="#fff" /></View>
        <Text style={styles.authTitle}>لا تملك صلاحية الوصول</Text>
        <Text style={styles.authSub}>الحساب {user?.email} ليس حساب مشرف. سجّل الدخول بحساب مشرف.</Text>
        <Button title="تسجيل الخروج" variant="ghost" icon="log-out-outline" onPress={logout} style={{ marginTop: SPACING.lg }} testID="denied-logout" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: COLORS.surface },
  wideRoot: { flex: 1, flexDirection: "row", backgroundColor: COLORS.surfaceSecondary },
  sidebar: { width: 264, backgroundColor: COLORS.surface, borderLeftWidth: 1, borderLeftColor: COLORS.border, paddingHorizontal: SPACING.md, paddingBottom: SPACING.lg },
  content: { flex: 1 },
  brand: { flexDirection: "row", alignItems: "center", gap: SPACING.sm, paddingHorizontal: SPACING.sm, marginBottom: SPACING.lg },
  brandLogo: { width: 40, height: 40, borderRadius: RADIUS.md, backgroundColor: COLORS.brand, alignItems: "center", justifyContent: "center" },
  brandTitle: { fontFamily: FONT.displayBold, fontSize: FSIZE.lg, color: COLORS.onSurface, textAlign: "right" },
  brandSub: { fontFamily: FONT.body, fontSize: FSIZE.sm, color: COLORS.onSurfaceSecondary, textAlign: "right" },
  navItem: { flexDirection: "row", alignItems: "center", gap: SPACING.md, paddingHorizontal: SPACING.md, height: 46, borderRadius: RADIUS.md },
  navItemActive: { backgroundColor: COLORS.brand },
  navTxt: { fontFamily: FONT.medium, fontSize: FSIZE.base, color: COLORS.onSurfaceSecondary },
  navTxtActive: { color: "#fff", fontFamily: FONT.bold },
  userBox: { flexDirection: "row", alignItems: "center", gap: SPACING.sm, paddingTop: SPACING.md, borderTopWidth: 1, borderTopColor: COLORS.border },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.brandSecondary, alignItems: "center", justifyContent: "center" },
  avatarTxt: { fontFamily: FONT.bold, color: "#fff", fontSize: FSIZE.lg },
  userName: { fontFamily: FONT.bold, fontSize: FSIZE.base, color: COLORS.onSurface, textAlign: "right" },
  userMail: { fontFamily: FONT.body, fontSize: FSIZE.sm, color: COLORS.onSurfaceSecondary, textAlign: "right" },

  narrowRoot: { flex: 1, backgroundColor: COLORS.surfaceSecondary },
  topbar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: SPACING.lg, paddingBottom: SPACING.md, backgroundColor: COLORS.surface },
  topLogout: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.surfaceSecondary, alignItems: "center", justifyContent: "center" },
  navScroll: { flexGrow: 0, backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  navScrollInner: { flexDirection: "row", gap: SPACING.sm, paddingHorizontal: SPACING.lg, paddingBottom: SPACING.md },

  authRoot: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: COLORS.surfaceSecondary, padding: SPACING.lg },
  authCard: { width: 400, maxWidth: "100%", backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.xl, alignItems: "stretch" },
  authLogo: { width: 56, height: 56, borderRadius: RADIUS.md, backgroundColor: COLORS.brand, alignItems: "center", justifyContent: "center", alignSelf: "center", marginBottom: SPACING.md },
  authTitle: { fontFamily: FONT.displayBold, fontSize: FSIZE.xxl, color: COLORS.onSurface, textAlign: "center" },
  authSub: { fontFamily: FONT.body, fontSize: FSIZE.base, color: COLORS.onSurfaceSecondary, textAlign: "center", marginTop: 4, marginBottom: SPACING.lg },
  authLabel: { fontFamily: FONT.medium, fontSize: FSIZE.sm, color: COLORS.onSurfaceSecondary, textAlign: "right", marginBottom: 6, marginTop: SPACING.sm },
  authInput: { backgroundColor: COLORS.surfaceSecondary, borderWidth: 1.5, borderColor: COLORS.border, borderRadius: RADIUS.md, paddingHorizontal: SPACING.lg, height: 52, fontFamily: FONT.body, fontSize: FSIZE.lg, color: COLORS.onSurface },
  errBox: { backgroundColor: "#FBEAEA", borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.sm },
  errTxt: { fontFamily: FONT.medium, fontSize: FSIZE.base, color: COLORS.error, textAlign: "center" },
});
