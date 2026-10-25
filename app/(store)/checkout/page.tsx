"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Cookies from "js-cookie";
import { FiArrowLeft, FiShoppingBag, FiCheckCircle } from "react-icons/fi";
import { toast } from "sonner";
import { useCart } from "@/context/CartContext";
import CheckoutForm, {
  ShippingAddressData,
} from "@/components/checkout/CheckoutForm";
import OrderSummaryCard from "@/components/checkout/OrderSummaryCard";
import { apiClient } from "@/lib/api-client";
import { UserProfile } from "@/lib/api/auth-api";

const TOKEN_COOKIE_NAME =
  process.env.NEXT_PUBLIC_AUTH_TOKEN_COOKIE_NAME || "dawang_token";

export default function CheckoutPage() {
  const { cart, subtotal, clearCart, isMounted } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const shippingFee = subtotal >= 150000 || subtotal === 0 ? 0 : 5000;

  // Fetch returning user profile if authenticated
  useEffect(() => {
    let active = true;

    const fetchProfile = async () => {
      const token = Cookies.get(TOKEN_COOKIE_NAME);
      if (!token) return;

      queueMicrotask(() => {
        if (active) setIsLoggedIn(true);
      });

      try {
        const user = (await apiClient.getMe()) as UserProfile;
        if (active && user) {
          setUserProfile(user);
        }
      } catch (err) {
        console.warn("Could not fetch user profile for checkout:", err);
      }
    };

    fetchProfile();

    return () => {
      active = false;
    };
  }, []);

  const handleCheckoutSubmit = async (shippingData: ShippingAddressData) => {
    if (cart.length === 0) {
      toast.error("Your shopping bag is empty");
      return;
    }

    try {
      setIsProcessing(true);

      // 1. Map shipping payload and cart line items
      const orderPayload = {
        shippingAddress: {
          firstName: shippingData.firstName,
          lastName: shippingData.lastName,
          email: shippingData.email,
          phone: shippingData.phone,
          streetAddress: shippingData.streetAddress,
          city: shippingData.city,
          state: shippingData.state,
        },
        items: cart.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
      };

      toast.info("Registering your order...");
      const order = await apiClient.createOrder(orderPayload);

      if (!order?.id) {
        throw new Error("Failed to generate order reference.");
      }

      // 3. Initialize Paystack Transaction
      toast.info("Connecting to Paystack...");
      const paymentData = await apiClient.initializePayment(order.id);

      if (paymentData?.authorization_url) {
        // Clear local & server cart before navigating to gateway
        await clearCart();

        toast.success("Redirecting to Paystack secure checkout...");
        window.location.href = paymentData.authorization_url;
      } else {
        throw new Error("Could not initialize payment gateway.");
      }
    } catch (err: unknown) {
      console.error("Checkout process error:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Checkout failed. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isMounted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-xs text-[#76726E]">
        Preparing checkout environment...
      </div>
    );
  }

  if (orderComplete) {
    return (
      <div className="min-h-[70vh] bg-white font-sans text-[#151413] flex items-center justify-center px-4">
        <div className="max-w-md w-full py-12 px-6 bg-[#FAF9F6] border border-[#EAE8E4] rounded-lg text-center flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
            <FiCheckCircle className="w-8 h-8" />
          </div>
          <h1 className="font-heading text-2xl font-bold uppercase tracking-tight">
            Order Confirmed!
          </h1>
          <p className="text-xs text-[#76726E] leading-relaxed">
            Thank you for shopping with Dawang Stores. Your order details have
            been received and sent to your email.
          </p>
          <Link
            href={isLoggedIn ? "/account" : "/shop"}
            className="mt-2 px-6 py-3 bg-[#151413] text-white text-xs font-bold uppercase tracking-widest rounded-md hover:bg-[#2A2725] transition-colors"
          >
            {isLoggedIn ? "View My Orders" : "Continue Shopping"}
          </Link>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-[60vh] bg-white font-sans text-[#151413] flex items-center justify-center px-4">
        <div className="max-w-md w-full py-12 px-6 bg-[#FAF9F6] border border-[#EAE8E4] rounded-lg text-center flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-white border border-[#EAE8E4] flex items-center justify-center text-[#A39E98]">
            <FiShoppingBag className="w-6 h-6" />
          </div>
          <h1 className="font-heading text-lg font-bold uppercase text-[#151413]">
            Your Bag is Empty
          </h1>
          <p className="text-xs text-[#76726E]">
            Please add items to your shopping bag before proceeding to checkout.
          </p>
          <Link
            href="/shop"
            className="mt-2 px-6 py-3 bg-[#151413] text-white text-xs font-bold uppercase tracking-widest rounded-md hover:bg-[#2A2725] transition-colors flex items-center gap-2"
          >
            <FiArrowLeft className="w-4 h-4" /> Return to Shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans text-[#151413]">
      <div className="bg-[#FAF9F6] border-b border-[#EAE8E4] py-8 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center gap-2">
          <span className="text-[10px] font-bold text-[#C4956A] uppercase tracking-[0.25em]">
            Express Checkout
          </span>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold uppercase tracking-tight">
            Secure Payment
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          <div className="lg:col-span-7 bg-white">
            <CheckoutForm
              onSubmit={handleCheckoutSubmit}
              isProcessing={isProcessing}
              isLoggedIn={isLoggedIn}
              user={userProfile}
            />
          </div>

          <div className="lg:col-span-5">
            <OrderSummaryCard shippingFee={shippingFee} />
          </div>
        </div>
      </div>
    </div>
  );
}
