"use client";

import { useState, useEffect } from "react";
import {
  LuPlus,
  LuPencil,
  LuTrash2,
  LuImage,
  LuTriangle,
  LuRefreshCw,
} from "react-icons/lu";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { Product, CreateProductInput } from "@/types/product";
import { Category } from "@/types/category";
import ProductFormModal from "@/components/products/ProductFormModal";

interface PaginatedResponse<T> {
  items?: T[];
  data?: T[];
  products?: T[];
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [pendingFiles, setPendingFiles] = useState<File[]>([]);

  const [formData, setFormData] = useState<CreateProductInput>({
    name: "",
    description: "",
    price: 0,
    discountPrice: 0,
    stockQuantity: 0,
    sku: "",
    images: [],
    isFeatured: false,
    isPopular: false,
    categoryId: "",
  });

  const [submitting, setSubmitting] = useState(false);

  const loadCatalogData = async (isMounted: boolean) => {
    try {
      setLoading(true);
      setError(null);

      const [productsRes, categoriesRes] = await Promise.all([
        apiClient.getProducts() as Promise<
          Product[] | PaginatedResponse<Product>
        >,
        apiClient.getCategories().catch(() => []) as Promise<
          Category[] | PaginatedResponse<Category>
        >,
      ]);

      if (!isMounted) return;

      let extractedProducts: Product[] = [];
      if (Array.isArray(productsRes)) {
        extractedProducts = productsRes;
      } else if (productsRes && Array.isArray(productsRes.items)) {
        extractedProducts = productsRes.items;
      } else if (productsRes && Array.isArray(productsRes.data)) {
        extractedProducts = productsRes.data;
      } else if (productsRes && Array.isArray(productsRes.products)) {
        extractedProducts = productsRes.products;
      }

      let extractedCategories: Category[] = [];
      if (Array.isArray(categoriesRes)) {
        extractedCategories = categoriesRes;
      } else if (categoriesRes && Array.isArray(categoriesRes.data)) {
        extractedCategories = categoriesRes.data;
      }

      setProducts(extractedProducts);
      setCategories(extractedCategories);
    } catch (err: unknown) {
      if (!isMounted) return;
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Could not fetch catalog data from the server.";
      console.error("Failed to load dashboard data:", err);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      if (isMounted) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      await loadCatalogData(isMounted);
    };

    init();

    return () => {
      isMounted = false;
    };
  }, []);

  const openAddModal = () => {
    setEditingProduct(null);
    setPendingFiles([]);
    setFormData({
      name: "",
      description: "",
      price: 0,
      discountPrice: 0,
      stockQuantity: 0,
      sku: "",
      images: [],
      isFeatured: false,
      isPopular: false,
      categoryId: categories[0]?.id || "",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setPendingFiles([]);
    setFormData({
      name: product.name,
      description: product.description || "",
      price: product.price,
      discountPrice: product.discountPrice || 0,
      stockQuantity: product.stockQuantity || 0,
      sku: product.sku || "",
      images: product.images || [],
      isFeatured: product.isFeatured || false,
      isPopular: product.isPopular || false,
      categoryId: product.categoryId || "",
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    toast.promise(apiClient.deleteProduct(id), {
      loading: "Deleting product...",
      success: () => {
        setProducts((prev) => prev.filter((p) => p.id !== id));
        return "Product deleted successfully";
      },
      error: (err: unknown) =>
        err instanceof Error ? err.message : "Failed to delete product",
    });
  };

  const getCategoryName = (product: Product) => {
    if (
      product.category &&
      typeof product.category === "object" &&
      product.category.name
    ) {
      return product.category.name;
    }
    if (product.categoryId) {
      const match = categories.find((c) => c.id === product.categoryId);
      return match ? match.name : "Uncategorized";
    }
    return "Uncategorized";
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const localPreviewUrl = URL.createObjectURL(file);
    setPendingFiles((prev) => [...prev, file]);
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, localPreviewUrl],
    }));
    toast.info("Image attached successfully.");
    e.target.value = "";
  };

  const handleRemoveImage = (index: number) => {
    if (index < pendingFiles.length) {
      setPendingFiles((prev) => prev.filter((_, i) => i !== index));
    }
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const submissionPromise = (async (): Promise<string> => {
      if (editingProduct) {
        const existingUrls = formData.images.filter(
          (img) => !img.startsWith("blob:"),
        );
        const updatePayload: Partial<CreateProductInput> = {
          name: formData.name,
          description: formData.description,
          price: formData.price,
          stockQuantity: formData.stockQuantity,
          sku: formData.sku,
          isFeatured: formData.isFeatured,
          isPopular: formData.isPopular,
          images: existingUrls,
        };

        if (formData.discountPrice)
          updatePayload.discountPrice = formData.discountPrice;
        if (formData.categoryId) updatePayload.categoryId = formData.categoryId;

        const updated = await apiClient.updateProduct(
          editingProduct.id,
          updatePayload,
        );

        const uploadedUrls: string[] = [];
        for (const file of pendingFiles) {
          const { url } = await apiClient.uploadToCloudflare(
            editingProduct.id,
            file,
          );
          uploadedUrls.push(url);
        }

        const finalImages = [...existingUrls, ...uploadedUrls];
        setProducts((prev) =>
          prev.map((p) =>
            p.id === editingProduct.id
              ? {
                  ...p,
                  ...updated,
                  images: finalImages.length > 0 ? finalImages : updated.images,
                }
              : p,
          ),
        );
        return "Product updated successfully!";
      } else {
        const creationPayload: CreateProductInput = {
          name: formData.name,
          description: formData.description,
          price: formData.price,
          stockQuantity: formData.stockQuantity,
          sku: formData.sku,
          isFeatured: formData.isFeatured,
          isPopular: formData.isPopular,
          images: [],
        };

        if (formData.discountPrice)
          creationPayload.discountPrice = formData.discountPrice;
        if (formData.categoryId)
          creationPayload.categoryId = formData.categoryId;

        const createdProduct = await apiClient.createProduct(creationPayload);

        const uploadedUrls: string[] = [];
        for (const file of pendingFiles) {
          const { url } = await apiClient.uploadToCloudflare(
            createdProduct.id,
            file,
          );
          uploadedUrls.push(url);
        }

        const finalProduct = {
          ...createdProduct,
          images:
            uploadedUrls.length > 0 ? uploadedUrls : createdProduct.images,
        };

        setProducts((prev) => [finalProduct, ...prev]);
        return "Product created and images uploaded successfully!";
      }
    })();

    toast.promise(submissionPromise, {
      loading: editingProduct ? "Updating product..." : "Publishing product...",
      success: (msg: string) => {
        setPendingFiles([]);
        setIsModalOpen(false);
        setSubmitting(false);
        return msg;
      },
      error: (err: unknown) => {
        setSubmitting(false);
        return err instanceof Error ? err.message : "Failed to save product";
      },
    });
  };

  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-[#1A1A1A]">
            Products
          </h1>
          <p className="text-xs text-[#76726E]">
            Manage your store inventory and catalog
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="px-4 py-2.5 bg-[#171514] text-white text-xs font-bold uppercase tracking-wider rounded-md hover:bg-[#2A2725] flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto"
        >
          <LuPlus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* Product Table Container */}
      <div className="bg-white rounded-lg border border-[#EAE8E4] overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-[#76726E] flex flex-col items-center gap-2">
            <LuRefreshCw className="w-5 h-5 animate-spin text-[#C4956A]" />
            Fetching catalog...
          </div>
        ) : error ? (
          <div className="p-12 text-center flex flex-col items-center gap-3">
            <LuTriangle className="w-8 h-8 text-rose-500" />
            <p className="text-xs font-medium text-rose-600">{error}</p>
            <button
              onClick={() => loadCatalogData(true)}
              className="text-xs font-bold text-[#1A1A1A] underline uppercase tracking-wider hover:text-[#C4956A]"
            >
              Try Again
            </button>
          </div>
        ) : !Array.isArray(products) || products.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center gap-3">
            <LuImage className="w-8 h-8 text-[#A39E98]" />
            <p className="text-xs text-[#76726E]">
              No products in database yet.
            </p>
            <button
              onClick={openAddModal}
              className="text-xs font-bold text-[#C4956A] underline uppercase tracking-wider"
            >
              Create first product
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-[#FAF9F6] border-b border-[#EAE8E4] text-[10px] font-bold uppercase tracking-wider text-[#76726E]">
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">SKU</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Stock</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE8E4] text-xs">
                {products.map((product) => (
                  <tr
                    key={product.id}
                    className="hover:bg-[#FAF9F6] transition-colors"
                  >
                    <td className="py-3 px-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-[#FAF9F6] border border-[#EAE8E4] overflow-hidden flex-shrink-0">
                        {product.images?.[0] ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={product.images[0]}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <LuImage className="w-full h-full p-2 text-[#A39E98]" />
                        )}
                      </div>
                      <span className="font-medium text-[#1A1A1A] line-clamp-1">
                        {product.name}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-[#76726E]">
                      {getCategoryName(product)}
                    </td>
                    <td className="py-3 px-4 font-mono text-[#76726E]">
                      {product.sku}
                    </td>
                    <td className="py-3 px-4 font-semibold text-[#1A1A1A]">
                      ₦{Number(product.price || 0).toLocaleString()}
                      {product.discountPrice ? (
                        <span className="ml-1 text-[10px] text-[#76726E] line-through font-normal">
                          ₦{Number(product.discountPrice).toLocaleString()}
                        </span>
                      ) : null}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          product.stockQuantity > 0
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-rose-50 text-rose-700"
                        }`}
                      >
                        {product.stockQuantity > 0
                          ? `${product.stockQuantity} in Stock`
                          : "Out of Stock"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditModal(product)}
                          className="p-1.5 text-[#76726E] hover:text-[#1A1A1A] cursor-pointer"
                          aria-label="Edit product"
                        >
                          <LuPencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 cursor-pointer"
                          aria-label="Delete product"
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

      {/* Extracted Form Modal */}
      <ProductFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingProduct={editingProduct}
        formData={formData}
        setFormData={setFormData}
        categories={categories}
        submitting={submitting}
        onSubmit={handleSubmit}
        onFileSelect={handleFileSelect}
        onRemoveImage={handleRemoveImage}
      />
    </div>
  );
}
