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
  LuShieldCheck,
} from "react-icons/lu";
import { toast } from "sonner";
import { vendorApi, VendorWalletResponse } from "@/lib/api/vendor-api";
import VendorKycVerificationCard from "@/components/vendor/VendorKycVerificationCard";
import WalletLedgerTabs, {
  WalletLedgerTab,
} from "@/components/vendor/WalletLedgerTabs";

const NIN_THRESHOLD_NGN = 50000;

export default function VendorWalletPage() {
  const [wallet, setWallet] = useState<VendorWalletResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<WalletLedgerTab>("pending");

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

  const kyc = wallet?.kycStatus;
  const threshold = kyc?.ninThresholdAmount ?? NIN_THRESHOLD_NGN;
  const numericAmount = Number(withdrawAmount) || 0;
  const requiresNin = numericAmount > threshold;
  const missingBvnForWithdrawal =
    numericAmount >= 100 && !requiresNin && !kyc?.bvnVerified;
  const missingNinForWithdrawal = requiresNin && !kyc?.ninVerified;

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

    if (numeric <= threshold && !kyc?.bvnVerified) {
      toast.error(
        `Complete Tier 1 BVN verification below before withdrawing up to ₦${threshold.toLocaleString()}`,
      );
      return;
    }

    if (numeric > threshold && !kyc?.ninVerified) {
      toast.error(
        `Complete Tier 2 NIN verification below before withdrawing above ₦${threshold.toLocaleString()}`,
      );
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
        Loading wallet &amp; escrow ledger...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 font-sans pb-12 text-[#151413]">
      <div>
        <span className="text-xs font-bold tracking-[0.15em] uppercase text-[#C4956A]">
          FINANCES &amp; ESCROW
        </span>
        <h1 className="font-heading text-3xl font-bold text-[#151413] mt-1">
          Wallet &amp; Payouts
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
              Withdrawals up to <strong>₦{threshold.toLocaleString()}</strong>{" "}
              require <strong>BVN verification</strong>. Withdrawals above{" "}
              <strong>₦{threshold.toLocaleString()}</strong> require{" "}
              <strong>NIN verification</strong>.
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
                Number(wallet.withdrawableBalance) < 100 ||
                missingBvnForWithdrawal ||
                missingNinForWithdrawal
              }
              className="px-6 py-2.5 bg-[#151413] text-white text-xs font-bold uppercase tracking-wider rounded-md hover:bg-[#2A2725] transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:bg-[#A39E98] disabled:cursor-not-allowed"
            >
              {withdrawing ? "Processing..." : "Transfer to Bank"}
              <LuArrowUpRight className="w-4 h-4 text-[#C4956A]" />
            </button>
          </div>

          {(missingBvnForWithdrawal || missingNinForWithdrawal) && (
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
              <LuShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
              <span>
                {missingNinForWithdrawal
                  ? `Withdrawals above ₦${threshold.toLocaleString()} require Tier 2 NIN Verification below.`
                  : `Withdrawals up to ₦${threshold.toLocaleString()} require Tier 1 BVN Verification below.`}
              </span>
            </div>
          )}
        </form>
      </div>

      {/* Tiered KYC Compliance Section */}
      <VendorKycVerificationCard
        kycStatus={wallet?.kycStatus}
        bankAccountName={wallet?.bankAccount.accountName}
        threshold={threshold}
        onVerificationSuccess={loadWallet}
      />

      {/* Escrow & Payout Ledger Tabs */}
      <WalletLedgerTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        pendingTransactions={wallet?.pendingTransactions || []}
        releasedTransactions={wallet?.releasedTransactions || []}
        withdrawals={wallet?.withdrawals || []}
      />
    </div>
  );
}
