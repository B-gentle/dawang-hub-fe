import { Product, CreateProductInput } from "@/types/product";
import { fetcher, API_BASE_URL, getAuthToken } from "./fetcher";

export interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user?: {
    firstName: string;
    lastName: string;
  };
}

export interface CreateReviewInput {
  productId: string;
  rating: number;
  comment: string;
}

export const productApi = {
  getProducts: (query?: string) =>
    fetcher<Product[]>(`/products${query ? `?${query}` : ""}`),

  getProductById: (id: string) => fetcher<Product>(`/products/${id}`),

  createProduct: (data: CreateProductInput) =>
    fetcher<Product>("/products", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateProduct: (id: string, data: Partial<CreateProductInput>) =>
    fetcher<Product>(`/products/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  deleteProduct: (id: string) =>
    fetcher<{ success: boolean }>(`/products/${id}`, {
      method: "DELETE",
    }),

  // --- Review Endpoints ---
  getProductReviews: (productId: string) =>
    fetcher<Review[]>(`/reviews/product/${productId}`),

  createReview: (data: CreateReviewInput) =>
    fetcher<Review>("/reviews", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // --- Wishlist Endpoints ---
  getWishlist: () => fetcher<Product[]>("/wishlist"),

  addToWishlist: (productId: string) =>
    fetcher<{ success: boolean }>(`/wishlist/${productId}`, {
      method: "POST",
    }),

  removeFromWishlist: (productId: string) =>
    fetcher<{ success: boolean }>(`/wishlist/${productId}`, {
      method: "DELETE",
    }),

  uploadToCloudflare: async (
    productId: string,
    file: File,
  ): Promise<{ url: string }> => {
    const token = getAuthToken();
    const formData = new FormData();
    formData.append("images", file);

    const headers: Record<string, string> = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE_URL}/products/${productId}/images`, {
      method: "POST",
      headers,
      body: formData,
    });

    if (!res.ok) {
      const error = await res
        .json()
        .catch(() => ({ message: "Image upload failed" }));
      throw new Error(
        Array.isArray(error.message)
          ? error.message.join(", ")
          : error.message || `Upload failed with status ${res.status}`,
      );
    }

    const data = await res.json();

    const url =
      (Array.isArray(data.images) && data.images.length > 0
        ? data.images[data.images.length - 1]
        : null) ||
      data.url ||
      data.imageUrl ||
      data.data?.url;

    if (!url) {
      throw new Error("No image URL returned from upload server");
    }

    return { url };
  },
};
