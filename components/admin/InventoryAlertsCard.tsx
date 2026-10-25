"use client";

import Link from "next/link";
import { FiAlertTriangle, FiPackage, FiArrowRight } from "react-icons/fi";
import { InventoryAlerts } from "@/lib/api/admin-api";

interface InventoryAlertsCardProps {
  alerts?: InventoryAlerts | null;
}

export default function InventoryAlertsCard({
  alerts,
}: InventoryAlertsCardProps) {
  const items = alerts?.items || [];
  const count = alerts?.itemsNeedingAttention ?? items.length;
  const affectedPercentage = alerts?.affectedPercentage ?? 0;

  return (
    <div className="bg-white p-6 sm:p-8 rounded-lg border border-[#EAE8E4] flex flex-col justify-between gap-6 font-sans shadow-xs">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-md">
              <FiAlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading text-lg font-bold text-[#151413]">
                Inventory Alerts
              </h3>
              <span className="text-xs text-[#76726E]">
                {affectedPercentage}% of active catalog needs attention
              </span>
            </div>
          </div>

          <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
            {count} Low Stock
          </span>
        </div>

        {/* Low Stock Items List */}
        {items.length === 0 ? (
          <div className="py-6 bg-[#FAF9F6] border border-[#EAE8E4] rounded-md text-center text-xs text-[#76726E] flex flex-col items-center gap-1">
            <FiPackage className="w-5 h-5 text-[#A39E98]" />
            <span>All product stocks are well maintained.</span>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5 mt-1">
            {items.slice(0, 3).map((item) => (
              <div
                key={item.id}
                className="p-3 bg-[#FAF9F6] border border-[#EAE8E4] rounded-md flex justify-between items-center text-xs"
              >
                <div className="flex flex-col min-w-0 pr-2">
                  <span className="font-semibold text-[#151413] truncate">
                    {item.name}
                  </span>
                  <span className="text-[10px] text-[#76726E] font-mono">
                    SKU: {item.sku || "N/A"}
                  </span>
                </div>
                <span className="font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-xs border border-rose-200 shrink-0 text-[11px]">
                  {item.stockQuantity === 0
                    ? "Out of Stock"
                    : `${item.stockQuantity} Left`}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <Link
        href="/admin/products"
        className="text-xs font-bold text-[#C4956A] uppercase tracking-wider flex items-center justify-between pt-3 border-t border-[#EAE8E4] hover:underline"
      >
        <span>Manage Catalog Inventory</span>
        <FiArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
