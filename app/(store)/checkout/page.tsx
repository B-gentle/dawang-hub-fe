"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Cookies from "js-cookie";
import { FiArrowLeft, FiShoppingBag, FiAlertTriangle } from "react-icons/fi";
import { toast } from "sonner";
import { useCart } from "@/context/CartContext";
import CheckoutForm, {
  ShippingAddressData,
} from "@/components/checkout/CheckoutForm";
import OrderSummaryCard from "@/components/checkout/OrderSummaryCard";
import { apiClient } from "@/lib/api-client";
import { UserProfile } from "@/lib/api/auth-api";
import { AddressPayload } from "@/lib/api/users-api";
import { vendorApi } from "@/lib/api/vendor-api";
import { systemConfigApi } from "@/lib/api/system-config-api";

const TOKEN_COOKIE_NAME =
  process.env.NEXT_PUBLIC_AUTH_TOKEN_COOKIE_NAME || "dawang_token";

export default function CheckoutPage() {
  const { cart, subtotal, clearCart, isMounted } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const [vendorId, setVendorId] = useState<string | undefined>(undefined);
  const [availableStates, setAvailableStates] = useState<
    Array<{ state: string; fee: number }>
  >([]);
  const [selectedState, setSelectedState] = useState<string>("Rivers");
  const [shippingFee, setShippingFee] = useState<number>(5000);
  const [deliverySupported, setDeliverySupported] = useState<boolean>(true);
  const [checkingShipping, setCheckingShipping] = useState<boolean>(false);

  // Detect vendorId from cart items or current storefront subdomain
  useEffect(() => {
    let active = true;

    const resolveVendor = async () => {
      const cartVendorId = cart[0]?.product?.vendorId || undefined;
      if (cartVendorId) {
        if (active) setVendorId(cartVendorId);
        return;
      }

      if (typeof window !== "undefined") {
        const host = window.location.hostname;
        const rootDomain =
          process.env.NEXT_PUBLIC_ROOT_DOMAIN || "globexmall.com";
        let slug = "";

        if (host.endsWith(".localhost") && host !== "localhost") {
          slug = host.replace(".localhost", "");
        } else if (
          host.endsWith(`.${rootDomain}`) &&
          host !== rootDomain &&
          host !== `www.${rootDomain}`
        ) {
          slug = host.replace(`.${rootDomain}`, "");
        }

        if (slug) {
          try {
            const store = await vendorApi.getStorefrontBySlug(slug);
            if (active && store?.id) {
              setVendorId(store.id);
            }
          } catch {
            // fallback to platform checkout
          }
        }
      }
    };

    resolveVendor();
    return () => {
      active = false;
    };
  }, [cart]);

  // Load supported states & fees for the active vendor (or global flat rate fallback)
  useEffect(() => {
    let active = true;

    const loadShippingOptions = async () => {
      try {
        if (vendorId) {
          const opts = await vendorApi.getShippingOptions(vendorId);
          if (!active) return;
          setAvailableStates(opts.states || []);
        } else {
          const cfg = await systemConfigApi.getPublicConfig().catch(() => null);
          if (!active) return;
          const flat = Number(cfg?.defaultFlatShippingFee ?? 5000);
          setShippingFee(subtotal >= 150000 || subtotal === 0 ? 0 : flat);
          setAvailableStates([]);
        }
      } catch {
        if (active) setAvailableStates([]);
      }
    };

    loadShippingOptions();
    return () => {
      active = false;
    };
  }, [vendorId, subtotal]);

  // Fetch user profile & default address
  useEffect(() => {
    let active = true;

    const fetchUserData = async () => {
      const token = Cookies.get(TOKEN_COOKIE_NAME);
      if (!token) return;

      if (active) setIsLoggedIn(true);

      try {
        const [userRes, addressesRes] = await Promise.allSettled([
          apiClient.getMe(),
          apiClient.getAddresses(),
        ]);

        if (!active) return;

        let user: UserProfile | null = null;
        if (userRes.status === "fulfilled" && userRes.value) {
          user = userRes.value as UserProfile;
        }

        let defaultAddr: AddressPayload | undefined;
        if (
          addressesRes.status === "fulfilled" &&
          Array.isArray(addressesRes.value)
        ) {
          const addrs = addressesRes.value as AddressPayload[];
          defaultAddr = addrs.find((a) => a.isDefault) || addrs[0];
        }

        if (user) {
          const rawState = defaultAddr?.state || user.state || "Rivers";
          const resolvedState =
            rawState === "Abuja" || rawState === "FCT"
              ? "FCT - Abuja"
              : rawState;
          setSelectedState(resolvedState);
          setUserProfile({
            ...user,
            phoneNumber: user.phoneNumber || "",
            streetAddress:
              defaultAddr?.streetAddress || user.streetAddress || "",
            city: defaultAddr?.city || user.city || "Port Harcourt",
            state: resolvedState,
          });
        }
      } catch (err) {
        console.warn(
          "Could not fetch user profile or address for checkout:",
          err,
        );
      }
    };

    fetchUserData();
    return () => {
      active = false;
    };
  }, []);

  // Fetch live state shipping rate whenever vendorId or selectedState changes
  useEffect(() => {
    if (!selectedState) return;
    let active = true;

    const fetchShipping = async () => {
      if (!vendorId) {
        if (active) {
          setDeliverySupported(true);
        }
        return;
      }

      try {
        if (active) setCheckingShipping(true);
        const res = await vendorApi.getShippingFeeForState(
          vendorId,
          selectedState,
        );
        if (!active) return;
        setDeliverySupported(res.supported);
        setShippingFee(res.supported ? Number(res.fee) || 0 : 0);
      } catch {
        if (!active) return;
        setDeliverySupported(true);
        setShippingFee(0);
      } finally {
        if (active) setCheckingShipping(false);
      }
    };

    fetchShipping();
    return () => {
      active = false;
    };
  }, [vendorId, selectedState]);

  const handleCheckoutSubmit = async (shippingData: ShippingAddressData) => {
    if (cart.length === 0) {
      toast.error("Your shopping bag is empty");
      return;
    }

    if (shippingData.state && shippingData.state !== selectedState) {
      setSelectedState(shippingData.state);
    }

    if (!deliverySupported) {
      toast.error(
        `This store does not currently deliver to ${shippingData.state}. Please choose a supported state.`,
      );
      return;
    }

    try {
      setIsProcessing(true);

      const orderPayload = {
        vendorId,
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
          selectedSize: item.selectedSize || undefined,
          selectedColor: item.selectedColor || undefined,
        })),
      };

      toast.info("Registering your order...");
      const order = await apiClient.createOrder(orderPayload);

      if (!order?.id) {
        throw new Error("Failed to generate order reference.");
      }

      toast.info("Connecting to payment gateway...");
      const paymentData = await apiClient.initializePayment(order.id);

      if (paymentData?.authorization_url) {
        await clearCart();
        toast.success("Redirecting to secure checkout...");
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
        {!deliverySupported && (
          <div className="mb-6 p-4 rounded-lg bg-rose-50 border border-rose-200 flex items-center gap-3 text-xs text-rose-800">
            <FiAlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>
              <strong>Delivery Unavailable for {selectedState}:</strong> This
              vendor has not enabled shipping to{" "}
              <strong>{selectedState}</strong>. Please select another delivery
              state.
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          <div className="lg:col-span-7 bg-white">
            <CheckoutForm
              onSubmit={handleCheckoutSubmit}
              isProcessing={isProcessing || checkingShipping}
              isLoggedIn={isLoggedIn}
              user={userProfile}
              availableStates={availableStates}
              onStateChange={(st: string) => setSelectedState(st)}
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
