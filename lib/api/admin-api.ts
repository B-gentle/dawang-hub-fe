import { fetcher } from "./fetcher";

export interface DashboardKPIs {
  totalRevenue: number;
  revenueGrowthPercentage: number;
  totalOrders: number;
  ordersGrowthPercentage: number;
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
  period: string;
  kpis: DashboardKPIs;
  inventoryAlerts: InventoryAlerts;
}

export const adminApi = {
  getDashboardAnalytics: () =>
    fetcher<DashboardAnalyticsResponse>("/admin/analytics/dashboard"),
};
