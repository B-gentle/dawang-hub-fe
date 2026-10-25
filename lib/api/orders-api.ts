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
}

export interface CreateOrderPayload {
  shippingAddress: ShippingAddressPayload;
  items?: OrderItemPayload[];
  paymentIntentId?: string;
}

export interface OrderResponse {
  id: string;
  totalAmount: number;
  status: string;
  shippingAddress: ShippingAddressPayload;
  createdAt: string;
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
}

export const ordersApi = {
  createOrder: (payload: CreateOrderPayload) =>
    fetcher<OrderResponse>("/orders/checkout", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getUserOrders: () => fetcher<OrderResponse[]>("/orders"),

  getAllOrdersAdmin: (params?: GetOrdersParams) => {
    const searchParams = new URLSearchParams();
    if (params?.skip !== undefined)
      searchParams.set("skip", params.skip.toString());
    if (params?.limit !== undefined)
      searchParams.set("limit", params.limit.toString());
    if (params?.sort) searchParams.set("sort", params.sort);

    const queryString = searchParams.toString();
    return fetcher<PaginatedOrdersResponse>(
      `/orders/admin/all${queryString ? `?${queryString}` : ""}`,
    );
  },

  initializePayment: (orderId: string) =>
    fetcher<InitializePaymentResponse>(`/payments/initialize/${orderId}`, {
      method: "POST",
    }),

  verifyPayment: (reference: string) =>
    fetcher<VerifyPaymentResponse>(`/payments/verify/${reference}`),
};
