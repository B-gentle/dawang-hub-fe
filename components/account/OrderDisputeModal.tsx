"use client";

import { useState } from "react";
import { FiAlertTriangle, FiX } from "react-icons/fi";

interface OrderDisputeModalProps {
  isOpen: boolean;
  orderId: string | null;
  submitting: boolean;
  onClose: () => void;
  onSubmit: (orderId: string, reason: string) => Promise<void> | void;
}

const QUICK_REASONS = [
  "Item not received despite being marked delivered",
  "Wrong item, size, or color delivered",
  "Item arrived damaged or defective",
  "Incomplete order (missing items)",
];

export default function OrderDisputeModal({
  isOpen,
  orderId,
  submitting,
  onClose,
  onSubmit,
}: OrderDisputeModalProps) {
  const [reason, setReason] = useState("");

  if (!isOpen || !orderId) return null;

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (reason.trim().length < 5) return;
    await onSubmit(orderId, reason.trim());
    setReason("");
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans text-[#151413]">
      <div className="w-full max-w-md bg-white border border-[#EAE8E4] rounded-xl p-6 shadow-xl flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#EAE8E4]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center shrink-0">
              <FiAlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-heading text-sm font-bold uppercase tracking-wider">
                Dispute Order #{orderId.slice(0, 8).toUpperCase()}
              </h3>
              <p className="text-[11px] text-[#76726E]">
                Pauses escrow release while our team reviews your case
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="p-1 text-[#76726E] hover:text-[#151413] cursor-pointer"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>

        <form
          onSubmit={handleFormSubmit}
          className="flex flex-col gap-3 text-xs"
        >
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#76726E]">
              Common Issues
            </span>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_REASONS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setReason(preset)}
                  className="px-2.5 py-1 rounded-md bg-[#FAF9F6] border border-[#EAE8E4] hover:border-[#C4956A] text-[11px] text-left cursor-pointer"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-[#76726E]">
              Describe the issue <span className="text-rose-600">*</span>
            </label>
            <textarea
              required
              minLength={5}
              rows={4}
              placeholder="Explain what went wrong with your delivery so an administrator can intervene..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full p-3 bg-[#FAF9F6] border border-[#EAE8E4] rounded-md focus:outline-hidden focus:border-[#C4956A]"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 border border-[#EAE8E4] rounded-md font-bold uppercase tracking-wider text-[11px] hover:bg-[#FAF9F6] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || reason.trim().length < 5}
              className="px-4 py-2 bg-rose-700 text-white rounded-md font-bold uppercase tracking-wider text-[11px] hover:bg-rose-800 disabled:opacity-50 cursor-pointer"
            >
              {submitting ? "Submitting..." : "Submit Dispute"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
