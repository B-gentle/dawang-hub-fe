"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import OrdersManager, { VendorOption } from "@/components/orders/OrdersManager";
import { vendorApi } from "@/lib/api/vendor-api";

export default function AdminOrdersPage() {
  const searchParams = useSearchParams();
  const initialVendorId = searchParams.get("vendorId") || "";
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

  return (
    <OrdersManager
      mode="admin"
      vendors={vendors}
      initialVendorId={initialVendorId}
    />
  );
}
