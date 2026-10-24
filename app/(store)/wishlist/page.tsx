"use client";

import Link from "next/link";
import { FiHeart, FiTrash2, FiArrowLeft } from "react-icons/fi";
import { useWishlist } from "@/context/WishlistContext";
import ProductCard from "@/components/products/ProductCard";

export default function WishlistPage() {
  const { wishlist, removeFromWishlist, clearWishlist } = useWishlist();

  return (
    <div className="min-h-screen bg-white font-sans text-[#151413]">
      {/* Header */}
      <div className="bg-[#FAF9F6] border-b border-[#EAE8E4] py-8 sm:py-12 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center gap-2">
          <span className="text-[10px] font-bold text-[#C4956A] uppercase tracking-[0.25em]">
            Saved Items
          </span>
          <h1 className="font-heading text-2xl sm:text-4xl font-bold uppercase tracking-tight">
            My Wishlist ({wishlist.length})
          </h1>
          <p className="text-xs text-[#76726E] max-w-md">
            Keep track of pieces you love and save them for later.
          </p>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
        {wishlist.length === 0 ? (
          <div className="py-20 bg-[#FAF9F6] rounded-lg border border-[#EAE8E4] flex flex-col items-center justify-center gap-4 text-center px-4">
            <div className="w-12 h-12 rounded-full bg-white border border-[#EAE8E4] flex items-center justify-center text-[#A39E98]">
              <FiHeart className="w-6 h-6" />
            </div>
            <div className="flex flex-col gap-1">
              <h2 className="font-heading text-lg font-bold uppercase text-[#151413]">
                Your Wishlist is Empty
              </h2>
              <p className="text-xs text-[#76726E] max-w-sm">
                Explore our catalog and tap the heart icon on any product to
                save it here.
              </p>
            </div>
            <Link
              href="/shop"
              className="mt-2 px-6 py-3 bg-[#151413] text-white text-xs font-bold uppercase tracking-widest rounded-md hover:bg-[#2A2725] transition-colors flex items-center gap-2"
            >
              <FiArrowLeft className="w-4 h-4" /> Start Shopping
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {/* Top Toolbar */}
            <div className="flex justify-between items-center pb-4 border-b border-[#EAE8E4]">
              <span className="text-xs font-bold uppercase tracking-wider text-[#76726E]">
                Showing {wishlist.length} saved item
                {wishlist.length > 1 ? "s" : ""}
              </span>
              <button
                onClick={clearWishlist}
                className="text-xs font-bold text-rose-600 hover:text-rose-800 uppercase tracking-wider underline cursor-pointer"
              >
                Clear All
              </button>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 w-full">
              {wishlist.map((product) => (
                <div key={product.id} className="relative group">
                  <ProductCard product={product} />
                  {/* Remove Button Overlay */}
                  <button
                    onClick={() => removeFromWishlist(product.id)}
                    className="absolute top-3 right-3 z-30 p-2 rounded-full bg-white/90 text-rose-600 shadow-sm hover:bg-rose-600 hover:text-white transition-colors cursor-pointer"
                    aria-label="Remove from wishlist"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
