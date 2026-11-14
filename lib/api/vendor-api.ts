import { API_BASE_URL, fetcher, getAuthToken } from "./fetcher";

export type VendorStatus = "PENDING" | "APPROVED" | "SUSPENDED";

export interface VendorProfile {
  id: string;
  userId: string;
  storeName: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  bannerUrl?: string;
  whatsappNumber?: string;
  themeConfig?: {
    primaryColor?: string;
    accentColor?: string;
    heroType?: "IMAGE" | "VIDEO";
    heroImages?: string[];
    heroVideoId?: string;
    tagline?: string;
    subtitle?: string;
    location?: string;
    contactAddress?: string;
    minFreeDeliveryFare?: number;
  };
  businessHours?:
    Record<string, { open: string; close: string; closed?: boolean }> | string;
  bankCode?: string;
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
  monnifySubAccountCode?: string;
  platformCommissionPercent: number;
  status: VendorStatus;
  createdAt: string;
}

export interface OnboardVendorPayload {
  storeName: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  whatsappNumber?: string;
  themeConfig?: Record<string, unknown>;
  businessHours?: Record<string, unknown>;
  bankCode: string;
  bankName: string;
  accountNumber: string;
}

export interface VendorDashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  recentOrders: Array<{
    id: string;
    totalAmount: number;
    status: string;
    createdAt: string;
    user?: { firstName: string; lastName: string; email: string };
  }>;
}

export const vendorApi = {
  stageSetup: async (
    payload: OnboardVendorPayload,
    logoFile: File | null,
    heroFiles: File[],
  ): Promise<{ draftId: string }> => {
    const formData = new FormData();
    formData.append("payload", JSON.stringify(payload));
    if (logoFile) {
      formData.append("logo", logoFile);
    }
    heroFiles.forEach((file) => {
      formData.append("heroImages", file);
    });

    const token = getAuthToken();
    const res = await fetch(`${API_BASE_URL}/vendors/setup/stage`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });

    if (!res.ok) {
      const error = await res
        .json()
        .catch(() => ({ message: "Failed to stage storefront setup" }));
      throw new Error(
        Array.isArray(error.message)
          ? error.message.join(", ")
          : error.message || `Request failed with status ${res.status}`,
      );
    }

    return res.json();
  },

  onboardVendor: (payload: OnboardVendorPayload) =>
    fetcher<VendorProfile>("/vendors/onboard", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getMyStore: () => fetcher<VendorProfile>("/vendors/me"),

  getMyDashboard: () => fetcher<VendorDashboardStats>("/vendors/me/dashboard"),

  getStorefrontBySlug: (slug: string) =>
    fetcher<VendorProfile>(`/vendors/storefront/${slug}`),
};
