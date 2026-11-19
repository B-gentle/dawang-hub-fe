"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
  FiPhone,
  FiCheckCircle,
  FiMapPin,
  FiClock,
  FiAlertTriangle,
  FiArrowRight,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { UserProfile } from "@/lib/api/auth-api";
import { AddressPayload, UpdateProfilePayload } from "@/lib/api/users-api";
import { ordersApi, OrderResponse } from "@/lib/api/orders-api";
import AddressModal from "@/components/account/AddressModal";
import EditProfileModal from "@/components/account/EditProfileModal";
import OrderDisputeModal from "@/components/account/OrderDisputeModal";

const TOKEN_COOKIE_NAME =
  process.env.NEXT_PUBLIC_AUTH_TOKEN_COOKIE_NAME || "dawang_token";
const ORDERS_PAGE_LIMIT = 8;

function getStatusBadgeClasses(status: string): string {
  switch (status?.toUpperCase()) {
    case "DELIVERED":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "AWAITING_CONFIRMATION":
      return "bg-amber-50 text-amber-800 border-amber-200";
    case "DISPUTED":
      return "bg-rose-50 text-rose-700 border-rose-200";
    case "CANCELLED":
      return "bg-stone-100 text-stone-600 border-stone-200";
    default:
      return "bg-[#FAF9F6] text-[#151413] border-[#EAE8E4]";
  }
}

