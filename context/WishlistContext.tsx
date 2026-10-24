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

interface PaginatedResponse<T> {
  items?: T[];
  data?: T[];
  products?: T[];
}

interface WishlistContextType {
  wishlist: Product[];
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  toggleWishlist: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
  syncing: boolean;
  isMounted: boolean;
}

const WISHLIST_STORAGE_KEY = "dawang_wishlist";
const TOKEN_COOKIE_NAME =
  process.env.NEXT_PUBLIC_AUTH_TOKEN_COOKIE_NAME || "dawang_token";

const WishlistContext = createContext<WishlistContextType | undefined>(
  undefined,
);

export const WishlistProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [wishlist, setWishlist] = useState<Product[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const localData = localStorage.getItem(WISHLIST_STORAGE_KEY);
      return localData ? JSON.parse(localData) : [];
    } catch {
      return [];
    }
  });

  const [syncing, setSyncing] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  // Set mounted state asynchronously after initial render tick
  useEffect(() => {
    queueMicrotask(() => {
      setIsMounted(true);
    });
  }, []);

  // Sync with server if user is authenticated
  const syncWishlistWithServer = useCallback(async (localItems: Product[]) => {
    const token = Cookies.get(TOKEN_COOKIE_NAME);
    if (!token) return;

    try {
      setSyncing(true);

      // 1. Fetch user's existing remote wishlist from server
      let remoteItems: Product[] = [];
      try {
        const res = (await apiClient.getWishlist()) as
          Product[] | PaginatedResponse<Product>;

        if (Array.isArray(res)) {
          remoteItems = res;
        } else if (res && Array.isArray(res.items)) {
          remoteItems = res.items;
        } else if (res && Array.isArray(res.data)) {
          remoteItems = res.data;
        }
      } catch (err) {
        console.warn("Could not fetch remote wishlist:", err);
      }

      // 2. Merge local guest items into remote items (deduplicate by product ID)
      const mergedMap = new Map<string, Product>();
      remoteItems.forEach((item) => mergedMap.set(item.id, item));
      localItems.forEach((item) => mergedMap.set(item.id, item));

      const mergedWishlist = Array.from(mergedMap.values());

      // 3. Post unsynced local guest items to server
      const unsyncedItems = localItems.filter(
        (local) => !remoteItems.some((remote) => remote.id === local.id),
      );

      if (unsyncedItems.length > 0) {
        await Promise.allSettled(
          unsyncedItems.map((item) => apiClient.addToWishlist(item.id)),
        );
      }

      setWishlist(mergedWishlist);
    } catch (err) {
      console.error("Failed to sync wishlist with server:", err);
    } finally {
      setSyncing(false);
    }
  }, []);

  // Async server synchronization on mount
  useEffect(() => {
    let active = true;

    const runSync = async () => {
      const token = Cookies.get(TOKEN_COOKIE_NAME);
      if (token && active) {
        await syncWishlistWithServer(wishlist);
      }
    };

    runSync();

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cache local changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
    } catch (err) {
      console.error("Failed to save wishlist locally:", err);
    }
  }, [wishlist]);

  const isInWishlist = (productId: string) => {
    return wishlist.some((item) => item.id === productId);
  };

  const addToWishlist = async (product: Product) => {
    if (isInWishlist(product.id)) return;

    // Optimistic local state update
    setWishlist((prev) => [...prev, product]);
    toast.success(`Added "${product.name}" to your wishlist`);

    // Sync to server if authenticated
    const token = Cookies.get(TOKEN_COOKIE_NAME);
    if (token) {
      try {
        await apiClient.addToWishlist(product.id);
      } catch (err) {
        console.error("Failed to add product to remote wishlist:", err);
      }
    }
  };

  const removeFromWishlist = async (productId: string) => {
    // Optimistic local state update
    setWishlist((prev) => prev.filter((item) => item.id !== productId));
    toast.info("Item removed from wishlist");

    // Sync removal to server if authenticated
    const token = Cookies.get(TOKEN_COOKIE_NAME);
    if (token) {
      try {
        await apiClient.removeFromWishlist(productId);
      } catch (err) {
        console.error("Failed to remove product from remote wishlist:", err);
      }
    }
  };

  const toggleWishlist = (product: Product) => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const clearWishlist = async () => {
    const currentItems = [...wishlist];
    setWishlist([]);
    localStorage.removeItem(WISHLIST_STORAGE_KEY);

    const token = Cookies.get(TOKEN_COOKIE_NAME);
    if (token && currentItems.length > 0) {
      try {
        await Promise.allSettled(
          currentItems.map((item) => apiClient.removeFromWishlist(item.id)),
        );
      } catch (err) {
        console.error("Failed to clear remote wishlist:", err);
      }
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        isInWishlist,
        clearWishlist,
        syncing,
        isMounted,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
};
