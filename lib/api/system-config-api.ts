import { fetcher, API_BASE_URL, getAuthToken } from "./fetcher";

export enum HeroType {
  IMAGE = "image",
  VIDEO = "video",
}

export interface SystemConfig {
  siteName: string;
  logoUrl: string;
  contactAddress: string;
  location: string;
  businessHours: string;
  whatsappContact: string;
  heroType: HeroType;
  heroImages: string[];
  heroVideoId: string;
  minFreeDeliveryFare: number;
  paymentEnv: string;
}

export interface CloudinaryUploadResult {
  secure_url?: string;
  url?: string;
  public_id?: string;
}

export const systemConfigApi = {
  getPublicConfig: () => fetcher<SystemConfig>("/system-config"),

  updateSystemConfig: (data: Partial<SystemConfig>) =>
    fetcher<SystemConfig>("/system-config", {
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
