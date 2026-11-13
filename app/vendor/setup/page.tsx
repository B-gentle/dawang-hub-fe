"use client";

import { useState, useCallback } from "react";
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
  LuEye,
  LuX,
} from "react-icons/lu";
import { toast } from "sonner";
import { systemConfigApi, HeroType } from "@/lib/api/system-config-api";
import { vendorApi } from "@/lib/api/vendor-api";
import { StorefrontPreview } from "@/components/vendor/StorefrontPreview";
import { BankAccountVerifier } from "@/components/vendor/BankAccountVerifier";

export default function StoreSetupPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingHero, setUploadingHero] = useState(false);
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false);

  // Bank Verification State
  const [resolvingAccount, setResolvingAccount] = useState(false);
  const [resolvedAccountName, setResolvedAccountName] = useState("");

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
    bankCode: "",
    bankName: "",
    accountNumber: "",
  });

  const handleBankChange = useCallback((bankCode: string, bankName: string) => {
    setFormData((prev) => ({ ...prev, bankCode, bankName }));
  }, []);

  const handleAccountNumberChange = useCallback((accountNumber: string) => {
    setFormData((prev) => ({ ...prev, accountNumber }));
  }, []);

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

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const localPreviewUrl = URL.createObjectURL(file);
    const previousLogo = formData.logoUrl;
    setFormData((prev) => ({ ...prev, logoUrl: localPreviewUrl }));

    try {
      setUploadingLogo(true);
      const res = await systemConfigApi.uploadSystemImage(file);
      if (res.url) {
        setFormData((prev) => ({ ...prev, logoUrl: res.url }));
        toast.success("Store logo uploaded");
      }
    } catch (err) {
      setFormData((prev) => ({ ...prev, logoUrl: previousLogo }));
      toast.error(err instanceof Error ? err.message : "Logo upload failed");
    } finally {
      URL.revokeObjectURL(localPreviewUrl);
      setUploadingLogo(false);
      e.target.value = "";
    }
  };

  const handleHeroImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (formData.heroImages.length >= 4) {
      toast.error("Maximum 4 hero images allowed");
      return;
    }

    const localPreviewUrl = URL.createObjectURL(file);
    setFormData((prev) => ({
      ...prev,
      heroImages: [...prev.heroImages, localPreviewUrl],
    }));

    try {
      setUploadingHero(true);
      const res = await systemConfigApi.uploadSystemImage(file);
      if (res.url) {
        setFormData((prev) => ({
          ...prev,
          heroImages: prev.heroImages.map((img) =>
            img === localPreviewUrl ? res.url : img,
          ),
        }));
        toast.success("Hero image added");
      }
    } catch (err) {
      setFormData((prev) => ({
        ...prev,
        heroImages: prev.heroImages.filter((img) => img !== localPreviewUrl),
      }));
      toast.error(err instanceof Error ? err.message : "Image upload failed");
    } finally {
      URL.revokeObjectURL(localPreviewUrl);
      setUploadingHero(false);
      e.target.value = "";
    }
  };

  const handleRemoveHeroImage = async (url: string) => {
    setFormData((prev) => ({
      ...prev,
      heroImages: prev.heroImages.filter((img) => img !== url),
    }));

    if (!url.startsWith("blob:")) {
      try {
        await systemConfigApi.deleteSystemImage(url);
      } catch {
        // Ignore cleanup failure
      }
    }
  };

  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.siteName.trim() || !formData.slug.trim()) {
      toast.error("Store name and URL slug are required");
      return;
    }

    if (!formData.bankCode || !/^\d{10}$/.test(formData.accountNumber)) {
      toast.error("Select a bank and enter a valid 10-digit account number");
      return;
    }

    if (!resolvedAccountName) {
      toast.error("Please wait for your bank account name to be verified");
      return;
    }

    if (uploadingLogo || uploadingHero) {
      toast.error("Please wait for image uploads to complete");
      return;
    }

    try {
      setSubmitting(true);
      await vendorApi.onboardVendor({
        storeName: formData.siteName,
        slug: formData.slug,
        description: formData.description,
        logoUrl: formData.logoUrl || undefined,
        whatsappNumber: formData.whatsappContact,
        themeConfig: {
          tagline: formData.tagline,
          subtitle: formData.subtitle,
          heroType: formData.heroType,
          heroImages: formData.heroImages,
          heroVideoId: formData.heroVideoId,
          contactAddress: formData.contactAddress,
          location: formData.location,
          minFreeDeliveryFare: Number(formData.minFreeDeliveryFare) || 0,
        },
        businessHours: { summary: formData.businessHours },
        bankCode: formData.bankCode,
        bankName: formData.bankName,
        accountNumber: formData.accountNumber,
      });

      toast.success("Your store has been launched!");
      router.push("/vendor/dashboard");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to initialize store",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const imageCount = formData.heroImages.length;
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "dawang.com";
  const isSubmitDisabled =
    submitting ||
    resolvingAccount ||
    !resolvedAccountName ||
    uploadingLogo ||
    uploadingHero;

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#151413] font-sans pb-20 lg:pb-0">
      {/* Top Builder Bar */}
      <div className="sticky top-0 z-40 bg-white border-b border-[#EAE8E4] px-4 sm:px-8 h-16 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-md bg-[#151413] text-[#C4956A] flex items-center justify-center shrink-0">
            <LuStore className="w-4 h-4" />
          </div>
          <div className="truncate">
            <h1 className="font-heading text-sm font-bold uppercase tracking-wider truncate">
              Storefront Builder
            </h1>
            <p className="text-[10px] text-[#76726E] truncate">
              Customize your e-commerce brand & live appearance
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Mobile Header Preview Button */}
          <button
            type="button"
            onClick={() => setMobilePreviewOpen(true)}
            aria-label="Preview Storefront"
            className="lg:hidden px-3 py-2.5 bg-[#FAF9F6] border border-[#EAE8E4] text-[#151413] text-xs font-bold uppercase tracking-wider rounded-md hover:border-[#C4956A] transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <LuEye className="w-4 h-4 text-[#C4956A]" />
            <span>Preview</span>
          </button>

          <button
            type="button"
            onClick={handleCreateStore}
            disabled={isSubmitDisabled}
            className="px-4 sm:px-5 py-2.5 bg-[#151413] text-white text-xs font-bold uppercase tracking-widest rounded-md hover:bg-[#2A2725] transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {submitting ? (
              <LuRefreshCw className="w-4 h-4 animate-spin text-[#C4956A]" />
            ) : (
              <LuCheck className="w-4 h-4 text-[#C4956A]" />
            )}
            <span>{submitting ? "Launching..." : "Launch"}</span>
          </button>
        </div>
      </div>

      {/* Main Split Workspace */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-8 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT SIDE: CONFIGURATION FORM */}
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
                  .{rootDomain}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-bold uppercase tracking-wider text-[#76726E]">
                Hero Headline (Tagline)
              </label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, tagline: e.target.value }))
                }
                className="w-full px-3.5 py-2 bg-[#FAF9F6] border border-[#EAE8E4] rounded-md focus:outline-hidden focus:border-[#C4956A]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-bold uppercase tracking-wider text-[#76726E]">
                Store Description
              </label>
              <textarea
                rows={2}
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                className="w-full px-3.5 py-2 bg-[#FAF9F6] border border-[#EAE8E4] rounded-md focus:outline-hidden focus:border-[#C4956A]"
              />
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
                  and footer.
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
                      key={`${img}-${i}`}
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
          <div className="flex flex-col gap-4 pb-5 border-b border-[#EAE8E4]">
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

          {/* 4. Extracted Monnify Settlement Bank Verifier */}
          <BankAccountVerifier
            bankCode={formData.bankCode}
            accountNumber={formData.accountNumber}
            resolvedAccountName={resolvedAccountName}
            onBankChange={handleBankChange}
            onAccountNumberChange={handleAccountNumberChange}
            onResolvedAccountChange={setResolvedAccountName}
            onResolvingStateChange={setResolvingAccount}
          />

          <button
            type="submit"
            disabled={isSubmitDisabled}
            className="w-full py-3.5 bg-[#151413] text-white font-bold uppercase tracking-widest rounded-md hover:bg-[#2A2725] transition-colors cursor-pointer disabled:opacity-50"
          >
            {submitting ? "Creating Store..." : "Complete & Launch Store"}
          </button>
        </form>

        {/* RIGHT SIDE: LIVE STOREFRONT PREVIEW (Desktop) */}
        <div className="hidden lg:block lg:col-span-7 sticky top-24">
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#76726E] flex items-center gap-1.5">
              <LuMonitor className="w-3.5 h-3.5 text-[#C4956A]" /> Live
              Storefront Preview
            </span>
            <span className="text-[11px] font-mono text-[#76726E] bg-white px-2.5 py-0.5 rounded-full border border-[#EAE8E4]">
              https://{formData.slug || "your-store"}.{rootDomain}
            </span>
          </div>

          <StorefrontPreview
            siteName={formData.siteName}
            slug={formData.slug}
            logoUrl={formData.logoUrl}
            tagline={formData.tagline}
            description={formData.description}
            heroType={formData.heroType}
            heroImages={formData.heroImages}
            heroVideoId={formData.heroVideoId}
            contactAddress={formData.contactAddress}
            location={formData.location}
            businessHours={formData.businessHours}
            whatsappContact={formData.whatsappContact}
            minFreeDeliveryFare={formData.minFreeDeliveryFare}
            rootDomain={rootDomain}
          />
        </div>
      </div>

      {/* MOBILE FLOATING PREVIEW BUTTON */}
      <button
        type="button"
        onClick={() => setMobilePreviewOpen(true)}
        className="lg:hidden fixed bottom-5 right-5 z-40 px-4 py-3 rounded-full bg-[#151413] text-white shadow-xl border border-[#C4956A]/40 flex items-center gap-2 text-xs font-bold uppercase tracking-wider cursor-pointer"
      >
        <LuEye className="w-4 h-4 text-[#C4956A]" />
        <span>Preview Site</span>
      </button>

      {/* MOBILE FULL-SCREEN PREVIEW MODAL */}
      {mobilePreviewOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-[#151413]/75 backdrop-blur-xs flex flex-col">
          <div className="bg-white border-b border-[#EAE8E4] px-4 h-14 flex items-center justify-between shrink-0">
            <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <LuEye className="w-4 h-4 text-[#C4956A]" /> Live Mobile Preview
            </span>
            <button
              type="button"
              onClick={() => setMobilePreviewOpen(false)}
              className="px-3 py-1.5 rounded-md bg-[#151413] text-white text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer"
            >
              <LuX className="w-3.5 h-3.5 text-[#C4956A]" /> Back to Editor
            </button>
          </div>
          <div className="p-3 overflow-y-auto flex-1">
            <StorefrontPreview
              siteName={formData.siteName}
              slug={formData.slug}
              logoUrl={formData.logoUrl}
              tagline={formData.tagline}
              description={formData.description}
              heroType={formData.heroType}
              heroImages={formData.heroImages}
              heroVideoId={formData.heroVideoId}
              contactAddress={formData.contactAddress}
              location={formData.location}
              businessHours={formData.businessHours}
              whatsappContact={formData.whatsappContact}
              minFreeDeliveryFare={formData.minFreeDeliveryFare}
              rootDomain={rootDomain}
            />
          </div>
        </div>
      )}
    </div>
  );
}
