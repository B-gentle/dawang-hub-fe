"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { Product } from "@/types/product";
import ProductGrid from "@/components/products/ProductGrid";
import Hero from "@/components/home/Hero";

interface PaginatedResponse<T> {
  items?: T[];
  data?: T[];
  products?: T[];
}

const extractProducts = (
  res: Product[] | PaginatedResponse<Product>,
): Product[] => {
  if (Array.isArray(res)) return res;
  if (res && Array.isArray(res.items)) return res.items;
  if (res && Array.isArray(res.data)) return res.data;
  if (res && Array.isArray(res.products)) return res.products;
  return [];
};

export default function HomePage() {
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [popularProducts, setPopularProducts] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchHomeSections = async () => {
      try {
        setLoading(true);

        // Fetch all 3 sections concurrently from the server with explicit DESC sorting
        const [newArrivalsRes, popularRes, featuredRes] = await Promise.all([
          apiClient.getProducts({
            limit: 10,
            sortBy: "createdAt",
            sortOrder: "DESC",
          }) as Promise<Product[] | PaginatedResponse<Product>>,

          apiClient.getProducts({
            limit: 8,
            isPopular: true,
            sortBy: "createdAt",
            sortOrder: "DESC",
          }) as Promise<Product[] | PaginatedResponse<Product>>,

          apiClient.getProducts({
            limit: 8,
            isFeatured: true,
            sortBy: "createdAt",
            sortOrder: "DESC",
          }) as Promise<Product[] | PaginatedResponse<Product>>,
        ]);

        if (!isMounted) return;

        setNewArrivals(extractProducts(newArrivalsRes));
        setPopularProducts(extractProducts(popularRes));
        setFeaturedProducts(extractProducts(featuredRes));
      } catch (err) {
        console.error("Failed to load home page collections:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchHomeSections();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-white font-sans text-[#151413]">
      <Hero videoId="t1Nbqpse8kc" />

      {/* 1. New Arrivals Section */}
      <ProductGrid
        title="New Arrivals"
        subtitle="The latest additions to the Dawang catalog"
        products={newArrivals}
        loading={loading}
        viewAllHref="/shop"
      />

      {/* Banner Break */}
      <section className="bg-[#FAF9F6] border-y border-[#EAE8E4] py-12 px-4 sm:px-6 text-center">
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-3">
          <span className="text-[10px] font-bold text-[#C4956A] uppercase tracking-[0.25em]">
            Craftsmanship
          </span>
          <h3 className="font-heading text-lg sm:text-2xl font-bold text-[#151413] uppercase">
            Curated Premium Essentials
          </h3>
          <p className="text-xs text-[#76726E] max-w-lg">
            Every piece in our catalog undergoes rigorous quality control to
            ensure high durability and exceptional style.
          </p>
        </div>
      </section>

      {/* 2. Popular Products Section */}
      <ProductGrid
        title="Popular Right Now"
        subtitle="Trending styles favored by our customers"
        products={popularProducts}
        loading={loading}
        viewAllHref="/shop"
      />

      {/* 3. Featured Products Section */}
      <ProductGrid
        title="Featured Selection"
        subtitle="Handpicked collection highlights"
        products={featuredProducts}
        loading={loading}
        viewAllHref="/shop"
      />
    </div>
  );
}
