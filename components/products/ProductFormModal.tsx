"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LuX, LuUpload, LuLoader } from "react-icons/lu";
import { Product, CreateProductInput } from "@/types/product";
import { Category } from "@/types/category";

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingProduct: Product | null;
  formData: CreateProductInput;
  setFormData: React.Dispatch<React.SetStateAction<CreateProductInput>>;
  categories: Category[];
  submitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: (index: number) => void;
}

export default function ProductFormModal({
  isOpen,
  onClose,
  editingProduct,
  formData,
  setFormData,
  categories,
  submitting,
  onSubmit,
  onFileSelect,
  onRemoveImage,
}: ProductFormModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-lg shadow-xl border border-[#EAE8E4] w-full max-w-xl max-h-[90vh] overflow-y-auto p-6"
          >
            <div className="flex justify-between items-center border-b border-[#EAE8E4] pb-4 mb-4">
              <h2 className="font-heading text-xl font-bold text-[#1A1A1A]">
                {editingProduct ? "Edit Product" : "Add New Product"}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="text-[#76726E] hover:text-[#1A1A1A] p-1 cursor-pointer"
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={onSubmit} className="flex flex-col gap-4 text-xs">
              <div>
                <label className="font-bold uppercase tracking-wider text-[#1A1A1A]">
                  Product Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full mt-1 p-2 bg-[#FAF9F6] border border-[#EAE8E4] rounded-md focus:outline-hidden focus:border-[#C4956A]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold uppercase tracking-wider text-[#1A1A1A]">
                    SKU
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="HEADPHONE-NC-01"
                    value={formData.sku}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, sku: e.target.value }))
                    }
                    className="w-full mt-1 p-2 bg-[#FAF9F6] border border-[#EAE8E4] rounded-md uppercase"
                  />
                </div>
                <div>
                  <label className="font-bold uppercase tracking-wider text-[#1A1A1A]">
                    Category
                  </label>
                  <select
                    value={formData.categoryId || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        categoryId: e.target.value,
                      }))
                    }
                    className="w-full mt-1 p-2 bg-[#FAF9F6] border border-[#EAE8E4] rounded-md focus:outline-hidden focus:border-[#C4956A]"
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="font-bold uppercase tracking-wider text-[#1A1A1A]">
                    Price (₦)
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formData.price || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        price: Number(e.target.value),
                      }))
                    }
                    className="w-full mt-1 p-2 bg-[#FAF9F6] border border-[#EAE8E4] rounded-md"
                  />
                </div>
                <div>
                  <label className="font-bold uppercase tracking-wider text-[#1A1A1A]">
                    Discount Price (₦)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.discountPrice || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        discountPrice: Number(e.target.value),
                      }))
                    }
                    className="w-full mt-1 p-2 bg-[#FAF9F6] border border-[#EAE8E4] rounded-md"
                  />
                </div>
                <div>
                  <label className="font-bold uppercase tracking-wider text-[#1A1A1A]">
                    Stock Qty
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formData.stockQuantity || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        stockQuantity: Number(e.target.value),
                      }))
                    }
                    className="w-full mt-1 p-2 bg-[#FAF9F6] border border-[#EAE8E4] rounded-md"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold uppercase tracking-wider text-[#1A1A1A]">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="w-full mt-1 p-2 bg-[#FAF9F6] border border-[#EAE8E4] rounded-md resize-none"
                />
              </div>

              {/* Staging File Dropzone */}
              <div>
                <label className="font-bold uppercase tracking-wider text-[#1A1A1A]">
                  Product Images
                </label>

                <div className="mt-1 flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-[#EAE8E4] border-dashed rounded-lg cursor-pointer bg-[#FAF9F6] hover:bg-[#FAF5EF] transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <LuUpload className="w-6 h-6 text-[#C4956A] mb-2" />
                      <p className="text-xs text-[#1A1A1A] font-semibold">
                        Click to attach image
                      </p>
                      <p className="text-[10px] text-[#76726E]">
                        Uploaded automatically upon publishing
                      </p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={onFileSelect}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Previews */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {formData.images.map((img, idx) => (
                    <div
                      key={idx}
                      className="relative w-16 h-16 rounded border border-[#EAE8E4] overflow-hidden group"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => onRemoveImage(idx)}
                        className="absolute top-0 right-0 p-1 bg-rose-500 text-white rounded-bl cursor-pointer opacity-90 hover:opacity-100 transition-opacity"
                      >
                        <LuX className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-6 pt-2 border-t border-[#EAE8E4]">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured || false}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        isFeatured: e.target.checked,
                      }))
                    }
                  />
                  Featured
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPopular || false}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        isPopular: e.target.checked,
                      }))
                    }
                  />
                  Popular
                </label>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="mt-4 py-2.5 bg-[#171514] text-white font-bold uppercase tracking-wider rounded-md hover:bg-[#2A2725] disabled:opacity-50 transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                {submitting && (
                  <LuLoader className="w-4 h-4 animate-spin text-[#C4956A]" />
                )}
                {submitting
                  ? "Saving..."
                  : editingProduct
                    ? "Update Product"
                    : "Publish Product"}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
