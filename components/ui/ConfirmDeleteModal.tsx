"use client";

import { useState } from "react";
import { LuTriangleAlert, LuTrash2, LuX } from "react-icons/lu";

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  title: string;
  subtitle?: string;
  description: React.ReactNode;
  expectedText?: string;
  secondaryMatchText?: string;
  confirmLabel?: string;
  isDeleting?: boolean;
  onClose: () => void;
  onConfirm: (typedValue: string) => Promise<void> | void;
}

export default function ConfirmDeleteModal({
  isOpen,
  title,
  subtitle = "This action cannot be undone.",
  description,
  expectedText = "DELETE",
  secondaryMatchText,
  confirmLabel = "Permanently Delete",
  isDeleting = false,
  onClose,
  onConfirm,
}: ConfirmDeleteModalProps) {
  const [typedValue, setTypedValue] = useState("");

  if (!isOpen) return null;

  const normalized = typedValue.trim().toLowerCase();
  const isValid =
    normalized === expectedText.trim().toLowerCase() ||
    (Boolean(secondaryMatchText) &&
      normalized === secondaryMatchText!.trim().toLowerCase());

  const handleClose = () => {
    if (isDeleting) return;
    setTypedValue("");
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || isDeleting) return;
    await onConfirm(typedValue.trim());
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans text-[#151413]">
      <div className="w-full max-w-md bg-white border border-rose-200 rounded-xl p-6 shadow-2xl flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#EAE8E4]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
              <LuTriangleAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-rose-800">
                {title}
              </h3>
              <p className="text-[11px] text-[#76726E]">{subtitle}</p>
            </div>
          </div>

          <button
            type="button"
            disabled={isDeleting}
            onClick={handleClose}
            className="p-1 text-[#76726E] hover:text-[#151413] cursor-pointer disabled:opacity-50"
          >
            <LuX className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs">
          <div className="text-[#76726E] leading-relaxed">{description}</div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#76726E]">
              Type{" "}
              <span className="text-rose-700 font-mono">{expectedText}</span> to
              confirm
            </label>
            <input
              type="text"
              required
              placeholder={expectedText}
              value={typedValue}
              onChange={(e) => setTypedValue(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#FAF9F6] border border-[#EAE8E4] rounded-md font-mono font-bold focus:outline-hidden focus:border-rose-600"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              disabled={isDeleting}
              onClick={handleClose}
              className="px-4 py-2 border border-[#EAE8E4] rounded-md font-bold uppercase tracking-wider text-[11px] hover:bg-[#FAF9F6] cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isValid || isDeleting}
              className="px-4 py-2 bg-rose-700 text-white rounded-md font-bold uppercase tracking-wider text-[11px] hover:bg-rose-800 disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
            >
              <LuTrash2 className="w-3.5 h-3.5" />
              {isDeleting ? "Deleting..." : confirmLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
