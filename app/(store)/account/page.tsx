"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import {
  FiUser,
  FiShoppingBag,
  FiLogOut,
  FiRefreshCw,
  FiClock,
  FiCheck,
  FiMapPin,
  FiMail,
} from "react-icons/fi";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { UserProfile } from "@/lib/api/auth-api";

interface OrderItemResponse {
  id: string;
  productName: string;
  unitPrice: number;
  quantity: number;
}

interface OrderResponse {
  id: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  items?: OrderItemResponse[];
  shippingAddress?: {
    streetAddress: string;
    city: string;
    state: string;
  };
}

const TOKEN_COOKIE_NAME =
  process.env.NEXT_PUBLIC_AUTH_TOKEN_COOKIE_NAME || "dawang_token";

export default function AccountPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<OrderResponse[]>([]);

  useEffect(() => {
    let isMounted = true;

    const loadAccountData = async () => {
      const token = Cookies.get(TOKEN_COOKIE_NAME);
      if (!token) {
        router.push("/login?redirect=/account");
        return;
      }

      try {
        setLoading(true);
        const [meRes, ordersRes] = await Promise.allSettled([
          apiClient.getMe(),
          apiClient.getUserOrders(),
        ]);

        if (!isMounted) return;

        if (meRes.status === "fulfilled") {
          setProfile(meRes.value as UserProfile);
        }

        if (
          ordersRes.status === "fulfilled" &&
          Array.isArray(ordersRes.value)
        ) {
          setOrders(ordersRes.value as OrderResponse[]);
        }
      } catch (err) {
        console.error("Failed to load account details:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadAccountData();

    return () => {
      isMounted = false;
    };
  }, [router]);

  const handleLogout = () => {
    apiClient.logout();
    toast.info("Logged out successfully");
    router.push("/");
    router.refresh();
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-2 text-xs text-[#76726E]">
        <FiRefreshCw className="w-6 h-6 animate-spin text-[#C4956A]" />
        Loading your dashboard...
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const uppercaseStatus = status?.toUpperCase() || "PENDING";
    switch (uppercaseStatus) {
      case "PAID":
      case "DELIVERED":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            <FiCheck className="w-3 h-3" /> {uppercaseStatus}
          </span>
        );
      case "SHIPPED":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
            {uppercaseStatus}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
            <FiClock className="w-3 h-3" /> {uppercaseStatus}
          </span>
        );
    }
  };

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

      {/* Main Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Profile Sidebar */}
          <div className="lg:col-span-4 bg-[#FAF9F6] border border-[#EAE8E4] rounded-md p-6 flex flex-col gap-6">
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

            <div className="flex flex-col gap-3 text-xs text-[#76726E]">
              <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-[#151413]">
                Default Shipping Address
              </h3>
              {profile?.streetAddress ? (
                <div className="flex items-start gap-2 bg-white p-3 border border-[#EAE8E4] rounded-md text-[#151413]">
                  <FiMapPin className="w-4 h-4 text-[#C4956A] shrink-0 mt-0.5" />
                  <div className="flex flex-col">
                    <span>{profile.streetAddress}</span>
                    <span>
                      {profile.city}, {profile.state}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-[11px] italic">
                  Address details will be saved automatically upon completing
                  your next purchase.
                </p>
              )}
            </div>
          </div>

          {/* Orders Section */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="flex justify-between items-center pb-3 border-b border-[#EAE8E4]">
              <h2 className="font-heading text-sm font-bold uppercase tracking-wider text-[#151413] flex items-center gap-2">
                <FiShoppingBag className="w-4 h-4 text-[#C4956A]" /> Order
                History ({orders.length})
              </h2>
            </div>

            {orders.length === 0 ? (
              <div className="p-8 border border-[#EAE8E4] bg-[#FAF9F6] rounded-md text-center flex flex-col items-center gap-3">
                <FiShoppingBag className="w-8 h-8 text-[#A39E98]" />
                <p className="font-heading text-xs font-bold uppercase text-[#151413]">
                  No Orders Placed Yet
                </p>
                <p className="text-xs text-[#76726E] max-w-xs">
                  Your future completed purchases will be listed here.
                </p>
                <Link
                  href="/shop"
                  className="mt-2 px-6 py-2.5 bg-[#151413] text-white text-xs font-bold uppercase tracking-widest rounded-md hover:bg-[#2A2725] transition-colors"
                >
                  Start Shopping
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="border border-[#EAE8E4] bg-white rounded-md p-5 flex flex-col gap-4 shadow-xs"
                  >
                    <div className="flex flex-wrap justify-between items-center gap-2 pb-3 border-b border-[#EAE8E4]">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-mono text-[#76726E] uppercase">
                          Ref: {order.id}
                        </span>
                        <span className="text-xs text-[#76726E]">
                          {new Date(order.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            },
                          )}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        {getStatusBadge(order.status)}
                        <span className="font-bold text-sm text-[#151413]">
                          ₦{Number(order.totalAmount).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {order.items && order.items.length > 0 && (
                      <div className="flex flex-col gap-2">
                        {order.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex justify-between items-center text-xs text-[#151413]"
                          >
                            <span className="font-medium">
                              {item.productName}{" "}
                              <span className="text-[#76726E]">
                                x{item.quantity}
                              </span>
                            </span>
                            <span className="font-bold text-[#C4956A]">
                              ₦
                              {(
                                Number(item.unitPrice) * item.quantity
                              ).toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
