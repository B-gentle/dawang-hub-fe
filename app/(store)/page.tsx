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

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = (await apiClient.getProducts()) as
          Product[] | PaginatedResponse<Product>;

        if (!isMounted) return;

        let extracted: Product[] = [];
        if (Array.isArray(res)) {
          extracted = res;
        } else if (res && Array.isArray(res.items)) {
          extracted = res.items;
        } else if (res && Array.isArray(res.data)) {
          extracted = res.data;
        } else if (res && Array.isArray(res.products)) {
          extracted = res.products;
        }

        setProducts(extracted);
      } catch (err) {
        console.error("Failed to load storefront products:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  // Deriving catalog collections
  const newArrivals = [...products]
    .sort(
      (a, b) =>
        new Date(b.createdAt || 0).getTime() -
        new Date(a.createdAt || 0).getTime(),
    )
    .slice(0, 10);

  const popularProducts = products.filter((p) => p.isPopular);
  const featuredProducts = products.filter((p) => p.isFeatured);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Hero videoId="dQw4w9WgXcQ" />

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
        products={
          popularProducts.length > 0 ? popularProducts : products.slice(0, 4)
        }
        loading={loading}
        viewAllHref="/shop"
      />

      {/* 3. Featured Products Section */}
      <ProductGrid
        title="Featured Selection"
        subtitle="Handpicked collection highlights"
        products={
          featuredProducts.length > 0 ? featuredProducts : products.slice(0, 4)
        }
        loading={loading}
        viewAllHref="/shop"
      />
    </div>
  );
}
