"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  FiFilter,
  FiX,
  FiSearch,
  FiRefreshCw,
  FiPackage,
  FiSliders,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import { apiClient } from "@/lib/api-client";
import { Product } from "@/types/product";
import { Category } from "@/types/category";
import ProductCard from "@/components/products/ProductCard";

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

function ShopContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");
  const queryParam = searchParams.get("q");

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination States (30 items per page)
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 30;
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Filter & Sort States
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<
    "newest" | "price-asc" | "price-desc" | "name"
  >("newest");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Sync search query from URL parameter
  useEffect(() => {
    if (queryParam) {
      queueMicrotask(() => {
        setSearchQuery(queryParam);
      });
    }
  }, [queryParam]);

  // Sync category selection from URL param
  useEffect(() => {
    if (!categoryParam || categories.length === 0) return;

    const target = categoryParam.toLowerCase().trim();
    const matchedCategory = categories.find((cat) => {
      const catIdMatches = cat.id.toLowerCase() === target;
      const catNameMatches = cat.name.toLowerCase().includes(target);
      const catSlugMatches = cat.slug?.toLowerCase() === target;
      return catIdMatches || catNameMatches || catSlugMatches;
    });

    queueMicrotask(() => {
      if (matchedCategory) {
        setSelectedCategory(matchedCategory.id);
      } else {
        setSelectedCategory(target);
      }
    });
  }, [categoryParam, categories]);

  // Map shop sort option to backend parameters
  const getSortParams = () => {
    switch (sortBy) {
      case "price-asc":
        return { sortBy: "price" as const, sortOrder: "ASC" as const };
      case "price-desc":
        return { sortBy: "price" as const, sortOrder: "DESC" as const };
      case "name":
        return { sortBy: "name" as const, sortOrder: "ASC" as const };
      case "newest":
      default:
        return { sortBy: "createdAt" as const, sortOrder: "DESC" as const };
    }
  };

  // Load catalog data from server with filters & 30-item limit
  useEffect(() => {
    let isMounted = true;

    const loadShopData = async () => {
      try {
        setLoading(true);

        const { sortBy: sortField, sortOrder } = getSortParams();

        const [productsRes, categoriesRes] = await Promise.all([
          apiClient.getProducts({
            page: currentPage,
            limit: pageSize,
            search: searchQuery.trim() || undefined,
            categoryId:
              selectedCategory !== "all" ? selectedCategory : undefined,
            sortBy: sortField,
            sortOrder: sortOrder,
          }) as Promise<Product[] | PaginatedResponse<Product>>,
          apiClient.getCategories().catch(() => []) as Promise<
            Category[] | PaginatedResponse<Category>
          >,
        ]);

        if (!isMounted) return;

        // Extract products and metadata
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
          } else if (Array.isArray(productsRes.products)) {
            extractedProducts = productsRes.products;
          }

          if (productsRes.meta) {
            setTotalItems(productsRes.meta.totalItems);
            setTotalPages(productsRes.meta.totalPages || 1);
          } else {
            setTotalItems(extractedProducts.length);
            setTotalPages(1);
          }
        }

        // Extract categories
        let extractedCategories: Category[] = [];
        if (Array.isArray(categoriesRes)) {
          extractedCategories = categoriesRes;
        } else if (categoriesRes && Array.isArray(categoriesRes.data)) {
          extractedCategories = categoriesRes.data;
        }

        setProducts(extractedProducts);
        setCategories(extractedCategories);
      } catch (err) {
        console.error("Failed to load shop catalog:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadShopData();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, selectedCategory, searchQuery, sortBy]);

  return (
    <div className="min-h-screen bg-white font-sans overflow-x-hidden">
      {/* Header */}
      <div className="bg-[#FAF9F6] border-b border-[#EAE8E4] py-6 sm:py-12 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center gap-1.5">
          <span className="text-[10px] font-bold text-[#C4956A] uppercase tracking-[0.25em]">
            Catalog
          </span>
          <h1 className="font-heading text-xl sm:text-4xl font-bold text-[#151413] uppercase tracking-tight">
            Shop All Products
          </h1>
          <p className="text-xs text-[#76726E] max-w-md">
            Explore our complete collection of luxury apparel, footwear, and
            accessories.
          </p>
        </div>
      </div>

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-6 sm:py-12">
        {/* Controls Bar */}
        <div className="flex flex-col gap-4 mb-6 pb-4 border-b border-[#EAE8E4]">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A39E98]" />
              <input
                type="text"
                placeholder="Search catalog..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-8 py-2 bg-[#FAF9F6] border border-[#EAE8E4] rounded-md text-xs text-[#151413] focus:outline-hidden focus:border-[#C4956A] placeholder-[#A39E98]"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setCurrentPage(1);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#76726E] hover:text-[#151413]"
                >
                  <FiX className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
              <button
                onClick={() => setIsMobileFilterOpen(true)}
                className="md:hidden flex-1 sm:flex-none px-3.5 py-2 bg-[#FAF9F6] border border-[#EAE8E4] rounded-md text-xs font-bold text-[#151413] flex items-center justify-center gap-2 uppercase tracking-wider cursor-pointer"
              >
                <FiSliders className="w-3.5 h-3.5 text-[#C4956A]" /> Filter
              </button>

              <div className="flex items-center gap-2 flex-1 sm:flex-none justify-end">
                <label className="text-xs font-bold uppercase tracking-wider text-[#76726E] shrink-0 hidden sm:inline">
                  Sort:
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(
                      e.target.value as
                        "newest" | "price-asc" | "price-desc" | "name",
                    );
                    setCurrentPage(1);
                  }}
                  className="w-full sm:w-auto p-2 bg-[#FAF9F6] border border-[#EAE8E4] rounded-md text-xs text-[#151413] font-semibold focus:outline-hidden focus:border-[#C4956A] cursor-pointer"
                >
                  <option value="newest">Newest First</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="name">Alphabetical</option>
                </select>
              </div>
            </div>
          </div>

          {/* Mobile Category Scroll */}
          <div className="flex md:hidden overflow-x-auto gap-2 pt-1 pb-1 text-xs no-scrollbar">
            <button
              onClick={() => {
                setSelectedCategory("all");
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-full whitespace-nowrap font-bold uppercase tracking-wider transition-colors cursor-pointer text-[10px] shrink-0 ${
                selectedCategory === "all"
                  ? "bg-[#151413] text-white"
                  : "bg-[#FAF9F6] text-[#76726E] border border-[#EAE8E4]"
              }`}
            >
              All
            </button>
            {categories.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-full whitespace-nowrap font-bold uppercase tracking-wider transition-colors cursor-pointer text-[10px] shrink-0 ${
                    isActive
                      ? "bg-[#151413] text-white"
                      : "bg-[#FAF9F6] text-[#76726E] border border-[#EAE8E4]"
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6 lg:gap-8">
          {/* Desktop Category Sidebar */}
          <aside className="hidden md:flex flex-col w-52 shrink-0 gap-6">
            <div>
              <h3 className="font-bold text-xs uppercase tracking-widest text-[#151413] mb-3 pb-2 border-b border-[#EAE8E4]">
                Categories
              </h3>
              <ul className="flex flex-col gap-1.5 text-xs">
                <li>
                  <button
                    onClick={() => {
                      setSelectedCategory("all");
                      setCurrentPage(1);
                    }}
                    className={`w-full text-left py-1.5 px-2.5 rounded-md transition-colors font-medium cursor-pointer ${
                      selectedCategory === "all"
                        ? "bg-[#151413] text-white font-bold"
                        : "text-[#76726E] hover:text-[#151413] hover:bg-[#FAF9F6]"
                    }`}
                  >
                    All Categories
                  </button>
                </li>
                {categories.map((cat) => (
                  <li key={cat.id}>
                    <button
                      onClick={() => {
                        setSelectedCategory(cat.id);
                        setCurrentPage(1);
                      }}
                      className={`w-full text-left py-1.5 px-2.5 rounded-md transition-colors font-medium cursor-pointer flex justify-between items-center ${
                        selectedCategory === cat.id
                          ? "bg-[#151413] text-white font-bold"
                          : "text-[#76726E] hover:text-[#151413] hover:bg-[#FAF9F6]"
                      }`}
                    >
                      <span>{cat.name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 min-w-0">
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-2 text-xs text-[#76726E]">
                <FiRefreshCw className="w-5 h-5 animate-spin text-[#C4956A]" />
                Loading catalog...
              </div>
            ) : products.length === 0 ? (
              <div className="py-20 bg-[#FAF9F6] rounded-lg border border-[#EAE8E4] flex flex-col items-center justify-center gap-3 text-center p-6">
                <FiPackage className="w-8 h-8 text-[#A39E98]" />
                <p className="text-xs font-semibold text-[#151413]">
                  No products found
                </p>
                <p className="text-[11px] text-[#76726E]">
                  Try clearing your search query or choosing another category.
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory("all");
                    setSearchQuery("");
                    setCurrentPage(1);
                  }}
                  className="mt-2 px-4 py-2 bg-[#151413] text-white text-[10px] font-bold uppercase tracking-wider rounded-md hover:bg-[#2A2725] cursor-pointer"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-8">
                {/* Product Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-5 w-full">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination Controls Footer */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between border-t border-[#EAE8E4] pt-6 text-xs text-[#76726E]">
                    <span>
                      Showing Page{" "}
                      <strong className="text-[#151413]">{currentPage}</strong>{" "}
                      of{" "}
                      <strong className="text-[#151413]">{totalPages}</strong> (
                      {totalItems} Products)
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        disabled={currentPage === 1}
                        onClick={() => {
                          setCurrentPage((p) => Math.max(1, p - 1));
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="px-3 py-1.5 border border-[#EAE8E4] bg-[#FAF9F6] rounded-md font-bold text-[#151413] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed flex items-center gap-1"
                      >
                        <FiChevronLeft className="w-4 h-4" /> Previous
                      </button>
                      <button
                        disabled={currentPage >= totalPages}
                        onClick={() => {
                          setCurrentPage((p) => p + 1);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="px-3 py-1.5 border border-[#EAE8E4] bg-[#FAF9F6] rounded-md font-bold text-[#151413] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed flex items-center gap-1"
                      >
                        Next <FiChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            onClick={() => setIsMobileFilterOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
          />
          <div className="relative ml-auto w-4/5 max-w-xs h-full bg-white shadow-2xl p-6 flex flex-col justify-between z-10 overflow-y-auto">
            <div>
              <div className="flex justify-between items-center pb-4 mb-4 border-b border-[#EAE8E4]">
                <h3 className="font-bold text-xs uppercase tracking-wider text-[#151413] flex items-center gap-2">
                  <FiFilter className="w-4 h-4 text-[#C4956A]" /> Filter
                  Categories
                </h3>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="p-1 text-[#76726E] hover:text-[#151413] cursor-pointer"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={() => {
                    setSelectedCategory("all");
                    setCurrentPage(1);
                    setIsMobileFilterOpen(false);
                  }}
                  className={`w-full text-left py-2.5 px-3 rounded-md transition-colors text-xs font-semibold ${
                    selectedCategory === "all"
                      ? "bg-[#151413] text-white"
                      : "text-[#76726E] hover:bg-[#FAF9F6]"
                  }`}
                >
                  All Categories
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      setCurrentPage(1);
                      setIsMobileFilterOpen(false);
                    }}
                    className={`w-full text-left py-2.5 px-3 rounded-md transition-colors text-xs font-semibold ${
                      selectedCategory === cat.id
                        ? "bg-[#151413] text-white"
                        : "text-[#76726E] hover:bg-[#FAF9F6]"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                setSelectedCategory("all");
                setSearchQuery("");
                setCurrentPage(1);
                setIsMobileFilterOpen(false);
              }}
              className="mt-6 w-full py-2.5 bg-[#FAF9F6] border border-[#EAE8E4] text-[#151413] text-xs font-bold uppercase tracking-wider rounded-md cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-2 text-xs text-[#76726E]">
          <FiRefreshCw className="w-6 h-6 animate-spin text-[#C4956A]" />
          Loading shop catalog...
        </div>
      }
    >
      <ShopContent />
    </Suspense>
  );
}
