"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Cookies from "js-cookie";
import {
  LuPlus,
  LuDownload,
  LuTrendingUp,
  LuShoppingBag,
  LuUsers,
  LuDollarSign,
  LuRefreshCw,
  LuHardDrive,
} from "react-icons/lu";
import { apiClient } from "@/lib/api-client";
import { UserProfile } from "@/lib/api/auth-api";
import {
  adminApi,
  DashboardAnalyticsResponse,
  DashboardKPIs,
  DashboardPeriod,
} from "@/lib/api/admin-api";
import { vendorApi, PlatformStorageStats } from "@/lib/api/vendor-api";
import { formatBytes } from "@/lib/utils/format-bytes";
import { getTimeGreeting } from "@/lib/utils/date";
import RevenueOverviewChart from "@/components/admin/RevenueOverviewChart";
import TopProductsCard from "@/components/admin/TopProductsCard";
import RecentOrdersTable from "@/components/admin/RecentOrdersTable";
import InventoryAlertsCard from "@/components/admin/InventoryAlertsCard";

const TOKEN_COOKIE_NAME =
  process.env.NEXT_PUBLIC_AUTH_TOKEN_COOKIE_NAME || "dawang_token";

const PERIOD_OPTIONS: Array<{
  value: DashboardPeriod;
  label: string;
  badge: string;
}> = [
  { value: "weekly", label: "Last 7 Days", badge: "7D" },
  { value: "monthly", label: "Last 30 Days", badge: "30D" },
  { value: "yearly", label: "Last 12 Months", badge: "1Y" },
  { value: "all", label: "All Time", badge: "ALL" },
];

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [kpiLoading, setKpiLoading] = useState(false);
  const [period, setPeriod] = useState<DashboardPeriod>("monthly");
  const [adminUser, setAdminUser] = useState<UserProfile | null>(null);
  const [analyticsData, setAnalyticsData] =
    useState<DashboardAnalyticsResponse | null>(null);
  const [greeting, setGreeting] = useState<string>("Good day");
  const [storageStats, setStorageStats] = useState<PlatformStorageStats | null>(
    null,
  );

  const fetchKpisForPeriod = useCallback(
    async (selectedPeriod: DashboardPeriod) => {
      try {
        setKpiLoading(true);
        const res = await adminApi.getDashboardAnalytics(selectedPeriod);
        setAnalyticsData(res);
      } catch (err) {
        console.error("Failed to filter dashboard KPIs:", err);
      } finally {
        setKpiLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    let active = true;

    const fetchDashboardData = async () => {
      const token = Cookies.get(TOKEN_COOKIE_NAME);
      if (!token) {
        if (active) setLoading(false);
        return;
      }

      try {
        const [meRes, analyticsRes, storageRes] = await Promise.allSettled([
          apiClient.getMe(),
          adminApi.getDashboardAnalytics("monthly"),
          vendorApi.getPlatformStorageStatsAdmin(),
        ]);

        if (!active) return;

        if (meRes.status === "fulfilled" && meRes.value) {
          setAdminUser(meRes.value as UserProfile);
        }

        if (analyticsRes.status === "fulfilled" && analyticsRes.value) {
          setAnalyticsData(analyticsRes.value);
        }

        if (storageRes.status === "fulfilled" && storageRes.value) {
          setStorageStats(storageRes.value);
        }
      } catch (err) {
        console.error("Failed to load admin dashboard analytics:", err);
      } finally {
        if (active) setLoading(false);
      }
    };

    queueMicrotask(() => {
      if (active) {
        setGreeting(getTimeGreeting());
        fetchDashboardData();
      }
    });

    return () => {
      active = false;
    };
  }, []);

  const handlePeriodChange = (nextPeriod: DashboardPeriod) => {
    if (nextPeriod === period) return;
    setPeriod(nextPeriod);
    fetchKpisForPeriod(nextPeriod);
  };

  const kpis: DashboardKPIs | undefined = analyticsData?.kpis;
  const adminName = adminUser?.firstName ? adminUser.firstName : "Admin";
  const activeBadge =
    PERIOD_OPTIONS.find((p) => p.value === period)?.badge || "30D";

  const renderGrowthBadge = (percentage?: number) => {
    if (period === "all") {
      return (
        <span className="text-[11px] font-semibold text-[#76726E]">
          Lifetime
        </span>
      );
    }
    const value = percentage ?? 0;
    const isPositive = value >= 0;
    return (
      <span
        className={`text-xs font-semibold ${
          isPositive ? "text-emerald-600" : "text-rose-600"
        }`}
      >
        {isPositive ? "↑" : "↓"} {Math.abs(value)}%
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-2 text-xs text-[#76726E]">
        <LuRefreshCw className="w-6 h-6 animate-spin text-[#C4956A]" />
        Loading dashboard metrics...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 font-sans">
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold tracking-[0.15em] uppercase text-[#C4956A]">
            OVERVIEW
          </span>
          <h1 className="font-heading text-3xl font-bold text-[#1A1A1A] mt-1">
            {greeting}, {adminName}.
          </h1>
          <p className="text-sm text-[#76726E] mt-1">
            Here’s what’s happening with your store today.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-white border border-[#EAE8E4] text-[#1A1A1A] text-xs font-bold tracking-wider uppercase rounded-md hover:bg-[#FAF9F6] transition-colors flex items-center gap-2 cursor-pointer">
            <LuDownload className="w-4 h-4" /> Export Report
          </button>
          <Link
            href="/admin/products?action=add"
            className="px-4 py-2 bg-[#171514] text-white text-xs font-bold tracking-wider uppercase rounded-md hover:bg-[#2A2725] transition-colors flex items-center gap-2"
          >
            <LuPlus className="w-4 h-4" /> Add Product
          </Link>
        </div>
      </div>

      {/* Summary Period Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white px-4 py-3 rounded-lg border border-[#EAE8E4]">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#76726E]">
            KPI Summary Window:
          </span>
          {kpiLoading && (
            <LuRefreshCw className="w-3.5 h-3.5 animate-spin text-[#C4956A]" />
          )}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {PERIOD_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              disabled={kpiLoading}
              onClick={() => handlePeriodChange(opt.value)}
              className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                period === opt.value
                  ? "bg-[#171514] text-white"
                  : "bg-[#FAF9F6] text-[#76726E] border border-[#EAE8E4] hover:text-[#1A1A1A]"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Metrics Grid */}
      <div
        className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 transition-opacity ${
          kpiLoading ? "opacity-60" : "opacity-100"
        }`}
      >
        {/* 1. Total Revenue */}
        <div className="bg-white p-6 rounded-lg border border-[#EAE8E4] flex flex-col justify-between h-36 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-[#FAF5EF] text-[#C4956A] rounded-md">
              <LuTrendingUp className="w-5 h-5" />
            </div>
            {renderGrowthBadge(kpis?.revenueGrowthPercentage)}
          </div>
          <div>
            <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#76726E]">
              TOTAL REVENUE ({activeBadge})
            </span>
            <p className="font-heading text-2xl font-bold text-[#1A1A1A]">
              ₦{Number(kpis?.totalRevenue || 0).toLocaleString()}
            </p>
            <p className="text-[11px] text-[#76726E] mt-0.5">
              From {kpis?.paidOrders ?? 0} paid orders
            </p>
          </div>
        </div>

        {/* 2. Total Orders */}
        <div className="bg-white p-6 rounded-lg border border-[#EAE8E4] flex flex-col justify-between h-36 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-[#FAF5EF] text-[#C4956A] rounded-md">
              <LuShoppingBag className="w-5 h-5" />
            </div>
            {renderGrowthBadge(kpis?.ordersGrowthPercentage)}
          </div>
          <div>
            <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#76726E]">
              ORDERS ({activeBadge})
            </span>
            <div className="flex items-baseline gap-2">
              <p className="font-heading text-2xl font-bold text-[#1A1A1A]">
                {kpis?.totalOrders ?? 0}
              </p>
              <span className="text-xs font-semibold text-emerald-700">
                ({kpis?.paidOrders ?? 0} paid)
              </span>
            </div>
            <p className="text-[11px] text-[#76726E] mt-0.5">
              {Math.max(0, (kpis?.totalOrders ?? 0) - (kpis?.paidOrders ?? 0))}{" "}
              other / unpaid
            </p>
          </div>
        </div>

        {/* 3. Total Customers */}
        <div className="bg-white p-6 rounded-lg border border-[#EAE8E4] flex flex-col justify-between h-36 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-[#FAF5EF] text-[#C4956A] rounded-md">
              <LuUsers className="w-5 h-5" />
            </div>
            {renderGrowthBadge(kpis?.customersGrowthPercentage)}
          </div>
          <div>
            <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#76726E]">
              CUSTOMERS ({activeBadge})
            </span>
            <p className="font-heading text-2xl font-bold text-[#1A1A1A]">
              {kpis?.totalCustomers ?? 0}
            </p>
          </div>
        </div>

        {/* 4. Average Order Value */}
        <div className="bg-white p-6 rounded-lg border border-[#EAE8E4] flex flex-col justify-between h-36 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-[#FAF5EF] text-[#C4956A] rounded-md">
              <LuDollarSign className="w-5 h-5" />
            </div>
            {renderGrowthBadge(kpis?.avgOrderValueGrowthPercentage)}
          </div>
          <div>
            <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#76726E]">
              AVG ORDER VALUE ({activeBadge})
            </span>
            <p className="font-heading text-2xl font-bold text-[#1A1A1A]">
              ₦{Number(kpis?.avgOrderValue || 0).toLocaleString()}
            </p>
          </div>
        </div>

        {/* 5. Platform Storage */}
        <Link
          href="/admin/vendors?sort=storage_desc"
          className="md:col-span-4 bg-white p-6 rounded-lg border border-[#EAE8E4] hover:border-[#C4956A] transition-colors flex flex-col justify-between h-36 shadow-xs"
        >
          <div className="flex items-center justify-between">
            <div className="p-2 bg-[#FAF5EF] text-[#C4956A] rounded-md">
              <LuHardDrive className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-semibold text-[#76726E]">
              {storageStats?.accountLimitBytes
                ? `of ${formatBytes(storageStats.accountLimitBytes)}`
                : "Cloudinary"}
            </span>
          </div>
          <div>
            <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#76726E]">
              PLATFORM STORAGE
            </span>
            <p className="font-heading text-2xl font-bold text-[#1A1A1A]">
              {formatBytes(storageStats?.totalPlatformStorageBytes)}
            </p>
          </div>
        </Link>
      </div>

      {/* Revenue Overview Section */}
      <RevenueOverviewChart />
      {/* Top Products Section */}
      <TopProductsCard />
      {/* Recent Orders Section */}
      <RecentOrdersTable />
      {/* Inventory Alert section */}
      <InventoryAlertsCard alerts={analyticsData?.inventoryAlerts} />
    </div>
  );
}
