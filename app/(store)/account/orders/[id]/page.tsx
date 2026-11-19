"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Cookies from "js-cookie";
import {
  FiArrowLeft,
  FiCheckCircle,
  FiAlertTriangle,
  FiMapPin,
  FiPackage,
  FiRefreshCw,
  FiClock,
  FiTruck,
} from "react-icons/fi";
import { toast } from "sonner";
import { ordersApi, OrderResponse } from "@/lib/api/orders-api";
import OrderDisputeModal from "@/components/account/OrderDisputeModal";

const TOKEN_COOKIE_NAME =
  process.env.NEXT_PUBLIC_AUTH_TOKEN_COOKIE_NAME || "dawang_token";

export default function CustomerOrderDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const orderId = params?.id;

  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [disputeModalOpen, setDisputeModalOpen] = useState(false);
  const [submittingDispute, setSubmittingDispute] = useState(false);

  const loadOrder = useCallback(async () => {
    if (!orderId) return;
    const token = Cookies.get(TOKEN_COOKIE_NAME);
    if (!token) {
      router.push(`/login?redirect=/account/orders/${orderId}`);
      return;
    }

    try {
      setLoading(true);
      const data = await ordersApi.getOrderById(orderId);
      setOrder(data);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to load order details",
      );
    } finally {
      setLoading(false);
    }
  }, [orderId, router]);

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (active) loadOrder();
    });
    return () => {
      active = false;
    };
  }, [loadOrder]);

  const handleConfirmDelivery = async () => {
    if (!order) return;
    if (
      !confirm(
        "Confirm that you have received this order in good condition? This releases escrow funds to the vendor.",
      )
    ) {
      return;
    }

    try {
      setConfirming(true);
      await ordersApi.confirmOrderDelivery(order.id);
      toast.success("Order delivery confirmed!");
      await loadOrder();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to confirm delivery",
      );
    } finally {
      setConfirming(false);
    }
  };

  const handleDisputeOrder = async (id: string, reason: string) => {
    try {
      setSubmittingDispute(true);
      await ordersApi.disputeOrder(id, reason);
      toast.success(
        "Dispute opened. Escrow release is paused and an administrator has been notified.",
      );
      setDisputeModalOpen(false);
      await loadOrder();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to submit dispute",
      );
    } finally {
      setSubmittingDispute(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-2 text-xs text-[#76726E]">
        <FiRefreshCw className="w-6 h-6 animate-spin text-[#C4956A]" />
        Loading order details...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center text-xs text-[#76726E]">
        <p className="mb-4">Order not found.</p>
        <Link
          href="/account"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#151413] text-white rounded-md font-bold uppercase"
        >
          <FiArrowLeft className="w-3.5 h-3.5" /> Back to Account
        </Link>
      </div>
    );
  }

  const normalizedStatus = order.status?.toUpperCase();
  const canConfirm = ["SHIPPED", "AWAITING_CONFIRMATION"].includes(
    normalizedStatus,
  );
  const canDispute = normalizedStatus === "AWAITING_CONFIRMATION";

  return (
    <div className="min-h-screen bg-[#FAF9F6] font-sans text-[#151413] py-8 px-4 sm:px-8">
      <div className="max-w-4xl mx-auto flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/account"
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#76726E] hover:text-[#151413]"
          >
            <FiArrowLeft className="w-4 h-4" /> Back to My Account
          </Link>

          <span className="text-xs font-mono text-[#76726E]">
            Placed {new Date(order.createdAt).toLocaleString()}
          </span>
        </div>

        {/* Top Order Header & Actions */}
        <div className="bg-white border border-[#EAE8E4] rounded-xl p-6 flex flex-col gap-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C4956A]">
                Order Reference
              </span>
              <h1 className="font-heading text-2xl font-bold mt-0.5">
                #{order.id.slice(0, 8).toUpperCase()}
              </h1>
              {order.vendor?.storeName && (
                <p className="text-xs text-[#76726E] mt-1">
                  Storefront: <strong>{order.vendor.storeName}</strong>
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {canDispute && (
                <button
                  type="button"
                  onClick={() => setDisputeModalOpen(true)}
                  className="px-4 py-2.5 border border-rose-200 bg-rose-50 text-rose-700 text-xs font-bold uppercase tracking-wider rounded-md hover:bg-rose-100 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <FiAlertTriangle className="w-4 h-4" /> Dispute Order
                </button>
              )}

              {canConfirm && (
                <button
                  type="button"
                  disabled={confirming}
                  onClick={handleConfirmDelivery}
                  className="px-5 py-2.5 bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider rounded-md hover:bg-emerald-800 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <FiCheckCircle className="w-4 h-4" />
                  {confirming ? "Confirming..." : "Confirm Delivery"}
                </button>
              )}
            </div>
          </div>

          {canDispute && (
            <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
              <FiClock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <span>
                The vendor has marked this order as delivered. If no dispute is
                opened within <strong>24 hours</strong>, funds in escrow will
                automatically be released to the vendor.
              </span>
            </div>
          )}

          {normalizedStatus === "DISPUTED" && (
            <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-900 flex items-start gap-2.5">
              <FiAlertTriangle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">
                  Order Disputed — Escrow Release Paused
                </p>
                {order.disputeReason && (
                  <p className="mt-1">Reason: {order.disputeReason}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Shipment & Delivery Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-[#EAE8E4] rounded-xl p-6 text-xs flex flex-col gap-2">
            <h2 className="font-heading text-xs font-bold uppercase tracking-wider text-[#151413] flex items-center gap-1.5 mb-1">
              <FiMapPin className="w-4 h-4 text-[#C4956A]" /> Delivery Address
            </h2>
            <p className="font-bold">
              {order.shippingAddress?.firstName}{" "}
              {order.shippingAddress?.lastName}
            </p>
            <p className="text-[#76726E]">
              {order.shippingAddress?.streetAddress}
            </p>
            <p className="text-[#76726E]">
              {order.shippingAddress?.city}, {order.shippingAddress?.state}
            </p>
            {order.shippingAddress?.phone && (
              <p className="text-[#76726E]">{order.shippingAddress.phone}</p>
            )}
          </div>

          <div className="bg-white border border-[#EAE8E4] rounded-xl p-6 text-xs flex flex-col gap-2">
            <h2 className="font-heading text-xs font-bold uppercase tracking-wider text-[#151413] flex items-center gap-1.5 mb-1">
              <FiTruck className="w-4 h-4 text-[#C4956A]" /> Fulfillment &amp;
              Status
            </h2>
            <p>
              Status:{" "}
              <strong className="uppercase">
                {order.status.replace("_", " ")}
              </strong>
            </p>
            {order.currentLocation && (
              <p>
                Current Location: <strong>{order.currentLocation}</strong>
              </p>
            )}
            {order.courierName && (
              <p>
                Courier: <strong>{order.courierName}</strong>
              </p>
            )}
            {order.trackingNumber && (
              <p>
                Tracking Number:{" "}
                <span className="font-mono font-bold">
                  {order.trackingNumber}
                </span>
              </p>
            )}
          </div>
        </div>

        {/* Items & Totals */}
        <div className="bg-white border border-[#EAE8E4] rounded-xl overflow-hidden text-xs">
          <div className="px-6 py-4 border-b border-[#EAE8E4]">
            <h2 className="font-heading text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <FiPackage className="w-4 h-4 text-[#C4956A]" /> Order Items
            </h2>
          </div>

          <div className="divide-y divide-[#EAE8E4]">
            {(order.items || []).map((item) => (
              <div
                key={item.id}
                className="px-6 py-4 flex items-center justify-between gap-4"
              >
                <div>
                  <p className="font-bold text-[#151413]">{item.productName}</p>
                  <p className="text-[#76726E] mt-0.5">
                    Qty: {item.quantity}
                    {item.selectedSize ? ` • Size: ${item.selectedSize}` : ""}
                    {item.selectedColor
                      ? ` • Color: ${item.selectedColor}`
                      : ""}
                  </p>
                </div>
                <p className="font-bold">
                  ₦{(Number(item.unitPrice) * item.quantity).toLocaleString()}
                </p>
              </div>
            ))}
          </div>

          <div className="bg-[#FAF9F6] px-6 py-4 border-t border-[#EAE8E4] flex flex-col gap-1.5">
            <div className="flex justify-between text-[#76726E]">
              <span>Shipping Fee</span>
              <span>₦{Number(order.shippingFee || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-[#151413] pt-1 border-t border-[#EAE8E4]">
              <span>Total Paid</span>
              <span>₦{Number(order.totalAmount).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Tracking Timeline */}
        {order.trackingHistory && order.trackingHistory.length > 0 && (
          <div className="bg-white border border-[#EAE8E4] rounded-xl p-6 text-xs">
            <h2 className="font-heading text-xs font-bold uppercase tracking-wider mb-4">
              Shipment &amp; Activity Timeline
            </h2>
            <div className="pl-4 border-l-2 border-[#C4956A] flex flex-col gap-3">
              {order.trackingHistory.map((cp, idx) => (
                <div key={idx}>
                  <p className="font-bold text-[#151413]">
                    {cp.location} ({cp.status.replace("_", " ")})
                  </p>
                  {cp.note && <p className="text-[#76726E]">{cp.note}</p>}
                  <p className="text-[10px] text-[#A39E98] mt-0.5">
                    {new Date(cp.timestamp).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <OrderDisputeModal
        isOpen={disputeModalOpen}
        orderId={order.id}
        submitting={submittingDispute}
        onClose={() => setDisputeModalOpen(false)}
        onSubmit={handleDisputeOrder}
      />
    </div>
  );
}
