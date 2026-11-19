import { fetcher } from "./fetcher";

export interface ShippingAddressPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  streetAddress: string;
  city: string;
  state: string;
}

export interface OrderItemPayload {
  productId: string;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}

export interface CreateOrderPayload {
  shippingAddress: ShippingAddressPayload;
  items?: OrderItemPayload[];
  paymentIntentId?: string;
  vendorId?: string;
}

export interface InitializePaymentResponse {
  authorization_url: string;
  access_code: string;
  reference: string;
}

export interface VerifyPaymentResponse {
  status: string;
  reference: string;
  orderId?: string;
}

export interface OrderItemResponse {
  id: string;
  productName: string;
  unitPrice: number;
  vendorUnitPrice?: number;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}

export interface ShipmentCheckpoint {
  location: string;
  status: string;
  note?: string;
  updatedBy: "VENDOR" | "ADMIN" | "SYSTEM" | "CUSTOMER";
  timestamp: string;
}

export interface OrderResponse {
  id: string;
  totalAmount: number;
  shippingFee?: number;
  vendorPayoutAmount?: number;
  escrowCredited?: boolean;
  escrowReleased?: boolean;
  status: string;
  shippingAddress: ShippingAddressPayload;
  items?: OrderItemResponse[];
  courierName?: string;
  trackingNumber?: string;
  currentLocation?: string;
  trackingHistory?: ShipmentCheckpoint[];
  deliveredAt?: string;
  confirmedAt?: string;
  disputeReason?: string;
  disputedAt?: string;
  vendorId?: string;
  vendor?: {
    id: string;
    storeName: string;
    slug?: string;
  } | null;
  createdAt: string;
}

export interface PaginatedOrdersResponse {
  data: OrderResponse[];
  total: number;
  skip: number;
  limit: number;
}

export interface GetOrdersParams {
  skip?: number;
  limit?: number;
  sort?: "ASC" | "DESC";
  vendorId?: string;
}

export interface UpdateOrderStatusPayload {
  status:
    | "PENDING"
    | "PAID"
    | "SHIPPED"
    | "AWAITING_CONFIRMATION"
    | "DELIVERED"
    | "DISPUTED"
    | "CANCELLED";
  courierName?: string;
  trackingNumber?: string;
  currentLocation?: string;
  locationNote?: string;
}

export const ordersApi = {
  createOrder: (payload: CreateOrderPayload) =>
    fetcher<OrderResponse>("/orders/checkout", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getUserOrders: (params?: GetOrdersParams) => {
    const searchParams = new URLSearchParams();
    if (params?.skip !== undefined)
      searchParams.set("skip", params.skip.toString());
    if (params?.limit !== undefined)
      searchParams.set("limit", params.limit.toString());
    if (params?.sort) searchParams.set("sort", params.sort);

    const queryString = searchParams.toString();
    return fetcher<PaginatedOrdersResponse>(
      `/orders${queryString ? `?${queryString}` : ""}`,
    );
  },

  getOrderById: (id: string) => fetcher<OrderResponse>(`/orders/${id}`),

  confirmOrderDelivery: (id: string) =>
    fetcher<OrderResponse>(`/orders/${id}/confirm-delivery`, {
      method: "PATCH",
    }),

  disputeOrder: (id: string, reason: string) =>
    fetcher<OrderResponse>(`/orders/${id}/dispute`, {
      method: "PATCH",
      body: JSON.stringify({ reason }),
    }),

  getVendorOrders: (params?: GetOrdersParams) => {
    const searchParams = new URLSearchParams();
    if (params?.skip !== undefined)
      searchParams.set("skip", params.skip.toString());
    if (params?.limit !== undefined)
      searchParams.set("limit", params.limit.toString());
    if (params?.sort) searchParams.set("sort", params.sort);

    const queryString = searchParams.toString();
    return fetcher<PaginatedOrdersResponse>(
      `/orders/vendor/me${queryString ? `?${queryString}` : ""}`,
    );
  },

  updateVendorOrderStatus: (id: string, payload: UpdateOrderStatusPayload) =>
    fetcher<OrderResponse>(`/orders/vendor/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  getAllOrdersAdmin: (params?: GetOrdersParams) => {
    const searchParams = new URLSearchParams();
    if (params?.skip !== undefined)
      searchParams.set("skip", params.skip.toString());
    if (params?.limit !== undefined)
      searchParams.set("limit", params.limit.toString());
    if (params?.sort) searchParams.set("sort", params.sort);
    if (params?.vendorId) searchParams.set("vendorId", params.vendorId);

    const queryString = searchParams.toString();
    return fetcher<PaginatedOrdersResponse>(
      `/orders/admin/all${queryString ? `?${queryString}` : ""}`,
    );
  },

  updateOrderStatusAdmin: (id: string, payload: UpdateOrderStatusPayload) =>
    fetcher<OrderResponse>(`/orders/admin/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  initializePayment: (orderId: string) =>
    fetcher<InitializePaymentResponse>(`/payments/initialize/${orderId}`, {
      method: "POST",
    }),

  verifyPayment: (reference: string) =>
    fetcher<VerifyPaymentResponse>(`/payments/verify/${reference}`),

  resolveDisputeAdmin: (
    id: string,
    payload: {
      resolution: "RELEASE_TO_VENDOR" | "REFUND_CUSTOMER";
      note?: string;
    },
  ) =>
    fetcher<OrderResponse>(`/orders/admin/${id}/resolve-dispute`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
};
