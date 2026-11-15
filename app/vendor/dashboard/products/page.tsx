"use client";

import { useEffect, useState } from "react";
import { vendorApi, VendorProfile } from "@/lib/api/vendor-api";
import ProductsManager from "@/components/products/ProductsManager";

export default function VendorProductsPage() {
  const [vendor, setVendor] = useState<VendorProfile | null>(null);

  useEffect(() => {
    let active = true;
    vendorApi
      .getMyStore()
      .then((data) => {
        if (active) setVendor(data);
      })
      .catch(() => null);
    return () => {
      active = false;
    };
  }, []);

  return (
    <ProductsManager
      mode="vendor"
      vendorId={vendor?.id}
      storeName={vendor?.storeName}
    />
  );
}
