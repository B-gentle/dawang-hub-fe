"use client";

import { useState } from "react";
import Link from "next/link";
import { LuLock, LuShieldCheck } from "react-icons/lu";
import { toast } from "sonner";
import { vendorApi, VendorWalletResponse } from "@/lib/api/vendor-api";

interface VendorKycVerificationCardProps {
  kycStatus?: VendorWalletResponse["kycStatus"];
  bankAccountName?: string;
  threshold: number;
  onVerificationSuccess: () => Promise<void> | void;
}

export default function VendorKycVerificationCard({
  kycStatus,
  bankAccountName,
  threshold,
  onVerificationSuccess,
}: VendorKycVerificationCardProps) {
  const [bvnInput, setBvnInput] = useState("");
  const [bvnConsent, setBvnConsent] = useState(false);
  const [verifyingBvn, setVerifyingBvn] = useState(false);

  const [ninInput, setNinInput] = useState("");
  const [ninConsent, setNinConsent] = useState(false);
  const [verifyingNin, setVerifyingNin] = useState(false);

  const handleVerifyBvn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{11}$/.test(bvnInput.trim())) {
      toast.error("Please enter a valid 11-digit BVN");
      return;
    }
    if (!bvnConsent) {
      toast.error(
        "Please accept the NDPA Data Protection & KYC Consent notice",
      );
      return;
    }

    try {
      setVerifyingBvn(true);
      await vendorApi.verifyMyBvn(bvnInput.trim(), true);
      toast.success("BVN verified and securely stored");
      setBvnInput("");
      await onVerificationSuccess();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "BVN verification failed",
      );
    } finally {
      setVerifyingBvn(false);
    }
  };

  const handleVerifyNin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{11}$/.test(ninInput.trim())) {
      toast.error("Please enter a valid 11-digit NIN");
      return;
    }
    if (!ninConsent) {
      toast.error(
        "Please accept the NDPA Data Protection & KYC Consent notice",
      );
      return;
    }

    try {
      setVerifyingNin(true);
      await vendorApi.verifyMyNin(ninInput.trim(), true);
      toast.success("NIN verified and securely stored");
      setNinInput("");
      await onVerificationSuccess();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "NIN verification failed",
      );
    } finally {
      setVerifyingNin(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-[#EAE8E4] flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#EAE8E4]">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#C4956A] flex items-center gap-1.5">
            <LuLock className="w-3.5 h-3.5" /> NDPA-PROTECTED IDENTITY
            COMPLIANCE
          </span>
          <h2 className="font-heading text-lg font-bold text-[#151413] mt-0.5">
            Tiered Payout KYC Verification
          </h2>
          <p className="text-xs text-[#76726E] mt-0.5">
            Your BVN and NIN are verified against your settlement bank account
            and encrypted in compliance with the{" "}
            <Link
              href="/privacy"
              target="_blank"
              className="underline font-semibold text-[#151413] hover:text-[#C4956A]"
            >
              Nigeria Data Protection Act (NDPA)
            </Link>
            .
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tier 1: BVN (<= Threshold) */}
        <div className="p-5 rounded-xl bg-[#FAF9F6] border border-[#EAE8E4] flex flex-col justify-between gap-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#C4956A]">
                TIER 1 • WITHDRAWALS UP TO ₦{threshold.toLocaleString()}
              </span>
              <h3 className="text-sm font-bold text-[#151413] mt-0.5">
                Bank Verification Number (BVN)
              </h3>
            </div>
            {kycStatus?.bvnVerified ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <LuShieldCheck className="w-3.5 h-3.5" /> Verified (••••{" "}
                {kycStatus.bvnLast4})
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                Required
              </span>
            )}
          </div>

          {kycStatus?.bvnVerified ? (
            <p className="text-xs text-[#76726E]">
              BVN ending in <strong>{kycStatus.bvnLast4}</strong> is verified
              and matched with{" "}
              <strong>{bankAccountName || "your settlement account"}</strong>.
              You are cleared for payouts up to ₦{threshold.toLocaleString()}.
            </p>
          ) : (
            <form onSubmit={handleVerifyBvn} className="flex flex-col gap-3">
              <input
                type="text"
                inputMode="numeric"
                maxLength={11}
                placeholder="Enter 11-digit BVN"
                value={bvnInput}
                onChange={(e) =>
                  setBvnInput(e.target.value.replace(/\D/g, "").slice(0, 11))
                }
                className="w-full px-3.5 py-2.5 bg-white border border-[#EAE8E4] rounded-md text-xs font-mono font-bold focus:outline-hidden focus:border-[#C4956A]"
              />

              <label className="flex items-start gap-2 text-[11px] text-[#76726E] cursor-pointer">
                <input
                  type="checkbox"
                  checked={bvnConsent}
                  onChange={(e) => setBvnConsent(e.target.checked)}
                  className="mt-0.5 accent-[#C4956A]"
                />
                <span>
                  I consent to the secure collection and verification of my BVN
                  for CBN/NDPA anti-fraud payout compliance as outlined in the{" "}
                  <Link
                    href="/privacy"
                    target="_blank"
                    className="underline text-[#151413] font-semibold"
                  >
                    Privacy Policy
                  </Link>
                  .
                </span>
              </label>

              <button
                type="submit"
                disabled={verifyingBvn || bvnInput.length !== 11 || !bvnConsent}
                className="w-full py-2.5 bg-[#151413] text-white text-xs font-bold uppercase tracking-wider rounded-md hover:bg-[#2A2725] transition-colors cursor-pointer disabled:bg-[#A39E98] disabled:cursor-not-allowed"
              >
                {verifyingBvn ? "Verifying BVN..." : "Verify BVN"}
              </button>
            </form>
          )}
        </div>

        {/* Tier 2: NIN (> Threshold) */}
        <div className="p-5 rounded-xl bg-[#FAF9F6] border border-[#EAE8E4] flex flex-col justify-between gap-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#C4956A]">
                TIER 2 • WITHDRAWALS ABOVE ₦{threshold.toLocaleString()}
              </span>
              <h3 className="text-sm font-bold text-[#151413] mt-0.5">
                National Identification Number (NIN)
              </h3>
            </div>
            {kycStatus?.ninVerified ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <LuShieldCheck className="w-3.5 h-3.5" /> Verified (••••{" "}
                {kycStatus.ninLast4})
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-stone-100 text-[#76726E] border border-[#EAE8E4]">
                Required &gt; ₦{threshold.toLocaleString()}
              </span>
            )}
          </div>

          {kycStatus?.ninVerified ? (
            <p className="text-xs text-[#76726E]">
              NIN ending in <strong>{kycStatus.ninLast4}</strong> is verified
              and matched with{" "}
              <strong>{bankAccountName || "your settlement account"}</strong>.
              You are cleared for unlimited payout amounts.
            </p>
          ) : (
            <form onSubmit={handleVerifyNin} className="flex flex-col gap-3">
              <input
                type="text"
                inputMode="numeric"
                maxLength={11}
                placeholder="Enter 11-digit NIN"
                value={ninInput}
                onChange={(e) =>
                  setNinInput(e.target.value.replace(/\D/g, "").slice(0, 11))
                }
                className="w-full px-3.5 py-2.5 bg-white border border-[#EAE8E4] rounded-md text-xs font-mono font-bold focus:outline-hidden focus:border-[#C4956A]"
              />

              <label className="flex items-start gap-2 text-[11px] text-[#76726E] cursor-pointer">
                <input
                  type="checkbox"
                  checked={ninConsent}
                  onChange={(e) => setNinConsent(e.target.checked)}
                  className="mt-0.5 accent-[#C4956A]"
                />
                <span>
                  I consent to the secure collection and verification of my NIN
                  for high-value payout compliance under the{" "}
                  <Link
                    href="/privacy"
                    target="_blank"
                    className="underline text-[#151413] font-semibold"
                  >
                    Privacy Policy
                  </Link>
                  .
                </span>
              </label>

              <button
                type="submit"
                disabled={verifyingNin || ninInput.length !== 11 || !ninConsent}
                className="w-full py-2.5 bg-[#151413] text-white text-xs font-bold uppercase tracking-wider rounded-md hover:bg-[#2A2725] transition-colors cursor-pointer disabled:bg-[#A39E98] disabled:cursor-not-allowed"
              >
                {verifyingNin ? "Verifying NIN..." : "Verify NIN"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
