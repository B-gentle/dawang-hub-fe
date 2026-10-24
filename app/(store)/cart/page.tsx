"use client";

import Image from "next/image";
import Link from "next/link";
import {
  FiShoppingBag,
  FiTrash2,
  FiMinus,
  FiPlus,
  FiArrowLeft,
  FiShield,
  FiTruck,
} from "react-icons/fi";
import { useCart } from "@/context/CartContext";

export default function CartPage() {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    subtotal,
    totalItems,
    clearCart,
  } = useCart();

  const estimatedShipping = subtotal >= 150000 || subtotal === 0 ? 0 : 5000;
  const grandTotal = subtotal + estimatedShipping;

  return (
    <div className="min-h-screen bg-white font-sans text-[#151413]">
      {/* Header */}
      <div className="bg-[#FAF9F6] border-b border-[#EAE8E4] py-8 sm:py-12 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center gap-2">
          <span className="text-[10px] font-bold text-[#C4956A] uppercase tracking-[0.25em]">
            Shopping Bag
          </span>
          <h1 className="font-heading text-2xl sm:text-4xl font-bold uppercase tracking-tight">
            Your Bag ({totalItems})
          </h1>
          <p className="text-xs text-[#76726E] max-w-md">
            Review selected luxury items before proceeding to checkout.
          </p>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
        {cart.length === 0 ? (
          <div className="py-20 bg-[#FAF9F6] rounded-lg border border-[#EAE8E4] flex flex-col items-center justify-center gap-4 text-center px-4">
            <div className="w-12 h-12 rounded-full bg-white border border-[#EAE8E4] flex items-center justify-center text-[#A39E98]">
              <FiShoppingBag className="w-6 h-6" />
            </div>
            <div className="flex flex-col gap-1">
              <h2 className="font-heading text-lg font-bold uppercase text-[#151413]">
                Your Bag is Currently Empty
              </h2>
              <p className="text-xs text-[#76726E] max-w-sm">
                Discover pieces across our footwear, apparel, and lifestyle
                catalog.
              </p>
            </div>
            <Link
              href="/shop"
              className="mt-2 px-6 py-3 bg-[#151413] text-white text-xs font-bold uppercase tracking-widest rounded-md hover:bg-[#2A2725] transition-colors flex items-center gap-2"
            >
              <FiArrowLeft className="w-4 h-4" /> Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left Column: Itemized Cart Table (8 Columns) */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              <div className="flex justify-between items-center pb-4 border-b border-[#EAE8E4]">
                <span className="text-xs font-bold uppercase tracking-wider text-[#76726E]">
                  Product Details
                </span>
                <button
                  onClick={clearCart}
                  className="text-xs font-bold text-rose-600 hover:text-rose-800 uppercase tracking-wider underline cursor-pointer"
                >
                  Empty Bag
                </button>
              </div>

              <div className="flex flex-col divide-y divide-[#EAE8E4]">
                {cart.map((item) => {
                  const price =
                    item.product.discountPrice || item.product.price;
                  return (
                    <div
                      key={item.product.id}
                      className="py-6 flex flex-col sm:flex-row justify-between gap-4 first:pt-0"
                    >
                      <div className="flex gap-4">
                        {/* Thumbnail */}
                        <div className="relative w-24 h-28 bg-[#FAF9F6] border border-[#EAE8E4] rounded-xs overflow-hidden shrink-0">
                          {item.product.images?.[0] && (
                            <Image
                              src={item.product.images[0]}
                              alt={item.product.name}
                              fill
                              unoptimized
                              className="object-cover"
                            />
                          )}
                        </div>

                        {/* Title & Category */}
                        <div className="flex flex-col justify-between">
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold text-[#C4956A] uppercase tracking-wider">
                              {typeof item.product.category === "object"
                                ? item.product.category?.name
                                : "Luxury Item"}
                            </span>
                            <Link
                              href={`/product/${item.product.id}`}
                              className="font-bold text-sm text-[#151413] hover:text-[#C4956A] transition-colors"
                            >
                              {item.product.name}
                            </Link>
                            <span className="text-xs font-bold text-[#151413]">
                              ₦{Number(price).toLocaleString()}
                            </span>
                          </div>

                          <button
                            onClick={() => removeFromCart(item.product.id)}
                            className="text-xs font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1 cursor-pointer w-fit"
                          >
                            <FiTrash2 className="w-3.5 h-3.5" /> Remove
                          </button>
                        </div>
                      </div>

                      {/* Quantity Selector & Item Total */}
                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-between gap-2 border-t sm:border-t-0 pt-3 sm:pt-0 border-[#FAF9F6]">
                        <div className="flex items-center border border-[#EAE8E4] rounded-md bg-[#FAF9F6] px-2 py-1">
                          <button
                            onClick={() =>
                              updateQuantity(item.product.id, item.quantity - 1)
                            }
                            className="p-1 text-[#76726E] hover:text-[#151413] cursor-pointer"
                          >
                            <FiMinus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold px-3">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.product.id, item.quantity + 1)
                            }
                            className="p-1 text-[#76726E] hover:text-[#151413] cursor-pointer"
                          >
                            <FiPlus className="w-3 h-3" />
                          </button>
                        </div>

                        <span className="font-bold text-sm text-[#151413]">
                          ₦{Number(price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Order Summary (4 Columns) */}
            <div className="lg:col-span-4 bg-[#FAF9F6] border border-[#EAE8E4] rounded-md p-6 flex flex-col gap-6">
              <h2 className="font-heading text-sm font-bold uppercase tracking-wider text-[#151413] pb-3 border-b border-[#EAE8E4]">
                Order Summary
              </h2>

              <div className="flex flex-col gap-3 text-xs">
                <div className="flex justify-between text-[#76726E]">
                  <span>Subtotal</span>
                  <span className="font-bold text-[#151413]">
                    ₦{subtotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-[#76726E]">
                  <span>Estimated Shipping</span>
                  <span className="font-bold text-[#151413]">
                    {estimatedShipping === 0
                      ? "FREE"
                      : `₦${estimatedShipping.toLocaleString()}`}
                  </span>
                </div>
                {estimatedShipping > 0 && (
                  <p className="text-[10px] text-[#C4956A]">
                    Add ₦{(150000 - subtotal).toLocaleString()} more for FREE
                    delivery!
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-[#EAE8E4] flex justify-between items-baseline">
                <span className="font-bold text-xs uppercase tracking-wider text-[#151413]">
                  Total
                </span>
                <span className="font-bold text-xl text-[#151413]">
                  ₦{grandTotal.toLocaleString()}
                </span>
              </div>

              <Link
                href="/checkout"
                className="w-full py-4 bg-[#151413] text-white text-xs font-bold uppercase tracking-widest rounded-md hover:bg-[#2A2725] transition-colors text-center"
              >
                Proceed to Checkout
              </Link>

              <div className="flex flex-col gap-2 pt-2 border-t border-[#EAE8E4] text-[11px] text-[#76726E]">
                <div className="flex items-center gap-2">
                  <FiTruck className="w-4 h-4 text-[#C4956A]" />
                  <span>Secure nationwide shipping</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiShield className="w-4 h-4 text-[#C4956A]" />
                  <span>Guaranteed authentic goods</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
