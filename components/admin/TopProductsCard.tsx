"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FiRefreshCw, FiPackage } from "react-icons/fi";
import { apiClient } from "@/lib/api-client";
import { TopProductItem } from "@/lib/api/admin-api";

export default function TopProductsCard() {
  const [topProducts, setTopProducts] = useState<TopProductItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const fetchTopProducts = async () => {
      try {
        setLoading(true);
        const res = await apiClient.getTopProducts(4);
        if (active && Array.isArray(res)) {
          setTopProducts(res);
        }
      } catch (err) {
        console.error("Failed to fetch top products analytics:", err);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchTopProducts();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="bg-white p-6 sm:p-8 rounded-lg border border-[#EAE8E4] flex flex-col gap-6 font-sans shadow-xs">
      {/* Header Bar */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="font-heading text-xl font-bold text-[#151413]">
            Top products
          </h2>
          <p className="text-xs text-[#76726E] mt-0.5">
            Best performing this month
          </p>
        </div>

        <Link
          href="/admin/products"
          className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#C4956A] hover:underline cursor-pointer"
        >
          VIEW ALL
        </Link>
      </div>

      {/* List / Loading / Empty state */}
      {loading ? (
        <div className="h-64 flex flex-col items-center justify-center gap-2 text-xs text-[#76726E]">
          <FiRefreshCw className="w-5 h-5 animate-spin text-[#C4956A]" />
          <span>Loading top performing products...</span>
        </div>
      ) : topProducts.length === 0 ? (
        <div className="h-64 bg-[#FAF9F6] border border-[#EAE8E4] rounded-md flex flex-col items-center justify-center gap-2 text-xs text-[#76726E]">
          <FiPackage className="w-6 h-6 text-[#A39E98]" />
          <span>No product sales recorded for this month yet.</span>
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-[#FAF9F6]">
          {topProducts.map((item, index) => {
            const rank = (index + 1).toString().padStart(2, "0");

            return (
              <div
                key={item.id || index}
                className="py-3.5 flex items-center justify-between gap-4 first:pt-0 last:pb-0"
              >
                {/* Rank Badge & Item Details */}
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-12 h-12 bg-[#FAF9F6] border border-[#EAE8E4] rounded-md flex items-center justify-center font-heading font-bold text-base text-[#C4956A] shrink-0">
                    {rank}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-medium text-xs text-[#151413] truncate">
                      {item.name}
                    </span>
                    <span className="text-[11px] text-[#A39E98] mt-0.5 capitalize">
                      {item.category}
                    </span>
                  </div>
                </div>

                {/* Amount */}
                <div className="font-bold text-xs text-[#151413] shrink-0">
                  ₦{Number(item.totalSales || item.price).toLocaleString()}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
