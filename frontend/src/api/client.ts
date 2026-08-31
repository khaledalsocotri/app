// Central API client. Reads the backend base from EXPO_PUBLIC_BACKEND_URL and
// always appends /api. Injects the Bearer token from secure storage.
import { storage } from "@/src/utils/storage";

const rawBase = process.env.EXPO_PUBLIC_BACKEND_URL?.trim().replace(/\/$/, "");
if (!rawBase) {
  throw new Error("EXPO_PUBLIC_BACKEND_URL is not configured. Copy frontend/.env.example to your environment file and set the backend URL.");
}

const BASE = rawBase;
export const API = `${BASE}/api`;
export const TOKEN_KEY = "socotra_token";

let memToken: string | null = null;

export const setToken = async (token: string | null) => {
  memToken = token;
  if (token) await storage.secureSet(TOKEN_KEY, token);
  else await storage.secureRemove(TOKEN_KEY);
};

export const loadToken = async (): Promise<string | null> => {
  if (memToken) return memToken;
  const t = await storage.secureGet(TOKEN_KEY, "");
  memToken = t && t.length > 0 ? t : null;
  return memToken;
};

type Options = {
  method?: string;
  body?: any;
  auth?: boolean;
};

export async function apiFetch<T = any>(path: string, opts: Options = {}): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (opts.auth !== false) {
    const token = await loadToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetch(`${API}${path}`, {
    method: opts.method || "GET",
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  if (!res.ok) {
    let detail = "حدث خطأ. حاول مرة أخرى.";
    try {
      const data = await res.json();
      detail = data.detail || detail;
    } catch {}
    const err: any = new Error(detail);
    err.status = res.status;
    throw err;
  }
  if (res.status === 204) return undefined as unknown as T;
  return res.json();
}
