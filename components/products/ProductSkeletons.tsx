"use client";

import React from "react";
import { Skeleton } from "@/components/common/Skeleton";

export function ProductCardSkeleton() {
  return (
    <div className="bg-white border border-[#EAE8E4] rounded-lg overflow-hidden flex flex-col">
      {/* Image Placeholder */}
      <div className="w-full aspect-4/5 bg-[#FAF9F6] relative overflow-hidden">
        <Skeleton className="w-full h-full rounded-none" tone="surface" />
        <Skeleton
          className="absolute top-2.5 left-2.5 h-4 w-12"
          tone="default"
        />
      </div>

      {/* Card Body Placeholder */}
      <div className="p-3 sm:p-3.5 flex flex-col gap-2">
        <Skeleton variant="text" className="h-2.5 w-16" tone="muted" />
        <Skeleton variant="text" className="h-3.5 w-4/5" tone="default" />
        <Skeleton variant="text" className="h-3.5 w-1/2" tone="muted" />

        <div className="pt-1.5 mt-0.5 border-t border-[#FAF9F6] flex items-center justify-between">
          <Skeleton variant="text" className="h-4 w-20" tone="default" />
          <Skeleton className="h-7 w-7" tone="surface" />
        </div>
      </div>
    </div>
  );
}

export interface ProductGridSkeletonProps {
  count?: number;
  className?: string;
}

export function ProductGridSkeleton({
  count = 8,
  className = "",
}: ProductGridSkeletonProps) {
  return (
    <div
      aria-busy="true"
      aria-label="Loading products"
      className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-5 w-full ${className}`}
    >
      {Array.from({ length: count }).map((_, idx) => (
        <ProductCardSkeleton key={idx} />
      ))}
    </div>
  );
}

export function ShopPageSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading shop catalog"
      className="min-h-screen bg-white font-sans overflow-x-hidden"
    >
      {/* Header Skeleton */}
      <div className="bg-[#FAF9F6] border-b border-[#EAE8E4] py-6 sm:py-12 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center gap-2.5">
          <Skeleton variant="text" className="h-2.5 w-24" tone="default" />
          <Skeleton className="h-7 sm:h-9 w-56 sm:w-72" tone="default" />
          <Skeleton variant="text" className="h-3 w-64 sm:w-80" tone="muted" />
        </div>
      </div>

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-6 sm:py-12">
        {/* Controls Bar Skeleton */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-[#EAE8E4]">
          <Skeleton className="h-9 w-full sm:w-72" tone="surface" />
          <Skeleton className="h-9 w-full sm:w-44" tone="surface" />
        </div>

        <div className="flex flex-col md:flex-row gap-6 lg:gap-8">
          {/* Desktop Sidebar Skeleton */}
          <aside className="hidden md:flex flex-col w-52 shrink-0 gap-3">
            <Skeleton variant="text" className="h-4 w-24 mb-2" tone="default" />
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" tone="surface" />
            ))}
          </aside>

          {/* Grid Skeleton */}
          <main className="flex-1 min-w-0">
            <ProductGridSkeleton count={8} />
          </main>
        </div>
      </div>
    </div>
  );
}
