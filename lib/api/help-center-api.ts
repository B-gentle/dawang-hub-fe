import { fetcher } from "./fetcher";

export interface HelpArticle {
  id: string;
  title: string;
  slug: string;
  category: string;
  content: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateHelpArticleInput {
  title: string;
  category: string;
  content: string;
  isPublished?: boolean;
}

export const helpCenterApi = {
  // Public Storefront Endpoints
  getPublishedArticles: (category?: string, search?: string) => {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (search) params.set("search", search);
    const query = params.toString() ? `?${params.toString()}` : "";
    return fetcher<HelpArticle[]>(`/help/articles${query}`);
  },

  getArticleBySlug: (slug: string) =>
    fetcher<HelpArticle>(`/help/articles/${slug}`),

  // Admin Management Endpoints
  getAllArticlesAdmin: () => fetcher<HelpArticle[]>("/admin/help/articles"),

  createArticle: (data: CreateHelpArticleInput) =>
    fetcher<HelpArticle>("/admin/help/articles", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateArticle: (id: string, data: Partial<CreateHelpArticleInput>) =>
    fetcher<HelpArticle>(`/admin/help/articles/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  deleteArticle: (id: string) =>
    fetcher<{ success: boolean }>(`/admin/help/articles/${id}`, {
      method: "DELETE",
    }),
};
