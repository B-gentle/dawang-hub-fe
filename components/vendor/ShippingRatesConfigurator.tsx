"use client";

import { useState } from "react";
import { LuTruck } from "react-icons/lu";
import { toast } from "sonner";
import { StateShippingRate } from "@/lib/api/vendor-api";

interface ShippingRatesConfiguratorProps {
  rates: StateShippingRate[];
  minFreeDeliveryFare: number;
  onRatesChange: (rates: StateShippingRate[]) => void;
  onMinFreeDeliveryFareChange: (amount: number) => void;
}

export default function ShippingRatesConfigurator({
  rates,
  minFreeDeliveryFare,
  onRatesChange,
  onMinFreeDeliveryFareChange,
}: ShippingRatesConfiguratorProps) {
  const [bulkFee, setBulkFee] = useState("");
  const enabledStatesCount = rates.filter((r) => r.enabled).length;

  const toggleStateShipping = (stateName: string) => {
    onRatesChange(
      rates.map((item) =>
        item.state === stateName
          ? {
              ...item,
              enabled: !item.enabled,
              fee: !item.enabled ? item.fee : 0,
            }
          : item,
      ),
    );
  };

  const updateStateFee = (stateName: string, fee: number) => {
    onRatesChange(
      rates.map((item) =>
        item.state === stateName
          ? { ...item, fee: Math.max(0, Number(fee) || 0) }
          : item,
      ),
    );
  };

  const applyBulkFeeToEnabled = () => {
    const numeric = Math.max(0, Number(bulkFee) || 0);
    onRatesChange(
      rates.map((item) => (item.enabled ? { ...item, fee: numeric } : item)),
    );
    toast.success(`Applied ₦${numeric.toLocaleString()} to all enabled states`);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="pb-3 border-b border-[#EAE8E4]">
        <h2 className="font-heading text-base font-bold uppercase tracking-wider text-[#151413]">
          36-State Delivery Coverage & Fees
        </h2>
        <p className="text-[#76726E] text-xs mt-0.5">
          When no states are enabled below, your storefront automatically ships
          nationwide across all 36 states + FCT at the platform default flat
          rate. As soon as you enable one or more states, checkout will only
          allow customers in your selected states and apply your custom fees.
        </p>
      </div>

      {enabledStatesCount === 0 && (
        <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900">
          <strong>Nationwide Default Flat-Rate Active:</strong> You have not
          enabled custom states yet, so customers can order from any Nigerian
          state at the platform default flat-rate delivery fee. Enable specific
          states below to restrict coverage or set custom per-state fees.
        </div>
      )}

      {/* Bulk Fee Helper + Free Shipping Banner Threshold */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#FAF9F6] p-4 rounded-lg border border-[#EAE8E4]">
        <div className="flex flex-col gap-1.5">
          <label className="font-bold uppercase tracking-wider text-[#76726E]">
            Bulk Apply Fee to Enabled States (₦)
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              min="0"
              placeholder="e.g. 3500"
              value={bulkFee}
              onChange={(e) => setBulkFee(e.target.value)}
              className="flex-1 px-3 py-2 bg-white border border-[#EAE8E4] rounded-md font-bold focus:outline-hidden focus:border-[#C4956A]"
            />
            <button
              type="button"
              onClick={applyBulkFeeToEnabled}
              className="px-3 py-2 bg-[#151413] text-white text-[11px] font-bold uppercase rounded-md hover:bg-[#2A2725] cursor-pointer"
            >
              Apply
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="font-bold uppercase tracking-wider text-[#76726E] flex items-center gap-1">
            <LuTruck className="w-3.5 h-3.5 text-[#C4956A]" /> Free Shipping
            Promo Threshold (₦)
          </label>
          <input
            type="number"
            min="0"
            value={minFreeDeliveryFare}
            onChange={(e) =>
              onMinFreeDeliveryFareChange(Number(e.target.value))
            }
            className="w-full px-3 py-2 bg-white border border-[#EAE8E4] rounded-md font-bold focus:outline-hidden focus:border-[#C4956A]"
          />
        </div>
      </div>

      {/* 36 States + FCT Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-112 overflow-y-auto pr-1">
        {rates.map((item) => (
          <div
            key={item.state}
            className={`p-3 rounded-lg border transition-colors flex flex-col gap-2 ${
              item.enabled
                ? "bg-[#FAF9F6] border-[#C4956A]"
                : "bg-white border-[#EAE8E4] opacity-75"
            }`}
          >
            <label className="flex items-center justify-between gap-2 cursor-pointer">
              <span className="font-bold text-[#151413]">{item.state}</span>
              <input
                type="checkbox"
                checked={item.enabled}
                onChange={() => toggleStateShipping(item.state)}
                className="accent-[#C4956A] w-4 h-4 cursor-pointer"
              />
            </label>

            {item.enabled ? (
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-[#76726E]">₦</span>
                <input
                  type="number"
                  min="0"
                  value={item.fee}
                  onChange={(e) =>
                    updateStateFee(item.state, Number(e.target.value))
                  }
                  placeholder="Delivery fee"
                  className="w-full px-2.5 py-1.5 bg-white border border-[#EAE8E4] rounded text-xs font-bold focus:outline-hidden focus:border-[#C4956A]"
                />
              </div>
            ) : (
              <span className="text-[10px] text-[#76726E]">
                Delivery disabled
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
