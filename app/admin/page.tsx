"use client";

import Link from "next/link";
import {
  LuPlus,
  LuDownload,
  LuTrendingUp,
  LuShoppingBag,
  LuUsers,
  LuChartBar,
} from "react-icons/lu";

export default function AdminDashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold tracking-[0.15em] uppercase text-[#C4956A]">
            OVERVIEW
          </span>
          <h1 className="font-heading text-3xl font-bold text-[#1A1A1A] mt-1">
            Good morning, Ada.
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

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue */}
        <div className="bg-white p-6 rounded-lg border border-[#EAE8E4] flex flex-col justify-between h-36">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-[#FAF5EF] text-[#C4956A] rounded-md">
              <LuTrendingUp className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-emerald-600">
              ↑ 18.6%
            </span>
          </div>
          <div>
            <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#76726E]">
              TOTAL REVENUE
            </span>
            <p className="font-heading text-2xl font-bold text-[#1A1A1A]">
              ₦2.84m
            </p>
          </div>
        </div>

        {/* Orders */}
        <div className="bg-white p-6 rounded-lg border border-[#EAE8E4] flex flex-col justify-between h-36">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-[#FAF5EF] text-[#C4956A] rounded-md">
              <LuShoppingBag className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-emerald-600">
              ↑ 12.4%
            </span>
          </div>
          <div>
            <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#76726E]">
              ORDERS
            </span>
            <p className="font-heading text-2xl font-bold text-[#1A1A1A]">
              284
            </p>
          </div>
        </div>

        {/* Customers */}
        <div className="bg-white p-6 rounded-lg border border-[#EAE8E4] flex flex-col justify-between h-36">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-[#FAF5EF] text-[#C4956A] rounded-md">
              <LuUsers className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-emerald-600">
              ↑ 8.2%
            </span>
          </div>
          <div>
            <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#76726E]">
              CUSTOMERS
            </span>
            <p className="font-heading text-2xl font-bold text-[#1A1A1A]">
              1,420
            </p>
          </div>
        </div>

        {/* Conversion Rate */}
        <div className="bg-white p-6 rounded-lg border border-[#EAE8E4] flex flex-col justify-between h-36">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-[#FAF5EF] text-[#C4956A] rounded-md">
              <LuChartBar className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-emerald-600">
              ↑ 3.8%
            </span>
          </div>
          <div>
            <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#76726E]">
              CONVERSION RATE
            </span>
            <p className="font-heading text-2xl font-bold text-[#1A1A1A]">
              3.2%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
