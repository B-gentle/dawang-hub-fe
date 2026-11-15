import { API_BASE_URL, fetcher, getAuthToken } from "./fetcher";

export type VendorStatus = "PENDING" | "APPROVED" | "SUSPENDED";

export interface StateShippingRate {
  state: string;
  enabled: boolean;
  fee: number;
}

export interface VendorProfile {
  id: string;
  userId: string;
  storeName: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  bannerUrl?: string;
  whatsappNumber?: string;
  planId?: string;
  planName?: string;
  subscriptionPlan?: string;
  planExpiresAt?: string;
  subscriptionExpiresAt?: string;
  expiresAt?: string;
  pendingBalance?: number;
  withdrawableBalance?: number;
  totalWithdrawn?: number;
  shippingRates?: StateShippingRate[];
  themeConfig?: {
    primaryColor?: string;
    accentColor?: string;
    backgroundColor?: string;
    heroType?: "IMAGE" | "VIDEO";
    heroImages?: string[];
    heroVideoId?: string;
    tagline?: string;
    subtitle?: string;
    location?: string;
    contactAddress?: string;
    minFreeDeliveryFare?: number;
    navCategories?: Array<{
      label?: string;
      name?: string;
      slug?: string;
      id?: string;
    }>;
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
  pendingBalance?: number;
  withdrawableBalance?: number;
  totalWithdrawn?: number;
  recentOrders: Array<{
    id: string;
    totalAmount: number;
    vendorPayoutAmount?: number;
    status: string;
    createdAt: string;
    user?: { firstName: string; lastName: string; email: string };
  }>;
}

export interface VendorWithdrawalRecord {
  id: string;
  amount: number;
  reference: string;
  status: "PENDING" | "SUCCESS" | "FAILED";
  bankCode: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  sessionId?: string;
  failureReason?: string;
  createdAt: string;
}

export interface VendorWalletResponse {
  pendingBalance: number;
  withdrawableBalance: number;
  totalWithdrawn: number;
  bankAccount: {
    bankCode?: string;
    bankName?: string;
    accountNumber?: string;
    accountName?: string;
  };
  pendingTransactions: Array<{
    id: string;
    totalAmount: number;
    vendorPayoutAmount: number;
    shippingFee: number;
    status: string;
    currentLocation?: string;
    deliveredAt?: string;
    createdAt: string;
  }>;
  releasedTransactions: Array<{
    id: string;
    totalAmount: number;
    vendorPayoutAmount: number;
    shippingFee: number;
    status: string;
    confirmedAt?: string;
    createdAt: string;
  }>;
  withdrawals: VendorWithdrawalRecord[];
}

export interface AdminVendorSummary extends VendorProfile {
  status: "PENDING" | "APPROVED" | "SUSPENDED";
  pendingBalance?: number;
  withdrawableBalance?: number;
  totalWithdrawn?: number;
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
  productCount?: number;
  orderCount?: number;
  owner?: {
    id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  };
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

  getMyWallet: () => fetcher<VendorWalletResponse>("/vendors/me/wallet"),

  requestWithdrawal: (amount: number) =>
    fetcher<VendorWithdrawalRecord>("/vendors/me/withdraw", {
      method: "POST",
      body: JSON.stringify({ amount }),
    }),

  updateShippingRates: (shippingRates: StateShippingRate[]) =>
    fetcher<StateShippingRate[]>("/vendors/me/shipping-rates", {
      method: "PATCH",
      body: JSON.stringify({ shippingRates }),
    }),

  getShippingFeeForState: (vendorId: string, state: string) =>
    fetcher<{ supported: boolean; fee: number }>(
      `/vendors/${vendorId}/shipping-fee?state=${encodeURIComponent(state)}`,
    ),

  getStorefrontBySlug: (slug: string) =>
    fetcher<VendorProfile>(`/vendors/storefront/${slug}`),

  getAllVendorsAdmin: (): Promise<AdminVendorSummary[]> =>
    fetcher<AdminVendorSummary[]>("/vendors/admin/all"),

  updateVendorStatusAdmin: (
    vendorId: string,
    status: "PENDING" | "APPROVED" | "SUSPENDED",
  ): Promise<AdminVendorSummary> =>
    fetcher<AdminVendorSummary>(`/vendors/${vendorId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
};
