"use client";

import { LuChevronLeft, LuChevronRight } from "react-icons/lu";
import {
  VendorWalletResponse,
  WalletLedgerPagination,
} from "@/lib/api/vendor-api";

export type WalletLedgerTab = "pending" | "released" | "withdrawals";

interface WalletLedgerTabsProps {
  activeTab: WalletLedgerTab;
  onTabChange: (tab: WalletLedgerTab) => void;
  pendingTransactions: VendorWalletResponse["pendingTransactions"];
  releasedTransactions: VendorWalletResponse["releasedTransactions"];
  withdrawals: VendorWalletResponse["withdrawals"];
  pagination?: WalletLedgerPagination;
  onPageChange?: (tab: WalletLedgerTab, page: number) => void;
  loading?: boolean;
}

export default function WalletLedgerTabs({
  activeTab,
  onTabChange,
  pendingTransactions = [],
  releasedTransactions = [],
  withdrawals = [],
  pagination,
  onPageChange,
  loading = false,
}: WalletLedgerTabsProps) {
  const pendingCount = pagination?.pending.total ?? pendingTransactions.length;
  const releasedCount =
    pagination?.released.total ?? releasedTransactions.length;
  const withdrawalsCount = pagination?.withdrawals.total ?? withdrawals.length;

  const activeMeta = pagination?.[activeTab];

  return (
    <div className="bg-white rounded-xl border border-[#EAE8E4] overflow-hidden">
      <div className="px-6 py-4 border-b border-[#EAE8E4] flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onTabChange("pending")}
            className={`px-3.5 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider cursor-pointer ${
              activeTab === "pending"
                ? "bg-[#151413] text-white"
                : "bg-[#FAF9F6] text-[#76726E] hover:text-[#151413]"
            }`}
          >
            Pending Escrow ({pendingCount})
          </button>

          <button
            type="button"
            onClick={() => onTabChange("released")}
            className={`px-3.5 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider cursor-pointer ${
              activeTab === "released"
                ? "bg-[#151413] text-white"
                : "bg-[#FAF9F6] text-[#76726E] hover:text-[#151413]"
            }`}
          >
            Confirmed Earnings ({releasedCount})
          </button>

          <button
            type="button"
            onClick={() => onTabChange("withdrawals")}
            className={`px-3.5 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider cursor-pointer ${
              activeTab === "withdrawals"
                ? "bg-[#151413] text-white"
                : "bg-[#FAF9F6] text-[#76726E] hover:text-[#151413]"
            }`}
          >
            Payout History ({withdrawalsCount})
          </button>
        </div>

        {activeMeta && activeMeta.totalPages > 1 && (
          <span className="text-[11px] font-mono text-[#76726E]">
            Page {activeMeta.page} of {activeMeta.totalPages}
          </span>
        )}
      </div>

      <div className={loading ? "opacity-60 pointer-events-none" : ""}>
        {activeTab === "pending" && (
          <div className="divide-y divide-[#EAE8E4] text-xs">
            {pendingTransactions.length === 0 ? (
              <p className="p-8 text-center text-[#76726E]">
                No funds currently held in escrow.
              </p>
            ) : (
              pendingTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="px-6 py-4 flex items-center justify-between gap-4"
                >
                  <div>
                    <p className="font-mono font-bold">
                      Order #{tx.id.slice(0, 8).toUpperCase()}
                    </p>
                    <p className="text-[#76726E] mt-0.5">
                      {new Date(tx.createdAt).toLocaleDateString()} • Shipping:
                      ₦{tx.shippingFee.toLocaleString()} • Paid: ₦
                      {tx.totalAmount.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-amber-700">
                      +₦{tx.vendorPayoutAmount.toLocaleString()}
                    </p>
                    <span className="text-[10px] font-bold uppercase text-[#C4956A]">
                      {tx.status.replace("_", " ")}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "released" && (
          <div className="divide-y divide-[#EAE8E4] text-xs">
            {releasedTransactions.length === 0 ? (
              <p className="p-8 text-center text-[#76726E]">
                No confirmed earnings yet.
              </p>
            ) : (
              releasedTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="px-6 py-4 flex items-center justify-between gap-4"
                >
                  <div>
                    <p className="font-mono font-bold">
                      Order #{tx.id.slice(0, 8).toUpperCase()}
                    </p>
                    <p className="text-[#76726E] mt-0.5">
                      Confirmed{" "}
                      {tx.confirmedAt
                        ? new Date(tx.confirmedAt).toLocaleDateString()
                        : new Date(tx.createdAt).toLocaleDateString()}{" "}
                      • Paid: ₦{tx.totalAmount.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-emerald-700">
                      +₦{tx.vendorPayoutAmount.toLocaleString()}
                    </p>
                    <span className="text-[10px] font-bold uppercase text-emerald-600">
                      RELEASED
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "withdrawals" && (
          <div className="divide-y divide-[#EAE8E4] text-xs">
            {withdrawals.length === 0 ? (
              <p className="p-8 text-center text-[#76726E]">
                No bank payouts requested yet.
              </p>
            ) : (
              withdrawals.map((w) => (
                <div
                  key={w.id}
                  className="px-6 py-4 flex items-center justify-between gap-4"
                >
                  <div>
                    <p className="font-mono font-bold">{w.reference}</p>
                    <p className="text-[#76726E] mt-0.5">
                      {w.bankName} ({w.accountNumber}) •{" "}
                      {new Date(w.createdAt).toLocaleString()}
                    </p>
                    {w.failureReason && (
                      <p className="text-rose-600 mt-0.5">{w.failureReason}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-bold">
                      ₦{Number(w.amount).toLocaleString()}
                    </p>
                    <span
                      className={`text-[10px] font-bold uppercase ${
                        w.status === "SUCCESS"
                          ? "text-emerald-600"
                          : w.status === "FAILED"
                            ? "text-rose-600"
                            : "text-amber-600"
                      }`}
                    >
                      {w.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Pagination Footer */}
      {activeMeta && activeMeta.totalPages > 1 && onPageChange && (
        <div className="px-6 py-3.5 bg-[#FAF9F6] border-t border-[#EAE8E4] flex items-center justify-between text-xs">
          <span className="text-[#76726E]">
            Showing page <strong>{activeMeta.page}</strong> of{" "}
            <strong>{activeMeta.totalPages}</strong> ({activeMeta.total} total)
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={activeMeta.page <= 1 || loading}
              onClick={() => onPageChange(activeTab, activeMeta.page - 1)}
              className="px-3 py-1.5 bg-white border border-[#EAE8E4] rounded-md font-bold uppercase tracking-wider text-[11px] hover:border-[#C4956A] disabled:opacity-40 cursor-pointer flex items-center gap-1"
            >
              <LuChevronLeft className="w-3.5 h-3.5" /> Prev
            </button>
            <button
              type="button"
              disabled={activeMeta.page >= activeMeta.totalPages || loading}
              onClick={() => onPageChange(activeTab, activeMeta.page + 1)}
              className="px-3 py-1.5 bg-white border border-[#EAE8E4] rounded-md font-bold uppercase tracking-wider text-[11px] hover:border-[#C4956A] disabled:opacity-40 cursor-pointer flex items-center gap-1"
            >
              Next <LuChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
