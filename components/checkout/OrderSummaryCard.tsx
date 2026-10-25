"use client";

import Image from "next/image";
import Link from "next/link";
import { FiShoppingBag, FiLock, FiTruck, FiShield } from "react-icons/fi";
import { useCart } from "@/context/CartContext";

interface OrderSummaryCardProps {
  shippingFee: number;
}

export default function OrderSummaryCard({
  shippingFee,
}: OrderSummaryCardProps) {
  const { cart, subtotal, totalItems } = useCart();
  const grandTotal = subtotal + shippingFee;

  return (
    <div className="bg-[#FAF9F6] border border-[#EAE8E4] rounded-md p-6 flex flex-col gap-6 font-sans text-[#151413]">
      <div className="flex justify-between items-center pb-3 border-b border-[#EAE8E4]">
        <h2 className="font-heading text-sm font-bold uppercase tracking-wider text-[#151413]">
          Order Summary ({totalItems})
        </h2>
        <Link
          href="/cart"
          className="text-xs font-bold text-[#C4956A] hover:underline uppercase tracking-wider"
        >
          Edit Bag
        </Link>
      </div>

      {/* Item List */}
      <div className="flex flex-col gap-4 max-h-80 overflow-y-auto pr-1 divide-y divide-[#EAE8E4]/60">
        {cart.map((item) => {
          const product = item.product;
          const price = product.discountPrice || product.price || 0;

          return (
            <div
              key={product.id}
              className="pt-3 first:pt-0 flex gap-3 items-center"
            >
              <div className="relative w-14 h-16 bg-white border border-[#EAE8E4] rounded-xs overflow-hidden shrink-0">
                {product.images?.[0] ? (
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#A39E98]">
                    <FiShoppingBag className="w-4 h-4" />
                  </div>
                )}
                <span className="absolute top-0 right-0 bg-[#151413] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-bl-xs">
                  x{item.quantity}
                </span>
              </div>

              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <h3 className="text-xs font-bold text-[#151413] truncate">
                  {product.name}
                </h3>
                {(item.selectedSize || item.selectedColor) && (
                  <span className="text-[10px] text-[#76726E]">
                    {item.selectedSize ? `Size: ${item.selectedSize}` : ""}
                    {item.selectedSize && item.selectedColor ? " | " : ""}
                    {item.selectedColor ? `Color: ${item.selectedColor}` : ""}
                  </span>
                )}
                <span className="text-xs font-bold text-[#C4956A] mt-0.5">
                  ₦{(price * item.quantity).toLocaleString()}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Financial Calculations */}
      <div className="flex flex-col gap-2.5 text-xs pt-3 border-t border-[#EAE8E4]">
        <div className="flex justify-between text-[#76726E]">
          <span>Subtotal</span>
          <span className="font-bold text-[#151413]">
            ₦{subtotal.toLocaleString()}
          </span>
        </div>

        <div className="flex justify-between text-[#76726E]">
          <span>Shipping Fee</span>
          <span className="font-bold text-[#151413]">
            {shippingFee === 0 ? "FREE" : `₦${shippingFee.toLocaleString()}`}
          </span>
        </div>

        {subtotal < 150000 && (
          <p className="text-[10px] text-[#C4956A]">
            Add ₦{(150000 - subtotal).toLocaleString()} more for free nationwide
            delivery!
          </p>
        )}
      </div>

      <div className="pt-3 border-t border-[#EAE8E4] flex justify-between items-baseline">
        <span className="font-bold text-xs uppercase tracking-wider text-[#151413]">
          Total Amount
        </span>
        <span className="font-bold text-xl text-[#151413]">
          ₦{grandTotal.toLocaleString()}
        </span>
      </div>

      {/* Security Guarantees */}
      <div className="flex flex-col gap-2 pt-2 text-[11px] text-[#76726E]">
        <div className="flex items-center gap-2">
          <FiLock className="w-3.5 h-3.5 text-[#C4956A]" />
          <span>Encrypted payment processing via Paystack</span>
        </div>
        <div className="flex items-center gap-2">
          <FiTruck className="w-3.5 h-3.5 text-[#C4956A]" />
          <span>Insured delivery across Nigeria</span>
        </div>
        <div className="flex items-center gap-2">
          <FiShield className="w-3.5 h-3.5 text-[#C4956A]" />
          <span>100% Guaranteed authentic luxury items</span>
        </div>
      </div>
    </div>
  );
}
