"use client";

import { LuSearch, LuUser, LuShoppingBag } from "react-icons/lu";
import { FaWhatsapp } from "react-icons/fa";
import { HeroType } from "@/lib/api/system-config-api";

export interface StorefrontPreviewProps {
  siteName: string;
  slug: string;
  logoUrl: string;
  tagline: string;
  description: string;
  heroType: HeroType;
  heroImages: string[];
  heroVideoId: string;
  contactAddress: string;
  location: string;
  businessHours: string;
  whatsappContact: string;
  minFreeDeliveryFare: number;
  rootDomain?: string;
}

export function StorefrontPreview({
  siteName,
  slug,
  logoUrl,
  tagline,
  description,
  heroType,
  heroImages,
  heroVideoId,
  contactAddress,
  location,
  businessHours,
  whatsappContact,
  minFreeDeliveryFare,
  rootDomain = "dawang.com",
}: StorefrontPreviewProps) {
  const nameParts = (siteName || "STORE NAME").trim().split(" ");
  const previewMainTitle = nameParts[0] || "STORE";
  const previewSubTitle = nameParts.slice(1).join(" ") || "OFFICIAL";
  const imageCount = heroImages.length;

  return (
    <div className="w-full rounded-xl border border-[#EAE8E4] bg-white shadow-xl overflow-hidden flex flex-col">
      {/* Browser Top Chrome */}
      <div className="bg-[#FAF9F6] border-b border-[#EAE8E4] px-4 py-2.5 flex items-center gap-2">
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
        </div>
        <div className="flex-1 mx-2 sm:mx-4 bg-white border border-[#EAE8E4] rounded-md py-1 px-3 text-[10px] font-mono text-[#76726E] text-center truncate">
          {slug || "your-store"}.{rootDomain}
        </div>
      </div>

      {/* Simulated Storefront Viewport */}
      <div className="relative flex flex-col max-h-[76vh] lg:max-h-190 overflow-y-auto">
        {/* 1. Preview Announcement Bar */}
        <div className="w-full bg-[#151413] text-white text-[9px] font-bold tracking-[0.2em] py-1.5 px-2 text-center">
          FREE DELIVERY ON ORDERS OVER ₦
          {Number(minFreeDeliveryFare || 0).toLocaleString()} •{" "}
          <span className="underline">SHOP NOW</span>
        </div>

        {/* 2. Preview Site Header */}
        <div className="px-4 sm:px-6 h-16 border-b border-[#EAE8E4] bg-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {logoUrl ? (
              <div className="relative w-10 h-10 overflow-hidden shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={logoUrl}
                  alt="Preview Logo"
                  className="w-full h-full object-contain"
                />
              </div>
            ) : null}
            <div className="flex flex-col">
              <span className="font-heading text-sm font-bold tracking-[0.18em] text-[#151413] leading-none uppercase">
                {previewMainTitle}
              </span>
              <span className="text-[7px] font-bold tracking-[0.25em] uppercase text-[#C4956A] mt-0.5">
                {previewSubTitle}
              </span>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-5 text-[9px] font-bold tracking-[0.18em] uppercase text-[#151413]">
            <span>Shop</span>
            <span>Wishlist</span>
            <span>Clothes</span>
            <span>Shoes</span>
          </div>

          <div className="flex items-center gap-3 text-[#151413]">
            <LuSearch className="w-4 h-4" />
            <LuUser className="w-4 h-4" />
            <LuShoppingBag className="w-4 h-4" />
          </div>
        </div>

        {/* 3. Preview Hero Section */}
        <div className="relative w-full h-80 sm:h-90 bg-[#151413] text-white overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 w-full h-full pointer-events-none">
            {heroType === HeroType.VIDEO ? (
              <iframe
                key={heroVideoId}
                src={`https://www.youtube.com/embed/${
                  heroVideoId || "t1Nbqpse8kc"
                }?autoplay=1&mute=1&controls=0&loop=1&playlist=${
                  heroVideoId || "t1Nbqpse8kc"
                }`}
                title="Preview Video"
                className="w-[250%] h-[250%] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 object-cover opacity-55"
              />
            ) : imageCount > 0 ? (
              <div
                className={`w-full h-full grid gap-0.5 ${
                  imageCount === 1
                    ? "grid-cols-1"
                    : imageCount === 2
                      ? "grid-cols-2"
                      : imageCount === 3
                        ? "grid-cols-2 grid-rows-2"
                        : "grid-cols-4"
                }`}
              >
                {heroImages.slice(0, 4).map((imgUrl, idx) => (
                  <div
                    key={`${imgUrl}-${idx}`}
                    className={`relative w-full h-full overflow-hidden ${
                      imageCount === 3 && idx === 2 ? "col-span-2" : ""
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imgUrl}
                      alt={`Hero ${idx + 1}`}
                      className="w-full h-full object-cover opacity-75"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="w-full h-full bg-linear-to-br from-[#23201E] via-[#151413] to-[#2E241C]" />
            )}
          </div>

          <div className="absolute inset-0 bg-linear-to-t from-[#151413] via-[#151413]/50 to-black/60" />

          <div className="relative z-10 px-6 flex flex-col items-center text-center gap-3">
            <span className="text-[9px] font-bold uppercase tracking-[0.35em] text-[#C4956A]">
              Welcome to {siteName || "Our Store"}
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl font-extrabold uppercase tracking-tight max-w-lg leading-tight">
              {tagline || "Your Store Tagline"}
            </h2>
            <p className="text-[11px] text-gray-200 max-w-md">
              {description || "Your store description appears here"}
            </p>
            <div className="flex gap-3 mt-1">
              <span className="px-4 sm:px-5 py-2 bg-[#C4956A] text-white text-[9px] font-bold uppercase tracking-widest rounded-sm">
                Explore Catalog
              </span>
              <span className="px-4 sm:px-5 py-2 border border-white/40 text-white text-[9px] font-bold uppercase tracking-widest rounded-sm">
                View Collection
              </span>
            </div>
          </div>
        </div>

        {/* 4. Preview Sample Catalog Grid */}
        <div className="p-4 sm:p-6 bg-white">
          <div className="flex justify-between items-center mb-4">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">
              Featured Arrivals
            </span>
            <span className="text-[9px] text-[#C4956A] font-bold uppercase">
              View All →
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="flex flex-col gap-1.5">
                <div className="aspect-3/4 bg-[#FAF9F6] border border-[#EAE8E4] rounded-sm flex items-center justify-center text-[9px] text-[#A39E98]">
                  Product {item}
                </div>
                <div className="h-2.5 w-3/4 bg-[#EAE8E4] rounded-xs" />
                <div className="h-2 w-1/2 bg-[#FAF9F6] rounded-xs" />
              </div>
            ))}
          </div>
        </div>

        {/* 5. Preview Footer & Floating WhatsApp */}
        <div className="bg-[#FAF9F6] border-t border-[#EAE8E4] p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-3 gap-6 text-[10px] relative">
          <div className="flex flex-col gap-2">
            <span className="font-heading font-bold text-xs uppercase tracking-widest">
              {siteName || "STORE NAME"}
            </span>
            <p className="text-[#76726E] leading-relaxed">
              {description ||
                "Curated fashion and lifestyle essentials delivered nationwide."}
            </p>
          </div>

          <div className="flex flex-col gap-1.5 text-[#76726E]">
            <span className="font-bold text-[#151413] uppercase tracking-wider">
              Quick Links
            </span>
            <span>New Arrivals</span>
            <span>Best Sellers</span>
            <span>Delivery & Returns</span>
          </div>

          <div className="flex flex-col gap-1.5 text-[#76726E]">
            <span className="font-bold text-[#151413] uppercase tracking-wider">
              Contact
            </span>
            {contactAddress && <span>{contactAddress}</span>}
            {location && <span>{location}</span>}
            {whatsappContact && <span>{whatsappContact}</span>}
            {businessHours && <span>{businessHours}</span>}
          </div>

          {/* Floating WhatsApp Indicator */}
          <div
            title={`Chat with ${siteName}`}
            className="absolute bottom-4 right-4 w-9 h-9 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-md"
          >
            <FaWhatsapp className="w-5 h-5" />
          </div>
        </div>
      </div>
    </div>
  );
}
