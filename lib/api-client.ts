// lib/api-client.ts
import { authApi } from "./api/auth-api";
import { productApi } from "./api/product-api";
import { categoryApi } from "./api/category-api";

export * from "./api/fetcher";
export { authApi, productApi, categoryApi };

export const apiClient = {
  ...authApi,
  ...productApi,
  ...categoryApi,
};
