"use client";

import Link from "next/link";
import { FiShoppingBag, FiClock, FiCheck } from "react-icons/fi";

export interface OrderItemResponse {
  id: string;
  productName: string;
  unitPrice: number;
  quantity: number;
}

export interface OrderResponse {
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

interface OrderListProps {
  orders: OrderResponse[];
}

export default function OrderList({ orders }: OrderListProps) {
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

  if (orders.length === 0) {
    return (
      <div className="p-8 border border-[#EAE8E4] bg-[#FAF9F6] rounded-md text-center flex flex-col items-center gap-3">
        <FiShoppingBag className="w-8 h-8 text-[#A39E98]" />
        <p className="font-heading text-xs font-bold uppercase text-[#151413]">
          No Orders Placed Yet
        </p>
        <p className="text-xs text-[#76726E] max-w-xs">
          Your future purchases will appear here along with live tracking
          status.
        </p>
        <Link
          href="/shop"
          className="mt-2 px-6 py-2.5 bg-[#151413] text-white text-xs font-bold uppercase tracking-widest rounded-md hover:bg-[#2A2725] transition-colors"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 font-sans text-[#151413]">
      {orders.map((order) => (
        <div
          key={order.id}
          className="border border-[#EAE8E4] bg-white rounded-md p-5 flex flex-col gap-4 shadow-xs"
        >
          {/* Header Row with Date, Reference, Status Badge & Total */}
          <div className="flex flex-wrap justify-between items-center gap-2 pb-3 border-b border-[#EAE8E4]">
            <div className="flex flex-col">
              <span className="text-[10px] font-mono text-[#76726E] uppercase">
                Ref: {order.id}
              </span>
              <span className="text-xs text-[#76726E]">
                {new Date(order.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
            <div className="flex items-center gap-3">
              {getStatusBadge(order.status)}
              <span className="font-bold text-sm text-[#151413]">
                ₦{Number(order.totalAmount).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Itemized Receipts */}
          {order.items && order.items.length > 0 && (
            <div className="flex flex-col gap-2 pt-1">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center text-xs text-[#151413]"
                >
                  <span className="font-medium">
                    {item.productName}{" "}
                    <span className="text-[#76726E]">x{item.quantity}</span>
                  </span>
                  <span className="font-bold text-[#C4956A]">
                    ₦{(Number(item.unitPrice) * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
