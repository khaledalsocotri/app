import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { Platform } from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { apiFetch, setToken } from "@/src/api/client";

WebBrowser.maybeCompleteAuthSession();

export type User = {
  user_id: string;
  name: string;
  email: string;
  picture?: string | null;
  provider?: string;
  is_admin?: boolean;
};

type AuthState = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthState>({} as AuthState);
export const useAuth = () => useContext(AuthContext);

const processedSessions = new Set<string>();

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const checkSession = useCallback(async () => {
    try {
      const me = await apiFetch<User>("/auth/me");
      setUser(me);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const exchangeSession = useCallback(async (sessionId: string) => {
    if (processedSessions.has(sessionId)) return;
    processedSessions.add(sessionId);
    const res = await apiFetch<{ token: string; user: User }>("/auth/session", {
      method: "POST",
      body: { session_id: sessionId },
      auth: false,
    });
    await setToken(res.token);
    setUser(res.user);
  }, []);

  useEffect(() => {
    if (Platform.OS === "web") {
      const raw = window.location.hash + window.location.search;
      const m = raw.match(/[?#&]session_id=([^&#]+)/);
      if (m) {
        exchangeSession(decodeURIComponent(m[1]))
          .then(() => {
            window.history.replaceState(window.history.state, "", window.location.pathname);
          })
          .catch(() => {})
          .finally(() => setLoading(false));
        return;
      }
    }

    checkSession();

    if (Platform.OS !== "web") {
      const sub = Linking.addEventListener("url", ({ url }) => {
        const m = url.match(/[?#&]session_id=([^&#]+)/);
        if (m) exchangeSession(decodeURIComponent(m[1])).then(() => setLoading(false)).catch(() => {});
      });
      Linking.getInitialURL().then((url) => {
        if (url) {
          const m = url.match(/[?#&]session_id=([^&#]+)/);
          if (m) exchangeSession(decodeURIComponent(m[1])).then(() => setLoading(false)).catch(() => {});
        }
      });
      return () => sub.remove();
    }
  }, [checkSession, exchangeSession]);

  const login = async (email: string, password: string) => {
    const res = await apiFetch<{ token: string; user: User }>("/auth/login", {
      method: "POST",
      body: { email, password },
      auth: false,
    });
    await setToken(res.token);
    setUser(res.user);
  };

  const register = async (name: string, email: string, password: string) => {
    const res = await apiFetch<{ token: string; user: User }>("/auth/register", {
      method: "POST",
      body: { name, email, password },
      auth: false,
    });
    await setToken(res.token);
    setUser(res.user);
  };

  const loginWithGoogle = async () => {
    const redirectUrl =
      Platform.OS === "web" ? window.location.origin + "/" : Linking.createURL("");
    const authUrl = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
    if (Platform.OS === "web") {
      window.location.href = authUrl;
      return;
    }
    const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUrl);
    let url: string | null = null;
    if (result.type === "success" && result.url) url = result.url;
    if (!url) url = await Linking.getInitialURL();
    if (url) {
      const m = url.match(/[?#&]session_id=([^&#]+)/);
      if (m) await exchangeSession(decodeURIComponent(m[1]));
    }
  };

  const logout = async () => {
    try {
      await apiFetch("/auth/logout", { method: "POST" });
    } catch {}
    await setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, loginWithGoogle, logout, refresh: checkSession }}
    >
      {children}
    </AuthContext.Provider>
  );
}
