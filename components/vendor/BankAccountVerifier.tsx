"use client";

import { useState, useEffect } from "react";
import { LuLandmark, LuRefreshCw, LuCheck } from "react-icons/lu";
import { toast } from "sonner";
import { paymentsApi, BankItem } from "@/lib/api/payments-api";

export interface BankAccountVerifierProps {
  bankCode: string;
  accountNumber: string;
  resolvedAccountName: string;
  onBankChange: (bankCode: string, bankName: string) => void;
  onAccountNumberChange: (accountNumber: string) => void;
  onResolvedAccountChange: (accountName: string) => void;
  onResolvingStateChange?: (isResolving: boolean) => void;
}

export function BankAccountVerifier({
  bankCode,
  accountNumber,
  resolvedAccountName,
  onBankChange,
  onAccountNumberChange,
  onResolvedAccountChange,
  onResolvingStateChange,
}: BankAccountVerifierProps) {
  const [banks, setBanks] = useState<BankItem[]>([]);
  const [loadingBanks, setLoadingBanks] = useState(true);
  const [resolving, setResolving] = useState(false);
  const [accountError, setAccountError] = useState("");

  useEffect(() => {
    let active = true;

    paymentsApi
      .getBanks()
      .then((list) => {
        if (!active) return;
        setBanks(list);
        if (list.length > 0 && !bankCode) {
          const defaultBank = list.find((b) => b.code === "058") || list[0];
          onBankChange(defaultBank.code, defaultBank.name);
        }
      })
      .catch(() => {
        if (active) toast.error("Could not load bank list");
      })
      .finally(() => {
        if (active) setLoadingBanks(false);
      });

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (accountNumber.length !== 10 || !bankCode) {
      return;
    }

    let active = true;
    const timer = setTimeout(async () => {
      try {
        setResolving(true);
        onResolvingStateChange?.(true);
        setAccountError("");
        onResolvedAccountChange("");

        const res = await paymentsApi.resolveAccount(accountNumber, bankCode);
        if (active) {
          onResolvedAccountChange(res.accountName);
        }
      } catch (err) {
        if (active) {
          setAccountError(
            err instanceof Error
              ? err.message
              : "Could not verify bank account name",
          );
        }
      } finally {
        if (active) {
          setResolving(false);
          onResolvingStateChange?.(false);
        }
      }
    }, 400);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [
    accountNumber,
    bankCode,
    onResolvedAccountChange,
    onResolvingStateChange,
  ]);

  return (
    <div className="flex flex-col gap-4">
      <h2 className="font-heading text-sm font-bold uppercase tracking-wider text-[#151413] flex items-center gap-1.5">
        <LuLandmark className="w-4 h-4 text-[#C4956A]" /> 4. Settlement Bank
        Details
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="font-bold uppercase tracking-wider text-[#76726E]">
            Settlement Bank
          </label>
          <select
            disabled={loadingBanks}
            value={bankCode}
            onChange={(e) => {
              const selected = banks.find((b) => b.code === e.target.value);
              setAccountError("");
              onResolvedAccountChange("");
              onBankChange(e.target.value, selected?.name || "");
            }}
            className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#EAE8E4] rounded-md disabled:opacity-60"
          >
            {loadingBanks ? (
              <option value="">Loading banks...</option>
            ) : (
              <>
                <option value="">Select a bank</option>
                {banks.map((bank) => (
                  <option key={bank.code} value={bank.code}>
                    {bank.name}
                  </option>
                ))}
              </>
            )}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="font-bold uppercase tracking-wider text-[#76726E]">
            10-Digit Account Number
          </label>
          <input
            type="text"
            required
            maxLength={10}
            minLength={10}
            placeholder="0123456789"
            value={accountNumber}
            onChange={(e) => {
              setAccountError("");
              onResolvedAccountChange("");
              onAccountNumberChange(e.target.value.replace(/\D/g, ""));
            }}
            className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#EAE8E4] rounded-md font-mono"
          />
        </div>
      </div>

      {resolving && (
        <div className="flex items-center gap-2 text-[11px] text-[#76726E] bg-[#FAF9F6] px-3 py-2 rounded-md border border-[#EAE8E4]">
          <LuRefreshCw className="w-3.5 h-3.5 animate-spin text-[#C4956A]" />
          <span>Validating account...</span>
        </div>
      )}

      {resolvedAccountName && (
        <div className="flex items-center gap-2 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-3 py-2 rounded-md border border-emerald-200">
          <LuCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>Account Name: {resolvedAccountName}</span>
        </div>
      )}

      {accountError && (
        <div className="text-[11px] font-medium text-rose-700 bg-rose-50 px-3 py-2 rounded-md border border-rose-200">
          {accountError}
        </div>
      )}
    </div>
  );
}
