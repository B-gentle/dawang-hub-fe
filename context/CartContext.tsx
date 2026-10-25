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
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    try {
      const localData = localStorage.getItem(CART_STORAGE_KEY);
      if (localData) {
        const parsed = JSON.parse(localData);
        if (Array.isArray(parsed)) {
          const validLocal = parsed.filter(
            (item: CartItem) =>
              item &&
              item.product &&
              item.product.id &&
              item.product.name &&
              item.product.name !== "Product" &&
              Number(item.product.price) > 0,
          );
          queueMicrotask(() => {
            setCart(validLocal);
          });
        }
      }
    } catch (err) {
      console.error("Failed to read local cart:", err);
    } finally {
      queueMicrotask(() => {
        setIsMounted(true);
        setHasHydrated(true);
      });
    }
  }, []);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

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
      } catch (err: unknown) {
        const errObj = err as { message?: string; status?: number };
        if (
          errObj?.message?.toLowerCase().includes("unauthorized") ||
          errObj?.status === 401
        ) {
          console.warn("Session expired. Clearing stale token.");
          Cookies.remove(TOKEN_COOKIE_NAME);
          return;
        }
        console.warn("Could not fetch remote cart:", err);
      }

      const mergedMap = new Map<string, CartItem>();

      localItems.forEach((local) => {
        if (local?.product?.id) {
          mergedMap.set(local.product.id, local);
        }
      });

      for (const remote of remoteItems) {
        const prodId = remote.product?.id || remote.productId;
        if (!prodId) continue;

        const localMatch = mergedMap.get(prodId);

        if (!localMatch) {
          if (
            remote.product &&
            remote.product.name &&
            Number(remote.product.price) > 0
          ) {
            mergedMap.set(prodId, {
              id: remote.id,
              product: {
                ...remote.product,
                price: Number(remote.product.price),
              },
              quantity: Math.max(1, Number(remote.quantity) || 1),
              selectedSize: remote.selectedSize,
              selectedColor: remote.selectedColor,
            });
          }
        } else if (remote.id && !localMatch.id) {
          mergedMap.set(prodId, { ...localMatch, id: remote.id });
        }
      }

      const unsyncedLocal = localItems.filter(
        (local) =>
          local?.product?.id &&
          !remoteItems.some(
            (r) => (r.product?.id || r.productId) === local.product.id,
          ),
      );

      if (unsyncedLocal.length > 0) {
        await Promise.allSettled(
          unsyncedLocal.map((item) =>
            apiClient.addToCart(item.product.id, item.quantity),
          ),
        );
      }

      const finalCart = Array.from(mergedMap.values());
      if (finalCart.length > 0) {
        setCart(finalCart);
      }
    } catch (err) {
      console.error("Failed background cart sync:", err);
    } finally {
      setSyncing(false);
    }
  }, []);

  useEffect(() => {
    if (!hasHydrated) return;

    let active = true;
    const token = Cookies.get(TOKEN_COOKIE_NAME);

    if (token && active) {
      queueMicrotask(() => {
        syncCartWithServer(cart);
      });
    }

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasHydrated]);

  useEffect(() => {
    if (!hasHydrated) return;

    try {
      const validCart = cart.filter(
        (item) =>
          item &&
          item.product &&
          item.product.id &&
          item.product.name &&
          item.product.name !== "Product" &&
          Number(item.product.price) > 0,
      );
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(validCart));
    } catch (err) {
      console.error("Failed to save cart locally:", err);
    }
  }, [cart, hasHydrated]);

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

  const validCart = cart.filter(
    (item) =>
      item &&
      item.product &&
      item.product.id &&
      item.product.name &&
      item.product.name !== "Product" &&
      Number(item.product.price) > 0,
  );

  const subtotal = validCart.reduce((sum, item) => {
    const price = Number(item.product.discountPrice || item.product.price) || 0;
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
