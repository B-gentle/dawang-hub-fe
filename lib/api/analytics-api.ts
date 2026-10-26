import { fetcher } from "./fetcher";

export interface RevenueOverviewResponse {
  period: string;
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  grossSales?: number;
  discountsTotal?: number;
  chartData?: { label: string; revenue: number; orders: number }[];
}

export interface TopProductAnalytics {
  id: string;
  name: string;
  sku: string;
  totalUnitsSold: number;
  totalRevenue: number;
  stockQuantity: number;
  imageUrl?: string;
}

export interface OrderStatusDistribution {
  pending: number;
  paid: number;
  shipped: number;
  delivered: number;
  cancelled: number;
  total: number;
}

export interface CustomerMetrics {
  totalCustomers: number;
  newSignupsThisMonth: number;
  activeBuyers: number;
  repeatPurchaseRate: number;
}

export const analyticsApi = {
  getRevenueOverview: (
    period: "daily" | "weekly" | "monthly" | "yearly" = "monthly",
  ) =>
    fetcher<RevenueOverviewResponse>(
      `/admin/analytics/revenue-overview?period=${period}`,
    ),

  getTopProducts: (limit = 10) =>
    fetcher<TopProductAnalytics[]>(
      `/admin/analytics/top-products?limit=${limit}`,
    ),

  getOrderStatusStats: () =>
    fetcher<OrderStatusDistribution>("/analytics/order-status-stats"),

  getCustomerMetrics: () => fetcher<CustomerMetrics>("/customer-metrics"),
};
