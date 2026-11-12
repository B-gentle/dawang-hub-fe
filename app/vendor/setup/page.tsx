"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  LuStore,
  LuImage,
  LuVideo,
  LuUpload,
  LuTrash2,
  LuRefreshCw,
  LuCheck,
  LuMapPin,
  LuPhone,
  LuClock,
  LuTruck,
  LuMonitor,
  LuShoppingBag,
  LuSearch,
  LuUser,
} from "react-icons/lu";
import { FaWhatsapp } from "react-icons/fa";
import { toast } from "sonner";
import { systemConfigApi, HeroType } from "@/lib/api/system-config-api";

export default function StoreSetupPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingHero, setUploadingHero] = useState(false);

  // Store & Config Form State
  const [formData, setFormData] = useState({
    siteName: "AURA LUXURY",
    slug: "aura-luxury",
    logoUrl: "",
    tagline: "Fashion. Beauty. Lifestyle.",
    subtitle: "Welcome to the Experience",
    description: "Style that speaks, Quality that lasts",
    heroType: HeroType.IMAGE,
    heroImages: [] as string[],
    heroVideoId: "t1Nbqpse8kc",
    contactAddress: "14 Admiralty Way, Lekki Phase 1",
    location: "Lagos, Nigeria",
    businessHours: "Mon - Sat: 9:00 AM - 7:00 PM",
    whatsappContact: "+2348000000000",
    minFreeDeliveryFare: 150000,
  });

  // Auto-generate URL slug when store name changes
  const handleNameChange = (value: string) => {
    const generatedSlug = value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");

    setFormData((prev) => ({
      ...prev,
      siteName: value,
      slug: generatedSlug,
    }));
  };

  // Upload Store Logo
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingLogo(true);
      const res = await systemConfigApi.uploadSystemImage(file);
      if (res.url) {
        setFormData((prev) => ({ ...prev, logoUrl: res.url }));
        toast.success("Store logo uploaded");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Logo upload failed");
    } finally {
      setUploadingLogo(false);
      e.target.value = "";
    }
  };

  // Upload Hero Banner Image (Max 4)
  const handleHeroImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (formData.heroImages.length >= 4) {
      toast.error("Maximum 4 hero images allowed");
      return;
    }

    try {
      setUploadingHero(true);
      const res = await systemConfigApi.uploadSystemImage(file);
      if (res.url) {
        setFormData((prev) => ({
          ...prev,
          heroImages: [...prev.heroImages, res.url],
        }));
        toast.success("Hero image added");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Image upload failed");
    } finally {
      setUploadingHero(false);
      e.target.value = "";
    }
  };

  const handleRemoveHeroImage = async (url: string) => {
    try {
      await systemConfigApi.deleteSystemImage(url);
      setFormData((prev) => ({
        ...prev,
        heroImages: prev.heroImages.filter((img) => img !== url),
      }));
    } catch {
      // Remove locally even if cleanup fails
      setFormData((prev) => ({
        ...prev,
        heroImages: prev.heroImages.filter((img) => img !== url),
      }));
    }
  };

  // Submit Store Creation
  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.siteName.trim() || !formData.slug.trim()) {
      toast.error("Store name and URL slug are required");
      return;
    }

    try {
      setSubmitting(true);
      // Save configuration (connect to your multi-tenant vendor creation endpoint)
      await systemConfigApi.updateSystemConfig({
        siteName: formData.siteName,
        logoUrl: formData.logoUrl,
        contactAddress: formData.contactAddress,
        location: formData.location,
        businessHours: formData.businessHours,
        whatsappContact: formData.whatsappContact,
        heroType: formData.heroType,
        heroImages: formData.heroImages,
        heroVideoId: formData.heroVideoId,
        minFreeDeliveryFare: Number(formData.minFreeDeliveryFare) || 0,
      });

      toast.success("Your store has been launched!");
      router.push("/admin");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to initialize store",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Split siteName into stacked 2-line header format
  const nameParts = (formData.siteName || "STORE NAME").trim().split(" ");
  const previewMainTitle = nameParts[0] || "STORE";
  const previewSubTitle = nameParts.slice(1).join(" ") || "OFFICIAL";

  const imageCount = formData.heroImages.length;

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#151413] font-sans">
      {/* Top Builder Bar */}
      <div className="sticky top-0 z-40 bg-white border-b border-[#EAE8E4] px-4 sm:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-md bg-[#151413] text-[#C4956A] flex items-center justify-center">
            <LuStore className="w-4 h-4" />
          </div>
          <div>
            <h1 className="font-heading text-sm font-bold uppercase tracking-wider">
              Storefront Builder
            </h1>
            <p className="text-[10px] text-[#76726E]">
              Customize your e-commerce brand & live appearance
            </p>
          </div>
        </div>

        <button
          onClick={handleCreateStore}
          disabled={submitting}
          className="px-5 py-2.5 bg-[#151413] text-white text-xs font-bold uppercase tracking-widest rounded-md hover:bg-[#2A2725] transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {submitting ? (
            <LuRefreshCw className="w-4 h-4 animate-spin text-[#C4956A]" />
          ) : (
            <LuCheck className="w-4 h-4 text-[#C4956A]" />
          )}
          {submitting ? "Launching..." : "Launch Store"}
        </button>
      </div>

      {/* Main Split Workspace */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-8 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT SIDE: CONFIGURATION FORM (Full width on mobile, 5 cols on desktop) */}
        <form
          onSubmit={handleCreateStore}
          className="lg:col-span-5 flex flex-col gap-6 bg-white p-6 rounded-xl border border-[#EAE8E4] shadow-xs text-xs"
        >
          {/* 1. Brand Identity */}
          <div className="flex flex-col gap-4 pb-5 border-b border-[#EAE8E4]">
            <h2 className="font-heading text-sm font-bold uppercase tracking-wider text-[#151413]">
              1. Brand Identity
            </h2>

            <div className="flex flex-col gap-1.5">
              <label className="font-bold uppercase tracking-wider text-[#76726E]">
                Store Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g., AURA LUXURY"
                value={formData.siteName}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FAF9F6] border border-[#EAE8E4] rounded-md font-bold focus:outline-hidden focus:border-[#C4956A]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-bold uppercase tracking-wider text-[#76726E]">
                Store Subdomain URL
              </label>
              <div className="flex items-center bg-[#FAF9F6] border border-[#EAE8E4] rounded-md overflow-hidden">
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      slug: e.target.value.toLowerCase().replace(/\s+/g, "-"),
                    }))
                  }
                  className="w-full px-3.5 py-2.5 bg-transparent font-mono text-xs focus:outline-hidden"
                />
                <span className="px-3 py-2.5 bg-[#EAE8E4]/50 text-[#76726E] font-mono text-[11px] shrink-0">
                  .dawang.com
                </span>
              </div>
            </div>

            {/* Logo Upload */}
            <div className="flex flex-col gap-2">
              <label className="font-bold uppercase tracking-wider text-[#76726E]">
                Store Logo
              </label>
              <div className="flex items-center gap-4">
                {formData.logoUrl ? (
                  <div className="relative w-20 h-20 rounded-md border border-[#EAE8E4] bg-[#FAF9F6] p-2 flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={formData.logoUrl}
                      alt="Uploaded Logo"
                      className="w-full h-full object-contain"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, logoUrl: "" }))
                      }
                      className="absolute -top-2 -right-2 p-1 bg-rose-600 text-white rounded-full cursor-pointer"
                    >
                      <LuTrash2 className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-28 h-20 border-2 border-dashed border-[#EAE8E4] rounded-md cursor-pointer bg-[#FAF9F6] hover:bg-[#FAF5EF] transition-colors">
                    {uploadingLogo ? (
                      <LuRefreshCw className="w-4 h-4 animate-spin text-[#C4956A]" />
                    ) : (
                      <>
                        <LuUpload className="w-4 h-4 text-[#C4956A] mb-1" />
                        <span className="text-[10px] font-bold">
                          Upload Logo
                        </span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      disabled={uploadingLogo}
                      className="hidden"
                    />
                  </label>
                )}
                <p className="text-[10px] text-[#76726E] leading-relaxed">
                  Transparent PNG recommended. Appears in your storefront header
                  and footer[cite: 2, 11].
                </p>
              </div>
            </div>
          </div>

          {/* 2. Hero Banner Customization */}
          <div className="flex flex-col gap-4 pb-5 border-b border-[#EAE8E4]">
            <h2 className="font-heading text-sm font-bold uppercase tracking-wider text-[#151413]">
              2. Hero Showcase
            </h2>

            <div className="flex gap-3">
              <label className="flex items-center gap-2 cursor-pointer p-2.5 bg-[#FAF9F6] border border-[#EAE8E4] rounded-md flex-1">
                <input
                  type="radio"
                  checked={formData.heroType === HeroType.IMAGE}
                  onChange={() =>
                    setFormData((prev) => ({
                      ...prev,
                      heroType: HeroType.IMAGE,
                    }))
                  }
                  className="accent-[#C4956A]"
                />
                <LuImage className="w-4 h-4 text-[#C4956A]" />
                <span className="font-bold">Image Grid</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer p-2.5 bg-[#FAF9F6] border border-[#EAE8E4] rounded-md flex-1">
                <input
                  type="radio"
                  checked={formData.heroType === HeroType.VIDEO}
                  onChange={() =>
                    setFormData((prev) => ({
                      ...prev,
                      heroType: HeroType.VIDEO,
                    }))
                  }
                  className="accent-[#C4956A]"
                />
                <LuVideo className="w-4 h-4 text-[#C4956A]" />
                <span className="font-bold">YouTube Video</span>
              </label>
            </div>

            {formData.heroType === HeroType.IMAGE ? (
              <div className="flex flex-col gap-2">
                <span className="text-[11px] font-bold text-[#76726E]">
                  Banner Images ({imageCount} / 4)
                </span>
                <div className="grid grid-cols-4 gap-2">
                  {formData.heroImages.map((img, i) => (
                    <div
                      key={i}
                      className="relative aspect-square rounded-md overflow-hidden border border-[#EAE8E4]"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img}
                        alt={`Slide ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveHeroImage(img)}
                        className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-xs cursor-pointer"
                      >
                        <LuTrash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {imageCount < 4 && (
                    <label className="aspect-square border-2 border-dashed border-[#EAE8E4] rounded-md flex flex-col items-center justify-center cursor-pointer bg-[#FAF9F6] hover:bg-[#FAF5EF]">
                      {uploadingHero ? (
                        <LuRefreshCw className="w-4 h-4 animate-spin text-[#C4956A]" />
                      ) : (
                        <LuUpload className="w-4 h-4 text-[#C4956A]" />
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleHeroImageUpload}
                        disabled={uploadingHero}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-1.5">
                <label className="font-bold uppercase tracking-wider text-[#76726E]">
                  YouTube Video ID
                </label>
                <input
                  type="text"
                  placeholder="t1Nbqpse8kc"
                  value={formData.heroVideoId}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      heroVideoId: e.target.value,
                    }))
                  }
                  className="w-full px-3.5 py-2 bg-[#FAF9F6] border border-[#EAE8E4] rounded-md font-mono"
                />
              </div>
            )}
          </div>

          {/* 3. Contact & Logistics */}
          <div className="flex flex-col gap-4">
            <h2 className="font-heading text-sm font-bold uppercase tracking-wider text-[#151413]">
              3. Contact & Logistics
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="font-bold uppercase tracking-wider text-[#76726E] flex items-center gap-1">
                  <LuPhone className="w-3 h-3 text-[#C4956A]" /> WhatsApp Number
                </label>
                <input
                  type="text"
                  value={formData.whatsappContact}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      whatsappContact: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#EAE8E4] rounded-md font-mono"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold uppercase tracking-wider text-[#76726E] flex items-center gap-1">
                  <LuTruck className="w-3 h-3 text-[#C4956A]" /> Free Shipping
                  Min (₦)
                </label>
                <input
                  type="number"
                  value={formData.minFreeDeliveryFare}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      minFreeDeliveryFare: Number(e.target.value),
                    }))
                  }
                  className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#EAE8E4] rounded-md font-bold"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold uppercase tracking-wider text-[#76726E] flex items-center gap-1">
                  <LuMapPin className="w-3 h-3 text-[#C4956A]" /> City / Country
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      location: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#EAE8E4] rounded-md"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold uppercase tracking-wider text-[#76726E] flex items-center gap-1">
                  <LuClock className="w-3 h-3 text-[#C4956A]" /> Business Hours
                </label>
                <input
                  type="text"
                  value={formData.businessHours}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      businessHours: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#EAE8E4] rounded-md"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-bold uppercase tracking-wider text-[#76726E]">
                Store Address
              </label>
              <input
                type="text"
                value={formData.contactAddress}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    contactAddress: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#EAE8E4] rounded-md"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 bg-[#151413] text-white font-bold uppercase tracking-widest rounded-md hover:bg-[#2A2725] transition-colors cursor-pointer"
          >
            {submitting ? "Creating Store..." : "Complete & Launch Store"}
          </button>
        </form>

        {/* RIGHT SIDE: LIVE STOREFRONT PREVIEW (Desktop Only: hidden lg:block) */}
        <div className="hidden lg:block lg:col-span-7 sticky top-24">
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#76726E] flex items-center gap-1.5">
              <LuMonitor className="w-3.5 h-3.5 text-[#C4956A]" /> Live
              Storefront Preview
            </span>
            <span className="text-[11px] font-mono text-[#76726E] bg-white px-2.5 py-0.5 rounded-full border border-[#EAE8E4]">
              https://{formData.slug || "your-store"}.dawang.com
            </span>
          </div>

          {/* Browser Mockup Frame */}
          <div className="w-full rounded-xl border border-[#EAE8E4] bg-white shadow-xl overflow-hidden flex flex-col">
            {/* Browser Top Chrome */}
            <div className="bg-[#FAF9F6] border-b border-[#EAE8E4] px-4 py-2.5 flex items-center gap-2">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              </div>
              <div className="flex-1 mx-4 bg-white border border-[#EAE8E4] rounded-md py-1 px-3 text-[10px] font-mono text-[#76726E] text-center truncate">
                {formData.slug || "your-store"}.dawang.com
              </div>
            </div>

            {/* Simulated Storefront Viewport */}
            <div className="relative flex flex-col max-h-[760px] overflow-y-auto">
              {/* 1. Preview Announcement Bar */}
              <div className="w-full bg-[#151413] text-white text-[9px] font-bold tracking-[0.2em] py-1.5 text-center">
                FREE DELIVERY ON ORDERS OVER ₦
                {Number(formData.minFreeDeliveryFare || 0).toLocaleString()} •{" "}
                <span className="underline">SHOP NOW</span>
              </div>

              {/* 2. Preview Site Header */}
              <div className="px-6 h-16 border-b border-[#EAE8E4] bg-white flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  {formData.logoUrl ? (
                    <div className="relative w-10 h-10 overflow-hidden shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={formData.logoUrl}
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

                <div className="flex items-center gap-5 text-[9px] font-bold tracking-[0.18em] uppercase text-[#151413]">
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
              <div className="relative w-full h-[360px] bg-[#151413] text-white overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 w-full h-full pointer-events-none">
                  {formData.heroType === HeroType.VIDEO || imageCount === 0 ? (
                    <iframe
                      src={`https://www.youtube.com/embed/${
                        formData.heroVideoId || "t1Nbqpse8kc"
                      }?autoplay=1&mute=1&controls=0&loop=1&playlist=${
                        formData.heroVideoId || "t1Nbqpse8kc"
                      }`}
                      title="Preview Video"
                      className="w-[250%] h-[250%] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 object-cover opacity-55"
                    />
                  ) : (
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
                      {formData.heroImages.slice(0, 4).map((imgUrl, idx) => (
                        <div
                          key={idx}
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
                  )}
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-[#151413] via-[#151413]/50 to-black/60" />

                <div className="relative z-10 px-6 flex flex-col items-center text-center gap-3">
                  <span className="text-[9px] font-bold uppercase tracking-[0.35em] text-[#C4956A]">
                    Welcome to {formData.siteName || "Our Store"}
                  </span>
                  <h2 className="font-heading text-3xl font-extrabold uppercase tracking-tight max-w-lg leading-tight">
                    {formData.tagline}
                  </h2>
                  <p className="text-[11px] text-gray-200 max-w-md">
                    {formData.description}
                  </p>
                  <div className="flex gap-3 mt-1">
                    <span className="px-5 py-2 bg-[#C4956A] text-white text-[9px] font-bold uppercase tracking-widest rounded-sm">
                      Explore Catalog
                    </span>
                    <span className="px-5 py-2 border border-white/40 text-white text-[9px] font-bold uppercase tracking-widest rounded-sm">
                      View Collection
                    </span>
                  </div>
                </div>
              </div>

              {/* 4. Preview Sample Catalog Grid */}
              <div className="p-6 bg-white">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em]">
                    Featured Arrivals
                  </span>
                  <span className="text-[9px] text-[#C4956A] font-bold uppercase">
                    View All →
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {[1, 2, 3, 4].map((item) => (
                    <div key={item} className="flex flex-col gap-1.5">
                      <div className="aspect-[3/4] bg-[#FAF9F6] border border-[#EAE8E4] rounded-sm flex items-center justify-center text-[9px] text-[#A39E98]">
                        Product {item}
                      </div>
                      <div className="h-2.5 w-3/4 bg-[#EAE8E4] rounded-xs" />
                      <div className="h-2 w-1/2 bg-[#FAF9F6] rounded-xs" />
                    </div>
                  ))}
                </div>
              </div>

              {/* 5. Preview Footer & Floating WhatsApp */}
              <div className="bg-[#FAF9F6] border-t border-[#EAE8E4] p-6 grid grid-cols-3 gap-6 text-[10px] relative">
                <div className="flex flex-col gap-2">
                  <span className="font-heading font-bold text-xs uppercase tracking-widest">
                    {formData.siteName || "STORE NAME"}
                  </span>
                  <p className="text-[#76726E] leading-relaxed">
                    Curated fashion and lifestyle essentials delivered
                    nationwide.
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
                  {formData.contactAddress && (
                    <span>{formData.contactAddress}</span>
                  )}
                  {formData.location && <span>{formData.location}</span>}
                  {formData.whatsappContact && (
                    <span>{formData.whatsappContact}</span>
                  )}
                  {formData.businessHours && (
                    <span>{formData.businessHours}</span>
                  )}
                </div>

                {/* Floating WhatsApp Indicator */}
                <div
                  title={`Chat with ${formData.siteName}`}
                  className="absolute bottom-4 right-4 w-9 h-9 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-md"
                >
                  <FaWhatsapp className="w-5 h-5" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
