import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";
import { apiFetch } from "@/src/api/client";
import { useAuth } from "./AuthContext";

type ItemType = "destination" | "experience" | "product" | "trip";

type FavState = {
  isFav: (type: ItemType, id: string) => boolean;
  toggle: (type: ItemType, id: string) => Promise<boolean>;
  reload: () => Promise<void>;
};

const FavoritesContext = createContext<FavState>({} as FavState);
export const useFavorites = () => useContext(FavoritesContext);

const key = (t: string, id: string) => `${t}:${id}`;

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [set, setSet] = useState<Set<string>>(new Set());

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

  const toggle = useCallback(
    async (type: ItemType, id: string) => {
      if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const k = key(type, id);
      const optimistic = new Set(set);
      const willFav = !optimistic.has(k);
      if (willFav) optimistic.add(k);
      else optimistic.delete(k);
      setSet(optimistic);
      try {
        const res = await apiFetch<{ favorited: boolean }>("/favorites", {
          method: "POST",
          body: { item_type: type, item_id: id },
        });
        return res.favorited;
      } catch {
        setSet(set); // revert
        return !willFav;
      }
    },
    [set]
  );

  return (
    <FavoritesContext.Provider value={{ isFav, toggle, reload }}>
      {children}
    </FavoritesContext.Provider>
  );
}
