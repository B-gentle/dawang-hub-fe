"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FiRefreshCw, FiShoppingBag, FiArrowRight } from "react-icons/fi";
import { apiClient } from "@/lib/api-client";
import { OrderResponse, PaginatedOrdersResponse } from "@/lib/api/orders-api";

export default function RecentOrdersTable() {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const fetchRecentOrders = async () => {
      try {
        setLoading(true);

        // Fetch paginated top 5 recent orders directly from backend
        const res = await apiClient.getAllOrdersAdmin({
          skip: 0,
          limit: 5,
          sort: "DESC",
        });

        if (!active) return;

        if (
          res &&
          "data" in res &&
          Array.isArray((res as PaginatedOrdersResponse).data)
        ) {
          setOrders((res as PaginatedOrdersResponse).data);
        } else if (Array.isArray(res)) {
          setOrders(res.slice(0, 5));
        }
      } catch (err) {
        console.error("Failed to load recent orders for admin dashboard:", err);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchRecentOrders();

    return () => {
      active = false;
    };
  }, []);

  const getStatusBadge = (status: string) => {
    const s = status?.toUpperCase() || "PENDING";
    switch (s) {
      case "DELIVERED":
        return (
          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/70 px-2.5 py-1 rounded-full">
            Delivered
          </span>
        );
      case "SHIPPED":
        return (
          <span className="text-[10px] font-bold text-sky-800 bg-sky-100/70 px-2.5 py-1 rounded-full">
            Shipped
          </span>
        );
      case "PAID":
      case "PROCESSING":
        return (
          <span className="text-[10px] font-bold text-amber-800 bg-amber-100/80 px-2.5 py-1 rounded-full">
            {s === "PAID" ? "Paid" : "Processing"}
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-bold text-rose-800 bg-rose-100/70 px-2.5 py-1 rounded-full">
            Pending
          </span>
        );
    }
  };

  const formatOrderDate = (dateString: string) => {
    const d = new Date(dateString);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    const time = d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    if (isToday) return `Today, ${time}`;

    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${time}`;
    }

    return `${d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })}, ${time}`;
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-lg border border-[#EAE8E4] flex flex-col gap-6 font-sans shadow-xs">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h2 className="font-heading text-xl font-bold text-[#151413]">
            Recent orders
          </h2>
          <p className="text-xs text-[#76726E] mt-0.5">
            Keep an eye on your latest customer activity
          </p>
        </div>

        <Link
          href="/admin/orders"
          className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#C4956A] hover:underline flex items-center gap-1 cursor-pointer"
        >
          VIEW ALL ORDERS <FiArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Table Container */}
      {loading ? (
        <div className="h-48 flex flex-col items-center justify-center gap-2 text-xs text-[#76726E]">
          <FiRefreshCw className="w-5 h-5 animate-spin text-[#C4956A]" />
          <span>Fetching latest orders...</span>
        </div>
      ) : orders.length === 0 ? (
        <div className="h-48 bg-[#FAF9F6] border border-[#EAE8E4] rounded-md flex flex-col items-center justify-center gap-2 text-xs text-[#76726E]">
          <FiShoppingBag className="w-6 h-6 text-[#A39E98]" />
          <span>No recent orders found.</span>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[650px]">
            <thead>
              <tr className="border-b border-[#EAE8E4] text-[10px] font-bold uppercase tracking-[0.15em] text-[#76726E]">
                <th className="py-3 px-2 font-bold">ORDER</th>
                <th className="py-3 px-2 font-bold">CUSTOMER</th>
                <th className="py-3 px-2 font-bold">ITEM</th>
                <th className="py-3 px-2 font-bold">TOTAL</th>
                <th className="py-3 px-2 font-bold">STATUS</th>
                <th className="py-3 px-2 font-bold text-right">DATE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#FAF9F6] text-xs text-[#151413]">
              {orders.map((order) => {
                const customerName = order.shippingAddress
                  ? `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`
                  : "Guest Customer";

                const firstItemName =
                  (order as unknown as { items?: { productName: string }[] })
                    ?.items?.[0]?.productName || "Store Purchase";

                const orderRef = `#DH-${order.id.slice(0, 4).toUpperCase()}`;

                return (
                  <tr
                    key={order.id}
                    className="hover:bg-[#FAF9F6]/60 transition-colors"
                  >
                    <td className="py-4 px-2 font-mono font-semibold text-[#151413]">
                      {orderRef}
                    </td>
                    <td className="py-4 px-2 font-medium">{customerName}</td>
                    <td className="py-4 px-2 text-[#76726E] max-w-[180px] truncate">
                      {firstItemName}
                    </td>
                    <td className="py-4 px-2 font-bold">
                      ₦{Number(order.totalAmount).toLocaleString()}
                    </td>
                    <td className="py-4 px-2">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="py-4 px-2 text-right text-[#76726E]">
                      {formatOrderDate(order.createdAt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
