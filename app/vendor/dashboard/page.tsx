"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  LuPackage,
  LuShoppingBag,
  LuWallet,
  LuClock,
  LuArrowUpRight,
} from "react-icons/lu";
import { vendorApi, VendorDashboardStats } from "@/lib/api/vendor-api";

export default function VendorOverviewPage() {
  const [stats, setStats] = useState<VendorDashboardStats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    vendorApi
      .getMyDashboard()
      .then(setStats)
      .catch((err) => setError(err.message));
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
