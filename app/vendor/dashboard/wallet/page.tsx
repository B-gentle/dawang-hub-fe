"use client";

import { useEffect, useState } from "react";
import {
  LuWallet,
  LuClock,
  LuCircleCheck,
  LuArrowUpRight,
  LuBuilding2,
  LuRefreshCw,
  LuCircleAlert,
} from "react-icons/lu";
import { toast } from "sonner";
import { vendorApi, VendorWalletResponse } from "@/lib/api/vendor-api";

export default function VendorWalletPage() {
  const [wallet, setWallet] = useState<VendorWalletResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "pending" | "released" | "withdrawals"
  >("pending");

  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawing, setWithdrawing] = useState(false);

  const loadWallet = async () => {
    try {
      setLoading(true);
      const data = await vendorApi.getMyWallet();
      setWallet(data);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to load wallet data",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (active) loadWallet();
    });
    return () => {
      active = false;
    };
  }, []);

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    const numeric = Number(withdrawAmount);
    if (!Number.isFinite(numeric) || numeric < 100) {
      toast.error("Minimum withdrawal amount is ₦100");
      return;
    }

    if (wallet && numeric > wallet.withdrawableBalance) {
      toast.error("Amount exceeds your withdrawable balance");
      return;
    }

    try {
      setWithdrawing(true);
      await vendorApi.requestWithdrawal(numeric);
      toast.success(
        `₦${numeric.toLocaleString()} payout initiated to ${wallet?.bankAccount.bankName}!`,
      );
      setWithdrawAmount("");
      setActiveTab("withdrawals");
      await loadWallet();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Withdrawal request failed",
      );
    } finally {
      setWithdrawing(false);
    }
  };

  if (loading && !wallet) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-2 text-xs text-[#76726E]">
        <LuRefreshCw className="w-6 h-6 animate-spin text-[#C4956A]" />
        Loading wallet & escrow ledger...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 font-sans pb-12 text-[#151413]">
      <div>
        <span className="text-xs font-bold tracking-[0.15em] uppercase text-[#C4956A]">
          FINANCES & ESCROW
        </span>
        <h1 className="font-heading text-3xl font-bold text-[#151413] mt-1">
          Wallet & Payouts
        </h1>
        <p className="text-sm text-[#76726E] mt-1">
          Track escrow funds held during delivery and withdraw confirmed
          earnings directly to your bank account.
        </p>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl border border-[#EAE8E4] shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#76726E]">
            <span>Withdrawable Balance</span>
            <LuWallet className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="mt-3 text-3xl font-bold text-emerald-700">
            ₦{Number(wallet?.withdrawableBalance || 0).toLocaleString()}
          </p>
          <p className="mt-1.5 text-[11px] text-[#76726E]">
            Confirmed orders ready for instant payout
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-[#EAE8E4] shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#76726E]">
            <span>Pending Escrow</span>
            <LuClock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="mt-3 text-3xl font-bold text-[#151413]">
            ₦{Number(wallet?.pendingBalance || 0).toLocaleString()}
          </p>
          <p className="mt-1.5 text-[11px] text-[#76726E]">
            Releases upon customer confirmation or 24h after delivery
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-[#EAE8E4] shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#76726E]">
            <span>Total Withdrawn</span>
            <LuCircleCheck className="w-4 h-4 text-[#C4956A]" />
          </div>
          <p className="mt-3 text-3xl font-bold text-[#151413]">
            ₦{Number(wallet?.totalWithdrawn || 0).toLocaleString()}
          </p>
          <p className="mt-1.5 text-[11px] text-[#76726E]">
            Lifetime payouts transferred to your bank
          </p>
        </div>
      </div>

      {/* Payout Action & Destination Bank Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-[#EAE8E4] flex flex-col justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-[#FAF9F6] border border-[#EAE8E4]">
              <LuBuilding2 className="w-5 h-5 text-[#C4956A]" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#76726E]">
                Verified Settlement Account
              </p>
              <p className="text-sm font-bold text-[#151413] mt-1">
                {wallet?.bankAccount.accountName || "Not Configured"}
              </p>
              <p className="text-xs text-[#76726E] font-mono mt-0.5">
                {wallet?.bankAccount.bankName} •{" "}
                {wallet?.bankAccount.accountNumber}
              </p>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-[#FAF9F6] border border-[#EAE8E4] text-[11px] text-[#76726E] flex items-start gap-2">
            <LuCircleAlert className="w-4 h-4 text-[#C4956A] shrink-0 mt-0.5" />
            <span>
              You receive 100% of your listed base item price plus your
              configured state shipping fee.
            </span>
          </div>
        </div>

        <form
          onSubmit={handleWithdraw}
          className="lg:col-span-2 bg-white p-6 rounded-xl border border-[#EAE8E4] flex flex-col justify-between gap-4"
        >
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#151413]">
              Request Bank Payout
            </h2>
            <p className="text-xs text-[#76726E] mt-1">
              Enter the amount you want to transfer from your withdrawable
              balance.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
            <div className="flex-1 flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#76726E]">
                  Amount (₦)
                </label>
                {wallet && wallet.withdrawableBalance > 0 && (
                  <button
                    type="button"
                    onClick={() =>
                      setWithdrawAmount(String(wallet.withdrawableBalance))
                    }
                    className="text-[10px] font-bold text-[#C4956A] hover:underline uppercase cursor-pointer"
                  >
                    Withdraw Max (₦
                    {wallet.withdrawableBalance.toLocaleString()})
                  </button>
                )}
              </div>
              <input
                type="number"
                min={100}
                step="0.01"
                placeholder="e.g. 25000"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FAF9F6] border border-[#EAE8E4] rounded-md text-sm font-bold focus:outline-hidden focus:border-[#C4956A]"
              />
            </div>

            <button
              type="submit"
              disabled={
                withdrawing ||
                !wallet ||
                Number(wallet.withdrawableBalance) < 100
              }
              className="px-6 py-2.5 bg-[#151413] text-white text-xs font-bold uppercase tracking-wider rounded-md hover:bg-[#2A2725] transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:bg-[#A39E98] disabled:cursor-not-allowed"
            >
              {withdrawing ? "Processing..." : "Transfer to Bank"}
              <LuArrowUpRight className="w-4 h-4 text-[#C4956A]" />
            </button>
          </div>
        </form>
      </div>

      {/* Ledger Tabs */}
      <div className="bg-white rounded-xl border border-[#EAE8E4] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#EAE8E4] flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("pending")}
            className={`px-3.5 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider cursor-pointer ${
              activeTab === "pending"
                ? "bg-[#151413] text-white"
                : "bg-[#FAF9F6] text-[#76726E] hover:text-[#151413]"
            }`}
          >
            Pending Escrow ({wallet?.pendingTransactions.length || 0})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("released")}
            className={`px-3.5 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider cursor-pointer ${
              activeTab === "released"
                ? "bg-[#151413] text-white"
                : "bg-[#FAF9F6] text-[#76726E] hover:text-[#151413]"
            }`}
          >
            Confirmed Earnings ({wallet?.releasedTransactions.length || 0})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("withdrawals")}
            className={`px-3.5 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider cursor-pointer ${
              activeTab === "withdrawals"
                ? "bg-[#151413] text-white"
                : "bg-[#FAF9F6] text-[#76726E] hover:text-[#151413]"
            }`}
          >
            Payout History ({wallet?.withdrawals.length || 0})
          </button>
        </div>

        {activeTab === "pending" && (
          <div className="divide-y divide-[#EAE8E4] text-xs">
            {!wallet?.pendingTransactions.length ? (
              <p className="p-8 text-center text-[#76726E]">
                No funds currently held in escrow.
              </p>
            ) : (
              wallet.pendingTransactions.map((tx) => (
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
                      ₦{tx.shippingFee.toLocaleString()}
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
            {!wallet?.releasedTransactions.length ? (
              <p className="p-8 text-center text-[#76726E]">
                No confirmed earnings yet.
              </p>
            ) : (
              wallet.releasedTransactions.map((tx) => (
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
                        : new Date(tx.createdAt).toLocaleDateString()}
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
            {!wallet?.withdrawals.length ? (
              <p className="p-8 text-center text-[#76726E]">
                No bank payouts requested yet.
              </p>
            ) : (
              wallet.withdrawals.map((w) => (
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
    </div>
  );
}
