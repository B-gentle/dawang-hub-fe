"use client";

import { useEffect, useState } from "react";
import {
  LuPlus,
  LuPencil,
  LuTrash2,
  LuRefreshCw,
  LuCircle,
  LuCircleCheck,
  LuCircleX,
  LuX,
} from "react-icons/lu";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { HelpArticle, CreateHelpArticleInput } from "@/lib/api/help-center-api";

export default function AdminHelpCenterPage() {
  const [articles, setArticles] = useState<HelpArticle[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<HelpArticle | null>(
    null,
  );
  const [formData, setFormData] = useState<CreateHelpArticleInput>({
    title: "",
    category: "Shipping",
    content: "",
    isPublished: true,
  });
  const [submitting, setSubmitting] = useState(false);

  const loadArticles = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getAllArticlesAdmin().catch(() => []);
      setArticles(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch help articles:", err);
      toast.error("Could not load help articles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    queueMicrotask(() => {
      if (isMounted) {
        loadArticles();
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const openAddModal = () => {
    setEditingArticle(null);
    setFormData({
      title: "",
      category: "Shipping",
      content: "",
      isPublished: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (article: HelpArticle) => {
    setEditingArticle(article);
    setFormData({
      title: article.title,
      category: article.category,
      content: article.content,
      isPublished: article.isPublished,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this help article?")) return;

    toast.promise(apiClient.deleteArticle(id), {
      loading: "Deleting article...",
      success: () => {
        setArticles((prev) => prev.filter((a) => a.id !== id));
        return "Article deleted successfully";
      },
      error: (err) =>
        err instanceof Error ? err.message : "Failed to delete article",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editingArticle) {
        const updated = await apiClient.updateArticle(
          editingArticle.id,
          formData,
        );
        setArticles((prev) =>
          prev.map((a) =>
            a.id === editingArticle.id ? { ...a, ...updated } : a,
          ),
        );
        toast.success("Help article updated!");
      } else {
        const created = await apiClient.createArticle(formData);
        setArticles((prev) => [created, ...prev]);
        toast.success("Help article published!");
      }
      setIsModalOpen(false);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to save article",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 font-sans pb-12 text-[#151413]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-[#151413] flex items-center gap-2">
            Help Desk Knowledge Base ({articles.length})
          </h1>
          <p className="text-xs text-[#76726E]">
            Create and edit FAQ guides and customer service knowledge articles.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 bg-[#171514] text-white text-xs font-bold uppercase tracking-wider rounded-md hover:bg-[#2A2725] flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto"
        >
          <LuPlus className="w-4 h-4" /> Add Article
        </button>
      </div>

      {/* Directory Table */}
      <div className="bg-white rounded-lg border border-[#EAE8E4] overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-xs text-[#76726E] flex flex-col items-center gap-2">
            <LuRefreshCw className="w-5 h-5 animate-spin text-[#C4956A]" />
            Fetching knowledge articles...
          </div>
        ) : articles.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center gap-3">
            <LuCircle className="w-8 h-8 text-[#A39E98]" />
            <p className="text-xs text-[#76726E]">
              No help articles created yet.
            </p>
            <button
              onClick={openAddModal}
              className="text-xs font-bold text-[#C4956A] underline uppercase tracking-wider"
            >
              Create first article
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-[#FAF9F6] border-b border-[#EAE8E4] text-[10px] font-bold uppercase tracking-wider text-[#76726E]">
                  <th className="py-3 px-4">Article Title</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Updated</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE8E4] text-xs">
                {articles.map((art) => (
                  <tr
                    key={art.id}
                    className="hover:bg-[#FAF9F6] transition-colors"
                  >
                    <td className="py-3 px-4 font-semibold text-[#151413]">
                      {art.title}
                    </td>
                    <td className="py-3 px-4 font-medium text-[#76726E]">
                      {art.category}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          art.isPublished
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {art.isPublished ? (
                          <LuCircleCheck className="w-3 h-3" />
                        ) : (
                          <LuCircleX className="w-3 h-3" />
                        )}
                        {art.isPublished ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[#76726E]">
                      {new Date(
                        art.updatedAt || art.createdAt,
                      ).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditModal(art)}
                          className="p-1.5 text-[#76726E] hover:text-[#151413] cursor-pointer"
                        >
                          <LuPencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(art.id)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 cursor-pointer"
                        >
                          <LuTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Article Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-[#EAE8E4] w-full max-w-lg p-6 flex flex-col gap-4 text-xs">
            <div className="flex justify-between items-center pb-3 border-b border-[#EAE8E4]">
              <h3 className="font-heading text-base font-bold uppercase tracking-wider text-[#151413]">
                {editingArticle ? "Edit Article" : "Create Help Article"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#76726E] hover:text-[#151413]"
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-bold uppercase tracking-wider text-[#76726E]">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full p-2.5 bg-[#FAF9F6] border border-[#EAE8E4] rounded-md focus:outline-hidden focus:border-[#C4956A]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-bold uppercase tracking-wider text-[#76726E]">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full p-2.5 bg-[#FAF9F6] border border-[#EAE8E4] rounded-md font-semibold"
                >
                  <option value="Shipping">Shipping & Logistics</option>
                  <option value="Returns">Returns & Refunds</option>
                  <option value="Orders">Orders & Tracking</option>
                  <option value="Payments">Payments & Billing</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-bold uppercase tracking-wider text-[#76726E]">
                  Content Body *
                </label>
                <textarea
                  rows={5}
                  required
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  className="w-full p-2.5 bg-[#FAF9F6] border border-[#EAE8E4] rounded-md resize-none"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-2">
                <input
                  type="checkbox"
                  checked={formData.isPublished}
                  onChange={(e) =>
                    setFormData({ ...formData, isPublished: e.target.checked })
                  }
                  className="w-4 h-4 accent-[#C4956A] rounded-xs cursor-pointer"
                />
                <span className="font-bold text-xs text-[#151413]">
                  Publish Immediately
                </span>
              </label>

              <button
                type="submit"
                disabled={submitting}
                className="mt-2 py-2.5 bg-[#171514] text-white font-bold uppercase tracking-wider rounded-md hover:bg-[#2A2725] disabled:opacity-50 transition-colors cursor-pointer"
              >
                {submitting
                  ? "Saving..."
                  : editingArticle
                    ? "Update Article"
                    : "Publish Article"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
