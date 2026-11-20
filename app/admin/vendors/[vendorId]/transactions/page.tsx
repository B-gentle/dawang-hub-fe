"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  LuArrowLeft,
  LuWallet,
  LuClock,
  LuCircleCheck,
  LuBuilding2,
  LuRefreshCw,
  LuShieldCheck,
  LuExternalLink,
  LuChartBar,
} from "react-icons/lu";
import { toast } from "sonner";
import {
  vendorApi,
  VendorWalletResponse,
  VendorWalletLedgerQuery,
} from "@/lib/api/vendor-api";
import WalletLedgerTabs, {
  WalletLedgerTab,
} from "@/components/vendor/WalletLedgerTabs";

export default function AdminVendorTransactionsPage() {
  const params = useParams<{ vendorId: string }>();
  const vendorId = params.vendorId;

  const [wallet, setWallet] = useState<VendorWalletResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<WalletLedgerTab>("pending");

  const [pages, setPages] = useState<Required<VendorWalletLedgerQuery>>({
    pendingPage: 1,
    releasedPage: 1,
    withdrawalsPage: 1,
    limit: 15,
  });

  const loadVendorWallet = useCallback(
    async (query: VendorWalletLedgerQuery, isInitial = false) => {
      if (!vendorId) return;
      try {
        if (isInitial) {
          setLoading(true);
        } else {
          setPageLoading(true);
        }
        const data = await vendorApi.getVendorWalletAdmin(vendorId, query);
        setWallet(data);
      } catch (err) {
        toast.error(
          err instanceof Error
            ? err.message
            : "Failed to load vendor transactions",
        );
      } finally {
        setLoading(false);
        setPageLoading(false);
      }
    },
    [vendorId],
  );

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (active) {
        loadVendorWallet(pages, true);
      }
    });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vendorId]);

  const handlePageChange = (tab: WalletLedgerTab, nextPage: number) => {
    const updated: Required<VendorWalletLedgerQuery> = {
      ...pages,
      ...(tab === "pending" ? { pendingPage: nextPage } : {}),
      ...(tab === "released" ? { releasedPage: nextPage } : {}),
      ...(tab === "withdrawals" ? { withdrawalsPage: nextPage } : {}),
    };
    setPages(updated);
    loadVendorWallet(updated, false);
  };

  if (loading && !wallet) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-2 text-xs text-[#76726E]">
        <LuRefreshCw className="w-6 h-6 animate-spin text-[#C4956A]" />
        Loading vendor escrow &amp; payout ledger...
      </div>
    );
  }

  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "globexmall.com";
  const kyc = wallet?.kycStatus;

  return (
    <div className="flex flex-col gap-8 font-sans pb-12 text-[#151413]">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/admin/vendors"
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#76726E] hover:text-[#151413] mb-2"
          >
            <LuArrowLeft className="w-3.5 h-3.5" /> Back to Vendors
          </Link>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="font-heading text-3xl font-bold text-[#151413]">
              {wallet?.vendor?.storeName || "Vendor"} — Ledger &amp; Payouts
            </h1>
            {wallet?.vendor?.slug && (
              <a
                href={`https://${wallet.vendor.slug}.${rootDomain}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-mono text-[#C4956A] hover:underline inline-flex items-center gap-1"
              >
                {wallet.vendor.slug}.{rootDomain}
                <LuExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
          <p className="text-sm text-[#76726E] mt-1">
            Read-only admin audit of escrow funds, confirmed order releases, and
            Monnify bank disbursements
            {wallet?.vendor?.ownerEmail ? ` (${wallet.vendor.ownerEmail})` : ""}
            .
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Link
            href={`/admin/transactions?vendorId=${vendorId}`}
            className="px-4 py-2.5 bg-white border border-[#EAE8E4] text-xs font-bold uppercase tracking-wider rounded-md hover:border-[#C4956A] flex items-center gap-2"
          >
            <LuChartBar className="w-3.5 h-3.5 text-[#C4956A]" /> Commission
            Analysis
          </Link>
          <button
            type="button"
            onClick={() => loadVendorWallet(pages, false)}
            className="px-4 py-2.5 bg-[#151413] text-white text-xs font-bold uppercase tracking-wider rounded-md hover:bg-[#2A2725] flex items-center gap-2 cursor-pointer"
          >
            <LuRefreshCw
              className={`w-3.5 h-3.5 text-[#C4956A] ${
                pageLoading ? "animate-spin" : ""
              }`}
            />
            Refresh
          </button>
        </div>
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
            Available for vendor bank withdrawal
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
            Awaiting customer confirmation or 24h auto-release
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
            Lifetime bank payouts disbursed
          </p>
        </div>
      </div>

      {/* Settlement Bank Account & KYC Compliance Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-xl border border-[#EAE8E4] flex items-start gap-3">
          <div className="p-2.5 rounded-lg bg-[#FAF9F6] border border-[#EAE8E4]">
            <LuBuilding2 className="w-5 h-5 text-[#C4956A]" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#76726E]">
              Registered Settlement Account
            </p>
            <p className="text-sm font-bold text-[#151413] mt-1">
              {wallet?.bankAccount.accountName || "Not Configured"}
            </p>
            <p className="text-xs text-[#76726E] font-mono mt-0.5">
              {wallet?.bankAccount.bankName || "—"} •{" "}
              {wallet?.bankAccount.accountNumber || "—"}
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#EAE8E4] flex items-start gap-3">
          <div className="p-2.5 rounded-lg bg-[#FAF9F6] border border-[#EAE8E4]">
            <LuShieldCheck className="w-5 h-5 text-[#C4956A]" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#76726E]">
              Payout KYC Compliance Status
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              <span
                className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                  kyc?.bvnVerified
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-stone-100 text-[#76726E]"
                }`}
              >
                Tier 1 BVN:{" "}
                {kyc?.bvnVerified
                  ? `Verified (••••${kyc.bvnLast4})`
                  : "Unverified"}
              </span>
              <span
                className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                  kyc?.ninVerified
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-stone-100 text-[#76726E]"
                }`}
              >
                Tier 2 NIN:{" "}
                {kyc?.ninVerified
                  ? `Verified (••••${kyc.ninLast4})`
                  : "Unverified"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Paginated Ledger Tabs */}
      <WalletLedgerTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        pendingTransactions={wallet?.pendingTransactions || []}
        releasedTransactions={wallet?.releasedTransactions || []}
        withdrawals={wallet?.withdrawals || []}
        pagination={wallet?.pagination}
        onPageChange={handlePageChange}
        loading={pageLoading}
      />
    </div>
  );
}
