import { API_BASE_URL, fetcher, getAuthToken } from "./fetcher";

export type VendorStatus = "PENDING" | "APPROVED" | "SUSPENDED" | "EXPIRED";

export interface StateShippingRate {
  state: string;
  enabled: boolean;
  fee: number;
}

export interface VendorShippingOptionsResponse {
  isDefaultFlatRate: boolean;
  defaultFlatRate: number;
  states: Array<{
    state: string;
    fee: number;
  }>;
}

export interface VendorKycStatus {
  bvnVerified: boolean;
  bvnLast4: string | null;
  bvnVerifiedAt: string | null;
  ninVerified: boolean;
  ninLast4: string | null;
  ninVerifiedAt: string | null;
  ninThresholdAmount: number;
  kycPolicyVersion: string;
}

export interface KycAuditRecord {
  id: string;
  vendorId: string;
  adminUserId: string;
  adminEmail: string;
  action: string;
  reason?: string | null;
  ipAddress?: string | null;
  createdAt: string;
}

export interface AdminRevealedKycResponse {
  vendorId: string;
  storeName: string;
  accountName?: string;
  bvnVerified: boolean;
  bvn: string | null;
  bvnVerifiedAt?: string | null;
  ninVerified: boolean;
  nin: string | null;
  ninVerifiedAt?: string | null;
  kycConsentAccepted: boolean;
  kycConsentAcceptedAt?: string | null;
  kycPolicyVersion: string;
  auditTrail: KycAuditRecord[];
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
  planName?: string | null;
  planExpiresAt?: string | null;
  isExpired?: boolean;
  daysRemaining?: number | null;
  pendingBalance?: number;
  withdrawableBalance?: number;
  totalWithdrawn?: number;
  shippingRates?: StateShippingRate[];
  bvnVerified?: boolean;
  bvnLast4?: string | null;
  bvnVerifiedAt?: string | null;
  ninVerified?: boolean;
  ninLast4?: string | null;
  ninVerifiedAt?: string | null;
  kycConsentAccepted?: boolean;
  kycConsentAcceptedAt?: string | null;
  kycPolicyVersion?: string;
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
  termsAccepted: boolean;
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

export interface LedgerPageMeta {
  page: number;
  total: number;
  totalPages: number;
}

export interface WalletLedgerPagination {
  limit: number;
  pending: LedgerPageMeta;
  released: LedgerPageMeta;
  withdrawals: LedgerPageMeta;
}

export interface VendorWalletLedgerQuery {
  pendingPage?: number;
  releasedPage?: number;
  withdrawalsPage?: number;
  limit?: number;
}

export interface VendorWalletResponse {
  vendor?: {
    id: string;
    storeName: string;
    slug: string;
    status: VendorStatus;
    ownerEmail: string | null;
    ownerName: string | null;
  };
  pendingBalance: number;
  withdrawableBalance: number;
  totalWithdrawn: number;
  kycStatus?: VendorKycStatus;
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
  pagination?: WalletLedgerPagination;
}

export type PlatformTransactionTab =
  "ALL" | "ESCROW" | "RELEASED" | "DISPUTED" | "WITHDRAWALS";

export interface PlatformOrderLedgerItem {
  type: "ORDER";
  id: string;
  vendorId: string | null;
  vendorStoreName: string;
  vendorSlug: string | null;
  customerEmail: string | null;
  totalAmount: number;
  shippingFee: number;
  vendorPayoutAmount: number;
  grossCommission2Percent: number;
  monnifyFee15Percent: number;
  netProfit05Percent: number;
  status: string;
  escrowReleased: boolean;
  confirmedAt: string | null;
  createdAt: string;
}

export interface PlatformWithdrawalLedgerItem {
  type: "WITHDRAWAL";
  id: string;
  reference: string;
  vendorId: string;
  vendorStoreName: string;
  vendorSlug: string | null;
  amount: number;
  bankName: string;
  accountNumber: string;
  accountName: string;
  status: "PENDING" | "SUCCESS" | "FAILED";
  failureReason: string | null;
  createdAt: string;
}

export type PlatformLedgerItem =
  PlatformOrderLedgerItem | PlatformWithdrawalLedgerItem;

export interface PlatformTransactionsResponse {
  summary: {
    paidOrdersCount: number;
    grossCustomerVolume: number;
    productBaseGmv: number;
    totalShippingCollected: number;
    totalVendorEarnings: number;
    grossCommission2Percent: number;
    monnifyFee15Percent: number;
    netProfit05Percent: number;
    escrowHeldTotal: number;
    releasedToVendorsTotal: number;
    totalDisbursedWithdrawals: number;
    disbursedWithdrawalsCount: number;
  };
  topVendorsByProfit: Array<{
    vendorId: string | null;
    storeName: string;
    slug: string | null;
    orderCount: number;
    grossVolume: number;
    grossCommission2Percent: number;
    monnifyFee15Percent: number;
    netProfit05Percent: number;
  }>;
  monthlyBreakdown: Array<{
    month: string;
    orderCount: number;
    grossVolume: number;
    grossCommission2Percent: number;
    monnifyFee15Percent: number;
    netProfit05Percent: number;
  }>;
  items: PlatformLedgerItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AdminVendorSummary extends VendorProfile {
  status: VendorStatus;
  pendingBalance?: number;
  withdrawableBalance?: number;
  totalWithdrawn?: number;
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
  productCount?: number;
  orderCount?: number;
  storageUsedBytes?: number;
  owner?: {
    id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  };
}

export interface PlatformStorageStats {
  totalVendorStorageBytes: number;
  totalPlatformStorageBytes: number;
  accountLimitBytes: number;
  topHeavyVendors: Array<{
    id: string;
    storeName: string;
    slug: string;
    logoUrl: string | null;
    status: VendorStatus;
    ownerEmail: string | null;
    storageUsedBytes: number;
  }>;
}

function buildWalletQueryString(query?: VendorWalletLedgerQuery): string {
  if (!query) return "";
  const params = new URLSearchParams();
  if (query.pendingPage) params.set("pendingPage", String(query.pendingPage));
  if (query.releasedPage)
    params.set("releasedPage", String(query.releasedPage));
  if (query.withdrawalsPage)
    params.set("withdrawalsPage", String(query.withdrawalsPage));
  if (query.limit) params.set("limit", String(query.limit));
  const str = params.toString();
  return str ? `?${str}` : "";
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

  getMyWallet: (query?: VendorWalletLedgerQuery) =>
    fetcher<VendorWalletResponse>(
      `/vendors/me/wallet${buildWalletQueryString(query)}`,
    ),

  getVendorWalletAdmin: (vendorId: string, query?: VendorWalletLedgerQuery) =>
    fetcher<VendorWalletResponse>(
      `/vendors/admin/${vendorId}/wallet${buildWalletQueryString(query)}`,
    ),

  getPlatformTransactionsAdmin: (query?: {
    page?: number;
    limit?: number;
    tab?: PlatformTransactionTab;
    vendorId?: string;
    search?: string;
  }) => {
    const params = new URLSearchParams();
    if (query?.page) params.set("page", String(query.page));
    if (query?.limit) params.set("limit", String(query.limit));
    if (query?.tab) params.set("tab", query.tab);
    if (query?.vendorId) params.set("vendorId", query.vendorId);
    if (query?.search?.trim()) params.set("search", query.search.trim());
    const qs = params.toString();
    return fetcher<PlatformTransactionsResponse>(
      `/vendors/admin/platform-transactions${qs ? `?${qs}` : ""}`,
    );
  },

  verifyMyBvn: (bvn: string, consentAccepted: boolean) =>
    fetcher<VendorKycStatus>("/vendors/me/kyc/bvn", {
      method: "POST",
      body: JSON.stringify({ bvn, consentAccepted }),
    }),

  verifyMyNin: (nin: string, consentAccepted: boolean) =>
    fetcher<VendorKycStatus>("/vendors/me/kyc/nin", {
      method: "POST",
      body: JSON.stringify({ nin, consentAccepted }),
    }),

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

  getShippingOptions: (vendorId: string) =>
    fetcher<VendorShippingOptionsResponse>(
      `/vendors/${vendorId}/shipping-options`,
    ),

  getShippingFeeForState: (vendorId: string, state: string) =>
    fetcher<{ supported: boolean; fee: number; isDefaultFlatRate?: boolean }>(
      `/vendors/${vendorId}/shipping-fee?state=${encodeURIComponent(state)}`,
    ),

  getStorefrontBySlug: (slug: string) =>
    fetcher<VendorProfile>(`/vendors/storefront/${slug}`),

  getAllVendorsAdmin: (): Promise<AdminVendorSummary[]> =>
    fetcher<AdminVendorSummary[]>("/vendors/admin/all"),

  getPlatformStorageStatsAdmin: (): Promise<PlatformStorageStats> =>
    fetcher<PlatformStorageStats>("/vendors/admin/storage"),

  revealVendorKycAdmin: (
    vendorId: string,
    masterKey: string,
    reason: string,
  ): Promise<AdminRevealedKycResponse> =>
    fetcher<AdminRevealedKycResponse>(`/vendors/admin/${vendorId}/kyc/reveal`, {
      method: "POST",
      headers: {
        "x-kyc-master-key": masterKey,
      },
      body: JSON.stringify({ reason }),
    }),

  updateVendorStatusAdmin: (
    vendorId: string,
    status: VendorStatus,
  ): Promise<AdminVendorSummary> =>
    fetcher<AdminVendorSummary>(`/vendors/${vendorId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  deleteMyAccount: (confirmationText: string) =>
    fetcher<{ deleted: true; message: string }>("/vendors/me", {
      method: "DELETE",
      body: JSON.stringify({ confirmationText }),
    }),
};
