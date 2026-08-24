// Uploads an image to the backend, which stores it in Emergent Object Storage
// and returns a public URL path. Handles the web/native FormData split.
import { Platform } from "react-native";
import { API, loadToken } from "@/src/api/client";

const BASE = process.env.EXPO_PUBLIC_BACKEND_URL;

export async function uploadImageAsync(uri: string): Promise<string> {
  const token = await loadToken();
  const name = `photo_${Date.now()}.jpg`;
  const form = new FormData();
  if (Platform.OS === "web") {
    const blob = await (await fetch(uri)).blob();
    form.append("file", blob, name);
  } else {
    // @ts-ignore react-native native FormData file shape
    form.append("file", { uri, name, type: "image/jpeg" });
  }
  const res = await fetch(`${API}/upload`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: form,
  });
  if (!res.ok) {
    let detail = "فشل رفع الصورة";
    try {
      detail = (await res.json()).detail || detail;
    } catch {}
    throw new Error(detail);
  }
  const data = await res.json();
  // Return absolute URL so expo-image can load it on all platforms.
  return `${BASE}${data.url}`;
}
