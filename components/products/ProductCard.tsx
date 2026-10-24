"use client";

import Link from "next/link";
import Image from "next/image";
import { FiHeart, FiShoppingBag, FiImage } from "react-icons/fi";
import { FaHeart } from "react-icons/fa";
import { Product } from "@/types/product";
import { useWishlist } from "@/context/WishlistContext";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const isSaved = isInWishlist(product.id);

  const hasDiscount = Boolean(
    product.discountPrice && product.discountPrice < product.price,
  );
  const displayPrice = hasDiscount ? product.discountPrice! : product.price;
  const productHref = `/product/${product.id}`;

  return (
    <div className="group relative flex flex-col bg-white overflow-hidden transition-all duration-300 w-full rounded-b-md">
      {/* Image Stage Container */}
      <div className="relative aspect-4/5 w-full bg-[#FAF9F6] overflow-hidden z-20 shadow-xs group-hover:shadow-md transition-shadow duration-300">
        <Link href={productHref} className="absolute inset-0 z-0">
          {product.images && product.images.length > 0 ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              unoptimized
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#A39E98]">
              <FiImage className="w-8 h-8" />
            </div>
          )}
        </Link>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 pointer-events-none">
          {hasDiscount && (
            <span className="bg-rose-600 text-white text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-xs">
              SALE
            </span>
          )}
          {product.isFeatured && (
            <span className="bg-[#151413] text-white text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-xs">
              FEATURED
            </span>
          )}
        </div>

        {/* Interactive Wishlist Button */}
        <div className="absolute top-3 right-3 z-30 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleWishlist(product);
            }}
            className="w-8 h-8 rounded-full bg-white/90 text-[#151413] flex items-center justify-center shadow-xs hover:bg-[#151413] hover:text-white transition-colors cursor-pointer"
            aria-label={isSaved ? "Remove from wishlist" : "Add to wishlist"}
          >
            {isSaved ? (
              <FaHeart className="w-4 h-4 text-rose-600" />
            ) : (
              <FiHeart className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Quick Add To Bag Button */}
        <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
          <button className="w-full py-2.5 bg-[#151413]/90 backdrop-blur-xs text-white text-[10px] font-bold uppercase tracking-widest hover:bg-[#151413] flex items-center justify-center gap-2 transition-colors cursor-pointer">
            <FiShoppingBag className="w-3.5 h-3.5" /> Add to Bag
          </button>
        </div>
      </div>

      {/* Product Details Link */}
      <Link
        href={productHref}
        className="pt-3.5 pb-3 px-3 flex flex-col gap-1 bg-white border-x border-b border-[#EAE8E4]/60 rounded-b-md shadow-xs group-hover:shadow-md transition-shadow duration-300 z-10 block cursor-pointer"
      >
        <span className="text-[10px] font-bold tracking-widest text-[#C4956A] uppercase">
          {typeof product.category === "object"
            ? product.category?.name
            : "Catalog"}
        </span>
        <h3 className="font-medium text-xs sm:text-sm text-[#151413] group-hover:text-[#C4956A] transition-colors line-clamp-1">
          {product.name}
        </h3>

        <div className="flex items-baseline gap-2 mt-0.5">
          <span className="font-bold text-xs sm:text-sm text-[#151413]">
            ₦{Number(displayPrice || 0).toLocaleString()}
          </span>
          {hasDiscount && (
            <span className="text-[10px] sm:text-xs text-[#76726E] line-through font-normal">
              ₦{Number(product.price).toLocaleString()}
            </span>
          )}
        </div>
      </Link>
    </div>
  );
}
