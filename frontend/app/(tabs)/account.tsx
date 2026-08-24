import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect, useRouter } from "expo-router";
import { COLORS, SPACING, RADIUS, FONT, FSIZE, SHADOW } from "@/src/theme/theme";
import { apiFetch } from "@/src/api/client";
import { useAuth } from "@/src/context/AuthContext";

const TABBAR = 92;

const STATUS_AR: Record<string, string> = { pending: "قيد المراجعة", confirmed: "مؤكد", cancelled: "ملغى" };
const STATUS_COLOR: Record<string, string> = { pending: COLORS.warning, confirmed: COLORS.success, cancelled: COLORS.error };

export default function Account() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [view, setView] = useState<"menu" | "bookings" | "orders" | "notifications">("menu");

  const load = useCallback(async () => {
    try {
      const [b, o, n] = await Promise.all([apiFetch("/bookings"), apiFetch("/orders"), apiFetch("/notifications")]);
      setBookings(b);
      setOrders(o);
      setNotifications(n);
    } catch {}
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const menu = [
    { key: "bookings", label: "حجوزاتي", icon: "receipt-outline", badge: bookings.length, onPress: () => setView("bookings") },
    { key: "orders", label: "طلباتي", icon: "bag-handle-outline", badge: orders.length, onPress: () => setView("orders") },
    { key: "favorites", label: "المفضلة", icon: "heart-outline", onPress: () => router.push("/(tabs)/favorites") },
    { key: "notifications", label: "الإشعارات", icon: "notifications-outline", badge: notifications.filter((n) => !n.read).length, onPress: () => setView("notifications") },
    { key: "marketplace", label: "التسويق المحلي", icon: "storefront-outline", onPress: () => router.push("/marketplace") },
    ...(user?.is_admin ? [{ key: "admin", label: "لوحة الإدارة", icon: "shield-checkmark-outline", onPress: () => router.push("/admin") }] : []),
    { key: "settings", label: "الإعدادات", icon: "settings-outline", onPress: () => {} },
    { key: "help", label: "المساعدة والدعم", icon: "help-circle-outline", onPress: () => {} },
  ];

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + SPACING.md, paddingBottom: TABBAR + SPACING.xl }}
        showsVerticalScrollIndicator={false}
      >
        {view !== "menu" ? (
          <View style={styles.subHeader}>
            <Pressable onPress={() => setView("menu")} style={styles.backBtn} testID="account-back">
              <Ionicons name="chevron-forward" size={24} color={COLORS.onSurface} />
            </Pressable>
            <Text style={styles.subTitle}>{view === "bookings" ? "حجوزاتي" : view === "orders" ? "طلباتي" : "الإشعارات"}</Text>
            <View style={{ width: 40 }} />
          </View>
        ) : null}

        {/* Profile card */}
        {view === "menu" && (
          <View style={styles.profile}>
            <View style={styles.avatar}>
              {user?.picture ? (
                <Image source={user.picture} style={styles.avatarImg} />
              ) : (
                <Text style={styles.avatarTxt}>{user?.name?.[0]?.toUpperCase() || "?"}</Text>
              )}
            </View>
            <Text style={styles.name}>{user?.name}</Text>
            <Text style={styles.email}>{user?.email}</Text>
            {user?.is_admin ? (
              <View style={styles.adminBadge}><Text style={styles.adminTxt}>مدير</Text></View>
            ) : null}
          </View>
        )}

        {view === "menu" && (
          <View style={styles.menu}>
            {menu.map((m, i) => (
              <Pressable key={m.key} style={[styles.item, i < menu.length - 1 && styles.itemBorder]} onPress={m.onPress} testID={`menu-${m.key}`}>
                <View style={styles.itemIcon}><Ionicons name={m.icon as any} size={20} color={COLORS.brand} /></View>
                <Text style={styles.itemLabel}>{m.label}</Text>
                {m.badge ? <View style={styles.badge}><Text style={styles.badgeTxt}>{m.badge}</Text></View> : null}
                <Ionicons name="chevron-back" size={20} color={COLORS.borderStrong} />
              </Pressable>
            ))}
          </View>
        )}

        {view === "menu" && (
          <Pressable style={styles.logout} onPress={logout} testID="logout-button">
            <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
            <Text style={styles.logoutTxt}>تسجيل الخروج</Text>
          </Pressable>
        )}

        {/* Bookings */}
        {view === "bookings" && (
          <View style={{ padding: SPACING.lg, gap: SPACING.md }}>
            {bookings.length === 0 ? (
              <View style={styles.emptyBox}>
                <Ionicons name="receipt-outline" size={40} color={COLORS.brandPrimary} />
                <Text style={styles.emptyTxt}>لا توجد حجوزات بعد</Text>
              </View>
            ) : (
              bookings.map((b) => (
                <View key={b.id} style={[styles.booking, SHADOW.soft]} testID={`booking-${b.id}`}>
                  {b.item_image ? <Image source={b.item_image} style={styles.bookingImg} contentFit="cover" /> : null}
                  <View style={{ flex: 1 }}>
                    <Text style={styles.bookingTitle} numberOfLines={1}>{b.item_name_ar}</Text>
                    <Text style={styles.bookingMeta}>{b.booking_type === "trip" ? "رحلة" : "تجربة"} · {b.guests} أشخاص</Text>
                    {b.date ? <Text style={styles.bookingMeta}>التاريخ: {b.date}</Text> : null}
                    <View style={styles.bookingFooter}>
                      <View style={[styles.statusDot, { backgroundColor: STATUS_COLOR[b.status] }]} />
                      <Text style={[styles.statusTxt, { color: STATUS_COLOR[b.status] }]}>{STATUS_AR[b.status]}</Text>
                      <View style={{ flex: 1 }} />
                      {b.price ? <Text style={styles.bookingPrice}>${b.price}</Text> : null}
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {/* Orders */}
        {view === "orders" && (
          <View style={{ padding: SPACING.lg, gap: SPACING.md }}>
            {orders.length === 0 ? (
              <View style={styles.emptyBox}>
                <Ionicons name="bag-handle-outline" size={40} color={COLORS.brandPrimary} />
                <Text style={styles.emptyTxt}>لا توجد طلبات بعد</Text>
              </View>
            ) : (
              orders.map((o) => (
                <View key={o.id} style={[styles.booking, SHADOW.soft]} testID={`order-${o.id}`}>
                  {o.items?.[0]?.image ? <Image source={o.items[0].image} style={styles.bookingImg} contentFit="cover" /> : null}
                  <View style={{ flex: 1 }}>
                    <Text style={styles.bookingTitle} numberOfLines={1}>
                      {o.items?.[0]?.name_ar}{o.items?.length > 1 ? ` +${o.items.length - 1}` : ""}
                    </Text>
                    <Text style={styles.bookingMeta}>{o.items?.reduce((s: number, i: any) => s + i.quantity, 0)} عناصر · {o.address}</Text>
                    <View style={styles.bookingFooter}>
                      <View style={[styles.statusDot, { backgroundColor: STATUS_COLOR[o.status] || COLORS.warning }]} />
                      <Text style={[styles.statusTxt, { color: STATUS_COLOR[o.status] || COLORS.warning }]}>{STATUS_AR[o.status] || o.status}</Text>
                      <View style={{ flex: 1 }} />
                      <Text style={styles.bookingPrice}>${o.total}</Text>
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {/* Notifications */}
        {view === "notifications" && (
          <View style={{ padding: SPACING.lg, gap: SPACING.md }}>
            {notifications.length === 0 ? (
              <View style={styles.emptyBox}>
                <Ionicons name="notifications-off-outline" size={40} color={COLORS.brandPrimary} />
                <Text style={styles.emptyTxt}>لا توجد إشعارات</Text>
              </View>
            ) : (
              notifications.map((n) => (
                <View key={n.id} style={[styles.notif, SHADOW.soft]}>
                  <View style={styles.notifIcon}><Ionicons name="notifications" size={18} color={COLORS.brand} /></View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.notifTitle}>{n.title_ar}</Text>
                    <Text style={styles.notifBody}>{n.body_ar}</Text>
                  </View>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.surfaceSecondary },
  subHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: SPACING.lg, marginBottom: SPACING.sm },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.surface, alignItems: "center", justifyContent: "center" },
  subTitle: { fontFamily: FONT.displayBold, fontSize: FSIZE.xl, color: COLORS.onSurface },
  profile: { alignItems: "center", paddingVertical: SPACING.lg },
  avatar: { width: 90, height: 90, borderRadius: 45, backgroundColor: COLORS.brand, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  avatarImg: { width: "100%", height: "100%" },
  avatarTxt: { fontFamily: FONT.displayBold, fontSize: 36, color: "#fff" },
  name: { fontFamily: FONT.displayBold, fontSize: FSIZE.xl, color: COLORS.onSurface, marginTop: SPACING.md },
  email: { fontFamily: FONT.body, fontSize: FSIZE.base, color: COLORS.onSurfaceSecondary, marginTop: 2 },
  adminBadge: { marginTop: SPACING.sm, backgroundColor: COLORS.brandSecondary, paddingHorizontal: SPACING.md, paddingVertical: 4, borderRadius: RADIUS.pill },
  adminTxt: { fontFamily: FONT.bold, fontSize: FSIZE.sm, color: "#fff" },
  menu: { backgroundColor: COLORS.surface, marginHorizontal: SPACING.lg, borderRadius: RADIUS.lg, paddingHorizontal: SPACING.lg, ...SHADOW.soft },
  item: { flexDirection: "row", alignItems: "center", gap: SPACING.md, paddingVertical: SPACING.lg },
  itemBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: COLORS.divider },
  itemIcon: { width: 40, height: 40, borderRadius: RADIUS.md, backgroundColor: COLORS.brandTertiary, alignItems: "center", justifyContent: "center" },
  itemLabel: { flex: 1, fontFamily: FONT.medium, fontSize: FSIZE.lg, color: COLORS.onSurface, textAlign: "right" },
  badge: { backgroundColor: COLORS.brand, minWidth: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center", paddingHorizontal: 6 },
  badgeTxt: { fontFamily: FONT.bold, fontSize: FSIZE.sm, color: "#fff" },
  logout: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: SPACING.sm, marginHorizontal: SPACING.lg, marginTop: SPACING.lg, backgroundColor: "#FBEAEA", borderRadius: RADIUS.md, height: 54 },
  logoutTxt: { fontFamily: FONT.bold, fontSize: FSIZE.lg, color: COLORS.error },
  emptyBox: { alignItems: "center", gap: SPACING.md, paddingVertical: SPACING.xxxl },
  emptyTxt: { fontFamily: FONT.medium, fontSize: FSIZE.lg, color: COLORS.onSurfaceSecondary },
  booking: { flexDirection: "row", gap: SPACING.md, backgroundColor: COLORS.surface, borderRadius: RADIUS.md, padding: SPACING.md },
  bookingImg: { width: 70, height: 70, borderRadius: RADIUS.sm, backgroundColor: COLORS.surfaceSecondary },
  bookingTitle: { fontFamily: FONT.bold, fontSize: FSIZE.lg, color: COLORS.onSurface, textAlign: "right" },
  bookingMeta: { fontFamily: FONT.body, fontSize: FSIZE.sm, color: COLORS.onSurfaceSecondary, textAlign: "right", marginTop: 2 },
  bookingFooter: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: SPACING.sm },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusTxt: { fontFamily: FONT.bold, fontSize: FSIZE.sm },
  bookingPrice: { fontFamily: FONT.displayBold, fontSize: FSIZE.lg, color: COLORS.brandPrimary },
  notif: { flexDirection: "row", gap: SPACING.md, backgroundColor: COLORS.surface, borderRadius: RADIUS.md, padding: SPACING.md },
  notifIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.brandTertiary, alignItems: "center", justifyContent: "center" },
  notifTitle: { fontFamily: FONT.bold, fontSize: FSIZE.base, color: COLORS.onSurface, textAlign: "right" },
  notifBody: { fontFamily: FONT.body, fontSize: FSIZE.sm, color: COLORS.onSurfaceSecondary, textAlign: "right", marginTop: 2 },
});
