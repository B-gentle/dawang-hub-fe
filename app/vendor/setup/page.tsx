"use client";

import { useState, useCallback, useEffect } from "react";
import {
  LuStore,
  LuImage,
  LuVideo,
  LuUpload,
  LuTrash2,
  LuMapPin,
  LuPhone,
  LuClock,
  LuTruck,
  LuMonitor,
  LuEye,
  LuX,
  LuArrowRight,
  LuArrowLeft,
  LuPalette,
} from "react-icons/lu";
import { toast } from "sonner";
import { HeroType } from "@/lib/api/system-config-api";
import { vendorApi } from "@/lib/api/vendor-api";
import { paymentsApi } from "@/lib/api/payments-api";
import { StorefrontPreview } from "@/components/vendor/StorefrontPreview";
import { BankAccountVerifier } from "@/components/vendor/BankAccountVerifier";
import { VendorPlanCheckout } from "@/components/vendor/VendorPlanCheckout";

const DRAFT_STORAGE_KEY = "dawang_vendor_setup_draft";

interface StoreSetupFormData {
  siteName: string;
  slug: string;
  tagline: string;
  subtitle: string;
  description: string;
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  heroType: HeroType;
  heroVideoId: string;
  contactAddress: string;
  location: string;
  businessHours: string;
  whatsappContact: string;
  minFreeDeliveryFare: number;
  bankCode: string;
  bankName: string;
  accountNumber: string;
}

const COLOR_PRESETS = [
  {
    name: "Obsidian & Gold",
    primaryColor: "#151413",
    accentColor: "#C4956A",
    backgroundColor: "#FAF9F6",
  },
  {
    name: "Emerald & Sand",
    primaryColor: "#0F2E24",
    accentColor: "#B68D40",
    backgroundColor: "#F8F7F2",
  },
  {
    name: "Midnight & Rose",
    primaryColor: "#181B2E",
    accentColor: "#C97A7E",
    backgroundColor: "#FAF8F8",
  },
  {
    name: "Espresso & Cream",
    primaryColor: "#2B1E16",
    accentColor: "#D4A373",
    backgroundColor: "#FDFBF7",
  },
];

const INITIAL_FORM_DATA: StoreSetupFormData = {
  siteName: "AURA LUXURY",
  slug: "aura-luxury",
  tagline: "Fashion. Beauty. Lifestyle.",
  subtitle: "Welcome to the Experience",
  description: "Style that speaks, Quality that lasts",
  primaryColor: "#151413",
  accentColor: "#C4956A",
  backgroundColor: "#FAF9F6",
  heroType: HeroType.IMAGE,
  heroVideoId: "t1Nbqpse8kc",
  contactAddress: "14 Admiralty Way, Lekki Phase 1",
  location: "Lagos, Nigeria",
  businessHours: "Mon - Sat: 9:00 AM - 7:00 PM",
  whatsappContact: "+2348000000000",
  minFreeDeliveryFare: 150000,
  bankCode: "",
  bankName: "",
  accountNumber: "",
};

