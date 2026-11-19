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
  FiMapPin,
  FiAlertTriangle,
  FiShield,
} from "react-icons/fi";
import { toast } from "sonner";
import {
  ordersApi,
  OrderResponse,
  PaginatedOrdersResponse,
  UpdateOrderStatusPayload,
} from "@/lib/api/orders-api";
import { vendorApi } from "@/lib/api/vendor-api";

export interface VendorOption {
  id: string;
  storeName: string;
}

interface OrdersManagerProps {
  mode: "admin" | "vendor";
  vendors?: VendorOption[];
  initialVendorId?: string;
}

const ORDER_STATUSES = [
  "ALL",
  "DISPUTED",
  "AWAITING_CONFIRMATION",
  "PENDING",
  "PAID",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
] as const;

export default function OrdersManager({
  mode,
  vendors = [],
  initialVendorId = "",
}: OrdersManagerProps) {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [totalOrders, setTotalOrders] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedVendorId, setSelectedVendorId] =
    useState<string>(initialVendorId);
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedOrder, setSelectedOrder] = useState<OrderResponse | null>(
    null,
  );
  const [updating, setUpdating] = useState(false);
  const [resolvingDispute, setResolvingDispute] = useState(false);
  const [resolutionNote, setResolutionNote] = useState("");

  const [editStatus, setEditStatus] =
    useState<UpdateOrderStatusPayload["status"]>("PENDING");
  const [courierName, setCourierName] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [currentLocation, setCurrentLocation] = useState("");
  const [locationNote, setLocationNote] = useState("");

  const loadOrders = async () => {
    try {
      setLoading(true);
      const skip = (currentPage - 1) * pageSize;

      let res: PaginatedOrdersResponse | OrderResponse[];

      if (mode === "admin") {
        res = await ordersApi.getAllOrdersAdmin({
          skip,
          limit: pageSize,
          sort: "DESC",
          vendorId: selectedVendorId || undefined,
        });
      } else {
        res = await ordersApi
          .getVendorOrders({ skip, limit: pageSize, sort: "DESC" })
          .catch(async () => {
            const dash = await vendorApi.getMyDashboard();
            return (dash.recentOrders || []).map((o) => ({
              id: o.id,
              totalAmount: o.totalAmount,
              vendorPayoutAmount: o.vendorPayoutAmount,
              status: o.status,
              createdAt: o.createdAt,
              shippingAddress: {
                firstName: o.user?.firstName || "Customer",
                lastName: o.user?.lastName || "",
                email: o.user?.email || "",
                phone: "",
                streetAddress: "",
                city: "",
                state: "",
              },
            })) as OrderResponse[];
          });
      }

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
      console.error("Failed to load orders:", err);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (active) loadOrders();
    });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, selectedVendorId, mode]);

  const handleOpenDetails = async (order: OrderResponse) => {
    setSelectedOrder(order);
    setEditStatus(order.status as UpdateOrderStatusPayload["status"]);
    setCourierName(order.courierName || "");
    setTrackingNumber(order.trackingNumber || "");
    setCurrentLocation(order.currentLocation || "");
    setLocationNote("");
    setResolutionNote("");

    try {
      const detailed = await ordersApi.getOrderById(order.id);
      if (detailed) {
        setSelectedOrder(detailed);
        setEditStatus(detailed.status as UpdateOrderStatusPayload["status"]);
        setCourierName(detailed.courierName || "");
        setTrackingNumber(detailed.trackingNumber || "");
        setCurrentLocation(detailed.currentLocation || "");
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
      const payload: UpdateOrderStatusPayload = {
        status: editStatus,
        courierName: courierName.trim() || undefined,
        trackingNumber: trackingNumber.trim() || undefined,
        currentLocation: currentLocation.trim() || undefined,
        locationNote: locationNote.trim() || undefined,
      };

      const updated =
        mode === "admin"
          ? await ordersApi.updateOrderStatusAdmin(selectedOrder.id, payload)
          : await ordersApi.updateVendorOrderStatus(selectedOrder.id, payload);

      toast.success(
        `Order #${selectedOrder.id.slice(0, 8).toUpperCase()} updated`,
      );
      setLocationNote("");
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

  const handleResolveDispute = async (
    resolution: "RELEASE_TO_VENDOR" | "REFUND_CUSTOMER",
  ) => {
    if (!selectedOrder) return;

    const confirmMessage =
      resolution === "RELEASE_TO_VENDOR"
        ? "Release escrow funds to the vendor's withdrawable balance and close this dispute?"
        : "Cancel this order and deduct held escrow funds from the vendor's pending balance?";

    if (!confirm(confirmMessage)) return;

    try {
      setResolvingDispute(true);
      const updated = await ordersApi.resolveDisputeAdmin(selectedOrder.id, {
        resolution,
        note: resolutionNote.trim() || undefined,
      });
      toast.success(
        resolution === "RELEASE_TO_VENDOR"
          ? "Dispute resolved: Escrow released to vendor."
          : "Dispute resolved: Order cancelled & escrow reversed.",
      );
      setResolutionNote("");
      setSelectedOrder(updated);
      await loadOrders();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to resolve dispute",
      );
    } finally {
      setResolvingDispute(false);
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
      case "DISPUTED":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-800 bg-rose-100 px-2.5 py-1 rounded-full border border-rose-300">
            <FiAlertTriangle className="w-3 h-3" /> Disputed
          </span>
        );
      case "AWAITING_CONFIRMATION":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-800 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
            <FiClock className="w-3 h-3" /> Awaiting Confirmation
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
            <FiPackage className="w-3 h-3" />{" "}
            {mode === "vendor" ? "Paid (In Escrow)" : "Paid"}
          </span>
        );
      case "CANCELLED":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-stone-700 bg-stone-100 px-2.5 py-1 rounded-full border border-stone-200">
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

  const getVendorName = (vendorId?: string) => {
    if (!vendorId) return "Platform Direct";
    const found = vendors.find((v) => v.id === vendorId);
    return found ? found.storeName : `#${vendorId.slice(0, 6)}`;
  };

  const totalPages = Math.ceil(totalOrders / pageSize) || 1;
  const isSelectedDisputed =
    selectedOrder?.status?.toUpperCase() === "DISPUTED";

  return (
    <div className="flex flex-col gap-8 font-sans pb-12 text-[#151413]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold tracking-[0.15em] uppercase text-[#C4956A]">
            {mode === "admin"
              ? "PLATFORM MANAGEMENT"
              : "FULFILLMENT & TRACKING"}
          </span>
          <h1 className="font-heading text-3xl font-bold text-[#151413] mt-1">
            {mode === "admin"
              ? `Orders (${totalOrders})`
              : `Store Orders (${totalOrders})`}
          </h1>
          <p className="text-sm text-[#76726E] mt-1">
            {mode === "admin"
              ? "Monitor customer purchases, vendor fulfillment, disputes, and shipment checkpoints."
              : "Update shipment checkpoints and mark orders delivered so customers can confirm receipt."}
          </p>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="bg-white p-4 rounded-lg border border-[#EAE8E4] flex flex-col gap-4 shadow-xs">
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
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

          {mode === "admin" && vendors.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#76726E]">
                Vendor:
              </span>
              <select
                value={selectedVendorId}
                onChange={(e) => {
                  setSelectedVendorId(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 bg-[#FAF9F6] border border-[#EAE8E4] rounded-md text-xs font-semibold text-[#151413] focus:outline-hidden focus:border-[#C4956A] cursor-pointer"
              >
                <option value="">All Storefronts</option>
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.storeName}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1 md:pb-0 pt-2 border-t border-[#EAE8E4]">
          {ORDER_STATUSES.map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wider transition-colors shrink-0 cursor-pointer ${
                statusFilter === status
                  ? status === "DISPUTED"
                    ? "bg-rose-700 text-white"
                    : "bg-[#151413] text-white"
                  : status === "DISPUTED"
                    ? "bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100"
                    : "bg-[#FAF9F6] text-[#76726E] border border-[#EAE8E4] hover:text-[#151413]"
              }`}
            >
              {status.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
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
            <table className="w-full text-left border-collapse min-w-187.5">
              <thead>
                <tr className="bg-[#FAF9F6] border-b border-[#EAE8E4] text-[10px] font-bold uppercase tracking-[0.15em] text-[#76726E]">
                  <th className="py-3.5 px-4 font-bold">ORDER ID</th>
                  <th className="py-3.5 px-4 font-bold">CUSTOMER</th>
                  {mode === "admin" && (
                    <th className="py-3.5 px-4 font-bold">VENDOR</th>
                  )}
                  <th className="py-3.5 px-4 font-bold">
                    {mode === "vendor" ? "YOUR PAYOUT" : "TOTAL"}
                  </th>
                  <th className="py-3.5 px-4 font-bold">LOCATION</th>
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

                  const displayAmount =
                    mode === "vendor"
                      ? Number(order.vendorPayoutAmount ?? order.totalAmount)
                      : Number(order.totalAmount);

                  const isDisputed = order.status?.toUpperCase() === "DISPUTED";

                  return (
                    <tr
                      key={order.id}
                      className={
                        isDisputed
                          ? "bg-rose-50/40 hover:bg-rose-50/70 transition-colors"
                          : "hover:bg-[#FAF9F6]/50 transition-colors"
                      }
                    >
                      <td className="py-4 px-4 font-mono font-semibold text-[#151413]">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </td>
                      <td className="py-4 px-4 font-medium">
                        <div className="flex flex-col">
                          <span>{customerName}</span>
                          <span className="text-[10px] text-[#76726E]">
                            {order.shippingAddress?.state ||
                              order.shippingAddress?.email}
                          </span>
                        </div>
                      </td>
                      {mode === "admin" && (
                        <td className="py-4 px-4 font-semibold text-[#76726E]">
                          {getVendorName(order.vendorId)}
                        </td>
                      )}
                      <td className="py-4 px-4 font-bold text-[#151413]">
                        ₦{displayAmount.toLocaleString()}
                      </td>
                      <td className="py-4 px-4 text-[#76726E]">
                        {order.currentLocation || "—"}
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
                          className={`px-3 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                            isDisputed && mode === "admin"
                              ? "bg-rose-700 text-white hover:bg-rose-800"
                              : "bg-[#FAF9F6] border border-[#EAE8E4] text-[#151413] hover:bg-[#151413] hover:text-white"
                          }`}
                        >
                          {isDisputed && mode === "admin"
                            ? "Resolve Dispute"
                            : "Manage"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

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

      {/* Order Details & Tracking Slide-over Drawer */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            onClick={() => setSelectedOrder(null)}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
          />
          <div className="relative w-full max-w-md h-full bg-white shadow-2xl p-6 flex flex-col justify-between z-10 overflow-y-auto">
            <div className="flex flex-col gap-6">
              <div className="flex justify-between items-center pb-4 border-b border-[#EAE8E4]">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-[#C4956A] uppercase tracking-wider">
                    ORDER & SHIPMENT TRACKING
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

              {/* Dispute Alert & Admin Resolution Panel */}
              {isSelectedDisputed && (
                <div className="bg-rose-50 border border-rose-200 rounded-lg p-4 flex flex-col gap-3 text-xs">
                  <div className="flex items-start gap-2 text-rose-900">
                    <FiAlertTriangle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold uppercase tracking-wider text-[11px]">
                        Customer Dispute Opened
                      </p>
                      {selectedOrder.disputedAt && (
                        <p className="text-[10px] text-rose-700">
                          Opened{" "}
                          {new Date(selectedOrder.disputedAt).toLocaleString()}
                        </p>
                      )}
                      <p className="mt-1.5 text-rose-950 font-medium">
                        &ldquo;
                        {selectedOrder.disputeReason ||
                          "No reason provided by customer"}
                        &rdquo;
                      </p>
                    </div>
                  </div>

                  {mode === "admin" ? (
                    <div className="pt-2 border-t border-rose-200 flex flex-col gap-2.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800 flex items-center gap-1">
                        <FiShield className="w-3.5 h-3.5" /> Admin Dispute
                        Resolution
                      </span>
                      <input
                        type="text"
                        placeholder="Resolution note (optional, recorded in timeline)"
                        value={resolutionNote}
                        onChange={(e) => setResolutionNote(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-rose-200 rounded-md text-xs text-[#151413]"
                      />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <button
                          type="button"
                          disabled={resolvingDispute}
                          onClick={() =>
                            handleResolveDispute("RELEASE_TO_VENDOR")
                          }
                          className="px-3 py-2 bg-emerald-700 text-white rounded-md text-[10px] font-bold uppercase tracking-wider hover:bg-emerald-800 disabled:opacity-50 cursor-pointer"
                        >
                          {resolvingDispute
                            ? "Processing..."
                            : "Release Escrow to Vendor"}
                        </button>
                        <button
                          type="button"
                          disabled={resolvingDispute}
                          onClick={() =>
                            handleResolveDispute("REFUND_CUSTOMER")
                          }
                          className="px-3 py-2 bg-rose-700 text-white rounded-md text-[10px] font-bold uppercase tracking-wider hover:bg-rose-800 disabled:opacity-50 cursor-pointer"
                        >
                          {resolvingDispute
                            ? "Processing..."
                            : "Cancel & Reverse Escrow"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-[11px] text-rose-800 pt-2 border-t border-rose-200">
                      Escrow payout is paused while platform administrators
                      review this dispute.
                    </p>
                  )}
                </div>
              )}

              {/* Financial Breakdown */}
              <div className="bg-[#FAF9F6] p-4 rounded-md border border-[#EAE8E4] grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase text-[#76726E]">
                    {mode === "vendor" ? "Your Net Payout" : "Order Total"}
                  </span>
                  <p className="text-sm font-bold text-emerald-700 mt-0.5">
                    ₦
                    {Number(
                      mode === "vendor"
                        ? (selectedOrder.vendorPayoutAmount ??
                            selectedOrder.totalAmount)
                        : selectedOrder.totalAmount,
                    ).toLocaleString()}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-[#76726E]">
                    Delivery Fee
                  </span>
                  <p className="text-sm font-bold text-[#151413] mt-0.5">
                    ₦{Number(selectedOrder.shippingFee || 0).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Customer Contact & Shipping Address */}
              <div className="bg-[#FAF9F6] p-4 rounded-md border border-[#EAE8E4] flex flex-col gap-1.5 text-xs">
                <span className="font-bold uppercase tracking-wider text-[10px] text-[#76726E]">
                  Destination Address
                </span>
                <span className="font-bold text-[#151413]">
                  {selectedOrder.shippingAddress?.firstName}{" "}
                  {selectedOrder.shippingAddress?.lastName}
                </span>
                <span className="text-[#76726E]">
                  {selectedOrder.shippingAddress?.email}{" "}
                  {selectedOrder.shippingAddress?.phone
                    ? `• ${selectedOrder.shippingAddress.phone}`
                    : ""}
                </span>
                {selectedOrder.shippingAddress?.streetAddress && (
                  <span className="text-[#151413] mt-1 pt-2 border-t border-[#EAE8E4]">
                    {selectedOrder.shippingAddress.streetAddress},{" "}
                    {selectedOrder.shippingAddress.city},{" "}
                    <strong>{selectedOrder.shippingAddress.state}</strong>
                  </span>
                )}
              </div>

              {/* Ordered Items */}
              {selectedOrder.items && selectedOrder.items.length > 0 && (
                <div className="flex flex-col gap-2">
                  <span className="font-bold uppercase tracking-wider text-[10px] text-[#76726E]">
                    Ordered Items ({selectedOrder.items.length})
                  </span>
                  {selectedOrder.items.map((item) => {
                    const unit =
                      mode === "vendor"
                        ? Number(item.vendorUnitPrice ?? item.unitPrice)
                        : Number(item.unitPrice);
                    return (
                      <div
                        key={item.id}
                        className="p-3 bg-white border border-[#EAE8E4] rounded-md text-xs flex justify-between items-start"
                      >
                        <div className="flex flex-col gap-1">
                          <span className="font-semibold text-[#151413]">
                            {item.productName}{" "}
                            <strong className="text-[#C4956A]">
                              x{item.quantity}
                            </strong>
                          </span>
                          <div className="flex flex-wrap items-center gap-1.5">
                            {item.selectedSize && (
                              <span className="text-[10px] font-bold bg-[#FAF9F6] border border-[#EAE8E4] px-2 py-0.5 rounded-xs">
                                Size: {item.selectedSize}
                              </span>
                            )}
                            {item.selectedColor && (
                              <span className="text-[10px] font-bold bg-[#FAF9F6] border border-[#EAE8E4] px-2 py-0.5 rounded-xs">
                                Color: {item.selectedColor}
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="font-bold shrink-0">
                          ₦{(unit * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Shipment Tracking Timeline */}
              {selectedOrder.trackingHistory &&
                selectedOrder.trackingHistory.length > 0 && (
                  <div className="flex flex-col gap-2 pt-2 border-t border-[#EAE8E4]">
                    <span className="font-bold uppercase tracking-wider text-[10px] text-[#76726E]">
                      Shipment Timeline
                    </span>
                    <div className="flex flex-col gap-2.5 pl-3 border-l-2 border-[#C4956A]">
                      {selectedOrder.trackingHistory.map((cp, idx) => (
                        <div key={idx} className="text-xs">
                          <p className="font-bold text-[#151413]">
                            {cp.location}{" "}
                            <span className="text-[10px] font-normal text-[#C4956A]">
                              ({cp.status.replace("_", " ")})
                            </span>
                          </p>
                          {cp.note && (
                            <p className="text-[#76726E] text-[11px]">
                              {cp.note}
                            </p>
                          )}
                          <p className="text-[10px] text-[#A39E98]">
                            {new Date(cp.timestamp).toLocaleString()} •{" "}
                            {cp.updatedBy}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Update Fulfillment & Location Form */}
              {!(mode === "vendor" && isSelectedDisputed) && (
                <form
                  onSubmit={handleUpdateStatus}
                  className="flex flex-col gap-4 pt-3 border-t border-[#EAE8E4]"
                >
                  <span className="font-bold uppercase tracking-wider text-[10px] text-[#76726E]">
                    Update Status & Current Location
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
                      {mode === "admin" && <option value="PAID">PAID</option>}
                      <option value="SHIPPED">SHIPPED (In Transit)</option>
                      <option value="DELIVERED">
                        DELIVERED (Triggers 24h Customer Confirmation)
                      </option>
                      {mode === "admin" && (
                        <option value="DISPUTED">DISPUTED</option>
                      )}
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-[#76726E] uppercase flex items-center gap-1">
                      <FiMapPin className="w-3.5 h-3.5 text-[#C4956A]" />{" "}
                      Current Package Location
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Dispatched from Ikeja Hub"
                      value={currentLocation}
                      onChange={(e) => setCurrentLocation(e.target.value)}
                      className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#EAE8E4] rounded-md text-xs text-[#151413]"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-[#76726E] uppercase">
                      Tracking Note (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Rider out for doorstep delivery"
                      value={locationNote}
                      onChange={(e) => setLocationNote(e.target.value)}
                      className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#EAE8E4] rounded-md text-xs text-[#151413]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold text-[#76726E] uppercase">
                        Courier Name
                      </label>
                      <input
                        type="text"
                        placeholder="GIG Logistics"
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
                        placeholder="TRK-987654"
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
                    {updating ? "Updating..." : "Save Tracking & Status"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
