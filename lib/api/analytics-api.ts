import { fetcher } from "./fetcher";

export interface RevenueDataPoint {
  label: string;
  revenue: number;
}

export interface RevenueOverviewResponse {
  period: "weekly" | "monthly" | "yearly";
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

export interface TopVendorItem {
  id: string;
  storeName: string;
  slug: string;
  logoUrl: string | null;
  orderCount: number;
  grossSales: number;
  vendorEarnings: number;
  platformFeeEarned: number;
}

export const analyticsApi = {
  getRevenueOverview: (period: "weekly" | "monthly" | "yearly" = "monthly") =>
    fetcher<RevenueOverviewResponse>(
      `/admin/analytics/revenue-overview?period=${period}`,
    ),

  getTopProducts: (limit = 10) =>
    fetcher<TopProductItem[]>(`/admin/analytics/top-products?limit=${limit}`),

  getTopVendors: (
    period: "weekly" | "monthly" | "yearly" = "monthly",
    limit = 5,
  ) =>
    fetcher<TopVendorItem[]>(
      `/admin/analytics/top-vendors?period=${period}&limit=${limit}`,
    ),
};
