"use client";

import { useEffect, useState } from "react";
import { LuCheck, LuSparkles, LuCreditCard, LuRefreshCw } from "react-icons/lu";
import { toast } from "sonner";
import { systemConfigApi, VendorPlanConfig } from "@/lib/api/system-config-api";

interface VendorPlanCheckoutProps {
  siteName: string;
  slug: string;
  rootDomain: string;
  resolvedAccountName: string;
  bankName: string;
  selectedPlanId: string;
  submitting: boolean;
  onSelectPlan: (planId: string) => void;
  onPayAndLaunch: () => void;
}

export function VendorPlanCheckout({
  siteName,
  slug,
  rootDomain,
  resolvedAccountName,
  bankName,
  selectedPlanId,
  submitting,
  onSelectPlan,
  onPayAndLaunch,
}: VendorPlanCheckoutProps) {
  const [plans, setPlans] = useState<VendorPlanConfig[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);

  useEffect(() => {
    let active = true;
    systemConfigApi
      .getPublicConfig()
      .then((cfg) => {
        if (!active) return;
        const dbPlans = cfg.vendorPlans || [];
        setPlans(dbPlans);
        if (
          dbPlans.length > 0 &&
          !dbPlans.some((p) => p.id === selectedPlanId)
        ) {
          const recommended = dbPlans.find((p) => p.recommended) || dbPlans[0];
          onSelectPlan(recommended.id);
        }
      })
      .catch(() => {
        if (active) {
          toast.error("Could not load subscription plans");
        }
      })
      .finally(() => {
        if (active) setLoadingPlans(false);
      });

    return () => {
      active = false;
    };
  }, [onSelectPlan, selectedPlanId]);

  const activePlan =
    plans.find((p) => p.id === selectedPlanId) ||
    plans.find((p) => p.recommended) ||
    plans[0];

  if (loadingPlans) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 flex flex-col items-center justify-center gap-2 text-xs text-[#76726E]">
        <LuRefreshCw className="w-6 h-6 animate-spin text-[#C4956A]" />
        <span>Loading subscription plans...</span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-10 space-y-8">
      <div className="text-center space-y-2">
        <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#C4956A]">
          Final Step • Storefront Activation
        </span>
        <h2 className="font-heading text-2xl sm:text-3xl font-extrabold uppercase">
          Choose Your Billing Cycle
        </h2>
        <p className="text-xs text-[#76726E] max-w-lg mx-auto">
          Launching <span className="font-bold text-[#151413]">{siteName}</span>{" "}
          ({slug}.{rootDomain}) • Payouts to{" "}
          <span className="font-bold text-[#151413]">
            {resolvedAccountName}
          </span>{" "}
          ({bankName})
        </p>
      </div>

      {/* 4-Plan Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {plans.map((plan) => {
          const selected = plan.id === activePlan?.id;
          return (
            <div
              key={plan.id}
              onClick={() => onSelectPlan(plan.id)}
              className={`relative rounded-xl p-5 border transition-all cursor-pointer flex flex-col justify-between ${
                selected
                  ? "bg-white border-[#151413] ring-2 ring-[#C4956A] shadow-lg"
                  : "bg-white border-[#EAE8E4] hover:border-[#C4956A]"
              }`}
            >
              {plan.recommended && (
                <span className="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full bg-[#151413] text-[#C4956A] text-[9px] font-bold uppercase tracking-widest flex items-center gap-1">
                  <LuSparkles className="w-3 h-3" /> Best Value
                </span>
              )}

              <div className="space-y-3.5">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#C4956A]">
                    {plan.positioning}
                  </span>
                  <h3 className="font-heading text-sm font-bold uppercase tracking-wider mt-0.5">
                    {plan.name}
                  </h3>
                </div>

                <div className="pb-3.5 border-b border-[#EAE8E4] space-y-1">
                  <div className="text-2xl font-extrabold">
                    ₦{Number(plan.price).toLocaleString()}
                  </div>
                  <div className="text-[11px] text-[#76726E] font-medium">
                    Effective: {plan.effectiveMonthlyLabel}
                  </div>
                  {plan.savingsLabel ? (
                    <span className="inline-block px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                      {plan.savingsLabel}
                    </span>
                  ) : (
                    <span className="inline-block text-[10px] text-[#A39E98]">
                      Standard monthly rate
                    </span>
                  )}
                </div>

                <ul className="space-y-2 text-[11px]">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2">
                      <LuCheck className="w-3.5 h-3.5 text-[#C4956A] shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-5 pt-3.5 border-t border-[#EAE8E4] flex items-center justify-between text-[11px] font-bold uppercase tracking-wider">
                <span>{selected ? "Selected" : "Select"}</span>
                <span
                  className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    selected
                      ? "bg-[#151413] border-[#151413] text-[#C4956A]"
                      : "border-[#EAE8E4]"
                  }`}
                >
                  {selected && <LuCheck className="w-2.5 h-2.5" />}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {activePlan && (
        <div className="bg-white p-6 rounded-xl border border-[#EAE8E4] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs">
            <p className="font-bold uppercase tracking-wider">
              Total Due Today: ₦{Number(activePlan.price).toLocaleString()} (
              {activePlan.name})
            </p>
            <p className="text-[#76726E] mt-0.5">
              Your account will automatically upgrade to Vendor upon payment
              confirmation.
            </p>
          </div>

          <button
            type="button"
            onClick={onPayAndLaunch}
            disabled={submitting}
            className="w-full sm:w-auto px-6 py-3.5 bg-[#151413] text-white text-xs font-bold uppercase tracking-widest rounded-md hover:bg-[#2A2725] transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {submitting ? (
              <LuRefreshCw className="w-4 h-4 animate-spin text-[#C4956A]" />
            ) : (
              <LuCreditCard className="w-4 h-4 text-[#C4956A]" />
            )}
            <span>
              {submitting
                ? "Preparing Checkout..."
                : `Pay ₦${Number(activePlan.price).toLocaleString()} & Launch`}
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
