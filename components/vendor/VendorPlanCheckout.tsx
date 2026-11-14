"use client";

import { LuCheck, LuSparkles, LuCreditCard, LuRefreshCw } from "react-icons/lu";

export interface VendorPlanOption {
  id: string;
  name: string;
  price: number;
  billing: string;
  recommended?: boolean;
  description: string;
  features: string[];
}

export const VENDOR_PLANS: VendorPlanOption[] = [
  {
    id: "starter",
    name: "Starter Store",
    price: 15000,
    billing: "One-time setup",
    description: "Launch your custom subdomain storefront and start selling.",
    features: [
      "Custom yourstore.globexmall.com subdomain",
      "Custom brand color theme & logo",
      "Automated bank split settlements",
      "Direct WhatsApp customer chat",
    ],
  },
  {
    id: "pro",
    name: "Growth Brand",
    price: 35000,
    billing: "One-time setup",
    recommended: true,
    description: "Full luxury showcase with video hero and unlimited catalog.",
    features: [
      "Everything in Starter Store",
      "Unlimited products & categories",
      "YouTube video & 4-grid hero showcase",
      "Priority storefront verification",
    ],
  },
];

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
  const activePlan =
    VENDOR_PLANS.find((p) => p.id === selectedPlanId) || VENDOR_PLANS[1];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-10 space-y-8">
      <div className="text-center space-y-2">
        <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#C4956A]">
          Final Step • Storefront Activation
        </span>
        <h2 className="font-heading text-2xl sm:text-3xl font-extrabold uppercase">
          Choose Your Storefront Plan
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {VENDOR_PLANS.map((plan) => {
          const selected = plan.id === selectedPlanId;
          return (
            <div
              key={plan.id}
              onClick={() => onSelectPlan(plan.id)}
              className={`relative rounded-xl p-6 border transition-all cursor-pointer flex flex-col justify-between ${
                selected
                  ? "bg-white border-[#151413] ring-2 ring-[#C4956A] shadow-lg"
                  : "bg-white border-[#EAE8E4] hover:border-[#C4956A]"
              }`}
            >
              {plan.recommended && (
                <span className="absolute -top-3 right-5 px-3 py-1 rounded-full bg-[#151413] text-[#C4956A] text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                  <LuSparkles className="w-3 h-3" /> Recommended
                </span>
              )}

              <div className="space-y-4">
                <div>
                  <h3 className="font-heading text-base font-bold uppercase tracking-wider">
                    {plan.name}
                  </h3>
                  <p className="text-xs text-[#76726E] mt-1">
                    {plan.description}
                  </p>
                </div>

                <div className="pb-4 border-b border-[#EAE8E4]">
                  <span className="text-3xl font-extrabold">
                    ₦{plan.price.toLocaleString()}
                  </span>
                  <span className="text-[11px] text-[#76726E] ml-2">
                    / {plan.billing}
                  </span>
                </div>

                <ul className="space-y-2.5 text-xs">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2">
                      <LuCheck className="w-4 h-4 text-[#C4956A] shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-[#EAE8E4] flex items-center justify-between text-xs font-bold uppercase tracking-wider">
                <span>{selected ? "Selected Plan" : "Select Plan"}</span>
                <span
                  className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                    selected
                      ? "bg-[#151413] border-[#151413] text-[#C4956A]"
                      : "border-[#EAE8E4]"
                  }`}
                >
                  {selected && <LuCheck className="w-3 h-3" />}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white p-6 rounded-xl border border-[#EAE8E4] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs">
          <p className="font-bold uppercase tracking-wider">
            Total Due Today: ₦{activePlan.price.toLocaleString()}
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
              : `Pay ₦${activePlan.price.toLocaleString()} & Launch`}
          </span>
        </button>
      </div>
    </div>
  );
}
