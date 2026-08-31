import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";
import { apiFetch } from "@/src/api/client";
import { useAuth } from "./AuthContext";

type ItemType = "destination" | "experience" | "product" | "trip";

type FavState = {
  isFav: (type: ItemType, id: string) => boolean;
  isPending: (type: ItemType, id: string) => boolean;
  toggle: (type: ItemType, id: string) => Promise<boolean>;
  reload: () => Promise<void>;
};

const FavoritesContext = createContext<FavState>({} as FavState);
export const useFavorites = () => useContext(FavoritesContext);

const key = (t: string, id: string) => `${t}:${id}`;

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [set, setSet] = useState<Set<string>>(new Set());
  const [pending, setPending] = useState<Set<string>>(new Set());

  const reload = useCallback(async () => {
    if (!user) {
      setSet(new Set());
      return;
    }
    try {
      const ids = await apiFetch<{ item_type: string; item_id: string }[]>("/favorites/ids");
      setSet(new Set(ids.map((i) => key(i.item_type, i.item_id))));
    } catch {
      setSet(new Set());
    }
  }, [user]);

  useEffect(() => {
    reload();
  }, [reload]);

  const isFav = useCallback((type: ItemType, id: string) => set.has(key(type, id)), [set]);
  const isPending = useCallback((type: ItemType, id: string) => pending.has(key(type, id)), [pending]);

  const toggle = useCallback(
    async (type: ItemType, id: string) => {
      const k = key(type, id);
      if (pending.has(k)) return set.has(k);
      if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const previous = new Set(set);
      const optimistic = new Set(set);
      const willFav = !optimistic.has(k);
      if (willFav) optimistic.add(k);
      else optimistic.delete(k);
      setSet(optimistic);
      setPending((current) => new Set(current).add(k));

      try {
        const res = await apiFetch<{ favorited: boolean }>("/favorites", {
          method: "POST",
          body: { item_type: type, item_id: id },
        });
        setSet((current) => {
          const next = new Set(current);
          if (res.favorited) next.add(k);
          else next.delete(k);
          return next;
        });
        return res.favorited;
      } catch {
        setSet(previous);
        return previous.has(k);
      } finally {
        setPending((current) => {
          const next = new Set(current);
          next.delete(k);
          return next;
        });
      }
    },
    [pending, set]
  );

  return (
    <FavoritesContext.Provider value={{ isFav, isPending, toggle, reload }}>
      {children}
    </FavoritesContext.Provider>
  );
}
