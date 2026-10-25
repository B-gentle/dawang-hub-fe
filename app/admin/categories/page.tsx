"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  FiFolder,
  FiPlus,
  FiSearch,
  FiRefreshCw,
  FiEdit2,
  FiTrash2,
  FiX,
  FiCheck,
  FiImage,
} from "react-icons/fi";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import {
  Category,
  CreateCategoryInput,
  UpdateCategoryInput,
} from "@/types/category";

interface CategoryFormData {
  name: string;
  description: string;
  imageUrl: string;
  parentId: string;
  isActive: boolean;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState<CategoryFormData>({
    name: "",
    description: "",
    imageUrl: "",
    parentId: "",
    isActive: true,
  });

  const loadCategories = async () => {
    try {
      setLoading(true);
      const res = await apiClient.getCategories();
      let list: Category[] = [];
      if (Array.isArray(res)) {
        list = res;
      } else if (
        res &&
        "data" in res &&
        Array.isArray((res as { data: Category[] }).data)
      ) {
        list = (res as { data: Category[] }).data;
      }
      setCategories(list);
    } catch (err) {
      console.error("Failed to load categories:", err);
      toast.error("Failed to fetch store categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;

    queueMicrotask(() => {
      if (active) {
        loadCategories();
      }
    });

    return () => {
      active = false;
    };
  }, []);

  const handleOpenModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name || "",
        description: category.description || "",
        imageUrl: category.imageUrl || "",
        parentId: category.parentId || "",
        isActive: category.isActive ?? true,
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: "",
        description: "",
        imageUrl: "",
        parentId: "",
        isActive: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Category name is required");
      return;
    }

    try {
      setSaving(true);

      if (editingCategory) {
        const updatePayload: UpdateCategoryInput = {
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          imageUrl: formData.imageUrl.trim() || undefined,
          parentId: formData.parentId ? formData.parentId : null,
          isActive: formData.isActive,
        };

        await apiClient.updateCategory(editingCategory.id, updatePayload);
        toast.success(`Category "${formData.name}" updated successfully`);
      } else {
        const createPayload: CreateCategoryInput = {
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          imageUrl: formData.imageUrl.trim() || undefined,
          parentId: formData.parentId || undefined,
        };

        await apiClient.createCategory(createPayload);
        toast.success(`Category "${formData.name}" created successfully`);
      }

      setIsModalOpen(false);
      await loadCategories();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to save category";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCategory = async (category: Category) => {
    if (
      !confirm(
        `Are you sure you want to delete "${category.name}"? Products linked to this category may be affected.`,
      )
    ) {
      return;
    }

    try {
      await apiClient.deleteCategory(category.id);
      toast.success(`Category "${category.name}" removed`);
      await loadCategories();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to delete category";
      toast.error(msg);
    }
  };

