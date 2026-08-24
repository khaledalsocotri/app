import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { I18nManager, LogBox } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

import { useIconFonts } from "@/src/hooks/use-icon-fonts";
import { useAppFonts } from "@/src/hooks/use-app-fonts";
import { AuthProvider } from "@/src/context/AuthContext";
import { LanguageProvider } from "@/src/context/LanguageContext";
import { FavoritesProvider } from "@/src/context/FavoritesContext";
import { CartProvider } from "@/src/context/CartContext";
import { ToastProvider } from "@/src/components/Toast";

LogBox.ignoreAllLogs(true);

// Arabic-first: enable RTL layout across the app.
I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [iconsLoaded, iconsErr] = useIconFonts();
  const [fontsLoaded, fontsErr] = useAppFonts();

  const ready = (iconsLoaded || iconsErr) && (fontsLoaded || fontsErr);

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardProvider>
        <SafeAreaProvider>
          <LanguageProvider>
            <AuthProvider>
              <FavoritesProvider>
                <CartProvider>
                  <ToastProvider>
                  <StatusBar style="dark" />
                  <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "#FFFFFF" } }}>
                    <Stack.Screen name="index" />
                    <Stack.Screen name="(auth)" />
                    <Stack.Screen name="(tabs)" />
                    <Stack.Screen name="destination/[id]" options={{ animation: "slide_from_right" }} />
                    <Stack.Screen name="trip/[id]" options={{ animation: "slide_from_right" }} />
                    <Stack.Screen name="experience/[id]" options={{ animation: "slide_from_right" }} />
                    <Stack.Screen name="product/[id]" options={{ animation: "slide_from_right" }} />
                    <Stack.Screen name="booking" options={{ presentation: "modal" }} />
                    <Stack.Screen name="cart" options={{ animation: "slide_from_right" }} />
                    <Stack.Screen name="search" options={{ animation: "fade" }} />
                    <Stack.Screen name="marketplace" options={{ animation: "slide_from_right" }} />
                  </Stack>
                  </ToastProvider>
                </CartProvider>
              </FavoritesProvider>
            </AuthProvider>
          </LanguageProvider>
        </SafeAreaProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}
