"use client";

import { useEffect, useState } from "react";
import { vendorApi, VendorProfile } from "@/lib/api/vendor-api";
import CategoriesManager from "@/components/categories/CategoriesManager";

export default function VendorCategoriesPage() {
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

  return <CategoriesManager mode="vendor" vendorId={vendor?.id} />;
}