  const filteredCategories = categories.filter((cat) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const nameMatches = cat.name.toLowerCase().includes(q);
    const descMatches = cat.description?.toLowerCase().includes(q);
    return nameMatches || descMatches;
  });

  return (
    <div className="flex flex-col gap-8 font-sans pb-12 text-[#151413]">
      {/* Header & Main Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold tracking-[0.15em] uppercase text-[#C4956A]">
            MANAGEMENT
          </span>
          <h1 className="font-heading text-3xl font-bold text-[#151413] mt-1">
            Categories ({categories.length})
          </h1>
          <p className="text-sm text-[#76726E] mt-1">
            Organize catalog departments, luxury collections, and subcategories.
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2.5 bg-[#171514] text-white text-xs font-bold tracking-wider uppercase rounded-md hover:bg-[#2A2725] transition-colors flex items-center justify-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <FiPlus className="w-4 h-4" /> Add Category
        </button>
      </div>

      {/* Search Controls */}
      <div className="bg-white p-4 rounded-lg border border-[#EAE8E4] flex justify-between items-center shadow-xs">
        <div className="relative w-full max-w-md">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A39E98]" />
          <input
            type="text"
            placeholder="Search category name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 bg-[#FAF9F6] border border-[#EAE8E4] rounded-md text-xs text-[#151413] focus:outline-hidden focus:border-[#C4956A] placeholder-[#A39E98]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#76726E] hover:text-[#151413]"
            >
              <FiX className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-lg border border-[#EAE8E4] shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-2 text-xs text-[#76726E]">
            <FiRefreshCw className="w-6 h-6 animate-spin text-[#C4956A]" />
            Loading category list...
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="py-20 bg-[#FAF9F6] flex flex-col items-center justify-center gap-3 text-center p-6">
            <FiFolder className="w-8 h-8 text-[#A39E98]" />
            <p className="text-xs font-semibold text-[#151413]">
              No categories found
            </p>
            <p className="text-[11px] text-[#76726E]">
              Create your first store category to organize product catalog.
            </p>
            <button
              onClick={() => handleOpenModal()}
              className="mt-2 px-4 py-2 bg-[#151413] text-white text-[10px] font-bold uppercase tracking-wider rounded-md cursor-pointer"
            >
              + Create Category
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[650px]">
              <thead>
                <tr className="bg-[#FAF9F6] border-b border-[#EAE8E4] text-[10px] font-bold uppercase tracking-[0.15em] text-[#76726E]">
                  <th className="py-3.5 px-4 font-bold">CATEGORY</th>
                  <th className="py-3.5 px-4 font-bold">DESCRIPTION</th>
                  <th className="py-3.5 px-4 font-bold">PARENT CATEGORY</th>
                  <th className="py-3.5 px-4 font-bold">STATUS</th>
                  <th className="py-3.5 px-4 font-bold text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#FAF9F6] text-xs">
                {filteredCategories.map((cat) => {
                  const parentCat = categories.find(
                    (c) => c.id === cat.parentId,
                  );

                  return (
                    <tr
                      key={cat.id}
                      className="hover:bg-[#FAF9F6]/50 transition-colors"
                    >
                      <td className="py-4 px-4 font-medium">
                        <div className="flex items-center gap-3">
                          <div className="relative w-10 h-10 rounded-md bg-[#FAF9F6] border border-[#EAE8E4] overflow-hidden shrink-0 flex items-center justify-center text-[#A39E98]">
                            {cat.imageUrl ? (
                              <Image
                                src={cat.imageUrl}
                                alt={cat.name}
                                fill
                                unoptimized
                                className="object-cover"
                              />
                            ) : (
                              <FiImage className="w-5 h-5" />
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-[#151413]">
                              {cat.name}
                            </span>
                            {cat.slug && (
                              <span className="text-[10px] font-mono text-[#76726E]">
                                /{cat.slug}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4 text-[#76726E] max-w-[240px] truncate">
                        {cat.description || "No description provided."}
                      </td>

                      <td className="py-4 px-4 text-[#76726E]">
                        {parentCat ? (
                          <span className="font-semibold text-[#151413] bg-[#FAF9F6] px-2 py-1 rounded-md border border-[#EAE8E4] text-[11px]">
                            {parentCat.name}
                          </span>
                        ) : (
                          <span className="text-[11px] italic text-[#A39E98]">
                            Top-level Department
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-4">
                        {cat.isActive !== false ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                            <FiCheck className="w-3 h-3" /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-800 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                            Hidden
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenModal(cat)}
                            className="p-1.5 text-[#76726E] hover:text-[#151413] hover:bg-[#FAF9F6] rounded-md transition-colors cursor-pointer"
                            title="Edit Category"
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(cat)}
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                            title="Delete Category"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal for Create / Edit Category */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs font-sans">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 flex flex-col gap-4 shadow-xl">
            <div className="flex justify-between items-center pb-3 border-b border-[#EAE8E4]">
              <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-[#151413]">
                {editingCategory ? "Edit Category" : "Create New Category"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#76726E] hover:text-[#151413] p-1 cursor-pointer"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleSaveCategory}
              className="flex flex-col gap-4 text-xs text-[#151413]"
            >
              {/* Category Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#76726E]">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Footwear, Luxury Bags, Apparel"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 bg-[#FAF9F6] border border-[#EAE8E4] rounded-md text-xs text-[#151413] focus:outline-hidden focus:border-[#C4956A]"
                />
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#76726E]">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Short department overview..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 bg-[#FAF9F6] border border-[#EAE8E4] rounded-md text-xs text-[#151413] focus:outline-hidden focus:border-[#C4956A]"
                />
              </div>

              {/* Image URL */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#76726E]">
                  Thumbnail Image URL
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/images/category-thumbnail.png"
                  value={formData.imageUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, imageUrl: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 bg-[#FAF9F6] border border-[#EAE8E4] rounded-md text-xs text-[#151413] focus:outline-hidden focus:border-[#C4956A]"
                />
              </div>

              {/* Parent Category Select */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#76726E]">
                  Parent Category (Subcategory Parent)
                </label>
                <select
                  value={formData.parentId}
                  onChange={(e) =>
                    setFormData({ ...formData, parentId: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 bg-[#FAF9F6] border border-[#EAE8E4] rounded-md text-xs text-[#151413] focus:outline-hidden focus:border-[#C4956A]"
                >
                  <option value="">None (Top-Level Category)</option>
                  {categories
                    .filter((c) => c.id !== editingCategory?.id)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </div>

              {/* Availability Status Checkbox */}
              {editingCategory && (
                <label className="flex items-center gap-2 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                    className="accent-[#C4956A] w-4 h-4 rounded-xs cursor-pointer"
                  />
                  <span className="text-xs text-[#76726E]">
                    Category is active and visible to shoppers
                  </span>
                </label>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 mt-4 pt-3 border-t border-[#EAE8E4]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={saving}
                  className="flex-1 py-3 border border-[#EAE8E4] rounded-md text-xs font-bold uppercase tracking-wider text-[#151413] hover:bg-[#FAF9F6] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 bg-[#151413] text-white rounded-md text-xs font-bold uppercase tracking-widest hover:bg-[#2A2725] transition-colors cursor-pointer disabled:bg-[#A39E98]"
                >
                  {saving
                    ? "Saving..."
                    : editingCategory
                      ? "Update Category"
                      : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
