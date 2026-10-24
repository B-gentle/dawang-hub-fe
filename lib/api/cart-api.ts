import { Product } from "@/types/product";
import { fetcher } from "./fetcher";

export interface CartApiItem {
  id: string; // Cart item ID on backend
  productId: string;
  quantity: number;
  product: Product;
  selectedSize?: string;
  selectedColor?: string;
}

export interface CartApiResponse {
  id?: string;
  items: CartApiItem[];
  subtotal?: number;
}

export const cartApi = {
  // GET /cart
  getCart: () => fetcher<CartApiResponse>("/cart"),

  // POST /cart/items
  addToCart: (productId: string, quantity = 1) =>
    fetcher<CartApiItem>("/cart/items", {
      method: "POST",
      body: JSON.stringify({ productId, quantity }),
    }),

  // PATCH /cart/items/{itemId}
  updateCartItem: (itemId: string, quantity: number) =>
    fetcher<CartApiItem>(`/cart/items/${itemId}`, {
      method: "PATCH",
      body: JSON.stringify({ quantity }),
    }),

  // DELETE /cart/items/{itemId}
  removeCartItem: (itemId: string) =>
    fetcher<{ success: boolean }>(`/cart/items/${itemId}`, {
      method: "DELETE",
    }),

  // DELETE /cart
  clearCart: () =>
    fetcher<{ success: boolean }>("/cart", {
      method: "DELETE",
    }),
};
