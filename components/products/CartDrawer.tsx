"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiX,
  FiShoppingBag,
  FiTrash2,
  FiMinus,
  FiPlus,
  FiArrowRight,
} from "react-icons/fi";
import { useCart } from "@/context/CartContext";

export default function CartDrawer() {
  const {
    cart,
    isCartOpen,
    closeCart,
    removeFromCart,
    updateQuantity,
    subtotal,
    totalItems,
  } = useCart();

  return (
    <AnimatePresence>
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end font-sans">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
          />

          {/* Slide-out Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="relative w-full max-w-md h-full bg-white shadow-2xl flex flex-col justify-between z-10"
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-5 border-b border-[#EAE8E4]">
              <div className="flex items-center gap-2">
                <FiShoppingBag className="w-5 h-5 text-[#C4956A]" />
                <h2 className="font-heading text-sm font-bold uppercase tracking-wider text-[#151413]">
                  Shopping Bag ({totalItems})
                </h2>
              </div>
              <button
                onClick={closeCart}
                className="p-1.5 text-[#76726E] hover:text-[#151413] transition-colors cursor-pointer"
                aria-label="Close cart drawer"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-5 divide-y divide-[#EAE8E4]">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center gap-4 py-12">
                  <div className="w-12 h-12 rounded-full bg-[#FAF9F6] border border-[#EAE8E4] flex items-center justify-center text-[#A39E98]">
                    <FiShoppingBag className="w-6 h-6" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="font-heading text-sm font-bold uppercase text-[#151413]">
                      Your Bag is Empty
                    </p>
                    <p className="text-xs text-[#76726E] max-w-xs">
                      Items added to your bag will appear here.
                    </p>
                  </div>
                  <button
                    onClick={closeCart}
                    className="mt-2 px-6 py-2.5 bg-[#151413] text-white text-xs font-bold uppercase tracking-widest rounded-md hover:bg-[#2A2725] transition-colors cursor-pointer"
                  >
                    Explore Shop
                  </button>
                </div>
              ) : (
                cart.map((item) => {
                  const product = item.product;
                  const price = product.discountPrice || product.price || 0;

                  return (
                    <div
                      key={product.id}
                      className="py-4 flex gap-4 first:pt-0 last:pb-0"
                    >
                      {/* Item Image */}
                      <div className="relative w-20 h-24 bg-[#FAF9F6] border border-[#EAE8E4] rounded-xs overflow-hidden shrink-0">
                        {product.images?.[0] && (
                          <Image
                            src={product.images[0]}
                            alt={product.name || "Product image"}
                            fill
                            unoptimized
                            className="object-cover"
                          />
                        )}
                      </div>

                      {/* Item Info */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start gap-2">
                            <h3 className="text-xs font-bold text-[#151413] line-clamp-1">
                              {product.name}
                            </h3>
                            <button
                              onClick={() => removeFromCart(product.id)}
                              className="text-[#76726E] hover:text-rose-600 transition-colors cursor-pointer"
                              aria-label="Remove item"
                            >
                              <FiTrash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <p className="text-[11px] font-bold text-[#C4956A] mt-0.5">
                            ₦{Number(price).toLocaleString()}
                          </p>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center border border-[#EAE8E4] rounded-md bg-[#FAF9F6] px-2 py-1">
                            <button
                              onClick={() =>
                                updateQuantity(product.id, item.quantity - 1)
                              }
                              className="p-1 text-[#76726E] hover:text-[#151413] cursor-pointer"
                            >
                              <FiMinus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-bold px-2">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(product.id, item.quantity + 1)
                              }
                              className="p-1 text-[#76726E] hover:text-[#151413] cursor-pointer"
                            >
                              <FiPlus className="w-3 h-3" />
                            </button>
                          </div>
                          <span className="text-xs font-bold text-[#151413]">
                            ₦{Number(price * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer Summary */}
            {cart.length > 0 && (
              <div className="p-5 border-t border-[#EAE8E4] bg-[#FAF9F6] flex flex-col gap-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-[#76726E] uppercase tracking-wider">
                    Subtotal
                  </span>
                  <span className="font-bold text-base text-[#151413]">
                    ₦{subtotal.toLocaleString()}
                  </span>
                </div>
                <p className="text-[10px] text-[#76726E]">
                  Taxes and shipping are calculated during checkout.
                </p>

                <div className="flex flex-col gap-2">
                  <Link
                    href="/cart"
                    onClick={closeCart}
                    className="w-full py-3.5 bg-[#151413] text-white text-xs font-bold uppercase tracking-widest rounded-md hover:bg-[#2A2725] transition-colors flex items-center justify-center gap-2 text-center"
                  >
                    View Cart & Checkout <FiArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
