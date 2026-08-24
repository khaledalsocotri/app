import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { Platform } from "react-native";
import * as Haptics from "expo-haptics";
import { storage } from "@/src/utils/storage";

export type CartItem = {
  id: string;
  name_ar: string;
  cover_image: string;
  price: number;
  quantity: number;
};

type CartState = {
  items: CartItem[];
  count: number;
  total: number;
  add: (product: any) => void;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartState>({} as CartState);
export const useCart = () => useContext(CartContext);

const KEY = "socotra_cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    storage.getItem(KEY, "").then((raw) => {
      if (raw) {
        try {
          setItems(JSON.parse(raw as string));
        } catch {}
      }
    });
  }, []);

  const persist = useCallback((next: CartItem[]) => {
    setItems(next);
    storage.setItem(KEY, JSON.stringify(next));
  }, []);

  const add = useCallback(
    (product: any) => {
      if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setItems((prev) => {
        const existing = prev.find((i) => i.id === product.id);
        let next: CartItem[];
        if (existing) {
          next = prev.map((i) => (i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i));
        } else {
          next = [
            ...prev,
            { id: product.id, name_ar: product.name_ar, cover_image: product.cover_image, price: product.price, quantity: 1 },
          ];
        }
        storage.setItem(KEY, JSON.stringify(next));
        return next;
      });
    },
    []
  );

  const setQty = useCallback(
    (id: string, qty: number) => {
      setItems((prev) => {
        const next = qty <= 0 ? prev.filter((i) => i.id !== id) : prev.map((i) => (i.id === id ? { ...i, quantity: qty } : i));
        storage.setItem(KEY, JSON.stringify(next));
        return next;
      });
    },
    []
  );

  const remove = useCallback((id: string) => {
    setItems((prev) => {
      const next = prev.filter((i) => i.id !== id);
      storage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const clear = useCallback(() => persist([]), [persist]);

  const count = items.reduce((s, i) => s + i.quantity, 0);
  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, count, total, add, setQty, remove, clear }}>
      {children}
    </CartContext.Provider>
  );
}
