"use client";

import { useState, useEffect } from "react";
import { FiX, FiUser, FiPhone } from "react-icons/fi";
import { UserProfile } from "@/lib/api/auth-api";
import { UpdateProfilePayload } from "@/lib/api/users-api";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: UpdateProfilePayload) => Promise<void>;
  profile: UserProfile | null;
}

export default function EditProfileModal({
  isOpen,
  onClose,
  onSave,
  profile,
}: EditProfileModalProps) {
  const [formData, setFormData] = useState<UpdateProfilePayload>({
    firstName: "",
    lastName: "",
    phoneNumber: "",
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      if (profile) {
        setFormData({
          firstName: profile.firstName || "",
          lastName: profile.lastName || "",
          phoneNumber: profile.phoneNumber || "",
        });
      }
    });
  }, [profile, isOpen]);

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
            Edit Profile Information
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
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#76726E]">
                First Name *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="John"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  className="w-full pl-9 pr-3.5 py-2.5 bg-[#FAF9F6] border border-[#EAE8E4] rounded-md text-xs text-[#151413] focus:outline-hidden focus:border-[#C4956A]"
                />
                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A39E98]" />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#76726E]">
                Last Name *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  className="w-full pl-9 pr-3.5 py-2.5 bg-[#FAF9F6] border border-[#EAE8E4] rounded-md text-xs text-[#151413] focus:outline-hidden focus:border-[#C4956A]"
                />
                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A39E98]" />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#76726E]">
              Phone Number
            </label>
            <div className="relative">
              <input
                type="tel"
                placeholder="+2348012345678"
                value={formData.phoneNumber}
                onChange={(e) =>
                  setFormData({ ...formData, phoneNumber: e.target.value })
                }
                className="w-full pl-9 pr-3.5 py-2.5 bg-[#FAF9F6] border border-[#EAE8E4] rounded-md text-xs text-[#151413] focus:outline-hidden focus:border-[#C4956A]"
              />
              <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A39E98]" />
            </div>
          </div>

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
              {saving ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
