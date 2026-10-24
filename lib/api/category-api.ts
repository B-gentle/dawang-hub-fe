import {
  Category,
  CreateCategoryInput,
  UpdateCategoryInput,
} from "@/types/category";
import { fetcher } from "../api-client";

export const categoryApi = {
  getCategories: (query?: string) =>
    fetcher<Category[]>(`/categories${query ? `?${query}` : ""}`),

  getCategoryById: (id: string) => fetcher<Category>(`/categories/${id}`),

  createCategory: (data: CreateCategoryInput) =>
    fetcher<Category>("/categories", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateCategory: (id: string, data: UpdateCategoryInput) =>
    fetcher<Category>(`/categories/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  deleteCategory: (id: string) =>
    fetcher<{ success: boolean }>(`/categories/${id}`, {
      method: "DELETE",
    }),
};
