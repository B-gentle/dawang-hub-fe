"use client";

import { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";
import { AddressPayload } from "@/lib/api/users-api";

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: AddressPayload) => Promise<void>;
  initialData?: AddressPayload | null;
  isEditing?: boolean;
}

export default function AddressModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  isEditing = false,
}: AddressModalProps) {
  const [formData, setFormData] = useState<AddressPayload>({
    streetAddress: "",
    city: "Lagos",
    state: "Lagos State",
    postalCode: "100001",
    country: "Nigeria",
    isDefault: false,
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      if (initialData) {
        setFormData({
          streetAddress: initialData.streetAddress || "",
          city: initialData.city || "Lagos",
          state: initialData.state || "Lagos State",
          postalCode: initialData.postalCode || "100001",
          country: initialData.country || "Nigeria",
          isDefault: initialData.isDefault || false,
        });
      } else {
        setFormData({
          streetAddress: "",
          city: "Lagos",
          state: "Lagos State",
          postalCode: "100001",
          country: "Nigeria",
          isDefault: false,
        });
      }
    });
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await onSave(formData);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 font-sans">
      <div className="bg-white rounded-lg max-w-md w-full p-6 flex flex-col gap-4 shadow-lg">
        <div className="flex justify-between items-center pb-2 border-b border-[#EAE8E4]">
          <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-[#151413]">
            {isEditing ? "Edit Saved Address" : "Add New Delivery Address"}
          </h3>
          <button
            onClick={onClose}
            className="text-[#76726E] hover:text-[#151413] p-1 cursor-pointer"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-3.5 text-xs text-[#151413]"
        >
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#76726E]">
              Street Address *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 123 Victoria Island Street"
              value={formData.streetAddress}
              onChange={(e) =>
                setFormData({ ...formData, streetAddress: e.target.value })
              }
              className="w-full px-3.5 py-2.5 bg-[#FAF9F6] border border-[#EAE8E4] rounded-md text-xs text-[#151413] focus:outline-hidden focus:border-[#C4956A]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#76726E]">
                City *
              </label>
              <input
                type="text"
                required
                placeholder="Lagos"
                value={formData.city}
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value })
                }
                className="w-full px-3.5 py-2.5 bg-[#FAF9F6] border border-[#EAE8E4] rounded-md text-xs text-[#151413] focus:outline-hidden focus:border-[#C4956A]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#76726E]">
                State *
              </label>
              <input
                type="text"
                required
                placeholder="Lagos State"
                value={formData.state}
                onChange={(e) =>
                  setFormData({ ...formData, state: e.target.value })
                }
                className="w-full px-3.5 py-2.5 bg-[#FAF9F6] border border-[#EAE8E4] rounded-md text-xs text-[#151413] focus:outline-hidden focus:border-[#C4956A]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#76726E]">
                Postal Code
              </label>
              <input
                type="text"
                placeholder="100001"
                value={formData.postalCode}
                onChange={(e) =>
                  setFormData({ ...formData, postalCode: e.target.value })
                }
                className="w-full px-3.5 py-2.5 bg-[#FAF9F6] border border-[#EAE8E4] rounded-md text-xs text-[#151413] focus:outline-hidden focus:border-[#C4956A]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#76726E]">
                Country
              </label>
              <input
                type="text"
                placeholder="Nigeria"
                value={formData.country}
                onChange={(e) =>
                  setFormData({ ...formData, country: e.target.value })
                }
                className="w-full px-3.5 py-2.5 bg-[#FAF9F6] border border-[#EAE8E4] rounded-md text-xs text-[#151413] focus:outline-hidden focus:border-[#C4956A]"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={formData.isDefault}
              onChange={(e) =>
                setFormData({ ...formData, isDefault: e.target.checked })
              }
              className="accent-[#C4956A] w-4 h-4 rounded-xs cursor-pointer"
            />
            <span className="text-xs text-[#76726E]">
              Set as default delivery address
            </span>
          </label>

          <div className="flex gap-3 mt-4 pt-2 border-t border-[#EAE8E4]">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex-1 py-3 border border-[#EAE8E4] rounded-md text-xs font-bold uppercase tracking-wider text-[#151413] hover:bg-[#FAF9F6] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 bg-[#151413] text-white rounded-md text-xs font-bold uppercase tracking-widest hover:bg-[#2A2725] transition-colors cursor-pointer disabled:bg-[#A39E98]"
            >
              {saving ? "Saving..." : "Save Address"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
