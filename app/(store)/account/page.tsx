"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import {
  FiShoppingBag,
  FiLogOut,
  FiRefreshCw,
  FiMail,
  FiPlus,
  FiTrash2,
  FiEdit2,
  FiStar,
} from "react-icons/fi";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { UserProfile } from "@/lib/api/auth-api";
import { AddressPayload } from "@/lib/api/users-api";
import AddressModal from "@/components/account/AddressModal";
import OrderList, { OrderResponse } from "@/components/account/OrderList";

const TOKEN_COOKIE_NAME =
  process.env.NEXT_PUBLIC_AUTH_TOKEN_COOKIE_NAME || "dawang_token";

export default function AccountPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [addresses, setAddresses] = useState<AddressPayload[]>([]);
  const [orders, setOrders] = useState<OrderResponse[]>([]);

  // Modal controls
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<AddressPayload | null>(
    null,
  );

  const loadAccountData = async () => {
    const token = Cookies.get(TOKEN_COOKIE_NAME);
    if (!token) {
      router.push("/login?redirect=/account");
      return;
    }

    try {
      const [meRes, addrRes, ordersRes] = await Promise.allSettled([
        apiClient.getMe(),
        apiClient.getAddresses(),
        apiClient.getUserOrders(),
      ]);

      if (meRes.status === "fulfilled") setProfile(meRes.value as UserProfile);
      if (addrRes.status === "fulfilled" && Array.isArray(addrRes.value)) {
        setAddresses(addrRes.value as AddressPayload[]);
      }
      if (ordersRes.status === "fulfilled" && Array.isArray(ordersRes.value)) {
        setOrders(ordersRes.value as OrderResponse[]);
      }
    } catch (err) {
      console.error("Failed to load account details:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;

    queueMicrotask(() => {
      if (active) {
        loadAccountData();
      }
    });

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = () => {
    apiClient.logout();
    toast.info("Logged out successfully");
    router.push("/");
    router.refresh();
  };

  const handleSaveAddress = async (formData: AddressPayload) => {
    try {
      if (editingAddress?.id) {
        await apiClient.updateAddress(editingAddress.id, formData);
        toast.success("Address updated successfully");
      } else {
        if (addresses.length >= 3) {
          toast.error("Maximum 3 saved addresses allowed.");
          return;
        }
        await apiClient.addAddress(formData);
        toast.success("Address saved successfully");
      }

      setIsModalOpen(false);
      setEditingAddress(null);
      await loadAccountData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save address";
      toast.error(msg);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    try {
      await apiClient.deleteAddress(id);
      toast.success("Address removed");
      await loadAccountData();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to delete address";
      toast.error(msg);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-2 text-xs text-[#76726E]">
        <FiRefreshCw className="w-6 h-6 animate-spin text-[#C4956A]" />
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans text-[#151413]">
      {/* Header Banner */}
      <div className="bg-[#FAF9F6] border-b border-[#EAE8E4] py-8 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-[10px] font-bold text-[#C4956A] uppercase tracking-[0.25em]">
              Customer Portal
            </span>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold uppercase tracking-tight text-[#151413]">
              My Account
            </h1>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 border border-[#EAE8E4] bg-white rounded-md text-xs font-bold uppercase tracking-wider text-[#151413] hover:bg-[#151413] hover:text-white transition-colors flex items-center gap-2 cursor-pointer"
          >
            <FiLogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Profile & Addresses Sidebar */}
          <div className="lg:col-span-5 bg-[#FAF9F6] border border-[#EAE8E4] rounded-md p-6 flex flex-col gap-6">
            <div className="flex items-center gap-3 pb-4 border-b border-[#EAE8E4]">
              <div className="w-12 h-12 rounded-full bg-[#151413] text-white flex items-center justify-center font-bold text-sm uppercase">
                {profile?.firstName?.[0] || "U"}
                {profile?.lastName?.[0] || ""}
              </div>
              <div className="flex flex-col">
                <h2 className="font-bold text-sm text-[#151413]">
                  {profile?.firstName} {profile?.lastName}
                </h2>
                <span className="text-xs text-[#76726E] flex items-center gap-1 mt-0.5">
                  <FiMail className="w-3 h-3 text-[#C4956A]" /> {profile?.email}
                </span>
              </div>
            </div>

            {/* Saved Addresses Section */}
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-[#151413]">
                  Saved Delivery Addresses ({addresses.length}/3)
                </h3>
                {addresses.length < 3 && (
                  <button
                    onClick={() => {
                      setEditingAddress(null);
                      setIsModalOpen(true);
                    }}
                    className="text-[10px] font-bold text-[#C4956A] uppercase tracking-wider flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <FiPlus className="w-3.5 h-3.5" /> Add New
                  </button>
                )}
              </div>

              {addresses.length === 0 ? (
                <p className="text-xs text-[#76726E] italic bg-white p-3 border border-[#EAE8E4] rounded-md">
                  No addresses saved yet. You can save up to 3 addresses.
                </p>
              ) : (
                <div className="flex flex-col gap-2.5">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className="bg-white p-3.5 border border-[#EAE8E4] rounded-md text-xs flex justify-between items-start"
                    >
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#151413]">
                            {addr.streetAddress}
                          </span>
                          {addr.isDefault && (
                            <span className="text-[9px] font-bold uppercase text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-xs flex items-center gap-0.5">
                              <FiStar className="w-2.5 h-2.5" /> Default
                            </span>
                          )}
                        </div>
                        <span className="text-[#76726E]">
                          {addr.city}, {addr.state} ({addr.country})
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingAddress(addr);
                            setIsModalOpen(true);
                          }}
                          className="text-[#76726E] hover:text-[#151413] p-1 cursor-pointer"
                        >
                          <FiEdit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() =>
                            addr.id && handleDeleteAddress(addr.id)
                          }
                          className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                        >
                          <FiTrash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Order History Column */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <h2 className="font-heading text-sm font-bold uppercase tracking-wider text-[#151413] flex items-center gap-2 pb-2 border-b border-[#EAE8E4]">
              <FiShoppingBag className="w-4 h-4 text-[#C4956A]" /> Order History
              ({orders.length})
            </h2>

            <OrderList orders={orders} />
          </div>
        </div>
      </div>

      <AddressModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingAddress(null);
        }}
        onSave={handleSaveAddress}
        initialData={editingAddress}
        isEditing={!!editingAddress}
      />
    </div>
  );
}
