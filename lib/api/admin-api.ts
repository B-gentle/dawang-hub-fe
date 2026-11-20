import { fetcher } from "./fetcher";

export type DashboardPeriod = "weekly" | "monthly" | "yearly" | "all";

export interface DashboardKPIs {
  totalRevenue: number;
  revenueGrowthPercentage: number;
  totalOrders: number;
  ordersGrowthPercentage: number;
  paidOrders: number;
  paidOrdersGrowthPercentage: number;
  totalCustomers: number;
  customersGrowthPercentage: number;
  avgOrderValue: number;
  avgOrderValueGrowthPercentage: number;
}

export interface InventoryAlertItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: string;
  discountPrice: string | null;
  stockQuantity: number;
  sku: string;
  images: string[];
  isActive: boolean;
  isFeatured: boolean;
  isPopular: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryAlerts {
  itemsNeedingAttention: number;
  affectedPercentage: number;
  items: InventoryAlertItem[];
}

export interface DashboardAnalyticsResponse {
  period: DashboardPeriod;
  kpis: DashboardKPIs;
  inventoryAlerts: InventoryAlerts;
}

export interface RevenueDataPoint {
  label: string;
  revenue: number;
}

export interface RevenueOverviewResponse {
  period: DashboardPeriod;
  comparedToPreviousPeriodPercentage: number;
  data: RevenueDataPoint[];
}

export interface TopProductItem {
  id: string;
  name: string;
  category: string;
  price: number;
  totalSales: number;
}

export const adminApi = {
  getDashboardAnalytics: (period: DashboardPeriod = "monthly") =>
    fetcher<DashboardAnalyticsResponse>(
      `/admin/analytics/dashboard?period=${period}`,
    ),

  getRevenueOverview: (period: DashboardPeriod = "monthly") =>
    fetcher<RevenueOverviewResponse>(
      `/admin/analytics/revenue-overview?period=${period}`,
    ),

  getTopProducts: (limit = 4) =>
    fetcher<TopProductItem[]>(`/admin/analytics/top-products?limit=${limit}`),
};
