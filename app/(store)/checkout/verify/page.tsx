"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FiCheckCircle, FiXCircle, FiRefreshCw } from "react-icons/fi";
import { apiClient } from "@/lib/api-client";

function VerifyPaymentContent() {
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference") || searchParams.get("trxref");

  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const verify = async () => {
      if (!reference) {
        if (isMounted) {
          setErrorMessage("No transaction reference found in callback.");
          setLoading(false);
        }
        return;
      }

      try {
        const res = await apiClient.verifyPayment(reference);

        if (!isMounted) return;

        if (res?.status === "success") {
          setVerified(true);
          if (res.orderId) setOrderId(res.orderId);
        } else {
          setErrorMessage(
            "Payment verification failed or transaction was declined.",
          );
        }
      } catch (err: unknown) {
        if (!isMounted) return;
        const msg =
          err instanceof Error
            ? err.message
            : "Error verifying payment with gateway.";
        setErrorMessage(msg);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    verify();

    return () => {
      isMounted = false;
    };
  }, [reference]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-xs text-[#76726E]">
        <FiRefreshCw className="w-8 h-8 animate-spin text-[#C4956A]" />
        <span>Verifying payment with Paystack...</span>
      </div>
    );
  }

  if (verified) {
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
            Thank you for shopping with Dawang Stores. Your payment has been
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
        <p className="text-xs text-[#76726E] leading-relaxed">
          {errorMessage ||
            "We could not confirm your transaction payment status."}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 mt-4 w-full">
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
        </div>
      </div>
    </div>
  );
}

export default function VerifyPaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-xs text-[#76726E]">
          <FiRefreshCw className="w-8 h-8 animate-spin text-[#C4956A]" />
          <span>Loading callback verification...</span>
        </div>
      }
    >
      <VerifyPaymentContent />
    </Suspense>
  );
}
