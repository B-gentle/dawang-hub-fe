import { fetcher } from "./fetcher";

export interface UserAccount {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "admin" | "customer";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AddressPayload {
  id?: string;
  streetAddress: string;
  city: string;
  state: string;
  postalCode?: string;
  country?: string;
  isDefault?: boolean;
}

export interface UpdateProfilePayload {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
}

export const usersApi = {
  updateProfile: (data: UpdateProfilePayload) =>
    fetcher("/users/profile", {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  getAddresses: () => fetcher<AddressPayload[]>("/users/addresses"),

  addAddress: (data: AddressPayload) =>
    fetcher<AddressPayload>("/users/addresses", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateAddress: (id: string, data: Partial<AddressPayload>) =>
    fetcher<AddressPayload>(`/users/addresses/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  deleteAddress: (id: string) =>
    fetcher(`/users/addresses/${id}`, {
      method: "DELETE",
    }),

  // --- Admin User Management Endpoints ---
  getAllUsers: () => fetcher<UserAccount[]>("/users/admin/all"),

  updateUserRole: (id: string, role: "admin" | "customer") =>
    fetcher<UserAccount>(`/users/admin/${id}/role`, {
      method: "PATCH",
      body: JSON.stringify({ role }),
    }),

  toggleUserStatus: (id: string, isActive: boolean) =>
    fetcher<UserAccount>(`/users/admin/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ isActive }),
    }),
};
