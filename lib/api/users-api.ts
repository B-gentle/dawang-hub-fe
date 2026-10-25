import { fetcher } from "./fetcher";

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
  phone?: string;
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
};
