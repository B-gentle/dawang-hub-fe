import { fetcher, API_BASE_URL, getAuthToken } from "./fetcher";

export enum HeroType {
  IMAGE = "image",
  VIDEO = "video",
}

export interface StoreThemeConfig {
  primaryColor?: string;
  accentColor?: string;
  backgroundColor?: string;
  tagline?: string;
  subtitle?: string;
}

export interface VendorPlanConfig {
  id: string;
  name: string;
  durationMonths: number;
  price: number;
  billingLabel: string;
  effectiveMonthlyLabel: string;
  savingsLabel?: string;
  positioning: string;
  recommended?: boolean;
  features: string[];
}

export interface SystemConfig {
  vendorId?: string | null;
  siteName: string;
  logoUrl: string;
  tagline?: string;
  subtitle?: string;
  description?: string;
  contactAddress: string;
  location: string;
  businessHours: string;
  whatsappContact: string;
  heroType: HeroType;
  heroImages: string[];
  heroVideoId: string;
  minFreeDeliveryFare: number;
  paymentEnv?: string;
  vendorPlans?: VendorPlanConfig[];
  themeConfig?: StoreThemeConfig;
}

export interface CloudinaryUploadResult {
  secure_url?: string;
  url?: string;
  public_id?: string;
}

export const systemConfigApi = {
  getPublicConfig: (vendorId?: string) =>
    fetcher<SystemConfig>(
      vendorId
        ? `/system-config?vendorId=${encodeURIComponent(vendorId)}`
        : "/system-config",
    ),

  updateSystemConfig: (data: Partial<SystemConfig>) =>
    fetcher<SystemConfig>("/system-config", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  updateMyVendorConfig: (data: Partial<SystemConfig>) =>
    fetcher<SystemConfig>("/system-config/vendor/me", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  uploadSystemImage: async (file: File): Promise<{ url: string }> => {
    const token = getAuthToken();
    const formData = new FormData();
    formData.append("file", file);

    const headers: Record<string, string> = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE_URL}/system-config/upload-image`, {
      method: "POST",
      headers,
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: "Upload failed" }));
      throw new Error(err.message || "Failed to upload image");
    }

    const data: { url: string | CloudinaryUploadResult } = await res.json();

    const imageUrl =
      typeof data.url === "string"
        ? data.url
        : data.url?.secure_url || data.url?.url || "";

    return { url: imageUrl };
  },

  deleteSystemImage: (imageUrl: string) =>
    fetcher<{ success: boolean }>("/system-config/delete-image", {
      method: "DELETE",
      body: JSON.stringify({ imageUrl }),
    }),
};
