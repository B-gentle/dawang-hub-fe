import { useSyncExternalStore } from "react";

const KEY = "dawang_vendor_store_name";

/**
 * Remembers the vendor's store name so loaders can show the right initials
 * on later visits, before the store has been fetched. Display only.
 */
export function cacheStoreName(name: string) {
  try {
    localStorage.setItem(KEY, name);
  } catch {
    /* storage unavailable (private mode, etc.) */
  }
}

/** Call on logout so the next person on this device doesn't see it. */
export function clearCachedStoreName() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

const subscribe = (onChange: () => void) => {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
};

/** null on the server and when nothing is cached (no hydration mismatch). */
export function useCachedStoreName(): string | null {
  return useSyncExternalStore(
    subscribe,
    () => {
      try {
        return localStorage.getItem(KEY);
      } catch {
        return null;
      }
    },
    () => null,
  );
}
