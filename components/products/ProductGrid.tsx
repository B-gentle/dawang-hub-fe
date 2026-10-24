"use client";

import { useMemo } from "react";
import Link from "next/link";
import { FiRefreshCw, FiPackage, FiArrowRight } from "react-icons/fi";
import { Product } from "@/types/product";
import { shuffleArray } from "@/lib/utils/shuffle";
import ProductCard from "./ProductCard";

interface ProductGridProps {
  title: string;
  subtitle?: string;
  products: Product[];
  loading?: boolean;
  viewAllHref?: string;
  shuffle?: boolean;
}

export default function ProductGrid({
  title,
  subtitle,
  products,
  loading = false,
  viewAllHref,
  shuffle = true,
}: ProductGridProps) {
  const displayedProducts = useMemo(() => {
    if (!products || products.length === 0) return [];
    return shuffle ? shuffleArray(products) : products;
  }, [products, shuffle]);

  return (
    <section className="py-12 sm:py-16 w-full px-4 sm:px-8 lg:px-12">
      {/* Header Layout */}
      <div className="flex items-end justify-between gap-4 mb-6 sm:mb-8 pb-3 border-b border-[#EAE8E4]">
        <div>
          <h2 className="font-heading text-2xl sm:text-3xl font-normal tracking-tight text-[#151413]">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs text-[#76726E] mt-1">{subtitle}</p>
          )}
        </div>

        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="text-[10px] sm:text-xs font-bold text-[#151413] hover:text-[#C4956A] tracking-widest uppercase flex items-center gap-1.5 transition-colors shrink-0"
          >
            VIEW ALL <FiArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>

      {/* Grid Content */}
      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center gap-2 text-xs text-[#76726E]">
          <FiRefreshCw className="w-5 h-5 animate-spin text-[#C4956A]" />
          Fetching collection...
        </div>
      ) : !displayedProducts || displayedProducts.length === 0 ? (
        <div className="py-16 bg-[#FAF9F6] rounded-lg border border-[#EAE8E4] flex flex-col items-center justify-center gap-2 text-center p-6">
          <FiPackage className="w-8 h-8 text-[#A39E98]" />
          <p className="text-xs font-semibold text-[#151413]">
            No items in this collection
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 w-full">
          {displayedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
