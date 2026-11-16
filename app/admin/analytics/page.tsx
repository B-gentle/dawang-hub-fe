"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  LuTrendingUp,
  LuShoppingBag,
  LuDollarSign,
  LuRefreshCw,
  LuCalendar,
  LuImage,
  LuHardDrive,
  LuArrowUpRight,
} from "react-icons/lu";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import {
  RevenueOverviewResponse,
  TopProductItem,
} from "@/lib/api/analytics-api";
import { vendorApi, PlatformStorageStats } from "@/lib/api/vendor-api";
import { formatBytes } from "@/lib/utils/format-bytes";

export default function AdminAnalyticsPage() {
  const [period, setPeriod] = useState<"weekly" | "monthly" | "yearly">(
    "monthly",
  );
  const [loading, setLoading] = useState(true);

  const [revenueStats, setRevenueStats] =
    useState<RevenueOverviewResponse | null>(null);
  const [topProducts, setTopProducts] = useState<TopProductItem[]>([]);
  const [storageStats, setStorageStats] = useState<PlatformStorageStats | null>(
    null,
  );

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);

      const [revenueData, productsData, storageData] = await Promise.all([
        apiClient.getRevenueOverview(period).catch(() => null),
        apiClient.getTopProducts(10).catch(() => []),
        vendorApi.getPlatformStorageStatsAdmin().catch(() => null),
      ]);

      setRevenueStats(revenueData);
      setTopProducts(Array.isArray(productsData) ? productsData : []);
      setStorageStats(storageData);
    } catch (err) {
      console.error("Failed to fetch studio analytics:", err);
      toast.error("Failed to load store analytics data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    queueMicrotask(() => {
      if (isMounted) {
        loadAnalyticsData();
      }
    });

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);

  const totalPeriodRevenue =
    revenueStats?.data?.reduce((acc, curr) => acc + (curr.revenue || 0), 0) ||
    0;

  const heavyVendors = storageStats?.topHeavyVendors || [];
  const totalVendorBytes = storageStats?.totalVendorStorageBytes || 0;

  return (
    <div className="flex flex-col gap-8 font-sans pb-12 text-[#151413]">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold tracking-[0.15em] uppercase text-[#C4956A]">
            REPORTS &amp; INSIGHTS
          </span>
          <h1 className="font-heading text-3xl font-bold text-[#151413] mt-1">
            Analytics &amp; Performance
          </h1>
          <p className="text-sm text-[#76726E] mt-1">
            Deep dive into revenue trends, platform storage consumption, and top
            performing product sales.
          </p>
        </div>

        {/* Timeframe Selector */}
        <div className="flex items-center gap-2 bg-white p-1.5 border border-[#EAE8E4] rounded-lg shadow-xs self-start sm:self-auto">
          <LuCalendar className="w-4 h-4 text-[#C4956A] ml-2 shrink-0" />
          <div className="flex items-center gap-1">
            {(["weekly", "monthly", "yearly"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                  period === p
                    ? "bg-[#151413] text-white"
                    : "text-[#76726E] hover:text-[#151413] hover:bg-[#FAF9F6]"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-2 text-xs text-[#76726E]">
          <LuRefreshCw className="w-6 h-6 animate-spin text-[#C4956A]" />
          Calculating metrics...
        </div>
      ) : (
        <>
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Period Revenue */}
            <div className="bg-white p-6 rounded-lg border border-[#EAE8E4] shadow-xs flex flex-col justify-between gap-4">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#76726E]">
                  Total Revenue ({period})
                </span>
                <div className="p-2 bg-[#FAF5EF] text-[#C4956A] rounded-md">
                  <LuDollarSign className="w-4 h-4" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold font-heading text-[#151413]">
                  ₦{totalPeriodRevenue.toLocaleString()}
                </h3>
                <p className="text-[11px] text-[#76726E] mt-1 flex items-center gap-1">
                  <LuTrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                  {revenueStats?.comparedToPreviousPeriodPercentage
                    ? `${revenueStats.comparedToPreviousPeriodPercentage}% vs previous period`
                    : "Revenue calculated across period"}
                </p>
              </div>
            </div>

            {/* Total Sales Volume */}
            <div className="bg-white p-6 rounded-lg border border-[#EAE8E4] shadow-xs flex flex-col justify-between gap-4">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#76726E]">
                  Top Product Volume
                </span>
                <div className="p-2 bg-[#FAF5EF] text-[#C4956A] rounded-md">
                  <LuShoppingBag className="w-4 h-4" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold font-heading text-[#151413]">
                  {topProducts.reduce(
                    (sum, item) => sum + (item.totalSales || 0),
                    0,
                  )}{" "}
                  Units
                </h3>
                <p className="text-[11px] text-[#76726E] mt-1">
                  Total units sold among top products
                </p>
              </div>
            </div>

            {/* Total Tracked Data Points */}
            <div className="bg-white p-6 rounded-lg border border-[#EAE8E4] shadow-xs flex flex-col justify-between gap-4">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#76726E]">
                  Reporting Data Points
                </span>
                <div className="p-2 bg-[#FAF5EF] text-[#C4956A] rounded-md">
                  <LuCalendar className="w-4 h-4" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold font-heading text-[#151413]">
                  {revenueStats?.data?.length || 0} Points
                </h3>
                <p className="text-[11px] text-[#76726E] mt-1">
                  Interval points recorded
                </p>
              </div>
            </div>

            {/* Overall Platform Storage */}
            <Link
              href="/admin/vendors?sort=storage_desc"
              className="bg-white p-6 rounded-lg border border-[#EAE8E4] hover:border-[#C4956A] transition-colors shadow-xs flex flex-col justify-between gap-4"
            >
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#76726E]">
                  Platform Media Storage
                </span>
                <div className="p-2 bg-[#FAF5EF] text-[#C4956A] rounded-md">
                  <LuHardDrive className="w-4 h-4" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold font-heading text-[#151413]">
                  {formatBytes(storageStats?.totalPlatformStorageBytes)}
                </h3>
                <p className="text-[11px] text-[#76726E] mt-1">
                  {formatBytes(totalVendorBytes)} across vendor stores
                </p>
              </div>
            </Link>
          </div>

          {/* Top 5 Heavy Storage Users */}
          <div className="bg-white p-6 rounded-lg border border-[#EAE8E4] shadow-xs flex flex-col gap-4">
            <div className="pb-3 border-b border-[#EAE8E4] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-[#151413] flex items-center gap-2">
                  <LuHardDrive className="w-4 h-4 text-[#C4956A]" /> Top 5 Heavy
                  Storage Users
                </h3>
                <p className="text-xs text-[#76726E] mt-0.5">
                  Vendors consuming the most media storage. Click any vendor to
                  inspect all stores sorted by highest storage.
                </p>
              </div>

              <Link
                href="/admin/vendors?sort=storage_desc"
                className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-[#C4956A] hover:underline self-start sm:self-auto"
              >
                View All by Storage <LuArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {heavyVendors.length === 0 ? (
              <div className="py-10 text-center text-xs text-[#76726E] bg-[#FAF9F6] rounded-md">
                No vendor storage usage recorded yet.
              </div>
            ) : (
              <div className="divide-y divide-[#EAE8E4]">
                {heavyVendors.map((vendor, index) => {
                  const sharePercent =
                    totalVendorBytes > 0
                      ? Math.min(
                          100,
                          Math.round(
                            (vendor.storageUsedBytes / totalVendorBytes) * 100,
                          ),
                        )
                      : 0;

                  return (
                    <Link
                      key={vendor.id}
                      href="/admin/vendors?sort=storage_desc"
                      className="py-3.5 px-3 -mx-3 rounded-md hover:bg-[#FAF9F6] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-6 h-6 rounded-full bg-[#FAF5EF] text-[#C4956A] font-bold text-xs flex items-center justify-center shrink-0">
                          {index + 1}
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-[#151413] group-hover:text-[#C4956A] transition-colors truncate">
                            {vendor.storeName}
                          </p>
                          <p className="text-[11px] text-[#76726E] truncate">
                            {vendor.slug}
                            {vendor.ownerEmail ? ` • ${vendor.ownerEmail}` : ""}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 sm:w-64 shrink-0">
                        <div className="flex-1 h-2 bg-[#FAF9F6] border border-[#EAE8E4] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#C4956A] rounded-full"
                            style={{ width: `${Math.max(sharePercent, 4)}%` }}
                          />
                        </div>
                        <span className="font-mono text-xs font-bold text-[#151413] w-20 text-right">
                          {formatBytes(vendor.storageUsedBytes)}
                        </span>
                        <LuArrowUpRight className="w-4 h-4 text-[#A39E98] group-hover:text-[#151413] shrink-0" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Top Products Performance Table */}
          <div className="bg-white p-6 rounded-lg border border-[#EAE8E4] shadow-xs flex flex-col gap-4">
            <div className="pb-3 border-b border-[#EAE8E4] flex justify-between items-center">
              <div>
                <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-[#151413]">
                  Top Performing Catalog Products
                </h3>
                <p className="text-xs text-[#76726E] mt-0.5">
                  Products with highest volume sales performance
                </p>
              </div>
            </div>

            {topProducts.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#76726E] bg-[#FAF9F6] rounded-md">
                No sales data recorded yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#FAF9F6] border-b border-[#EAE8E4] text-[10px] font-bold uppercase tracking-wider text-[#76726E]">
                      <th className="py-2.5 px-4">PRODUCT</th>
                      <th className="py-2.5 px-4">CATEGORY</th>
                      <th className="py-2.5 px-4">UNIT PRICE</th>
                      <th className="py-2.5 px-4 text-right">
                        TOTAL UNITS SOLD
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EAE8E4] text-xs">
                    {topProducts.map((prod) => (
                      <tr
                        key={prod.id}
                        className="hover:bg-[#FAF9F6] transition-colors"
                      >
                        <td className="py-3 px-4 font-semibold text-[#151413] flex items-center gap-2">
                          <LuImage className="w-4 h-4 text-[#A39E98]" />
                          {prod.name}
                        </td>
                        <td className="py-3 px-4 text-[#76726E] font-medium">
                          {prod.category || "General"}
                        </td>
                        <td className="py-3 px-4 font-bold text-[#151413]">
                          ₦{Number(prod.price || 0).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-[#C4956A]">
                          {prod.totalSales || 0} Units
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
