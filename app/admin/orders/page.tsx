"use client";

import { useState, useEffect } from "react";
import {
  FiShoppingBag,
  FiSearch,
  FiRefreshCw,
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiTruck,
  FiPackage,
  FiCheckCircle,
  FiClock,
  FiXCircle,
} from "react-icons/fi";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import {
  OrderResponse,
  PaginatedOrdersResponse,
  UpdateOrderStatusPayload,
} from "@/lib/api/orders-api";

const ORDER_STATUSES = [
  "ALL",
  "PENDING",
  "PAID",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
] as const;

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [totalOrders, setTotalOrders] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  // Pagination & Filter state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Drawer / Modal details state
  const [selectedOrder, setSelectedOrder] = useState<OrderResponse | null>(
    null,
  );
  const [updating, setUpdating] = useState(false);
  const [editStatus, setEditStatus] =
    useState<UpdateOrderStatusPayload["status"]>("PENDING");
  const [courierName, setCourierName] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");

  const loadOrders = async () => {
    try {
      setLoading(true);
      const skip = (currentPage - 1) * pageSize;

      const res = await apiClient.getAllOrdersAdmin({
        skip,
        limit: pageSize,
        sort: "DESC",
      });

      if (
        res &&
        "data" in res &&
        Array.isArray((res as PaginatedOrdersResponse).data)
      ) {
        const paginated = res as PaginatedOrdersResponse;
        setOrders(paginated.data);
        setTotalOrders(paginated.total);
      } else if (Array.isArray(res)) {
        setOrders(res);
        setTotalOrders(res.length);
      }
    } catch (err) {
      console.error("Failed to load admin orders:", err);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;

    queueMicrotask(() => {
      if (active) {
        loadOrders();
      }
    });

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const handleOpenDetails = async (order: OrderResponse) => {
    setSelectedOrder(order);
    setEditStatus(order.status as UpdateOrderStatusPayload["status"]);
    setCourierName(order.courierName || "");
    setTrackingNumber(order.trackingNumber || "");

    try {
      const detailed = await apiClient.getOrderById(order.id);
      if (detailed) {
        setSelectedOrder(detailed);
        setEditStatus(detailed.status as UpdateOrderStatusPayload["status"]);
        setCourierName(detailed.courierName || "");
        setTrackingNumber(detailed.trackingNumber || "");
      }
    } catch (err) {
      console.warn("Could not fetch full order details:", err);
    }
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    try {
      setUpdating(true);
      const updated = await apiClient.updateOrderStatusAdmin(selectedOrder.id, {
        status: editStatus,
        courierName: courierName.trim() || undefined,
        trackingNumber: trackingNumber.trim() || undefined,
      });

      toast.success(
        `Order #${selectedOrder.id.slice(0, 6)} updated successfully`,
      );
      setSelectedOrder(updated);
      await loadOrders();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to update order status";
      toast.error(msg);
    } finally {
      setUpdating(false);
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (
      statusFilter !== "ALL" &&
      order.status?.toUpperCase() !== statusFilter
    ) {
      return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const refMatches = order.id.toLowerCase().includes(q);
      const nameMatches = order.shippingAddress
        ? `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`
            .toLowerCase()
            .includes(q)
        : false;
      const emailMatches = order.shippingAddress?.email
        ?.toLowerCase()
        .includes(q);

      if (!refMatches && !nameMatches && !emailMatches) return false;
    }

    return true;
  });

  const getStatusBadge = (status: string) => {
    const s = status?.toUpperCase() || "PENDING";
    switch (s) {
      case "DELIVERED":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            <FiCheckCircle className="w-3 h-3" /> Delivered
          </span>
        );
      case "SHIPPED":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-sky-800 bg-sky-50 px-2.5 py-1 rounded-full border border-sky-200">
            <FiTruck className="w-3 h-3" /> Shipped
          </span>
        );
      case "PAID":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
            <FiPackage className="w-3 h-3" /> Paid
          </span>
        );
      case "CANCELLED":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-800 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
            <FiXCircle className="w-3 h-3" /> Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
            <FiClock className="w-3 h-3" /> Pending
          </span>
        );
    }
  };

  const totalPages = Math.ceil(totalOrders / pageSize) || 1;

  return (
    <div className="flex flex-col gap-8 font-sans pb-12 text-[#151413]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold tracking-[0.15em] uppercase text-[#C4956A]">
            MANAGEMENT
          </span>
          <h1 className="font-heading text-3xl font-bold text-[#151413] mt-1">
            Orders ({totalOrders})
          </h1>
          <p className="text-sm text-[#76726E] mt-1">
            Track customer purchases, fulfillment, and shipment status.
          </p>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="bg-white p-4 rounded-lg border border-[#EAE8E4] flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 shadow-xs">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A39E98]" />
          <input
            type="text"
            placeholder="Search by Order ID, customer name, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 bg-[#FAF9F6] border border-[#EAE8E4] rounded-md text-xs text-[#151413] focus:outline-hidden focus:border-[#C4956A] placeholder-[#A39E98]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#76726E] hover:text-[#151413]"
            >
              <FiX className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1 md:pb-0">
          {ORDER_STATUSES.map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wider transition-colors shrink-0 cursor-pointer ${
                statusFilter === status
                  ? "bg-[#151413] text-white"
                  : "bg-[#FAF9F6] text-[#76726E] border border-[#EAE8E4] hover:text-[#151413]"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-lg border border-[#EAE8E4] shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-2 text-xs text-[#76726E]">
            <FiRefreshCw className="w-6 h-6 animate-spin text-[#C4956A]" />
            Loading orders...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-20 bg-[#FAF9F6] flex flex-col items-center justify-center gap-3 text-center p-6">
            <FiShoppingBag className="w-8 h-8 text-[#A39E98]" />
            <p className="text-xs font-semibold text-[#151413]">
              No orders found
            </p>
            <p className="text-[11px] text-[#76726E]">
              Try adjusting your search query or filter criteria.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[750px]">
              <thead>
                <tr className="bg-[#FAF9F6] border-b border-[#EAE8E4] text-[10px] font-bold uppercase tracking-[0.15em] text-[#76726E]">
                  <th className="py-3.5 px-4 font-bold">ORDER ID</th>
                  <th className="py-3.5 px-4 font-bold">CUSTOMER</th>
                  <th className="py-3.5 px-4 font-bold">TOTAL</th>
                  <th className="py-3.5 px-4 font-bold">STATUS</th>
                  <th className="py-3.5 px-4 font-bold">DATE</th>
                  <th className="py-3.5 px-4 font-bold text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#FAF9F6] text-xs">
                {filteredOrders.map((order) => {
                  const customerName = order.shippingAddress
                    ? `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`
                    : "Guest User";

                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-[#FAF9F6]/50 transition-colors"
                    >
                      <td className="py-4 px-4 font-mono font-semibold text-[#151413]">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </td>
                      <td className="py-4 px-4 font-medium">
                        <div className="flex flex-col">
                          <span>{customerName}</span>
                          <span className="text-[10px] text-[#76726E]">
                            {order.shippingAddress?.email}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 font-bold text-[#151413]">
                        ₦{Number(order.totalAmount).toLocaleString()}
                      </td>
                      <td className="py-4 px-4">
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="py-4 px-4 text-[#76726E]">
                        {new Date(order.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={() => handleOpenDetails(order)}
                          className="px-3 py-1.5 bg-[#FAF9F6] border border-[#EAE8E4] rounded-md text-[11px] font-bold uppercase tracking-wider text-[#151413] hover:bg-[#151413] hover:text-white transition-colors cursor-pointer"
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        <div className="p-4 border-t border-[#EAE8E4] bg-[#FAF9F6] flex items-center justify-between text-xs text-[#76726E]">
          <span>
            Page <strong className="text-[#151413]">{currentPage}</strong> of{" "}
            <strong className="text-[#151413]">{totalPages}</strong>
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-2 border border-[#EAE8E4] bg-white rounded-md disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
            >
              <FiChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="p-2 border border-[#EAE8E4] bg-white rounded-md disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
            >
              <FiChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Slide-over Drawer for Order Details & Status Update */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            onClick={() => setSelectedOrder(null)}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
          />
          <div className="relative w-full max-w-md h-full bg-white shadow-2xl p-6 flex flex-col justify-between z-10 overflow-y-auto">
            <div className="flex flex-col gap-6">
              {/* Drawer Header */}
              <div className="flex justify-between items-center pb-4 border-b border-[#EAE8E4]">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-[#C4956A] uppercase tracking-wider">
                    ORDER DETAILS
                  </span>
                  <h3 className="font-heading text-lg font-bold text-[#151413]">
                    #{selectedOrder.id.slice(0, 8).toUpperCase()}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-1 text-[#76726E] hover:text-[#151413] cursor-pointer"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              {/* Customer & Address Details */}
              <div className="bg-[#FAF9F6] p-4 rounded-md border border-[#EAE8E4] flex flex-col gap-2 text-xs">
                <span className="font-bold uppercase tracking-wider text-[10px] text-[#76726E]">
                  Customer Contact & Shipping Address
                </span>
                <span className="font-bold text-[#151413]">
                  {selectedOrder.shippingAddress?.firstName}{" "}
                  {selectedOrder.shippingAddress?.lastName}
                </span>
                <span className="text-[#76726E]">
                  {selectedOrder.shippingAddress?.email}
                </span>
                <span className="text-[#76726E]">
                  {selectedOrder.shippingAddress?.phone}
                </span>
                <span className="text-[#151413] mt-1 pt-2 border-t border-[#EAE8E4]">
                  {selectedOrder.shippingAddress?.streetAddress},{" "}
                  {selectedOrder.shippingAddress?.city},{" "}
                  {selectedOrder.shippingAddress?.state}
                </span>
              </div>

              {/* Itemized Products */}
              {selectedOrder.items && selectedOrder.items.length > 0 && (
                <div className="flex flex-col gap-2.5">
                  <span className="font-bold uppercase tracking-wider text-[10px] text-[#76726E]">
                    Ordered Items ({selectedOrder.items.length})
                  </span>
                  {selectedOrder.items.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 bg-white border border-[#EAE8E4] rounded-md text-xs flex justify-between items-center"
                    >
                      <span>
                        {item.productName}{" "}
                        <strong className="text-[#C4956A]">
                          x{item.quantity}
                        </strong>
                      </span>
                      <span className="font-bold">
                        ₦
                        {(
                          Number(item.unitPrice) * item.quantity
                        ).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Status & Courier Update Form */}
              <form
                onSubmit={handleUpdateStatus}
                className="flex flex-col gap-4 pt-2 border-t border-[#EAE8E4]"
              >
                <span className="font-bold uppercase tracking-wider text-[10px] text-[#76726E]">
                  Update Fulfillment Status
                </span>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-[#76726E] uppercase">
                    Order Status
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) =>
                      setEditStatus(
                        e.target.value as UpdateOrderStatusPayload["status"],
                      )
                    }
                    className="w-full p-2.5 bg-[#FAF9F6] border border-[#EAE8E4] rounded-md text-xs font-semibold text-[#151413] focus:outline-hidden focus:border-[#C4956A]"
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="PAID">PAID</option>
                    <option value="SHIPPED">SHIPPED</option>
                    <option value="DELIVERED">DELIVERED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-[#76726E] uppercase">
                      Courier Name
                    </label>
                    <input
                      type="text"
                      placeholder="DHL Express"
                      value={courierName}
                      onChange={(e) => setCourierName(e.target.value)}
                      className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#EAE8E4] rounded-md text-xs text-[#151413]"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-[#76726E] uppercase">
                      Tracking Number
                    </label>
                    <input
                      type="text"
                      placeholder="DHL-987654321"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#EAE8E4] rounded-md text-xs text-[#151413]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={updating}
                  className="mt-2 w-full py-3 bg-[#151413] text-white rounded-md text-xs font-bold uppercase tracking-widest hover:bg-[#2A2725] transition-colors cursor-pointer disabled:bg-[#A39E98]"
                >
                  {updating ? "Updating..." : "Update Order"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
