"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  LuPackage,
  LuShoppingBag,
  LuWallet,
  LuClock,
  LuArrowUpRight,
  LuTriangleAlert,
  LuCalendarClock,
} from "react-icons/lu";
import {
  vendorApi,
  VendorDashboardStats,
  VendorProfile,
} from "@/lib/api/vendor-api";

interface SubscriptionSummary {
  planLabel: string;
  formattedExpiry: string | null;
  daysRemaining: number | null;
  isExpired: boolean;
  isExpiringSoon: boolean;
}

function buildSubscriptionSummary(
  store: VendorProfile | null,
): SubscriptionSummary | null {
  if (!store) return null;

  const expiresAt = store.planExpiresAt;
  const expiryMs = expiresAt ? new Date(expiresAt).getTime() : null;
  const now = Date.now();

  const daysRemaining =
    typeof store.daysRemaining === "number"
      ? store.daysRemaining
      : expiryMs !== null && !Number.isNaN(expiryMs)
        ? Math.ceil((expiryMs - now) / (24 * 60 * 60 * 1000))
        : null;

  const isExpired =
    store.status === "EXPIRED" ||
    Boolean(store.isExpired) ||
    (expiryMs !== null && !Number.isNaN(expiryMs) && expiryMs <= now);

  const isExpiringSoon =
    !isExpired && daysRemaining !== null && daysRemaining <= 7;

  const formattedExpiry =
    expiresAt && !Number.isNaN(new Date(expiresAt).getTime())
      ? new Date(expiresAt).toLocaleDateString("en-NG", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : null;

  return {
    planLabel: store.planName || store.planId || "Standard",
    formattedExpiry,
    daysRemaining,
    isExpired,
    isExpiringSoon,
  };
}

export default function VendorOverviewPage() {
  const [stats, setStats] = useState<VendorDashboardStats | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionSummary | null>(
    null,
  );
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    Promise.all([
      vendorApi.getMyDashboard(),
      vendorApi.getMyStore().catch(() => null),
    ])
      .then(([dashboardStats, vendorProfile]) => {
        if (!active) return;
        setStats(dashboardStats);
        setSubscription(buildSubscriptionSummary(vendorProfile));
      })
      .catch((err) => {
        if (active) setError(err.message);
      });

    return () => {
      active = false;
    };
  }, []);

  if (error) {
    return (
      <div className="p-6 bg-white rounded-xl border border-[#EAE8E4] text-xs text-[#76726E]">
        Dashboard analytics will unlock once your storefront is approved (
        {error}).
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {subscription &&
        (subscription.isExpired || subscription.isExpiringSoon) && (
          <div
            className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
              subscription.isExpired
                ? "bg-rose-50 border-rose-200 text-rose-900"
                : "bg-amber-50 border-amber-200 text-amber-900"
            }`}
          >
            <div className="flex items-start gap-2.5">
              <LuTriangleAlert
                className={`w-4 h-4 shrink-0 mt-0.5 ${
                  subscription.isExpired ? "text-rose-600" : "text-amber-600"
                }`}
              />
              <div>
                <p className="font-bold">
                  {subscription.isExpired
                    ? "Your storefront subscription has expired"
                    : `Your storefront subscription expires in ${subscription.daysRemaining} day${subscription.daysRemaining === 1 ? "" : "s"}`}
                </p>
                <p className="mt-0.5 opacity-90">
                  {subscription.isExpired
                    ? "Your public storefront and products are currently hidden from shoppers until your subscription is renewed."
                    : `Renewal due on ${subscription.formattedExpiry} to keep your storefront live without interruption.`}
                </p>
              </div>
            </div>
            <Link
              href="/vendor/dashboard/settings"
              className={`px-3.5 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider shrink-0 text-center ${
                subscription.isExpired
                  ? "bg-rose-600 text-white hover:bg-rose-700"
                  : "bg-amber-700 text-white hover:bg-amber-800"
              }`}
            >
              Manage Plan
            </Link>
          </div>
        )}

      {subscription &&
        !subscription.isExpired &&
        !subscription.isExpiringSoon &&
        subscription.formattedExpiry && (
          <div className="px-4 py-2.5 bg-white rounded-xl border border-[#EAE8E4] flex items-center justify-between text-[11px] text-[#76726E]">
            <span className="inline-flex items-center gap-1.5">
              <LuCalendarClock className="w-3.5 h-3.5 text-[#C4956A]" />
              Active Plan:{" "}
              <strong className="text-[#151413] capitalize">
                {subscription.planLabel}
              </strong>
            </span>
            <span>
              Renews{" "}
              <strong className="text-[#151413]">
                {subscription.formattedExpiry}
              </strong>
              {subscription.daysRemaining !== null
                ? ` (${subscription.daysRemaining}d left)`
                : ""}
            </span>
          </div>
        )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl border border-[#EAE8E4]">
          <div className="flex items-center justify-between text-[#76726E] text-xs font-bold uppercase tracking-wider">
            <span>Withdrawable</span>
            <LuWallet className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="mt-3 text-2xl font-bold text-emerald-700">
            ₦{Number(stats?.withdrawableBalance || 0).toLocaleString()}
          </p>
          <Link
            href="/vendor/dashboard/wallet"
            className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#C4956A] hover:underline"
          >
            Withdraw Funds <LuArrowUpRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="bg-white p-6 rounded-xl border border-[#EAE8E4]">
          <div className="flex items-center justify-between text-[#76726E] text-xs font-bold uppercase tracking-wider">
            <span>Pending Escrow</span>
            <LuClock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="mt-3 text-2xl font-bold">
            ₦{Number(stats?.pendingBalance || 0).toLocaleString()}
          </p>
          <p className="mt-2 text-[10px] text-[#76726E]">
            Releases on delivery confirmation
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-[#EAE8E4]">
          <div className="flex items-center justify-between text-[#76726E] text-xs font-bold uppercase tracking-wider">
            <span>Total Orders</span>
            <LuShoppingBag className="w-4 h-4 text-[#C4956A]" />
          </div>
          <p className="mt-3 text-2xl font-bold">{stats?.totalOrders ?? 0}</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-[#EAE8E4]">
          <div className="flex items-center justify-between text-[#76726E] text-xs font-bold uppercase tracking-wider">
            <span>Listed Products</span>
            <LuPackage className="w-4 h-4 text-[#C4956A]" />
          </div>
          <p className="mt-3 text-2xl font-bold">{stats?.totalProducts ?? 0}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#EAE8E4] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#EAE8E4] flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider">
            Recent Storefront Orders
          </h2>
          <Link
            href="/vendor/dashboard/orders"
            className="text-[11px] font-bold uppercase tracking-wider text-[#C4956A] hover:underline"
          >
            View All
          </Link>
        </div>

        {!stats?.recentOrders?.length ? (
          <p className="p-6 text-xs text-[#76726E]">No orders yet.</p>
        ) : (
          <div className="divide-y divide-[#EAE8E4] text-xs">
            {stats.recentOrders.map((order) => (
              <div
                key={order.id}
                className="px-6 py-4 flex items-center justify-between"
              >
                <div>
                  <p className="font-mono font-bold">
                    #{order.id.slice(0, 8).toUpperCase()}
                  </p>
                  <p className="text-[#76726E]">
                    {order.user
                      ? `${order.user.firstName} ${order.user.lastName}`
                      : "Guest Customer"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold">
                    ₦
                    {Number(
                      order.vendorPayoutAmount ?? order.totalAmount,
                    ).toLocaleString()}
                  </p>
                  <span className="text-[10px] font-bold uppercase text-[#C4956A]">
                    {order.status.replace("_", " ")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