export default function AccountPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [addresses, setAddresses] = useState<AddressPayload[]>([]);

  // Paginated orders state
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [page, setPage] = useState(1);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const [confirmingOrderId, setConfirmingOrderId] = useState<string | null>(
    null,
  );
  const [disputeTargetOrderId, setDisputeTargetOrderId] = useState<
    string | null
  >(null);
  const [submittingDispute, setSubmittingDispute] = useState(false);

  // Modal controls
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<AddressPayload | null>(
    null,
  );

  const fetchOrdersPage = useCallback(async (targetPage: number) => {
    setLoadingOrders(true);
    try {
      const skip = (targetPage - 1) * ORDERS_PAGE_LIMIT;
      const res = await ordersApi.getUserOrders({
        skip,
        limit: ORDERS_PAGE_LIMIT,
        sort: "DESC",
      });
      setOrders(Array.isArray(res?.data) ? res.data : []);
      setTotalOrders(typeof res?.total === "number" ? res.total : 0);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load orders");
    } finally {
      setLoadingOrders(false);
    }
  }, []);

  const loadAccountData = useCallback(async () => {
    const token = Cookies.get(TOKEN_COOKIE_NAME);
    if (!token) {
      router.push("/login?redirect=/account");
      return;
    }

    try {
      const [meRes, addrRes] = await Promise.allSettled([
        apiClient.getMe(),
        apiClient.getAddresses(),
      ]);

      if (meRes.status === "fulfilled") setProfile(meRes.value as UserProfile);
      if (addrRes.status === "fulfilled" && Array.isArray(addrRes.value)) {
        setAddresses(addrRes.value as AddressPayload[]);
      }

      await fetchOrdersPage(1);
    } catch (err) {
      console.error("Failed to load account details:", err);
    } finally {
      setLoading(false);
    }
  }, [fetchOrdersPage, router]);

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (active) loadAccountData();
    });
    return () => {
      active = false;
    };
  }, [loadAccountData]);

  const handlePageChange = async (nextPage: number) => {
    setPage(nextPage);
    await fetchOrdersPage(nextPage);
  };

  const handleConfirmDelivery = async (orderId: string) => {
    if (
      !confirm(
        "Confirm that you have received this order in good condition? This will release the payment from escrow to the vendor.",
      )
    ) {
      return;
    }

    try {
      setConfirmingOrderId(orderId);
      await ordersApi.confirmOrderDelivery(orderId);
      toast.success("Delivery confirmed! Thank you for shopping with us.");
      await fetchOrdersPage(page);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to confirm delivery",
      );
    } finally {
      setConfirmingOrderId(null);
    }
  };

  const handleDisputeOrder = async (orderId: string, reason: string) => {
    try {
      setSubmittingDispute(true);
      await ordersApi.disputeOrder(orderId, reason);
      toast.success(
        "Dispute submitted. Escrow release is paused and an admin has been notified.",
      );
      setDisputeTargetOrderId(null);
      await fetchOrdersPage(page);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to submit dispute",
      );
    } finally {
      setSubmittingDispute(false);
    }
  };

  const handleLogout = () => {
    apiClient.logout();
    toast.info("Logged out successfully");
    router.push("/");
    router.refresh();
  };

  const handleSaveProfile = async (formData: UpdateProfilePayload) => {
    try {
      await apiClient.updateProfile(formData);
      toast.success("Profile updated successfully");
      setIsProfileModalOpen(false);
      await loadAccountData();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to update profile";
      toast.error(msg);
    }
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

      setIsAddressModalOpen(false);
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

  const awaitingConfirmationOrders = orders.filter((o) =>
    ["SHIPPED", "AWAITING_CONFIRMATION"].includes(o.status?.toUpperCase()),
  );
  const totalPages = Math.max(1, Math.ceil(totalOrders / ORDERS_PAGE_LIMIT));

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
            <div className="flex justify-between items-start pb-4 border-b border-[#EAE8E4]">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#151413] text-white flex items-center justify-center font-bold text-sm uppercase shrink-0">
                  {profile?.firstName?.[0] || "U"}
                  {profile?.lastName?.[0] || ""}
                </div>
                <div className="flex flex-col">
                  <h2 className="font-bold text-sm text-[#151413]">
                    {profile?.firstName} {profile?.lastName}
                  </h2>
                  <span className="text-xs text-[#76726E] flex items-center gap-1 mt-0.5">
                    <FiMail className="w-3 h-3 text-[#C4956A]" />{" "}
                    {profile?.email}
                  </span>
                  {profile?.phoneNumber && (
                    <span className="text-xs text-[#76726E] flex items-center gap-1 mt-0.5">
                      <FiPhone className="w-3 h-3 text-[#C4956A]" />{" "}
                      {profile.phoneNumber}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setIsProfileModalOpen(true)}
                className="text-[10px] font-bold text-[#C4956A] uppercase tracking-wider flex items-center gap-1 hover:underline cursor-pointer"
              >
                <FiEdit2 className="w-3.5 h-3.5" /> Edit
              </button>
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
                      setIsAddressModalOpen(true);
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
                            setIsAddressModalOpen(true);
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

          {/* Order History & Live Shipment Tracking Column */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            {/* Active Shipments Awaiting Delivery Confirmation */}
            {awaitingConfirmationOrders.length > 0 && (
              <div className="bg-[#FAF9F6] border border-[#C4956A]/50 rounded-lg p-5 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#151413] flex items-center gap-1.5">
                    <FiClock className="w-4 h-4 text-[#C4956A]" /> Active
                    Shipments &amp; Delivery Confirmation
                  </span>
                </div>

                <div className="flex flex-col gap-3">
                  {awaitingConfirmationOrders.map((order) => {
                    const isAwaiting =
                      order.status?.toUpperCase() === "AWAITING_CONFIRMATION";
                    return (
                      <div
                        key={order.id}
                        className="bg-white p-4 rounded-md border border-[#EAE8E4] flex flex-col gap-3 text-xs"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <Link
                              href={`/account/orders/${order.id}`}
                              className="font-mono font-bold text-[#151413] hover:text-[#C4956A] underline"
                            >
                              Order #{order.id.slice(0, 8).toUpperCase()}
                            </Link>
                            <p className="text-[11px] text-[#76726E]">
                              Status:{" "}
                              <strong className="text-[#C4956A]">
                                {order.status.replace("_", " ")}
                              </strong>
                              {order.courierName
                                ? ` • ${order.courierName}`
                                : ""}
                              {order.trackingNumber
                                ? ` (${order.trackingNumber})`
                                : ""}
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            {isAwaiting && (
                              <button
                                type="button"
                                onClick={() =>
                                  setDisputeTargetOrderId(order.id)
                                }
                                className="px-3 py-2 border border-rose-200 bg-rose-50 text-rose-700 text-[11px] font-bold uppercase tracking-wider rounded-md hover:bg-rose-100 transition-colors flex items-center gap-1.5 cursor-pointer"
                              >
                                <FiAlertTriangle className="w-3.5 h-3.5" />
                                Dispute
                              </button>
                            )}

                            <button
                              type="button"
                              disabled={confirmingOrderId === order.id}
                              onClick={() => handleConfirmDelivery(order.id)}
                              className="px-4 py-2 bg-emerald-700 text-white text-[11px] font-bold uppercase tracking-wider rounded-md hover:bg-emerald-800 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                            >
                              <FiCheckCircle className="w-3.5 h-3.5" />
                              {confirmingOrderId === order.id
                                ? "Confirming..."
                                : "Confirm Delivery"}
                            </button>
                          </div>
                        </div>

                        {isAwaiting && (
                          <p className="text-[11px] text-[#76726E] bg-amber-50/70 border border-amber-200/70 rounded px-3 py-2">
                            Funds will automatically release to the vendor 24
                            hours after delivery unless you dispute this order.
                          </p>
                        )}

                        {order.currentLocation && (
                          <div className="p-2.5 rounded bg-[#FAF9F6] border border-[#EAE8E4] flex items-center gap-2 text-[11px]">
                            <FiMapPin className="w-3.5 h-3.5 text-[#C4956A] shrink-0" />
                            <span>
                              Current Location:{" "}
                              <strong>{order.currentLocation}</strong>
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pb-2 border-b border-[#EAE8E4]">
              <h2 className="font-heading text-sm font-bold uppercase tracking-wider text-[#151413] flex items-center gap-2">
                <FiShoppingBag className="w-4 h-4 text-[#C4956A]" /> Order
                History ({totalOrders})
              </h2>
              <span className="text-[11px] text-[#76726E]">
                Page {page} of {totalPages}
              </span>
            </div>

            {loadingOrders ? (
              <div className="py-12 flex items-center justify-center gap-2 text-xs text-[#76726E]">
                <FiRefreshCw className="w-4 h-4 animate-spin text-[#C4956A]" />
                Loading orders...
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-[#FAF9F6] border border-[#EAE8E4] rounded-md p-8 text-center text-xs text-[#76726E]">
                You haven&apos;t placed any orders yet.
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-white border border-[#EAE8E4] rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs hover:border-[#C4956A] transition-colors"
                  >
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="font-mono font-bold text-sm text-[#151413]">
                          #{order.id.slice(0, 8).toUpperCase()}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getStatusBadgeClasses(
                            order.status,
                          )}`}
                        >
                          {order.status.replace("_", " ")}
                        </span>
                      </div>
                      <p className="text-[#76726E]">
                        {new Date(order.createdAt).toLocaleDateString()} •{" "}
                        {order.items?.length || 0} item(s) •{" "}
                        <strong className="text-[#151413]">
                          ₦{Number(order.totalAmount).toLocaleString()}
                        </strong>
                      </p>
                      {order.status === "DISPUTED" && order.disputeReason && (
                        <p className="text-[11px] text-rose-700 mt-0.5">
                          Dispute reason: {order.disputeReason}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <Link
                        href={`/account/orders/${order.id}`}
                        className="px-3.5 py-2 bg-[#151413] text-white text-[11px] font-bold uppercase tracking-wider rounded-md hover:bg-[#2A2725] transition-colors flex items-center gap-1.5"
                      >
                        View Order{" "}
                        <FiArrowRight className="w-3.5 h-3.5 text-[#C4956A]" />
                      </Link>
                    </div>
                  </div>
                ))}

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-3">
                    <button
                      type="button"
                      disabled={page <= 1 || loadingOrders}
                      onClick={() => handlePageChange(page - 1)}
                      className="px-3.5 py-2 border border-[#EAE8E4] rounded-md text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 disabled:opacity-40 cursor-pointer hover:bg-[#FAF9F6]"
                    >
                      <FiChevronLeft className="w-4 h-4" /> Previous
                    </button>

                    <span className="text-xs text-[#76726E]">
                      Showing {(page - 1) * ORDERS_PAGE_LIMIT + 1}–
                      {Math.min(page * ORDERS_PAGE_LIMIT, totalOrders)} of{" "}
                      {totalOrders}
                    </span>

                    <button
                      type="button"
                      disabled={page >= totalPages || loadingOrders}
                      onClick={() => handlePageChange(page + 1)}
                      className="px-3.5 py-2 border border-[#EAE8E4] rounded-md text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 disabled:opacity-40 cursor-pointer hover:bg-[#FAF9F6]"
                    >
                      Next <FiChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dispute Modal */}
      <OrderDisputeModal
        isOpen={Boolean(disputeTargetOrderId)}
        orderId={disputeTargetOrderId}
        submitting={submittingDispute}
        onClose={() => setDisputeTargetOrderId(null)}
        onSubmit={handleDisputeOrder}
      />

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onSave={handleSaveProfile}
        profile={profile}
      />

      {/* Address Modal */}
      <AddressModal
        isOpen={isAddressModalOpen}
        onClose={() => {
          setIsAddressModalOpen(false);
          setEditingAddress(null);
        }}
        onSave={handleSaveAddress}
        initialData={editingAddress}
        isEditing={!!editingAddress}
      />
    </div>
  );
}
