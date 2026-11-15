"use client";

import { useEffect, useState } from "react";
import CategoriesManager from "@/components/categories/CategoriesManager";
import { VendorOption } from "@/components/orders/OrdersManager";
import { vendorApi } from "@/lib/api/vendor-api";

export default function AdminCategoriesPage() {
  const [vendors, setVendors] = useState<VendorOption[]>([]);

  useEffect(() => {
    let active = true;
    vendorApi
      .getAllVendorsAdmin?.()
      .then((list) => {
        if (active && Array.isArray(list)) {
          setVendors(list.map((v) => ({ id: v.id, storeName: v.storeName })));
        }
      })
      .catch(() => null);
    return () => {
      active = false;
    };
  }, []);

  return <CategoriesManager mode="admin" vendors={vendors} />;
}
