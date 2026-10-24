"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import Cookies from "js-cookie";
import { toast } from "sonner";
import { Product } from "@/types/product";
import { apiClient } from "@/lib/api-client";
import { CartApiItem } from "@/lib/api/cart-api";

export interface CartItem {
  id?: string;
  product: Product;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}

interface CartContextType {
  cart: CartItem[];
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (
    product: Product,
    quantity?: number,
    size?: string,
    color?: string,
  ) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  subtotal: number;
  totalItems: number;
  syncing: boolean;
  isMounted: boolean;
}

const CART_STORAGE_KEY = "dawang_cart";
const TOKEN_COOKIE_NAME =
  process.env.NEXT_PUBLIC_AUTH_TOKEN_COOKIE_NAME || "dawang_token";

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const localData = localStorage.getItem(CART_STORAGE_KEY);
      const parsed = localData ? JSON.parse(localData) : [];
      return Array.isArray(parsed)
        ? parsed.filter(
            (item: CartItem) =>
              item &&
              item.product &&
              typeof item.product.id === "string" &&
              item.product.id.length > 0 &&
              typeof item.product.price === "number",
          )
        : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      setIsMounted(true);
    });
  }, []);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  // Safely map remote API items to valid frontend CartItems
  const normalizeRemoteItem = (item: CartApiItem): CartItem | null => {
    if (!item || !item.id) return null;

    // Reject items without a valid populated product object
    if (
      !item.product ||
      typeof item.product.id !== "string" ||
      !item.product.id
    ) {
      return null;
    }

    return {
      id: item.id,
      product: item.product,
      quantity: Math.max(1, Number(item.quantity) || 1),
      selectedSize: item.selectedSize,
      selectedColor: item.selectedColor,
    };
  };

  const syncCartWithServer = useCallback(async (localItems: CartItem[]) => {
    const token = Cookies.get(TOKEN_COOKIE_NAME);
    if (!token) return;

    try {
      setSyncing(true);

      let remoteItems: CartApiItem[] = [];
      try {
        const res = await apiClient.getCart();
        if (res && Array.isArray(res.items)) {
          remoteItems = res.items;
        }
      } catch (err) {
        console.warn("Could not fetch remote cart:", err);
      }

      const normalizedRemote: CartItem[] = remoteItems
        .map(normalizeRemoteItem)
        .filter((item): item is CartItem => item !== null);

      // Deduplicate remote items by product ID
      const remoteMap = new Map<string, CartItem>();
      normalizedRemote.forEach((item) => {
        if (!remoteMap.has(item.product.id)) {
          remoteMap.set(item.product.id, item);
        }
      });

      // Identify local guest items missing on the server
      const unsyncedLocal = localItems.filter(
        (local) => local?.product?.id && !remoteMap.has(local.product.id),
      );

      if (unsyncedLocal.length > 0) {
        await Promise.allSettled(
          unsyncedLocal.map((item) =>
            apiClient.addToCart(item.product.id, item.quantity),
          ),
        );

        try {
          const freshRes = await apiClient.getCart();
          if (freshRes && Array.isArray(freshRes.items)) {
            const freshNormalized = freshRes.items
              .map(normalizeRemoteItem)
              .filter((item): item is CartItem => item !== null);

            const freshMap = new Map<string, CartItem>();
            freshNormalized.forEach((item) => {
              if (!freshMap.has(item.product.id)) {
                freshMap.set(item.product.id, item);
              }
            });

            setCart(Array.from(freshMap.values()));
            return;
          }
        } catch (err) {
          console.warn("Could not refresh cart post-sync:", err);
        }
      }

      if (remoteMap.size > 0) {
        setCart(Array.from(remoteMap.values()));
      }
    } catch (err) {
      console.error("Failed to sync cart with server:", err);
    } finally {
      setSyncing(false);
    }
  }, []);

  // Sync with server on mount
  useEffect(() => {
    let active = true;

    const runSync = async () => {
      const token = Cookies.get(TOKEN_COOKIE_NAME);
      if (token && active) {
        await syncCartWithServer(cart);
      }
    };

    runSync();

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync changes to local storage
  useEffect(() => {
    try {
      const validCart = cart.filter(
        (item) => item && item.product && typeof item.product.id === "string",
      );
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(validCart));
    } catch (err) {
      console.error("Failed to save cart locally:", err);
    }
  }, [cart]);

  const addToCart = async (
    product: Product,
    quantity = 1,
    selectedSize?: string,
    selectedColor?: string,
  ) => {
    if (!product || !product.id) return;

    let isExisting = false;
    let existingCartItemId: string | undefined;

    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(
        (item) =>
          item.product?.id === product.id &&
          item.selectedSize === selectedSize &&
          item.selectedColor === selectedColor,
      );

      if (existingIndex > -1) {
        isExisting = true;
        existingCartItemId = prevCart[existingIndex].id;
        const updated = [...prevCart];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
        };
        return updated;
      }

      return [...prevCart, { product, quantity, selectedSize, selectedColor }];
    });

    toast.success(`Added "${product.name}" to your bag`);
    openCart();

    const token = Cookies.get(TOKEN_COOKIE_NAME);
    if (token) {
      try {
        if (isExisting && existingCartItemId) {
          const targetItem = cart.find((i) => i.product?.id === product.id);
          const newQty = (targetItem?.quantity || 1) + quantity;
          await apiClient.updateCartItem(existingCartItemId, newQty);
        } else {
          const serverItem = await apiClient.addToCart(product.id, quantity);
          if (serverItem?.id) {
            setCart((prev) =>
              prev.map((item) =>
                item.product?.id === product.id && !item.id
                  ? { ...item, id: serverItem.id }
                  : item,
              ),
            );
          }
        }
      } catch (err) {
        console.error("Failed to sync add item to server cart:", err);
      }
    }
  };

  const removeFromCart = async (productId: string) => {
    const targetItem = cart.find((item) => item.product?.id === productId);

    setCart((prev) => prev.filter((item) => item.product?.id !== productId));
    toast.info("Item removed from bag");

    const token = Cookies.get(TOKEN_COOKIE_NAME);
    if (token) {
      try {
        if (targetItem?.id) {
          await apiClient.removeCartItem(targetItem.id);
        } else {
          await apiClient.removeCartItem(productId);
        }
      } catch (err) {
        console.error("Failed to remove cart item on server:", err);
      }
    }
  };

  const updateQuantity = async (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      await removeFromCart(productId);
      return;
    }

    const targetItem = cart.find((item) => item.product?.id === productId);

    setCart((prev) =>
      prev.map((item) =>
        item.product?.id === productId
          ? { ...item, quantity: newQuantity }
          : item,
      ),
    );

    const token = Cookies.get(TOKEN_COOKIE_NAME);
    if (token && targetItem?.id) {
      try {
        await apiClient.updateCartItem(targetItem.id, newQuantity);
      } catch (err) {
        console.error("Failed to update cart item quantity on server:", err);
      }
    }
  };

  const clearCart = async () => {
    setCart([]);
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
    } catch (err) {
      console.error("Failed to clear local cart:", err);
    }

    const token = Cookies.get(TOKEN_COOKIE_NAME);
    if (token) {
      try {
        await apiClient.clearCart();
      } catch (err) {
        console.error("Failed to clear server cart:", err);
      }
    }
  };

  // Strictly calculate values on valid items with populated products
  const validCart = cart.filter(
    (item) => item && item.product && typeof item.product.id === "string",
  );

  const subtotal = validCart.reduce((sum, item) => {
    const price = item.product.discountPrice || item.product.price || 0;
    return sum + price * item.quantity;
  }, 0);

  const totalItems = validCart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart: validCart,
        isCartOpen,
        openCart,
        closeCart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        subtotal,
        totalItems,
        syncing,
        isMounted,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
