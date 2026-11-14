"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LuRefreshCw, LuCheck, LuTriangleAlert } from "react-icons/lu";
import { paymentsApi } from "@/lib/api/payments-api";

const DRAFT_STORAGE_KEY = "dawang_vendor_setup_draft";

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paymentReference = searchParams.get("paymentReference");
  const transactionReference = searchParams.get("transactionReference");
  const refToVerify = paymentReference || transactionReference || "";
  const hasRef = Boolean(refToVerify);

  const verifiedOnceRef = useRef(false);
  const [status, setStatus] = useState<"verifying" | "success" | "failed">(
    "verifying",
  );
  const [message, setMessage] = useState("Confirming your setup payment...");

  useEffect(() => {
    if (!refToVerify || verifiedOnceRef.current) {
      return;
    }
    verifiedOnceRef.current = true;

    paymentsApi
      .verifyMonnify(refToVerify)
      .then((res) => {
        if (res.status === "PAID" || res.status === "OVERPAID") {
          sessionStorage.removeItem(DRAFT_STORAGE_KEY);
          setStatus("success");
          setMessage("Storefront activated! Redirecting to your dashboard...");
          setTimeout(() => {
            router.refresh();
            router.replace("/vendor/dashboard");
          }, 1500);
        } else {
          setStatus("failed");
          setMessage("Payment was not completed. Your draft is still saved.");
        }
      })
      .catch((err) => {
        setStatus("failed");
        setMessage(
          err instanceof Error ? err.message : "Could not verify payment.",
        );
      });
  }, [refToVerify, router]);

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-xl border border-[#EAE8E4] text-center space-y-4">
        {hasRef && status === "verifying" && (
          <LuRefreshCw className="w-8 h-8 animate-spin text-[#C4956A] mx-auto" />
        )}
        {hasRef && status === "success" && (
          <LuCheck className="w-8 h-8 text-emerald-600 mx-auto" />
        )}
        {(!hasRef || status === "failed") && (
          <LuTriangleAlert className="w-8 h-8 text-rose-600 mx-auto" />
        )}

        <h1 className="font-heading text-base font-bold uppercase tracking-wider">
          {!hasRef
            ? "Invalid Callback"
            : status === "verifying"
              ? "Verifying Payment"
              : status === "success"
                ? "Welcome, Vendor!"
                : "Verification Issue"}
        </h1>
        <p className="text-xs text-[#76726E]">
          {!hasRef ? "Missing payment reference." : message}
        </p>

        {(!hasRef || status === "failed") && (
          <button
            type="button"
            onClick={() => router.replace("/vendor/setup")}
            className="px-5 py-2.5 bg-[#151413] text-white text-xs font-bold uppercase tracking-wider rounded-md cursor-pointer"
          >
            Return to Store Setup
          </button>
        )}
      </div>
    </div>
  );
}

export default function VendorSetupCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center p-4">
          <LuRefreshCw className="w-8 h-8 animate-spin text-[#C4956A]" />
        </div>
      }
    >
      <CallbackContent />
    </Suspense>
  );
}
