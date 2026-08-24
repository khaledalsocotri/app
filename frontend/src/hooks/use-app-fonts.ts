// Loads Arabic display/body fonts (Cairo + Tajawal) from a CDN.
// Non-blocking-safe: if a font fails, RN falls back to system.
import { useFonts } from "expo-font";

const CDN = "https://cdn.jsdelivr.net/fontsource/fonts";

export const useAppFonts = (): readonly [boolean, Error | null] =>
  useFonts({
    Cairo: `${CDN}/cairo@latest/arabic-400-normal.ttf`,
    CairoBold: `${CDN}/cairo@latest/arabic-700-normal.ttf`,
    Tajawal: `${CDN}/tajawal@latest/arabic-400-normal.ttf`,
    TajawalMedium: `${CDN}/tajawal@latest/arabic-500-normal.ttf`,
    TajawalBold: `${CDN}/tajawal@latest/arabic-700-normal.ttf`,
  });
