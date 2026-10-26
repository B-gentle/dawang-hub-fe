"use client";

import { useState, useEffect } from "react";
import {
  LuPlus,
  LuPencil,
  LuTrash2,
  LuImage,
  LuTriangle,
  LuRefreshCw,
  LuChevronLeft,
  LuChevronRight,
  LuSearch,
  LuX,
  LuFilter,
  LuArrowUp,
  LuArrowDown,
  LuStar,
  LuFlame,
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
  meta?: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Filter & Sorting States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [filterFeatured, setFilterFeatured] = useState<boolean | undefined>(
    undefined,
  );
  const [filterPopular, setFilterPopular] = useState<boolean | undefined>(
    undefined,
  );
  const [sortBy, setSortBy] = useState<
    "createdAt" | "name" | "price" | "stockQuantity"
  >("createdAt");
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("DESC");

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

  const loadCatalogData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [productsRes, categoriesRes] = await Promise.all([
        apiClient.getProducts({
          page: currentPage,
          limit: pageSize,
          search: searchQuery.trim() || undefined,
          categoryId: selectedCategoryId || undefined,
          isFeatured: filterFeatured,
          isPopular: filterPopular,
          sortBy,
          sortOrder,
        }) as Promise<PaginatedResponse<Product> | Product[]>,
        apiClient.getCategories().catch(() => []) as Promise<
          Category[] | PaginatedResponse<Category>
        >,
      ]);

      let extractedProducts: Product[] = [];
      if (Array.isArray(productsRes)) {
        extractedProducts = productsRes;
        setTotalItems(productsRes.length);
        setTotalPages(1);
      } else if (productsRes && typeof productsRes === "object") {
        if (Array.isArray(productsRes.items)) {
          extractedProducts = productsRes.items;
        } else if (Array.isArray(productsRes.data)) {
          extractedProducts = productsRes.data;
        }

        if (productsRes.meta) {
          setTotalItems(productsRes.meta.totalItems);
          setTotalPages(productsRes.meta.totalPages || 1);
        } else {
          setTotalItems(extractedProducts.length);
          setTotalPages(1);
        }
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
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Could not fetch catalog data from the server.";
      console.error("Failed to load dashboard data:", err);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    queueMicrotask(() => {
      if (isMounted) {
        loadCatalogData();
      }
    });

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    currentPage,
    searchQuery,
    selectedCategoryId,
    filterFeatured,
    filterPopular,
    sortBy,
    sortOrder,
  ]);

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
        loadCatalogData();
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

        await apiClient.updateProduct(editingProduct.id, updatePayload);

        for (const file of pendingFiles) {
          await apiClient.uploadToCloudflare(editingProduct.id, file);
        }

        await loadCatalogData();
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

        for (const file of pendingFiles) {
          await apiClient.uploadToCloudflare(createdProduct.id, file);
        }

        await loadCatalogData();
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
    <div className="flex flex-col gap-6 font-sans pb-12 text-[#1A1A1A]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-[#1A1A1A]">
            Products ({totalItems})
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

      {/* Controls Bar: Search, Category, Sorting, isFeatured & isPopular */}
      <div className="bg-white p-4 rounded-lg border border-[#EAE8E4] flex flex-col gap-4 shadow-xs">
        <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <LuSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A39E98]" />
            <input
              type="text"
              placeholder="Search by product name, description or SKU..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-8 py-2 bg-[#FAF9F6] border border-[#EAE8E4] rounded-md text-xs text-[#1A1A1A] focus:outline-hidden focus:border-[#C4956A] placeholder-[#A39E98]"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setCurrentPage(1);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#76726E] hover:text-[#1A1A1A]"
              >
                <LuX className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Controls: Category, Sort By, ASC/DESC Toggle */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Category Filter Dropdown */}
            <div className="flex items-center gap-1.5 bg-[#FAF9F6] px-2.5 py-1.5 border border-[#EAE8E4] rounded-md">
              <LuFilter className="w-3.5 h-3.5 text-[#C4956A] shrink-0" />
              <select
                value={selectedCategoryId}
                onChange={(e) => {
                  setSelectedCategoryId(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-transparent text-xs font-semibold text-[#1A1A1A] focus:outline-hidden cursor-pointer"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Field Selector */}
            <div className="flex items-center gap-1.5 bg-[#FAF9F6] px-2.5 py-1.5 border border-[#EAE8E4] rounded-md">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#76726E]">
                Sort:
              </span>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(
                    e.target.value as
                      "createdAt" | "name" | "price" | "stockQuantity",
                  );
                  setCurrentPage(1);
                }}
                className="bg-transparent text-xs font-semibold text-[#1A1A1A] focus:outline-hidden cursor-pointer"
              >
                <option value="createdAt">Date Created</option>
                <option value="name">Name</option>
                <option value="price">Price</option>
                <option value="stockQuantity">Stock Quantity</option>
              </select>
            </div>

            {/* Sort Direction Toggle Button */}
            <button
              onClick={() => {
                setSortOrder((prev) => (prev === "ASC" ? "DESC" : "ASC"));
                setCurrentPage(1);
              }}
              title={`Switch to ${sortOrder === "ASC" ? "Descending" : "Ascending"}`}
              className="p-2 bg-[#FAF9F6] border border-[#EAE8E4] rounded-md text-[#1A1A1A] hover:border-[#C4956A] transition-colors cursor-pointer flex items-center justify-center"
            >
              {sortOrder === "ASC" ? (
                <LuArrowUp className="w-3.5 h-3.5 text-[#C4956A]" />
              ) : (
                <LuArrowDown className="w-3.5 h-3.5 text-[#C4956A]" />
              )}
            </button>
          </div>
        </div>

        {/* Quick Filter Toggle Pills: Featured & Popular */}
        <div className="flex items-center gap-2 pt-2 border-t border-[#EAE8E4]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#76726E]">
            Tags:
          </span>
          <button
            onClick={() => {
              setFilterFeatured((prev) => (prev === true ? undefined : true));
              setCurrentPage(1);
            }}
            className={`px-3 py-1 rounded-full text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
              filterFeatured === true
                ? "bg-[#171514] text-white"
                : "bg-[#FAF9F6] border border-[#EAE8E4] text-[#76726E] hover:text-[#1A1A1A]"
            }`}
          >
            <LuStar className="w-3 h-3 text-[#C4956A]" /> Featured Only
          </button>

          <button
            onClick={() => {
              setFilterPopular((prev) => (prev === true ? undefined : true));
              setCurrentPage(1);
            }}
            className={`px-3 py-1 rounded-full text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
              filterPopular === true
                ? "bg-[#171514] text-white"
                : "bg-[#FAF9F6] border border-[#EAE8E4] text-[#76726E] hover:text-[#1A1A1A]"
            }`}
          >
            <LuFlame className="w-3 h-3 text-amber-500" /> Popular Only
          </button>

          {(filterFeatured !== undefined ||
            filterPopular !== undefined ||
            searchQuery ||
            selectedCategoryId) && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategoryId("");
                setFilterFeatured(undefined);
                setFilterPopular(undefined);
                setSortBy("createdAt");
                setSortOrder("DESC");
                setCurrentPage(1);
              }}
              className="ml-auto text-[10px] font-bold text-rose-600 hover:underline uppercase tracking-wider cursor-pointer"
            >
              Reset All Filters
            </button>
          )}
        </div>
      </div>

      {/* Product Table Container */}
      <div className="bg-white rounded-lg border border-[#EAE8E4] overflow-hidden shadow-xs">
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
              onClick={() => loadCatalogData()}
              className="text-xs font-bold text-[#1A1A1A] underline uppercase tracking-wider hover:text-[#C4956A]"
            >
              Try Again
            </button>
          </div>
        ) : !Array.isArray(products) || products.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center gap-3">
            <LuImage className="w-8 h-8 text-[#A39E98]" />
            <p className="text-xs text-[#76726E]">
              No products found for this filter combination.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategoryId("");
                setFilterFeatured(undefined);
                setFilterPopular(undefined);
                setCurrentPage(1);
              }}
              className="text-xs font-bold text-[#C4956A] underline uppercase tracking-wider"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-[#FAF9F6] border-b border-[#EAE8E4] text-[10px] font-bold uppercase tracking-wider text-[#76726E]">
                    <th className="py-3 px-4">Product</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">SKU</th>
                    <th className="py-3 px-4">Price</th>
                    <th className="py-3 px-4">Tags</th>
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
                        <div className="flex gap-1">
                          {product.isFeatured && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#FAF5EF] text-[#C4956A] border border-[#EAE8E4]">
                              Featured
                            </span>
                          )}
                          {product.isPopular && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              Popular
                            </span>
                          )}
                        </div>
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

            {/* Pagination Controls */}
            <div className="p-4 border-t border-[#EAE8E4] bg-[#FAF9F6] flex items-center justify-between text-xs text-[#76726E]">
              <span>
                Page <strong className="text-[#1A1A1A]">{currentPage}</strong>{" "}
                of <strong className="text-[#1A1A1A]">{totalPages}</strong>
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="p-2 border border-[#EAE8E4] bg-white rounded-md disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                >
                  <LuChevronLeft className="w-4 h-4" />
                </button>
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="p-2 border border-[#EAE8E4] bg-white rounded-md disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                >
                  <LuChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
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
