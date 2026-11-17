import { fetcher } from "./fetcher";

export interface UserAccount {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "admin" | "customer" | "vendor";
  phoneNumber?: string;
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

export interface UserAccountDetails extends UserAccount {
  addresses?: AddressPayload[];
}

export interface UpdateProfilePayload {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
}

export interface AdminUpdateUserPayload {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  role?: "admin" | "customer" | "vendor";
  isActive?: boolean;
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

  getUserById: (userId: string) =>
    fetcher<UserAccountDetails>(`/users/admin/${userId}`),

  updateUserRole: (id: string, role: "admin" | "customer" | "vendor") =>
    fetcher<UserAccount>(`/users/admin/${id}/role`, {
      method: "PATCH",
      body: JSON.stringify({ role }),
    }),

  toggleUserStatus: (id: string, isActive: boolean) =>
    fetcher<UserAccount>(`/users/admin/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ isActive }),
    }),

  adminUpdateUser: (userId: string, payload: AdminUpdateUserPayload) =>
    fetcher<UserAccount>(`/users/admin/${userId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
};