export default function StoreSetupPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedPlanId, setSelectedPlanId] = useState<string>("yearly");
  const [submitting, setSubmitting] = useState(false);
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false);

  const [resolvingAccount, setResolvingAccount] = useState(false);
  const [resolvedAccountName, setResolvedAccountName] = useState("");

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string>("");
  const [heroItems, setHeroItems] = useState<
    Array<{ file: File; previewUrl: string }>
  >([]);

  const [formData, setFormData] = useState<StoreSetupFormData>(() => {
    if (typeof window === "undefined") return INITIAL_FORM_DATA;
    try {
      const saved = sessionStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as {
          formData?: Partial<StoreSetupFormData>;
        };
        return { ...INITIAL_FORM_DATA, ...(parsed.formData || {}) };
      }
    } catch {
      // Ignore corrupt storage
    }
    return INITIAL_FORM_DATA;
  });

  useEffect(() => {
    try {
      sessionStorage.setItem(
        DRAFT_STORAGE_KEY,
        JSON.stringify({ formData, selectedPlanId }),
      );
    } catch {
      // Ignore storage quota errors
    }
  }, [formData, selectedPlanId]);

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

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (logoPreviewUrl) URL.revokeObjectURL(logoPreviewUrl);
    setLogoFile(file);
    setLogoPreviewUrl(URL.createObjectURL(file));
    e.target.value = "";
  };

  const handleRemoveLogo = () => {
    if (logoPreviewUrl) URL.revokeObjectURL(logoPreviewUrl);
    setLogoFile(null);
    setLogoPreviewUrl("");
  };

  const handleHeroImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (heroItems.length >= 4) {
      toast.error("Maximum 4 hero images allowed");
      return;
    }

    setHeroItems((prev) => [
      ...prev,
      { file, previewUrl: URL.createObjectURL(file) },
    ]);
    e.target.value = "";
  };

  const handleRemoveHeroImage = (previewUrl: string) => {
    URL.revokeObjectURL(previewUrl);
    setHeroItems((prev) =>
      prev.filter((item) => item.previewUrl !== previewUrl),
    );
  };

  const handleProceedToPricing = (e: React.FormEvent) => {
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

    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePayAndLaunch = async () => {
    const payload = {
      storeName: formData.siteName,
      slug: formData.slug,
      description: formData.description,
      whatsappNumber: formData.whatsappContact,
      themeConfig: {
        primaryColor: formData.primaryColor,
        accentColor: formData.accentColor,
        backgroundColor: formData.backgroundColor,
        tagline: formData.tagline,
        subtitle: formData.subtitle,
        heroType: formData.heroType,
        heroVideoId: formData.heroVideoId,
        contactAddress: formData.contactAddress,
        location: formData.location,
        minFreeDeliveryFare: Number(formData.minFreeDeliveryFare) || 0,
      },
      businessHours: { summary: formData.businessHours },
      bankCode: formData.bankCode,
      bankName: formData.bankName,
      accountNumber: formData.accountNumber,
    };

    try {
      setSubmitting(true);

      const { draftId } = await vendorApi.stageSetup(
        payload,
        logoFile,
        heroItems.map((i) => i.file),
      );

      const res = await paymentsApi.initializeMonnify({
        reason: "VENDOR_SETUP",
        planId: selectedPlanId,
        draftId,
      });

      if (res.checkoutUrl) {
        window.location.href = res.checkoutUrl;
      } else {
        throw new Error("Payment checkout URL was not returned");
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to initialize payment",
      );
      setSubmitting(false);
    }
  };

  const heroPreviewUrls = heroItems.map((i) => i.previewUrl);
  const imageCount = heroPreviewUrls.length;
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "dawang.com";
  const isStep1Invalid = resolvingAccount || !resolvedAccountName;

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
              Step {step} of 2:{" "}
              {step === 1 ? "Build & Preview Store" : "Select Plan & Pay"}
            </p>
          </div>
        </div>

        {/* Stepper Pills */}
        <div className="hidden md:flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider">
          <button
            type="button"
            onClick={() => setStep(1)}
            className={`px-3 py-1.5 rounded-full transition-colors cursor-pointer ${
              step === 1
                ? "bg-[#151413] text-white"
                : "bg-[#FAF9F6] text-[#76726E]"
            }`}
          >
            1. Build & Preview
          </button>
          <span className="text-[#EAE8E4]">—</span>
          <span
            className={`px-3 py-1.5 rounded-full ${
              step === 2
                ? "bg-[#151413] text-white"
                : "bg-[#FAF9F6] text-[#76726E]"
            }`}
          >
            2. Pricing & Payment
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {step === 1 ? (
            <>
              <div className="relative group lg:hidden">
                <button
                  type="button"
                  onClick={() => setMobilePreviewOpen(true)}
                  title="Preview Storefront"
                  aria-label="Preview Storefront"
                  className="w-9 h-9 bg-[#FAF9F6] border border-[#EAE8E4] text-[#151413] rounded-md hover:border-[#C4956A] transition-colors flex items-center justify-center cursor-pointer"
                >
                  <LuEye className="w-4 h-4 text-[#C4956A]" />
                </button>
                <span className="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity absolute top-full mt-1.5 left-1/2 -translate-x-1/2 px-2 py-1 rounded bg-[#151413] text-white text-[10px] font-bold whitespace-nowrap shadow-md">
                  Preview Storefront
                </span>
              </div>

              <button
                type="button"
                onClick={handleProceedToPricing}
                disabled={isStep1Invalid}
                className="px-4 sm:px-5 py-2.5 bg-[#151413] text-white text-xs font-bold uppercase tracking-widest rounded-md hover:bg-[#2A2725] transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>Continue</span>
                <LuArrowRight className="w-4 h-4 text-[#C4956A]" />
              </button>
            </>
          ) : (
            <div className="relative group">
              <button
                type="button"
                onClick={() => setStep(1)}
                disabled={submitting}
                title="Back to Edit Store"
                aria-label="Back to Edit Store"
                className="w-9 h-9 bg-[#FAF9F6] border border-[#EAE8E4] text-[#151413] rounded-md hover:border-[#C4956A] transition-colors flex items-center justify-center cursor-pointer disabled:opacity-50"
              >
                <LuArrowLeft className="w-4 h-4 text-[#C4956A]" />
              </button>
              <span className="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity absolute top-full mt-1.5 right-0 px-2 py-1 rounded bg-[#151413] text-white text-[10px] font-bold whitespace-nowrap shadow-md">
                Back to Edit Store
              </span>
            </div>
          )}
        </div>
      </div>

      {/* STEP 1: STORE BUILDER & LIVE PREVIEW */}
      {step === 1 && (
        <>
          <div className="max-w-[1600px] mx-auto px-4 sm:px-8 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <form
              onSubmit={handleProceedToPricing}
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
                          slug: e.target.value
                            .toLowerCase()
                            .replace(/\s+/g, "-"),
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
                      setFormData((prev) => ({
                        ...prev,
                        tagline: e.target.value,
                      }))
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

                <div className="flex flex-col gap-2">
                  <label className="font-bold uppercase tracking-wider text-[#76726E]">
                    Store Logo
                  </label>
                  <div className="flex items-center gap-4">
                    {logoPreviewUrl ? (
                      <div className="relative w-20 h-20 rounded-md border border-[#EAE8E4] bg-[#FAF9F6] p-2 flex items-center justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={logoPreviewUrl}
                          alt="Selected Logo"
                          className="w-full h-full object-contain"
                        />
                        <button
                          type="button"
                          onClick={handleRemoveLogo}
                          title="Remove Logo"
                          aria-label="Remove Logo"
                          className="absolute -top-2 -right-2 p-1 bg-rose-600 text-white rounded-full cursor-pointer"
                        >
                          <LuTrash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-28 h-20 border-2 border-dashed border-[#EAE8E4] rounded-md cursor-pointer bg-[#FAF9F6] hover:bg-[#FAF5EF] transition-colors">
                        <LuUpload className="w-4 h-4 text-[#C4956A] mb-1" />
                        <span className="text-[10px] font-bold">
                          Select Logo
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoSelect}
                          className="hidden"
                        />
                      </label>
                    )}
                    <p className="text-[10px] text-[#76726E] leading-relaxed">
                      Transparent PNG recommended. Uploaded automatically once
                      setup payment succeeds.
                    </p>
                  </div>
                </div>
              </div>

              {/* 2. Brand Colors & Palette */}
              <div className="flex flex-col gap-4 pb-5 border-b border-[#EAE8E4]">
                <h2 className="font-heading text-sm font-bold uppercase tracking-wider text-[#151413] flex items-center gap-1.5">
                  <LuPalette className="w-4 h-4 text-[#C4956A]" /> 2. Brand
                  Theme & Colors
                </h2>

                <div className="grid grid-cols-2 gap-2">
                  {COLOR_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          primaryColor: preset.primaryColor,
                          accentColor: preset.accentColor,
                          backgroundColor: preset.backgroundColor,
                        }))
                      }
                      className="flex items-center justify-between px-3 py-2 bg-[#FAF9F6] border border-[#EAE8E4] hover:border-[#C4956A] rounded-md text-[11px] font-semibold cursor-pointer"
                    >
                      <span className="truncate">{preset.name}</span>
                      <span className="flex items-center gap-1 shrink-0">
                        <span
                          style={{ backgroundColor: preset.primaryColor }}
                          className="w-3 h-3 rounded-full border border-black/10"
                        />
                        <span
                          style={{ backgroundColor: preset.accentColor }}
                          className="w-3 h-3 rounded-full border border-black/10"
                        />
                      </span>
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <label className="flex flex-col gap-1 cursor-pointer">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#76726E]">
                      Primary
                    </span>
                    <div className="flex items-center gap-2 px-2.5 py-1.5 bg-[#FAF9F6] border border-[#EAE8E4] rounded-md">
                      <input
                        type="color"
                        value={formData.primaryColor}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            primaryColor: e.target.value,
                          }))
                        }
                        className="w-5 h-5 border-0 bg-transparent cursor-pointer"
                      />
                      <span className="font-mono text-[10px] uppercase">
                        {formData.primaryColor}
                      </span>
                    </div>
                  </label>

                  <label className="flex flex-col gap-1 cursor-pointer">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#76726E]">
                      Accent
                    </span>
                    <div className="flex items-center gap-2 px-2.5 py-1.5 bg-[#FAF9F6] border border-[#EAE8E4] rounded-md">
                      <input
                        type="color"
                        value={formData.accentColor}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            accentColor: e.target.value,
                          }))
                        }
                        className="w-5 h-5 border-0 bg-transparent cursor-pointer"
                      />
                      <span className="font-mono text-[10px] uppercase">
                        {formData.accentColor}
                      </span>
                    </div>
                  </label>

                  <label className="flex flex-col gap-1 cursor-pointer">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#76726E]">
                      Surface
                    </span>
                    <div className="flex items-center gap-2 px-2.5 py-1.5 bg-[#FAF9F6] border border-[#EAE8E4] rounded-md">
                      <input
                        type="color"
                        value={formData.backgroundColor}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            backgroundColor: e.target.value,
                          }))
                        }
                        className="w-5 h-5 border-0 bg-transparent cursor-pointer"
                      />
                      <span className="font-mono text-[10px] uppercase">
                        {formData.backgroundColor}
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* 3. Hero Banner Customization */}
              <div className="flex flex-col gap-4 pb-5 border-b border-[#EAE8E4]">
                <h2 className="font-heading text-sm font-bold uppercase tracking-wider text-[#151413]">
                  3. Hero Showcase
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
                      {heroItems.map((item, i) => (
                        <div
                          key={item.previewUrl}
                          className="relative aspect-square rounded-md overflow-hidden border border-[#EAE8E4]"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.previewUrl}
                            alt={`Slide ${i + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              handleRemoveHeroImage(item.previewUrl)
                            }
                            title="Remove Image"
                            aria-label="Remove Image"
                            className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-xs cursor-pointer"
                          >
                            <LuTrash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      {imageCount < 4 && (
                        <label
                          title="Add Hero Image"
                          className="aspect-square border-2 border-dashed border-[#EAE8E4] rounded-md flex flex-col items-center justify-center cursor-pointer bg-[#FAF9F6] hover:bg-[#FAF5EF]"
                        >
                          <LuUpload className="w-4 h-4 text-[#C4956A]" />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleHeroImageSelect}
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

              {/* 4. Contact & Logistics */}
              <div className="flex flex-col gap-4 pb-5 border-b border-[#EAE8E4]">
                <h2 className="font-heading text-sm font-bold uppercase tracking-wider text-[#151413]">
                  4. Contact & Logistics
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="font-bold uppercase tracking-wider text-[#76726E] flex items-center gap-1">
                      <LuPhone className="w-3 h-3 text-[#C4956A]" /> WhatsApp
                      Number
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
                      <LuTruck className="w-3 h-3 text-[#C4956A]" /> Free
                      Shipping Min (₦)
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
                      <LuMapPin className="w-3 h-3 text-[#C4956A]" /> City /
                      Country
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
                      <LuClock className="w-3 h-3 text-[#C4956A]" /> Business
                      Hours
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

              {/* 5. Settlement Bank Verifier */}
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
                disabled={isStep1Invalid}
                className="w-full py-3.5 bg-[#151413] text-white font-bold uppercase tracking-widest rounded-md hover:bg-[#2A2725] transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <span>Continue to Pricing</span>
                <LuArrowRight className="w-4 h-4 text-[#C4956A]" />
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
                logoUrl={logoPreviewUrl}
                tagline={formData.tagline}
                description={formData.description}
                heroType={formData.heroType}
                heroImages={heroPreviewUrls}
                heroVideoId={formData.heroVideoId}
                contactAddress={formData.contactAddress}
                location={formData.location}
                businessHours={formData.businessHours}
                whatsappContact={formData.whatsappContact}
                minFreeDeliveryFare={formData.minFreeDeliveryFare}
                primaryColor={formData.primaryColor}
                accentColor={formData.accentColor}
                backgroundColor={formData.backgroundColor}
                rootDomain={rootDomain}
              />
            </div>
          </div>

          {/* MOBILE FLOATING ICON-ONLY PREVIEW BUTTON */}
          <div className="lg:hidden fixed bottom-5 right-5 z-40 group">
            <button
              type="button"
              onClick={() => setMobilePreviewOpen(true)}
              title="Preview Storefront"
              aria-label="Preview Storefront"
              className="w-12 h-12 rounded-full bg-[#151413] text-white shadow-xl border border-[#C4956A]/40 flex items-center justify-center cursor-pointer"
            >
              <LuEye className="w-5 h-5 text-[#C4956A]" />
            </button>
            <span className="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity absolute right-full mr-2.5 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded bg-[#151413] text-white text-[10px] font-bold uppercase tracking-wider whitespace-nowrap shadow-md">
              Preview Storefront
            </span>
          </div>

          {/* MOBILE FULL-SCREEN PREVIEW MODAL */}
          {mobilePreviewOpen && (
            <div className="lg:hidden fixed inset-0 z-50 bg-[#151413]/75 backdrop-blur-xs flex flex-col">
              <div className="bg-white border-b border-[#EAE8E4] px-4 h-14 flex items-center justify-between shrink-0">
                <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <LuEye className="w-4 h-4 text-[#C4956A]" /> Live Mobile
                  Preview
                </span>
                <div className="relative group">
                  <button
                    type="button"
                    onClick={() => setMobilePreviewOpen(false)}
                    title="Back to Edit Store"
                    aria-label="Back to Edit Store"
                    className="w-9 h-9 rounded-md bg-[#151413] text-white flex items-center justify-center cursor-pointer"
                  >
                    <LuX className="w-4 h-4 text-[#C4956A]" />
                  </button>
                  <span className="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity absolute top-full mt-1.5 right-0 px-2 py-1 rounded bg-[#151413] text-white text-[10px] font-bold whitespace-nowrap shadow-md">
                    Back to Edit Store
                  </span>
                </div>
              </div>
              <div className="p-3 overflow-y-auto flex-1">
                <StorefrontPreview
                  siteName={formData.siteName}
                  slug={formData.slug}
                  logoUrl={logoPreviewUrl}
                  tagline={formData.tagline}
                  description={formData.description}
                  heroType={formData.heroType}
                  heroImages={heroPreviewUrls}
                  heroVideoId={formData.heroVideoId}
                  contactAddress={formData.contactAddress}
                  location={formData.location}
                  businessHours={formData.businessHours}
                  whatsappContact={formData.whatsappContact}
                  minFreeDeliveryFare={formData.minFreeDeliveryFare}
                  primaryColor={formData.primaryColor}
                  accentColor={formData.accentColor}
                  backgroundColor={formData.backgroundColor}
                  rootDomain={rootDomain}
                />
              </div>
            </div>
          )}
        </>
      )}

      {/* STEP 2: DATABASE-DRIVEN PRICING PLAN & SETUP PAYMENT */}
      {step === 2 && (
        <VendorPlanCheckout
          siteName={formData.siteName}
          slug={formData.slug}
          rootDomain={rootDomain}
          resolvedAccountName={resolvedAccountName}
          bankName={formData.bankName}
          selectedPlanId={selectedPlanId}
          submitting={submitting}
          onSelectPlan={setSelectedPlanId}
          onPayAndLaunch={handlePayAndLaunch}
        />
      )}
    </div>
  );
}
