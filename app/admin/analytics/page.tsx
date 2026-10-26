"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  LuTrendingUp,
  LuShoppingBag,
  LuDollarSign,
  LuUsers,
  LuRefreshCw,
  LuCalendar,
  LuCircleCheck,
  LuClock,
  LuTruck,
  LuCircle,
  LuPackageCheck,
  LuImage,
} from "react-icons/lu";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import {
  RevenueOverviewResponse,
  TopProductAnalytics,
  OrderStatusDistribution,
  CustomerMetrics,
} from "@/lib/api/analytics-api";

export default function AdminAnalyticsPage() {
  const [period, setPeriod] = useState<
    "daily" | "weekly" | "monthly" | "yearly"
  >("monthly");
  const [loading, setLoading] = useState(true);

  // Analytics Data States
  const [revenueStats, setRevenueStats] =
    useState<RevenueOverviewResponse | null>(null);
  const [topProducts, setTopProducts] = useState<TopProductAnalytics[]>([]);
  const [orderDistribution, setOrderDistribution] =
    useState<OrderStatusDistribution | null>(null);
  const [customerMetrics, setCustomerMetrics] =
    useState<CustomerMetrics | null>(null);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);

      const [revenueData, productsData, orderData, customerData] =
        await Promise.all([
          apiClient.getRevenueOverview(period).catch(() => null),
          apiClient.getTopProducts(10).catch(() => []),
          apiClient.getOrderStatusStats().catch(() => null),
          apiClient.getCustomerMetrics().catch(() => null),
        ]);

      setRevenueStats(revenueData);
      setTopProducts(Array.isArray(productsData) ? productsData : []);
      setOrderDistribution(orderData);
      setCustomerMetrics(customerData);
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

  return (
    <div className="flex flex-col gap-8 font-sans pb-12 text-[#151413]">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold tracking-[0.15em] uppercase text-[#C4956A]">
            REPORTS & INSIGHTS
          </span>
          <h1 className="font-heading text-3xl font-bold text-[#151413] mt-1">
            Analytics & Performance
          </h1>
          <p className="text-sm text-[#76726E] mt-1">
            Deep dive into revenue trends, order fulfillment velocity, and sales
            distribution.
          </p>
        </div>

        {/* Timeframe Selector */}
        <div className="flex items-center gap-2 bg-white p-1.5 border border-[#EAE8E4] rounded-lg shadow-xs self-start sm:self-auto">
          <LuCalendar className="w-4 h-4 text-[#C4956A] ml-2 shrink-0" />
          <div className="flex items-center gap-1">
            {(["daily", "weekly", "monthly", "yearly"] as const).map((p) => (
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
          {/* Key Metric Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Revenue */}
            <div className="bg-white p-6 rounded-lg border border-[#EAE8E4] shadow-xs flex flex-col justify-between gap-4">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#76726E]">
                  Gross Revenue ({period})
                </span>
                <div className="p-2 bg-[#FAF5EF] text-[#C4956A] rounded-md">
                  <LuDollarSign className="w-4 h-4" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold font-heading text-[#151413]">
                  ₦{Number(revenueStats?.totalRevenue || 0).toLocaleString()}
                </h3>
                <p className="text-[11px] text-[#76726E] mt-1 flex items-center gap-1">
                  <LuTrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                  Calculated from paid orders
                </p>
              </div>
            </div>

            {/* Total Volume */}
            <div className="bg-white p-6 rounded-lg border border-[#EAE8E4] shadow-xs flex flex-col justify-between gap-4">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#76726E]">
                  Total Orders
                </span>
                <div className="p-2 bg-[#FAF5EF] text-[#C4956A] rounded-md">
                  <LuShoppingBag className="w-4 h-4" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold font-heading text-[#151413]">
                  {revenueStats?.totalOrders || 0}
                </h3>
                <p className="text-[11px] text-[#76726E] mt-1">
                  Completed & processing checkouts
                </p>
              </div>
            </div>

            {/* Average Order Value (AOV) */}
            <div className="bg-white p-6 rounded-lg border border-[#EAE8E4] shadow-xs flex flex-col justify-between gap-4">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#76726E]">
                  Average Order Value (AOV)
                </span>
                <div className="p-2 bg-[#FAF5EF] text-[#C4956A] rounded-md">
                  <LuTrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold font-heading text-[#151413]">
                  ₦
                  {Number(
                    revenueStats?.averageOrderValue || 0,
                  ).toLocaleString()}
                </h3>
                <p className="text-[11px] text-[#76726E] mt-1">
                  Average spent per basket
                </p>
              </div>
            </div>

            {/* Registered Customers */}
            <div className="bg-white p-6 rounded-lg border border-[#EAE8E4] shadow-xs flex flex-col justify-between gap-4">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#76726E]">
                  Registered Directory
                </span>
                <div className="p-2 bg-[#FAF5EF] text-[#C4956A] rounded-md">
                  <LuUsers className="w-4 h-4" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold font-heading text-[#151413]">
                  {customerMetrics?.totalCustomers || 0}
                </h3>
                <p className="text-[11px] text-[#76726E] mt-1">
                  +{customerMetrics?.newSignupsThisMonth || 0} new accounts this
                  month
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Fulfillment Status & Customer Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Fulfillment Status Breakdown */}
            <div className="bg-white p-6 rounded-lg border border-[#EAE8E4] shadow-xs flex flex-col gap-4">
              <div className="pb-3 border-b border-[#EAE8E4]">
                <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-[#151413]">
                  Order Fulfillment Status
                </h3>
                <p className="text-xs text-[#76726E] mt-0.5">
                  Current lifecycle state across total store orders
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between p-3 bg-[#FAF9F6] rounded-md border border-[#EAE8E4]">
                  <span className="text-xs font-semibold text-[#151413] flex items-center gap-2">
                    <LuCircleCheck className="w-4 h-4 text-emerald-600" />{" "}
                    Delivered
                  </span>
                  <span className="font-bold text-xs">
                    {orderDistribution?.delivered || 0}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-[#FAF9F6] rounded-md border border-[#EAE8E4]">
                  <span className="text-xs font-semibold text-[#151413] flex items-center gap-2">
                    <LuTruck className="w-4 h-4 text-sky-600" /> Shipped
                  </span>
                  <span className="font-bold text-xs">
                    {orderDistribution?.shipped || 0}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-[#FAF9F6] rounded-md border border-[#EAE8E4]">
                  <span className="text-xs font-semibold text-[#151413] flex items-center gap-2">
                    <LuPackageCheck className="w-4 h-4 text-amber-600" /> Paid /
                    Processing
                  </span>
                  <span className="font-bold text-xs">
                    {orderDistribution?.paid || 0}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-[#FAF9F6] rounded-md border border-[#EAE8E4]">
                  <span className="text-xs font-semibold text-[#151413] flex items-center gap-2">
                    <LuClock className="w-4 h-4 text-amber-600" /> Pending
                    Payment
                  </span>
                  <span className="font-bold text-xs">
                    {orderDistribution?.pending || 0}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-[#FAF9F6] rounded-md border border-[#EAE8E4]">
                  <span className="text-xs font-semibold text-[#151413] flex items-center gap-2">
                    <LuCircle className="w-4 h-4 text-rose-600" /> Cancelled
                  </span>
                  <span className="font-bold text-xs">
                    {orderDistribution?.cancelled || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Top Products Performance Table */}
            <div className="bg-white p-6 rounded-lg border border-[#EAE8E4] shadow-xs lg:col-span-2 flex flex-col gap-4">
              <div className="pb-3 border-b border-[#EAE8E4] flex justify-between items-center">
                <div>
                  <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-[#151413]">
                    Top Performing Products
                  </h3>
                  <p className="text-xs text-[#76726E] mt-0.5">
                    Highest revenue generating items in your catalog
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
                        <th className="py-2.5 px-3">PRODUCT</th>
                        <th className="py-2.5 px-3">SKU</th>
                        <th className="py-2.5 px-3">UNITS SOLD</th>
                        <th className="py-2.5 px-3">TOTAL REVENUE</th>
                        <th className="py-2.5 px-3 text-right">IN STOCK</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#FAF9F6] text-xs">
                      {topProducts.map((prod) => (
                        <tr
                          key={prod.id}
                          className="hover:bg-[#FAF9F6] transition-colors"
                        >
                          <td className="py-3 px-3 font-medium flex items-center gap-2.5">
                            <div className="relative w-8 h-8 rounded bg-[#FAF9F6] border border-[#EAE8E4] overflow-hidden shrink-0 flex items-center justify-center text-[#A39E98]">
                              {prod.imageUrl ? (
                                <Image
                                  src={prod.imageUrl}
                                  alt={prod.name}
                                  fill
                                  unoptimized
                                  className="object-cover"
                                />
                              ) : (
                                <LuImage className="w-4 h-4" />
                              )}
                            </div>
                            <span className="line-clamp-1">{prod.name}</span>
                          </td>
                          <td className="py-3 px-3 font-mono text-[#76726E] text-[11px]">
                            {prod.sku}
                          </td>
                          <td className="py-3 px-3 font-bold text-[#151413]">
                            {prod.totalUnitsSold || 0}
                          </td>
                          <td className="py-3 px-3 font-bold text-[#C4956A]">
                            ₦{Number(prod.totalRevenue || 0).toLocaleString()}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                prod.stockQuantity > 0
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-rose-50 text-rose-700"
                              }`}
                            >
                              {prod.stockQuantity} Left
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
