import { authApi } from "./api/auth-api";
import { productApi } from "./api/product-api";
import { categoryApi } from "./api/category-api";
import { cartApi } from "./api/cart-api";
import { ordersApi } from "./api/orders-api";
import { usersApi } from "./api/users-api";

export * from "./api/fetcher";
export { authApi, productApi, categoryApi, cartApi, ordersApi, usersApi };

export const apiClient = {
  ...authApi,
  ...productApi,
  ...categoryApi,
  ...cartApi,
  ...ordersApi,
  ...usersApi,
};
