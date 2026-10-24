"use client";

import { useState, useEffect, use } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  FiHeart,
  FiShoppingBag,
  FiTruck,
  FiShield,
  FiRefreshCw,
  FiChevronDown,
  FiMinus,
  FiPlus,
  FiImage,
} from "react-icons/fi";
import { FaHeart } from "react-icons/fa";
import { apiClient } from "@/lib/api-client";
import { Product } from "@/types/product";
import ProductGrid from "@/components/products/ProductGrid";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ProductDetailPage({ params }: PageProps) {
  const { id } = use(params);

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);

  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  // Accordion state toggles
  const [activeTab, setActiveTab] = useState<string | null>("description");

  useEffect(() => {
    let isMounted = true;

    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        const data = (await apiClient.getProductById(id)) as Product;

        if (!isMounted) return;

        setProduct(data);
        if (data.images && data.images.length > 0) {
          setSelectedImage(data.images[0]);
        }

        // Fetch catalog for related items matching category
        if (data.categoryId) {
          const allRes = await apiClient.getProducts();
          const catalog: Product[] = Array.isArray(allRes)
            ? allRes
            : (allRes as { items?: Product[] })?.items || [];

          const related = catalog.filter(
            (item) =>
              item.categoryId === data.categoryId && item.id !== data.id,
          );
          setRelatedProducts(related);
        }
      } catch (err) {
        console.error("Failed to load product details:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProductDetails();

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-2 text-xs text-[#76726E]">
        <FiRefreshCw className="w-6 h-6 animate-spin text-[#C4956A]" />
        Loading product details...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center px-4">
        <h2 className="font-heading text-xl font-bold uppercase text-[#151413]">
          Product Not Found
        </h2>
        <p className="text-xs text-[#76726E]">
          The item you are looking for may have been removed or is unavailable.
        </p>
        <Link
          href="/shop"
          className="px-6 py-2.5 bg-[#151413] text-white text-xs font-bold uppercase tracking-wider rounded-md"
        >
          Return to Shop
        </Link>
      </div>
    );
  }

  const hasDiscount = Boolean(
    product.discountPrice && product.discountPrice < product.price,
  );
  const displayPrice = hasDiscount ? product.discountPrice! : product.price;
  const isSaved = isInWishlist(product.id);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
    }
  };

  const toggleTab = (tab: string) => {
    setActiveTab(activeTab === tab ? null : tab);
  };

  return (
    <div className="min-h-screen bg-white font-sans text-[#151413]">
      {/* Breadcrumb Navigation */}
      <div className="bg-[#FAF9F6] border-b border-[#EAE8E4] py-3 px-4 sm:px-8 lg:px-12 text-[11px] text-[#76726E]">
        <div className="max-w-7xl mx-auto flex items-center gap-2">
          <Link href="/" className="hover:text-[#151413]">
            Home
          </Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-[#151413]">
            Shop
          </Link>
          <span>/</span>
          <span className="text-[#151413] font-medium truncate max-w-[200px]">
            {product.name}
          </span>
        </div>
      </div>

      {/* Main Product Showcase Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Image Gallery */}
          <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-4">
            {/* Thumbnails */}
            {product.images && product.images.length > 1 && (
              <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-y-auto max-h-[500px] shrink-0 no-scrollbar">
                {product.images.map((imgUrl, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(imgUrl)}
                    className={`relative w-16 h-20 sm:w-20 sm:h-24 bg-[#FAF9F6] border rounded-xs overflow-hidden shrink-0 cursor-pointer transition-all ${
                      selectedImage === imgUrl
                        ? "border-[#151413] ring-1 ring-[#151413]"
                        : "border-[#EAE8E4] opacity-70 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={imgUrl}
                      alt={`${product.name} preview ${index + 1}`}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Main Active Image Display */}
            <div className="relative aspect-4/5 w-full bg-[#FAF9F6] border border-[#EAE8E4] rounded-md overflow-hidden flex-1">
              {selectedImage ? (
                <Image
                  src={selectedImage}
                  alt={product.name}
                  fill
                  priority
                  unoptimized
                  className="object-cover transition-all duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#A39E98]">
                  <FiImage className="w-12 h-12" />
                </div>
              )}

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-10">
                {hasDiscount && (
                  <span className="bg-rose-600 text-white text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-xs">
                    SALE
                  </span>
                )}
                {product.isFeatured && (
                  <span className="bg-[#151413] text-white text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-xs">
                    FEATURED
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Product Info & Actions */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div>
              <span className="text-xs font-bold tracking-widest text-[#C4956A] uppercase block mb-1">
                {typeof product.category === "object"
                  ? product.category?.name
                  : "Luxury Collection"}
              </span>
              <h1 className="font-heading text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-[#151413]">
                {product.name}
              </h1>
              {product.sku && (
                <span className="text-[10px] font-mono text-[#76726E] mt-1 block">
                  SKU: {product.sku}
                </span>
              )}
            </div>

            {/* Pricing Bar */}
            <div className="flex items-baseline gap-3 pb-4 border-b border-[#EAE8E4]">
              <span className="font-bold text-2xl text-[#151413]">
                ₦{Number(displayPrice || 0).toLocaleString()}
              </span>
              {hasDiscount && (
                <span className="text-sm text-[#76726E] line-through font-normal">
                  ₦{Number(product.price).toLocaleString()}
                </span>
              )}
            </div>

            {/* Availability Status */}
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  (product.stockQuantity || 0) > 0
                    ? "bg-emerald-500"
                    : "bg-rose-500"
                }`}
              />
              <span className="text-xs font-semibold uppercase tracking-wider text-[#151413]">
                {(product.stockQuantity || 0) > 0
                  ? `In Stock (${product.stockQuantity} available)`
                  : "Out of Stock"}
              </span>
            </div>

            {/* Quantity Selector & Add to Bag */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <div className="flex items-center justify-between border border-[#EAE8E4] rounded-md bg-[#FAF9F6] px-3 py-2.5 w-full sm:w-32">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="p-1 text-[#76726E] hover:text-[#151413] cursor-pointer"
                  aria-label="Decrease quantity"
                >
                  <FiMinus className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs font-bold">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="p-1 text-[#76726E] hover:text-[#151413] cursor-pointer"
                  aria-label="Increase quantity"
                >
                  <FiPlus className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={(product.stockQuantity || 0) <= 0}
                className="flex-1 py-3.5 bg-[#151413] text-white text-xs font-bold uppercase tracking-widest rounded-md hover:bg-[#2A2725] transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:bg-[#A39E98] disabled:cursor-not-allowed"
              >
                <FiShoppingBag className="w-4 h-4" /> Add To Shopping Bag
              </button>

              {/* Connected Wishlist Toggle */}
              <button
                onClick={() => toggleWishlist(product)}
                className="p-3.5 border border-[#EAE8E4] rounded-md hover:border-[#151413] transition-colors flex items-center justify-center cursor-pointer"
                aria-label={
                  isSaved ? "Remove from wishlist" : "Save to wishlist"
                }
              >
                {isSaved ? (
                  <FaHeart className="w-4 h-4 text-rose-600" />
                ) : (
                  <FiHeart className="w-4 h-4 text-[#151413]" />
                )}
              </button>
            </div>

            {/* Value Guarantees */}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-[#EAE8E4] text-xs text-[#76726E]">
              <div className="flex items-center gap-2.5">
                <FiTruck className="w-4 h-4 text-[#C4956A] shrink-0" />
                <span>Express Nationwide Delivery</span>
              </div>
              <div className="flex items-center gap-2.5">
                <FiShield className="w-4 h-4 text-[#C4956A] shrink-0" />
                <span>100% Authentic Products</span>
              </div>
            </div>

            {/* Accordion Tabs */}
            <div className="flex flex-col border-t border-[#EAE8E4] pt-4 mt-2 divide-y divide-[#EAE8E4]">
              <div className="py-3">
                <button
                  onClick={() => toggleTab("description")}
                  className="w-full flex justify-between items-center text-xs font-bold uppercase tracking-wider text-[#151413] text-left cursor-pointer"
                >
                  <span>Description</span>
                  <FiChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${
                      activeTab === "description" ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {activeTab === "description" && (
                  <p className="text-xs text-[#76726E] mt-3 leading-relaxed">
                    {product.description ||
                      "Crafted with meticulous attention to detail using high-grade materials for optimal elegance and longevity."}
                  </p>
                )}
              </div>

              <div className="py-3">
                <button
                  onClick={() => toggleTab("shipping")}
                  className="w-full flex justify-between items-center text-xs font-bold uppercase tracking-wider text-[#151413] text-left cursor-pointer"
                >
                  <span>Shipping & Returns</span>
                  <FiChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${
                      activeTab === "shipping" ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {activeTab === "shipping" && (
                  <div className="text-xs text-[#76726E] mt-3 leading-relaxed flex flex-col gap-2">
                    <p>
                      Orders in Port Harcourt are processed and delivered within
                      24-48 hours.
                    </p>
                    <p>
                      Interstate shipments typically arrive within 2-4 business
                      days.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <div className="bg-[#FAF9F6] border-t border-[#EAE8E4] mt-12">
          <ProductGrid
            title="You May Also Like"
            subtitle="Curated items matching this style"
            products={relatedProducts.slice(0, 4)}
          />
        </div>
      )}
    </div>
  );
}
