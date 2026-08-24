import React from "react";
import { View, Text, Pressable, StyleSheet, Platform } from "react-native";
import { Tabs } from "expo-router";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { COLORS, SPACING, FONT, RADIUS } from "@/src/theme/theme";
import { useI18n } from "@/src/context/LanguageContext";

const TABS: Record<string, { key: string; icon: any }> = {
  map: { key: "tab_map", icon: "map" },
  index: { key: "tab_discover", icon: "compass" },
  trips: { key: "tab_trips", icon: "airplane" },
  favorites: { key: "tab_favorites", icon: "heart" },
  account: { key: "tab_account", icon: "person" },
};

function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { t } = useI18n();
  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, SPACING.sm) }]}>
      <BlurView intensity={Platform.OS === "ios" ? 60 : 90} tint="light" style={StyleSheet.absoluteFill as any} />
      <View style={styles.inner}>
        {state.routes.map((route, index) => {
          const conf = TABS[route.name];
          if (!conf) return null;
          const focused = state.index === index;
          const onPress = () => {
            Haptics.selectionAsync?.();
            const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
            if (!focused && !event.defaultPrevented) navigation.navigate(route.name as never);
          };
          return (
            <Pressable key={route.key} style={styles.tab} onPress={onPress} testID={`tab-${route.name}`}>
              <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
                <Ionicons name={focused ? conf.icon : `${conf.icon}-outline`} size={22} color={focused ? COLORS.onBrandPrimary : COLORS.onSurfaceSecondary} />
              </View>
              <Text style={[styles.label, focused && styles.labelActive]}>{t(conf.key)}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
      initialRouteName="index"
    >
      <Tabs.Screen name="map" />
      <Tabs.Screen name="index" />
      <Tabs.Screen name="trips" />
      <Tabs.Screen name="favorites" />
      <Tabs.Screen name="account" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.border,
    backgroundColor: Platform.OS === "android" ? "rgba(255,255,255,0.96)" : "rgba(255,255,255,0.7)",
  },
  inner: { flexDirection: "row", paddingTop: SPACING.sm, paddingHorizontal: SPACING.sm },
  tab: { flex: 1, alignItems: "center", gap: 3 },
  iconWrap: { width: 46, height: 32, borderRadius: RADIUS.pill, alignItems: "center", justifyContent: "center" },
  iconWrapActive: { backgroundColor: COLORS.brand },
  label: { fontFamily: FONT.medium, fontSize: 11, color: COLORS.onSurfaceSecondary },
  labelActive: { fontFamily: FONT.bold, color: COLORS.brand },
});
