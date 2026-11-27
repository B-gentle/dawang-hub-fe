"use client";

import StoreLoader from "@/components/vendor/StoreLoader";
import { useCachedStoreName } from "@/lib/utils/store-cache";

// Shown while a dashboard page loads (inside the layout's content area).
export default function DashboardLoading() {
  const storeName = useCachedStoreName();
  return <StoreLoader storeName={storeName} message="Loading..." />;
}
