"use client";

import { useEffect, useState } from "react";
import {
  LuX,
  LuUser,
  LuMail,
  LuPhone,
  LuMapPin,
  LuShield,
  LuPencil,
  LuCheck,
  LuRefreshCw,
} from "react-icons/lu";
import { toast } from "sonner";
import { usersApi, UserAccount, UserAccountDetails } from "@/lib/api/users-api";

interface UserDetailsDrawerProps {
  user: UserAccount | null;
  onClose: () => void;
  onUserUpdated: (updated: UserAccount) => void;
}

interface UserDetailsDrawerContentProps {
  user: UserAccount;
  onClose: () => void;
  onUserUpdated: (updated: UserAccount) => void;
}

function UserDetailsDrawerContent({
  user,
  onClose,
  onUserUpdated,
}: UserDetailsDrawerContentProps) {
  const [details, setDetails] = useState<UserAccountDetails>(user);
  const [loadingDetails, setLoadingDetails] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    email: user.email || "",
    phoneNumber: user.phoneNumber || "",
    role: user.role || "customer",
    isActive: user.isActive ?? true,
  });

  useEffect(() => {
    let active = true;

    usersApi
      .getUserById(user.id)
      .then((fullUser) => {
        if (!active) return;
        setDetails(fullUser);
        setFormData({
          firstName: fullUser.firstName || "",
          lastName: fullUser.lastName || "",
          email: fullUser.email || "",
          phoneNumber: fullUser.phoneNumber || "",
          role: fullUser.role || "customer",
          isActive: fullUser.isActive ?? true,
        });
      })
      .catch(() => {
        // Fallback to basic user object already initialized in state
      })
      .finally(() => {
        if (active) setLoadingDetails(false);
      });

    return () => {
      active = false;
    };
  }, [user.id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const updated = await usersApi.adminUpdateUser(details.id, formData);
      const merged: UserAccountDetails = { ...details, ...updated };
      setDetails(merged);
      onUserUpdated(merged);
      setIsEditing(false);
      toast.success("User information updated");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update user info",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end font-sans text-[#1A1A1A]">
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-xs"
      />

      <div className="relative w-full max-w-md h-full bg-white shadow-2xl p-6 flex flex-col justify-between z-10 overflow-y-auto">
        <div className="flex flex-col gap-5">
          {/* Drawer Header */}
          <div className="flex items-start justify-between pb-4 border-b border-[#EAE8E4]">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#C4956A]">
                CUSTOMER PROFILE
              </span>
              <h3 className="font-heading text-lg font-bold text-[#1A1A1A] mt-0.5">
                {details.firstName} {details.lastName}
              </h3>
              <p className="text-[11px] font-mono text-[#76726E]">
                ID: {details.id.slice(0, 8).toUpperCase()}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {!isEditing && (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="px-3 py-1.5 bg-[#FAF9F6] border border-[#EAE8E4] rounded-md text-[11px] font-bold uppercase tracking-wider text-[#1A1A1A] hover:border-[#C4956A] flex items-center gap-1.5 cursor-pointer"
                >
                  <LuPencil className="w-3 h-3 text-[#C4956A]" /> Edit
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-[#76726E] hover:text-[#1A1A1A] cursor-pointer"
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>
          </div>

          {isEditing ? (
            <form
              id="edit-user-form"
              onSubmit={handleSave}
              className="flex flex-col gap-4"
            >
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#76726E]">
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, firstName: e.target.value }))
                    }
                    className="px-3 py-2 bg-[#FAF9F6] border border-[#EAE8E4] rounded-md text-xs focus:outline-hidden focus:border-[#C4956A]"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#76726E]">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, lastName: e.target.value }))
                    }
                    className="px-3 py-2 bg-[#FAF9F6] border border-[#EAE8E4] rounded-md text-xs focus:outline-hidden focus:border-[#C4956A]"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#76726E]">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, email: e.target.value }))
                  }
                  className="px-3 py-2 bg-[#FAF9F6] border border-[#EAE8E4] rounded-md text-xs focus:outline-hidden focus:border-[#C4956A]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#76726E]">
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="e.g. 08012345678"
                  value={formData.phoneNumber}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, phoneNumber: e.target.value }))
                  }
                  className="px-3 py-2 bg-[#FAF9F6] border border-[#EAE8E4] rounded-md text-xs focus:outline-hidden focus:border-[#C4956A]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#76726E]">
                  Account Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      role: e.target.value as "admin" | "customer" | "vendor",
                    }))
                  }
                  className="px-3 py-2 bg-[#FAF9F6] border border-[#EAE8E4] rounded-md text-xs font-semibold focus:outline-hidden focus:border-[#C4956A]"
                >
                  <option value="customer">Customer</option>
                  <option value="admin">Admin</option>
                  <option value="vendor">Vendor</option>
                </select>
              </div>

              <label className="flex items-center gap-2.5 p-3 bg-[#FAF9F6] border border-[#EAE8E4] rounded-md text-xs font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, isActive: e.target.checked }))
                  }
                  className="accent-[#C4956A]"
                />
                Account Active (Uncheck to suspend access)
              </label>
            </form>
          ) : (
            <>
              {/* Status & Role Badges */}
              <div className="flex items-center justify-between bg-[#FAF9F6] p-3.5 rounded-md border border-[#EAE8E4] text-xs">
                <span className="inline-flex items-center gap-1.5 font-bold uppercase text-[10px] tracking-wider text-[#76726E]">
                  <LuShield className="w-3.5 h-3.5 text-[#C4956A]" />
                  Role:{" "}
                  <strong className="text-[#1A1A1A]">{details.role}</strong>
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    details.isActive
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-rose-50 text-rose-700 border border-rose-200"
                  }`}
                >
                  {details.isActive ? "Active" : "Suspended"}
                </span>
              </div>

              {/* Contact Info */}
              <div className="bg-[#FAF9F6] p-4 rounded-md border border-[#EAE8E4] flex flex-col gap-3 text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#76726E]">
                  Contact &amp; Account Details
                </span>
                <div className="flex items-center gap-2.5">
                  <LuUser className="w-4 h-4 text-[#C4956A] shrink-0" />
                  <span className="font-semibold">
                    {details.firstName} {details.lastName}
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <LuMail className="w-4 h-4 text-[#C4956A] shrink-0" />
                  <span>{details.email}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <LuPhone className="w-4 h-4 text-[#C4956A] shrink-0" />
                  <span>{details.phoneNumber || "No phone number saved"}</span>
                </div>
                <div className="pt-2 border-t border-[#EAE8E4] text-[11px] text-[#76726E]">
                  Joined{" "}
                  {details.createdAt
                    ? new Date(details.createdAt).toLocaleDateString()
                    : "N/A"}
                </div>
              </div>

              {/* Saved Delivery Addresses */}
              <div className="bg-[#FAF9F6] p-4 rounded-md border border-[#EAE8E4] flex flex-col gap-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#76726E] flex items-center gap-1.5">
                    <LuMapPin className="w-3.5 h-3.5 text-[#C4956A]" /> Saved
                    Addresses
                  </span>
                  {loadingDetails && (
                    <LuRefreshCw className="w-3 h-3 animate-spin text-[#C4956A]" />
                  )}
                </div>

                {details.addresses && details.addresses.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {details.addresses.map((addr, idx) => (
                      <div
                        key={addr.id || idx}
                        className="p-2.5 bg-white border border-[#EAE8E4] rounded text-[11px]"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#1A1A1A]">
                            {addr.city}, {addr.state}
                          </span>
                          {addr.isDefault && (
                            <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-[#C4956A]/15 text-[#C4956A]">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-[#76726E] mt-0.5">
                          {addr.streetAddress}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-[#76726E]">
                    No saved delivery addresses on file.
                  </p>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-[#EAE8E4] flex items-center gap-2.5 mt-6">
          {isEditing ? (
            <>
              <button
                type="button"
                disabled={saving}
                onClick={() => setIsEditing(false)}
                className="flex-1 py-2.5 bg-[#FAF9F6] border border-[#EAE8E4] rounded-md text-xs font-bold uppercase tracking-wider text-[#1A1A1A] hover:border-[#1A1A1A] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="edit-user-form"
                disabled={saving}
                className="flex-1 py-2.5 bg-[#1A1A1A] text-white rounded-md text-xs font-bold uppercase tracking-wider hover:bg-[#2A2725] flex items-center justify-center gap-1.5 cursor-pointer disabled:bg-[#A39E98]"
              >
                <LuCheck className="w-3.5 h-3.5 text-[#C4956A]" />
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="w-full py-3 bg-[#1A1A1A] text-white rounded-md text-xs font-bold uppercase tracking-widest hover:bg-[#2A2725] transition-colors cursor-pointer"
            >
              Edit User Info
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function UserDetailsDrawer({
  user,
  onClose,
  onUserUpdated,
}: UserDetailsDrawerProps) {
  if (!user) return null;

  return (
    <UserDetailsDrawerContent
      key={user.id}
      user={user}
      onClose={onClose}
      onUserUpdated={onUserUpdated}
    />
  );
}
