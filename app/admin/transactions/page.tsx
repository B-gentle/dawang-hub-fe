"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  LuTrendingUp,
  LuWallet,
  LuLandmark,
  LuPercent,
  LuSearch,
  LuX,
  LuRefreshCw,
  LuChevronLeft,
  LuChevronRight,
  LuArrowUpRight,
  LuClock,
  LuCircleCheck,
} from "react-icons/lu";
import { toast } from "sonner";
import {
  vendorApi,
  PlatformTransactionTab,
  PlatformTransactionsResponse,
} from "@/lib/api/vendor-api";

const TABS: Array<{ key: PlatformTransactionTab; label: string }> = [
  { key: "ALL", label: "All Paid Orders" },
  { key: "ESCROW", label: "In Escrow" },
  { key: "RELEASED", label: "Released Earnings" },
  { key: "DISPUTED", label: "Disputed" },
  { key: "WITHDRAWALS", label: "Vendor Payouts" },
];

function AdminPlatformTransactionsContent() {
  const searchParams = useSearchParams();
  const initialVendorId = searchParams.get("vendorId") || undefined;

  const [data, setData] = useState<PlatformTransactionsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);

  const [tab, setTab] = useState<PlatformTransactionTab>("ALL");
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [vendorFilter, setVendorFilter] = useState<string | undefined>(
    initialVendorId,
  );

  const loadTransactions = useCallback(
    async (
      params: {
        page: number;
        tab: PlatformTransactionTab;
        search: string;
        vendorId?: string;
      },
      initial = false,
    ) => {
      try {
        if (initial) {
          setLoading(true);
        } else {
          setFetching(true);
        }
        const res = await vendorApi.getPlatformTransactionsAdmin({
          page: params.page,
          limit: 20,
          tab: params.tab,
          search: params.search,
          vendorId: params.vendorId,
        });
        setData(res);
      } catch (err) {
        toast.error(
          err instanceof Error
            ? err.message
            : "Failed to load platform transactions",
        );
      } finally {
        setLoading(false);
        setFetching(false);
      }
    },
    [],
  );

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (active) {
        loadTransactions(
          { page: 1, tab: "ALL", search: "", vendorId: initialVendorId },
          true,
        );
      }
    });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTabChange = (nextTab: PlatformTransactionTab) => {
    setTab(nextTab);
    setPage(1);
    loadTransactions({
      page: 1,
      tab: nextTab,
      search: appliedSearch,
      vendorId: vendorFilter,
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAppliedSearch(searchInput);
    setPage(1);
    loadTransactions({
      page: 1,
      tab,
      search: searchInput,
      vendorId: vendorFilter,
    });
  };

  const handleClearFilters = () => {
    setSearchInput("");
    setAppliedSearch("");
    setVendorFilter(undefined);
    setPage(1);
    loadTransactions({
      page: 1,
      tab,
      search: "",
      vendorId: undefined,
    });
  };

  const handlePageChange = (nextPage: number) => {
    setPage(nextPage);
    loadTransactions({
      page: nextPage,
      tab,
      search: appliedSearch,
      vendorId: vendorFilter,
    });
  };

  const summary = data?.summary;
  const maxMonthlyCommission = Math.max(
    1,
    ...(data?.monthlyBreakdown || []).map((m) => m.grossCommission2Percent),
  );

  return (
    <div className="flex flex-col gap-8 font-sans pb-12 text-[#151413]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold tracking-[0.15em] uppercase text-[#C4956A]">
            PLATFORM TREASURY &amp; LEDGER
          </span>
          <h1 className="font-heading text-3xl font-bold text-[#151413] mt-1">
            Transactions &amp; Commission Analytics
          </h1>
          <p className="text-sm text-[#76726E] mt-1">
            Monitor platform-wide GMV, the 2% product markup split (1.5% Monnify
            gateway fee vs. 0.5% net GlobexMall profit), escrow, and vendor
            disbursements.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            loadTransactions({
              page,
              tab,
              search: appliedSearch,
              vendorId: vendorFilter,
            })
          }
          className="px-4 py-2.5 bg-white border border-[#EAE8E4] text-xs font-bold uppercase tracking-wider rounded-md hover:border-[#C4956A] flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <LuRefreshCw
            className={`w-3.5 h-3.5 ${fetching ? "animate-spin text-[#C4956A]" : ""}`}
          />
          Refresh Ledger
        </button>
      </div>

      {loading && !data ? (
        <div className="py-24 flex flex-col items-center justify-center gap-2 text-xs text-[#76726E]">
          <LuRefreshCw className="w-6 h-6 animate-spin text-[#C4956A]" />
          Calculating platform revenue &amp; commission splits...
        </div>
      ) : (
        <>
          {/* Primary Commission & Net Profit Split Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#151413] text-white p-6 rounded-xl border border-[#2A2725] shadow-xs">
              <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-[#A39E98]">
                <span>Net GlobexMall Profit (0.5%)</span>
                <LuTrendingUp className="w-4 h-4 text-[#C4956A]" />
              </div>
              <p className="mt-3 text-3xl font-bold text-[#C4956A]">
                ₦{Number(summary?.netProfit05Percent || 0).toLocaleString()}
              </p>
              <p className="mt-1.5 text-[11px] text-[#A39E98]">
                25% share of total 2% product markup retained
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-[#EAE8E4] shadow-xs">
              <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-[#76726E]">
                <span>Gross 2% Markup Charged</span>
                <LuPercent className="w-4 h-4 text-[#C4956A]" />
              </div>
              <p className="mt-3 text-3xl font-bold text-[#151413]">
                ₦
                {Number(summary?.grossCommission2Percent || 0).toLocaleString()}
              </p>
              <p className="mt-1.5 text-[11px] text-[#76726E]">
                Across {summary?.paidOrdersCount || 0} paid orders
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-[#EAE8E4] shadow-xs">
              <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-[#76726E]">
                <span>Monnify Gateway Share (1.5%)</span>
                <LuLandmark className="w-4 h-4 text-amber-600" />
              </div>
              <p className="mt-3 text-3xl font-bold text-[#151413]">
                ₦{Number(summary?.monnifyFee15Percent || 0).toLocaleString()}
              </p>
              <p className="mt-1.5 text-[11px] text-[#76726E]">
                75% of 2% fee allocated to payment processing
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-[#EAE8E4] shadow-xs">
              <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-[#76726E]">
                <span>Gross Customer Volume</span>
                <LuWallet className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="mt-3 text-3xl font-bold text-emerald-700">
                ₦{Number(summary?.grossCustomerVolume || 0).toLocaleString()}
              </p>
              <p className="mt-1.5 text-[11px] text-[#76726E]">
                Base GMV: ₦
                {Number(summary?.productBaseGmv || 0).toLocaleString()} •
                Shipping: ₦
                {Number(summary?.totalShippingCollected || 0).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Secondary Escrow & Vendor Payout Flow Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-xl border border-[#EAE8E4] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#76726E]">
                  Active Escrow Held
                </span>
                <p className="text-xl font-bold text-amber-700 mt-1">
                  ₦{Number(summary?.escrowHeldTotal || 0).toLocaleString()}
                </p>
              </div>
              <LuClock className="w-5 h-5 text-amber-500" />
            </div>

            <div className="bg-white p-5 rounded-xl border border-[#EAE8E4] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#76726E]">
                  Released to Vendor Wallets
                </span>
                <p className="text-xl font-bold text-[#151413] mt-1">
                  ₦
                  {Number(
                    summary?.releasedToVendorsTotal || 0,
                  ).toLocaleString()}
                </p>
              </div>
              <LuCircleCheck className="w-5 h-5 text-emerald-600" />
            </div>

            <div className="bg-white p-5 rounded-xl border border-[#EAE8E4] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#76726E]">
                  Disbursed Bank Payouts (
                  {summary?.disbursedWithdrawalsCount || 0})
                </span>
                <p className="text-xl font-bold text-[#151413] mt-1">
                  ₦
                  {Number(
                    summary?.totalDisbursedWithdrawals || 0,
                  ).toLocaleString()}
                </p>
              </div>
              <LuArrowUpRight className="w-5 h-5 text-[#C4956A]" />
            </div>
          </div>

          {/* Basic Financial Analysis: Monthly Trend & Top Vendors by Net Profit */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 6-Month Commission & Profit Breakdown */}
            <div className="bg-white p-6 rounded-xl border border-[#EAE8E4] flex flex-col gap-4">
              <div>
                <h2 className="font-heading text-sm font-bold uppercase tracking-wider text-[#151413]">
                  Monthly Commission &amp; Net Profit (Last 6 Months)
                </h2>
                <p className="text-xs text-[#76726E] mt-0.5">
                  Comparison of 2% gross fee vs. 0.5% retained platform profit
                </p>
              </div>

              {!data?.monthlyBreakdown?.length ? (
                <p className="py-10 text-center text-xs text-[#76726E]">
                  No paid order history available yet.
                </p>
              ) : (
                <div className="flex flex-col gap-3">
                  {data.monthlyBreakdown.map((m) => {
                    const widthPct = Math.max(
                      6,
                      Math.round(
                        (m.grossCommission2Percent / maxMonthlyCommission) *
                          100,
                      ),
                    );
                    return (
                      <div
                        key={m.month}
                        className="flex flex-col gap-1 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-[#151413]">
                            {m.month} ({m.orderCount} orders)
                          </span>
                          <span className="text-[#76726E]">
                            2% Fee:{" "}
                            <strong className="text-[#151413]">
                              ₦{m.grossCommission2Percent.toLocaleString()}
                            </strong>{" "}
                            • Net 0.5%:{" "}
                            <strong className="text-emerald-700">
                              ₦{m.netProfit05Percent.toLocaleString()}
                            </strong>
                          </span>
                        </div>
                        <div className="w-full h-2.5 bg-[#FAF9F6] rounded-full overflow-hidden border border-[#EAE8E4]">
                          <div
                            className="h-full bg-[#C4956A] rounded-full"
                            style={{ width: `${widthPct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Top Vendors Generating Platform Profit */}
            <div className="bg-white p-6 rounded-xl border border-[#EAE8E4] flex flex-col gap-4">
              <div>
                <h2 className="font-heading text-sm font-bold uppercase tracking-wider text-[#151413]">
                  Top Vendors by Net Platform Profit
                </h2>
                <p className="text-xs text-[#76726E] mt-0.5">
                  Click a storefront to inspect its dedicated payout ledger
                </p>
              </div>

              {!data?.topVendorsByProfit?.length ? (
                <p className="py-10 text-center text-xs text-[#76726E]">
                  No vendor transaction data yet.
                </p>
              ) : (
                <div className="divide-y divide-[#EAE8E4] text-xs">
                  {data.topVendorsByProfit.map((v, index) => (
                    <div
                      key={v.vendorId || `${v.storeName}-${index}`}
                      className="py-3 flex items-center justify-between gap-3"
                    >
                      <div>
                        {v.vendorId ? (
                          <Link
                            href={`/admin/vendors/${v.vendorId}/transactions`}
                            className="font-bold text-[#151413] hover:text-[#C4956A] hover:underline"
                          >
                            {v.storeName}
                          </Link>
                        ) : (
                          <span className="font-bold text-[#76726E]">
                            {v.storeName}
                          </span>
                        )}
                        <p className="text-[11px] text-[#76726E]">
                          {v.orderCount} orders • GMV: ₦
                          {v.grossVolume.toLocaleString()}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="font-bold text-emerald-700">
                          +₦{v.netProfit05Percent.toLocaleString()} net
                        </p>
                        <p className="text-[10px] text-[#76726E]">
                          2% Gross: ₦
                          {v.grossCommission2Percent.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Search, Filter Tabs & Paginated Platform Ledger */}
          <div className="bg-white rounded-xl border border-[#EAE8E4] overflow-hidden shadow-xs">
            <div className="p-5 border-b border-[#EAE8E4] flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <form
                  onSubmit={handleSearchSubmit}
                  className="relative flex-1 max-w-md flex gap-2"
                >
                  <div className="relative flex-1">
                    <LuSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A39E98]" />
                    <input
                      type="text"
                      placeholder="Search order ID, payout ref, store, or email..."
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      className="w-full pl-9 pr-8 py-2 bg-[#FAF9F6] border border-[#EAE8E4] rounded-md text-xs focus:outline-hidden focus:border-[#C4956A]"
                    />
                    {searchInput && (
                      <button
                        type="button"
                        onClick={() => setSearchInput("")}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#76726E] hover:text-[#151413]"
                      >
                        <LuX className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#151413] text-white text-xs font-bold uppercase tracking-wider rounded-md hover:bg-[#2A2725] cursor-pointer"
                  >
                    Search
                  </button>
                </form>

                {(vendorFilter || appliedSearch) && (
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className="text-xs font-bold text-rose-600 hover:underline self-start sm:self-auto cursor-pointer"
                  >
                    Clear Active Filters
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-1.5 pt-2 border-t border-[#EAE8E4]">
                {TABS.map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => handleTabChange(t.key)}
                    className={`px-3.5 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                      tab === t.key
                        ? "bg-[#151413] text-white"
                        : "bg-[#FAF9F6] text-[#76726E] border border-[#EAE8E4] hover:text-[#151413]"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div
              className={`overflow-x-auto ${
                fetching ? "opacity-60 pointer-events-none" : ""
              }`}
            >
              {!data?.items?.length ? (
                <p className="p-12 text-center text-xs text-[#76726E]">
                  No transactions match your current filter.
                </p>
              ) : tab === "WITHDRAWALS" ? (
                <table className="w-full text-left border-collapse min-w-200">
                  <thead>
                    <tr className="bg-[#FAF9F6] border-b border-[#EAE8E4] text-[10px] font-bold uppercase tracking-[0.15em] text-[#76726E]">
                      <th className="py-3.5 px-4">REFERENCE</th>
                      <th className="py-3.5 px-4">VENDOR</th>
                      <th className="py-3.5 px-4">DESTINATION BANK</th>
                      <th className="py-3.5 px-4">AMOUNT</th>
                      <th className="py-3.5 px-4">STATUS</th>
                      <th className="py-3.5 px-4 text-right">DATE</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EAE8E4] text-xs">
                    {data.items.map((item) => {
                      if (item.type !== "WITHDRAWAL") return null;
                      return (
                        <tr key={item.id} className="hover:bg-[#FAF9F6]/60">
                          <td className="py-3.5 px-4 font-mono font-bold">
                            {item.reference}
                          </td>
                          <td className="py-3.5 px-4">
                            <Link
                              href={`/admin/vendors/${item.vendorId}/transactions`}
                              className="font-bold text-[#151413] hover:text-[#C4956A] hover:underline"
                            >
                              {item.vendorStoreName}
                            </Link>
                          </td>
                          <td className="py-3.5 px-4 text-[#76726E]">
                            {item.bankName} • {item.accountNumber} (
                            {item.accountName})
                          </td>
                          <td className="py-3.5 px-4 font-bold">
                            ₦{item.amount.toLocaleString()}
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                                item.status === "SUCCESS"
                                  ? "bg-emerald-50 text-emerald-700"
                                  : item.status === "FAILED"
                                    ? "bg-rose-50 text-rose-700"
                                    : "bg-amber-50 text-amber-700"
                              }`}
                            >
                              {item.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right text-[#76726E]">
                            {new Date(item.createdAt).toLocaleString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <table className="w-full text-left border-collapse min-w-235">
                  <thead>
                    <tr className="bg-[#FAF9F6] border-b border-[#EAE8E4] text-[10px] font-bold uppercase tracking-[0.15em] text-[#76726E]">
                      <th className="py-3.5 px-4">ORDER</th>
                      <th className="py-3.5 px-4">VENDOR</th>
                      <th className="py-3.5 px-4">CUSTOMER PAID</th>
                      <th className="py-3.5 px-4">VENDOR SHARE</th>
                      <th className="py-3.5 px-4">2% MARKUP</th>
                      <th className="py-3.5 px-4">MONNIFY (1.5%)</th>
                      <th className="py-3.5 px-4">NET PROFIT (0.5%)</th>
                      <th className="py-3.5 px-4">STATUS</th>
                      <th className="py-3.5 px-4 text-right">DATE</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EAE8E4] text-xs">
                    {data.items.map((item) => {
                      if (item.type !== "ORDER") return null;
                      return (
                        <tr key={item.id} className="hover:bg-[#FAF9F6]/60">
                          <td className="py-3.5 px-4 font-mono font-bold">
                            #{item.id.slice(0, 8).toUpperCase()}
                          </td>
                          <td className="py-3.5 px-4">
                            {item.vendorId ? (
                              <Link
                                href={`/admin/vendors/${item.vendorId}/transactions`}
                                className="font-bold text-[#151413] hover:text-[#C4956A] hover:underline"
                              >
                                {item.vendorStoreName}
                              </Link>
                            ) : (
                              <span className="text-[#76726E]">
                                {item.vendorStoreName}
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 font-semibold">
                            ₦{item.totalAmount.toLocaleString()}
                          </td>
                          <td className="py-3.5 px-4 text-[#76726E]">
                            ₦{item.vendorPayoutAmount.toLocaleString()}
                          </td>
                          <td className="py-3.5 px-4 font-semibold">
                            ₦{item.grossCommission2Percent.toLocaleString()}
                          </td>
                          <td className="py-3.5 px-4 text-amber-700">
                            ₦{item.monnifyFee15Percent.toLocaleString()}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-emerald-700">
                            +₦{item.netProfit05Percent.toLocaleString()}
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                                item.status === "DELIVERED"
                                  ? "bg-emerald-50 text-emerald-700"
                                  : item.status === "DISPUTED"
                                    ? "bg-rose-50 text-rose-700"
                                    : "bg-amber-50 text-amber-700"
                              }`}
                            >
                              {item.status.replace("_", " ")}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right text-[#76726E]">
                            {new Date(item.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination Footer */}
            {data && data.pagination.totalPages > 1 && (
              <div className="px-6 py-3.5 bg-[#FAF9F6] border-t border-[#EAE8E4] flex items-center justify-between text-xs">
                <span className="text-[#76726E]">
                  Page <strong>{data.pagination.page}</strong> of{" "}
                  <strong>{data.pagination.totalPages}</strong> (
                  {data.pagination.total} records)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={data.pagination.page <= 1 || fetching}
                    onClick={() => handlePageChange(data.pagination.page - 1)}
                    className="px-3 py-1.5 bg-white border border-[#EAE8E4] rounded-md font-bold uppercase tracking-wider text-[11px] hover:border-[#C4956A] disabled:opacity-40 cursor-pointer flex items-center gap-1"
                  >
                    <LuChevronLeft className="w-3.5 h-3.5" /> Prev
                  </button>
                  <button
                    type="button"
                    disabled={
                      data.pagination.page >= data.pagination.totalPages ||
                      fetching
                    }
                    onClick={() => handlePageChange(data.pagination.page + 1)}
                    className="px-3 py-1.5 bg-white border border-[#EAE8E4] rounded-md font-bold uppercase tracking-wider text-[11px] hover:border-[#C4956A] disabled:opacity-40 cursor-pointer flex items-center gap-1"
                  >
                    Next <LuChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default function AdminPlatformTransactionsPage() {
  return (
    <Suspense fallback={null}>
      <AdminPlatformTransactionsContent />
    </Suspense>
  );
}
