import { fetcher } from "./fetcher";

export interface StoreSettings {
  storeName: string;
  supportEmail: string;
  supportPhone?: string;
  currency: string;
  currencySymbol: string;
  taxRate: number; // Percentage e.g. 7.5
  defaultShippingFee: number;
  freeShippingThreshold?: number;
  maintenanceMode: boolean;
  allowGuestCheckout: boolean;
  autoApproveOrders: boolean;
  address?: {
    street: string;
    city: string;
    state: string;
    country: string;
  };
}

export const settingsApi = {
  getStoreSettings: () => fetcher<StoreSettings>("/settings"),

  updateStoreSettings: (data: Partial<StoreSettings>) =>
    fetcher<StoreSettings>("/settings", {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
};
