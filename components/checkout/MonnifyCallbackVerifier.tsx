"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FiCheckCircle, FiXCircle, FiRefreshCw } from "react-icons/fi";
import { paymentsApi, PaymentReason } from "@/lib/api/payments-api";

const DRAFT_STORAGE_KEY = "dawang_vendor_setup_draft";

export interface MonnifyCallbackVerifierProps {
  defaultFlow?: PaymentReason;
}

function VerifierContent({
  defaultFlow = "ORDER_CHECKOUT",
}: MonnifyCallbackVerifierProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const paymentReference =
    searchParams.get("paymentReference") ||
    searchParams.get("reference") ||
    searchParams.get("trxref") ||
    undefined;
  const transactionReference =
    searchParams.get("transactionReference") || undefined;

  const hasRef = Boolean(paymentReference || transactionReference);
  const inferredFlow: PaymentReason = paymentReference?.startsWith("DW-VND-")
    ? "VENDOR_SETUP"
    : paymentReference?.startsWith("DW-MNFY-")
      ? "ORDER_CHECKOUT"
      : defaultFlow;

  const verifiedOnceRef = useRef(false);

  const [isVerifying, setIsVerifying] = useState(hasRef);
  const [verified, setVerified] = useState(false);
  const [resolvedReason, setResolvedReason] =
    useState<PaymentReason>(inferredFlow);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!hasRef || verifiedOnceRef.current) return;
    verifiedOnceRef.current = true;

    paymentsApi
      .verifyMonnify({ paymentReference, transactionReference })
      .then((res) => {
        const flow = res.reason || inferredFlow;
        setResolvedReason(flow);

        if (res.status === "PAID" || res.status === "OVERPAID") {
          setVerified(true);
          if (res.orderId) setOrderId(res.orderId);

          if (flow === "VENDOR_SETUP") {
            sessionStorage.removeItem(DRAFT_STORAGE_KEY);
            setTimeout(() => {
              router.refresh();
              router.replace("/vendor/dashboard");
            }, 1500);
          }
        } else {
          setErrorMessage(
            flow === "VENDOR_SETUP"
              ? "Payment was not completed. Your storefront draft is still saved."
              : "Payment verification failed or transaction was declined.",
          );
        }
      })
      .catch((err: unknown) => {
        setErrorMessage(
          err instanceof Error
            ? err.message
            : "Error verifying payment with gateway.",
        );
      })
      .finally(() => {
        setIsVerifying(false);
      });
  }, [hasRef, paymentReference, transactionReference, inferredFlow, router]);

  if (hasRef && isVerifying) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-xs text-[#76726E]">
        <FiRefreshCw className="w-8 h-8 animate-spin text-[#C4956A]" />
        <span>
          {inferredFlow === "VENDOR_SETUP"
            ? "Confirming your storefront setup payment..."
            : "Verifying payment with Monnify..."}
        </span>
      </div>
    );
  }

  if (verified) {
    if (resolvedReason === "VENDOR_SETUP") {
      return (
        <div className="min-h-[70vh] bg-white font-sans text-[#151413] flex items-center justify-center px-4">
          <div className="max-w-md w-full py-12 px-6 bg-[#FAF9F6] border border-[#EAE8E4] rounded-lg text-center flex flex-col items-center gap-4 shadow-xs">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
              <FiCheckCircle className="w-8 h-8" />
            </div>
            <span className="text-[10px] font-bold text-[#C4956A] uppercase tracking-[0.25em]">
              Payment Successful
            </span>
            <h1 className="font-heading text-2xl font-bold uppercase tracking-tight text-[#151413]">
              Welcome, Vendor!
            </h1>
            <p className="text-xs text-[#76726E] leading-relaxed">
              Your storefront is now active. Redirecting you to your vendor
              dashboard...
            </p>
            <Link
              href="/vendor/dashboard"
              className="mt-2 px-6 py-3 bg-[#151413] text-white text-xs font-bold uppercase tracking-widest rounded-md hover:bg-[#2A2725] transition-colors"
            >
              Go to Vendor Dashboard
            </Link>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-[70vh] bg-white font-sans text-[#151413] flex items-center justify-center px-4">
        <div className="max-w-md w-full py-12 px-6 bg-[#FAF9F6] border border-[#EAE8E4] rounded-lg text-center flex flex-col items-center gap-4 shadow-xs">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
            <FiCheckCircle className="w-8 h-8" />
          </div>
          <span className="text-[10px] font-bold text-[#C4956A] uppercase tracking-[0.25em]">
            Payment Successful
          </span>
          <h1 className="font-heading text-2xl font-bold uppercase tracking-tight text-[#151413]">
            Order Confirmed!
          </h1>
          <p className="text-xs text-[#76726E] leading-relaxed">
            Thank you for shopping with GlobexMall. Your payment has been
            verified and your order is currently being processed.
          </p>
          {orderId && (
            <span className="text-[11px] font-mono bg-white px-3 py-1.5 border border-[#EAE8E4] rounded-md text-[#151413]">
              Order Ref: {orderId}
            </span>
          )}
          <div className="flex flex-col sm:flex-row gap-3 mt-4 w-full">
            <Link
              href="/account"
              className="flex-1 py-3 bg-[#151413] text-white text-xs font-bold uppercase tracking-widest rounded-md hover:bg-[#2A2725] transition-colors text-center"
            >
              View Order History
            </Link>
            <Link
              href="/shop"
              className="flex-1 py-3 border border-[#EAE8E4] text-[#151413] text-xs font-bold uppercase tracking-widest rounded-md hover:border-[#151413] transition-colors text-center"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const displayError = !hasRef
    ? "No transaction reference found in callback."
    : errorMessage || "We could not confirm your transaction payment status.";

  return (
    <div className="min-h-[70vh] bg-white font-sans text-[#151413] flex items-center justify-center px-4">
      <div className="max-w-md w-full py-12 px-6 bg-[#FAF9F6] border border-[#EAE8E4] rounded-lg text-center flex flex-col items-center gap-4 shadow-xs">
        <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
          <FiXCircle className="w-8 h-8" />
        </div>
        <span className="text-[10px] font-bold text-rose-600 uppercase tracking-[0.25em]">
          Payment Unsuccessful
        </span>
        <h1 className="font-heading text-2xl font-bold uppercase tracking-tight text-[#151413]">
          Verification Failed
        </h1>
        <p className="text-xs text-[#76726E] leading-relaxed">{displayError}</p>
        <div className="flex flex-col sm:flex-row gap-3 mt-4 w-full">
          {resolvedReason === "VENDOR_SETUP" ? (
            <Link
              href="/vendor/setup"
              className="flex-1 py-3 bg-[#151413] text-white text-xs font-bold uppercase tracking-widest rounded-md hover:bg-[#2A2725] transition-colors text-center"
            >
              Return to Store Setup
            </Link>
          ) : (
            <>
              <Link
                href="/checkout"
                className="flex-1 py-3 bg-[#151413] text-white text-xs font-bold uppercase tracking-widest rounded-md hover:bg-[#2A2725] transition-colors text-center"
              >
                Return to Checkout
              </Link>
              <Link
                href="/shop"
                className="flex-1 py-3 border border-[#EAE8E4] text-[#151413] text-xs font-bold uppercase tracking-widest rounded-md hover:border-[#151413] transition-colors text-center"
              >
                Back to Shop
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MonnifyCallbackVerifier(
  props: MonnifyCallbackVerifierProps,
) {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-xs text-[#76726E]">
          <FiRefreshCw className="w-8 h-8 animate-spin text-[#C4956A]" />
          <span>Loading callback verification...</span>
        </div>
      }
    >
      <VerifierContent {...props} />
    </Suspense>
  );
}
