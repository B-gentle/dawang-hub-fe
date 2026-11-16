"use client";

import { useEffect, useState } from "react";
import { FaFacebookF, FaInstagram, FaTiktok } from "react-icons/fa";
import {
  LuGlobe,
  LuTruck,
  LuSave,
  LuRefreshCw,
  LuCheck,
  LuImage,
  LuUpload,
  LuTrash2,
  LuVideo,
  LuMapPin,
  LuClock,
  LuPhone,
  LuBuilding,
  LuPalette,
} from "react-icons/lu";
import { toast } from "sonner";
import {
  systemConfigApi,
  HeroType,
  SystemConfig,
} from "@/lib/api/system-config-api";
import {
  vendorApi,
  VendorProfile,
  StateShippingRate,
} from "@/lib/api/vendor-api";
import { categoryApi } from "@/lib/api/category-api";
import { Category } from "@/types/category";

const NIGERIAN_STATES = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "FCT - Abuja",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
];

export default function VendorStorefrontSettingsPage() {
  const [activeTab, setActiveTab] = useState<
    "general" | "branding" | "hero" | "shipping"
  >("general");
  const [vendor, setVendor] = useState<VendorProfile | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingHeroImage, setUploadingHeroImage] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const [primaryColor, setPrimaryColor] = useState("#151413");
  const [accentColor, setAccentColor] = useState("#C4956A");
  const [backgroundColor, setBackgroundColor] = useState("#FAF9F6");
  const [tagline, setTagline] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [selectedNavCatIds, setSelectedNavCatIds] = useState<string[]>([]);

  const [shippingRates, setShippingRates] = useState<StateShippingRate[]>(
    NIGERIAN_STATES.map((state) => ({ state, enabled: false, fee: 0 })),
  );
  const [bulkFee, setBulkFee] = useState<string>("");

  const [sysConfig, setSysConfig] = useState<SystemConfig>({
    siteName: "",
    logoUrl: "",
    description: "",
    contactAddress: "",
    location: "",
    businessHours: "Mon - Sat: 9:00 AM - 6:00 PM",
    whatsappContact: "",
    facebookUrl: "",
    instagramUrl: "",
    tiktokUrl: "",
    heroType: HeroType.IMAGE,
    heroImages: [],
    heroVideoId: "",
    minFreeDeliveryFare: 0,
  });

  const loadSettings = async () => {
    try {
      setLoading(true);
      const myVendor = await vendorApi.getMyStore();
      setVendor(myVendor);

      const [allCats, data] = await Promise.all([
        categoryApi
          .getCategories(`vendorId=${encodeURIComponent(myVendor.id)}`)
          .catch(() => [] as Category[]),
        systemConfigApi
          .getPublicConfig(myVendor.id)
          .catch(() => ({}) as Partial<SystemConfig>),
      ]);

      const catList = Array.isArray(allCats)
        ? allCats
        : (allCats as { data?: Category[] })?.data || [];
      setCategories(catList);

      // Hydrate 36-state shipping rates
      const existingRateMap = new Map(
        (myVendor.shippingRates || []).map((r) => [r.state.toLowerCase(), r]),
      );
      setShippingRates(
        NIGERIAN_STATES.map((state) => {
          const match = existingRateMap.get(state.toLowerCase());
          return {
            state,
            enabled: Boolean(match?.enabled),
            fee: match?.enabled ? Number(match.fee) || 0 : 0,
          };
        }),
      );

      const theme = {
        ...myVendor.themeConfig,
        ...data.themeConfig,
      };

      setPrimaryColor(theme.primaryColor || "#151413");
      setAccentColor(theme.accentColor || "#C4956A");
      setBackgroundColor(theme.backgroundColor || "#FAF9F6");
      setTagline(theme.tagline || data.tagline || "");
      setSubtitle(theme.subtitle || data.subtitle || "");

      const savedNavCats =
        (
          theme as {
            navCategories?: Array<{ id?: string; slug?: string }>;
          }
        )?.navCategories || [];
      setSelectedNavCatIds(
        savedNavCats
          .map((c) => c.id || c.slug || "")
          .filter(Boolean)
          .slice(0, 2),
      );

      setSysConfig({
        vendorId: myVendor.id,
        siteName: data.siteName || myVendor.storeName || "",
        logoUrl: data.logoUrl || myVendor.logoUrl || "",
        description: data.description || myVendor.description || "",
        contactAddress: data.contactAddress || "",
        location: data.location || "",
        businessHours: data.businessHours || "Mon - Sat: 9:00 AM - 6:00 PM",
        whatsappContact: data.whatsappContact || myVendor.whatsappNumber || "",
        facebookUrl: data.facebookUrl || "",
        instagramUrl: data.instagramUrl || "",
        tiktokUrl: data.tiktokUrl || "",
        heroType: data.heroType || HeroType.IMAGE,
        heroImages: Array.isArray(data.heroImages) ? data.heroImages : [],
        heroVideoId: data.heroVideoId || "",
        minFreeDeliveryFare: Number(data.minFreeDeliveryFare) || 0,
      });
    } catch (err) {
      console.error("Failed to fetch vendor storefront config:", err);
      toast.error("Could not load storefront configuration");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    queueMicrotask(() => {
      if (isMounted) loadSettings();
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const toggleNavCategory = (catId: string) => {
    setSelectedNavCatIds((prev) => {
      if (prev.includes(catId)) {
        return prev.filter((id) => id !== catId);
      }
      if (prev.length >= 2) {
        toast.info(
          "You can select up to 2 categories for header & footer navigation",
        );
        return prev;
      }
      return [...prev, catId];
    });
  };

  const toggleStateShipping = (stateName: string) => {
    setShippingRates((prev) =>
      prev.map((item) =>
        item.state === stateName
          ? {
              ...item,
              enabled: !item.enabled,
              fee: !item.enabled ? item.fee : 0,
            }
          : item,
      ),
    );
  };

  const updateStateFee = (stateName: string, fee: number) => {
    setShippingRates((prev) =>
      prev.map((item) =>
        item.state === stateName
          ? { ...item, fee: Math.max(0, Number(fee) || 0) }
          : item,
      ),
    );
  };

  const applyBulkFeeToEnabled = () => {
    const numeric = Math.max(0, Number(bulkFee) || 0);
    setShippingRates((prev) =>
      prev.map((item) => (item.enabled ? { ...item, fee: numeric } : item)),
    );
    toast.success(`Applied ₦${numeric.toLocaleString()} to all enabled states`);
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();

    const normalizeSocialInput = (
      raw: string | null | undefined,
      allowedHosts: string[],
      label: string,
    ): string | null => {
      const trimmed = (raw || "").trim();
      if (!trimmed) return null;
      const candidate = /^https?:\/\//i.test(trimmed)
        ? trimmed
        : `https://${trimmed}`;
      try {
        const parsed = new URL(candidate);
        const host = parsed.hostname.toLowerCase();
        const hasPath = parsed.pathname.replace(/\//g, "").length > 0;
        if (!allowedHosts.includes(host) || !hasPath) {
          throw new Error();
        }
        return parsed.toString();
      } catch {
        throw new Error(
          `Enter a valid ${label} profile URL (e.g. https://${allowedHosts[1]}/yourstore)`,
        );
      }
    };

    try {
      setSaving(true);

      const cleanedHeroImages = Array.isArray(sysConfig.heroImages)
        ? sysConfig.heroImages.filter(
            (img) => typeof img === "string" && img.trim() !== "",
          )
        : [];

      const navCategories = selectedNavCatIds
        .map((id) => categories.find((c) => c.id === id))
        .filter((c): c is Category => Boolean(c))
        .map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.slug || c.id,
        }));

      const facebookUrl = normalizeSocialInput(
        sysConfig.facebookUrl,
        [
          "facebook.com",
          "www.facebook.com",
          "m.facebook.com",
          "fb.com",
          "www.fb.com",
        ],
        "Facebook",
      );
      const instagramUrl = normalizeSocialInput(
        sysConfig.instagramUrl,
        ["instagram.com", "www.instagram.com", "instagr.am", "www.instagr.am"],
        "Instagram",
      );
      const tiktokUrl = normalizeSocialInput(
        sysConfig.tiktokUrl,
        ["tiktok.com", "www.tiktok.com", "vm.tiktok.com", "vt.tiktok.com"],
        "TikTok",
      );

      await Promise.all([
        systemConfigApi.updateMyVendorConfig({
          siteName: sysConfig.siteName,
          logoUrl: sysConfig.logoUrl,
          description: sysConfig.description,
          contactAddress: sysConfig.contactAddress,
          location: sysConfig.location,
          businessHours: sysConfig.businessHours,
          whatsappContact: sysConfig.whatsappContact,
          facebookUrl,
          instagramUrl,
          tiktokUrl,
          heroType: sysConfig.heroType,
          heroImages: cleanedHeroImages,
          heroVideoId: sysConfig.heroVideoId || "",
          minFreeDeliveryFare: Number(sysConfig.minFreeDeliveryFare) || 0,
          themeConfig: {
            primaryColor,
            accentColor,
            backgroundColor,
            tagline,
            subtitle,
            ...(navCategories.length > 0 ? { navCategories } : {}),
          } as SystemConfig["themeConfig"],
        }),
        vendorApi.updateShippingRates(shippingRates),
      ]);

      toast.success("Storefront & delivery rates updated successfully");
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "Failed to save storefront settings";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingLogo(true);
      toast.info("Uploading store logo...");
      const res = await systemConfigApi.uploadSystemImage(file);

      if (!res.url || typeof res.url !== "string") {
        throw new Error("Invalid image URL returned from server");
      }

      setSysConfig((prev) => ({
        ...prev,
        logoUrl: res.url,
      }));
      toast.success("Logo uploaded successfully");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      toast.error(msg);
    } finally {
      setUploadingLogo(false);
      e.target.value = "";
    }
  };

  const handleRemoveLogo = async () => {
    if (!sysConfig.logoUrl) return;
    try {
      await systemConfigApi
        .deleteSystemImage(sysConfig.logoUrl)
        .catch(() => null);
      setSysConfig((prev) => ({
        ...prev,
        logoUrl: "",
      }));
      toast.success("Logo removed");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to remove logo";
      toast.error(msg);
    }
  };

  const handleHeroFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (sysConfig.heroImages.length >= 4) {
      toast.error("Maximum 4 hero images allowed");
      return;
    }

    try {
      setUploadingHeroImage(true);
      toast.info("Uploading hero banner image...");
      const res = await systemConfigApi.uploadSystemImage(file);

      if (!res.url || typeof res.url !== "string") {
        throw new Error("Invalid image URL returned from server");
      }

      setSysConfig((prev) => ({
        ...prev,
        heroImages: [...prev.heroImages, res.url],
      }));
      toast.success("Hero image uploaded successfully");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      toast.error(msg);
    } finally {
      setUploadingHeroImage(false);
      e.target.value = "";
    }
  };

  const handleRemoveHeroImage = async (url: string) => {
    try {
      await systemConfigApi.deleteSystemImage(url).catch(() => null);
      setSysConfig((prev) => ({
        ...prev,
        heroImages: prev.heroImages.filter((img) => img !== url),
      }));
      toast.success("Hero image removed");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to delete image";
      toast.error(msg);
    }
  };

  const enabledStatesCount = shippingRates.filter((r) => r.enabled).length;

  return (
    <div className="flex flex-col gap-8 font-sans pb-12 text-[#151413]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold tracking-[0.15em] uppercase text-[#C4956A]">
            STOREFRONT CUSTOMIZATION
          </span>
          <h1 className="font-heading text-3xl font-bold text-[#151413] mt-1">
            Storefront Settings
          </h1>
          <p className="text-sm text-[#76726E] mt-1">
            Customize your subdomain branding, colors, navigation categories,
            hero media, and state delivery rates
            {vendor ? ` (${vendor.slug}.globexmall.com)` : ""}.
          </p>
        </div>

        <button
          onClick={handleSaveSettings}
          disabled={saving || loading}
          className="px-5 py-2.5 bg-[#171514] text-white text-xs font-bold tracking-wider uppercase rounded-md hover:bg-[#2A2725] transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 self-start sm:self-auto"
        >
          {saving ? (
            <LuRefreshCw className="w-4 h-4 animate-spin text-[#C4956A]" />
          ) : (
            <LuSave className="w-4 h-4" />
          )}
          {saving ? "Saving Changes..." : "Save Storefront"}
        </button>
      </div>

      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-2 text-xs text-[#76726E]">
          <LuRefreshCw className="w-6 h-6 animate-spin text-[#C4956A]" />
          Loading storefront settings...
        </div>
      ) : (
        <div className="flex flex-col md:flex-row gap-8">
          {/* Navigation Sidebar */}
          <aside className="w-full md:w-64 shrink-0 flex flex-col gap-1">
            <button
              type="button"
              onClick={() => setActiveTab("general")}
              className={`flex items-center gap-3 px-4 py-3 rounded-md text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer text-left ${
                activeTab === "general"
                  ? "bg-[#171514] text-white"
                  : "bg-white text-[#76726E] hover:text-[#151413] hover:bg-[#FAF9F6] border border-[#EAE8E4]"
              }`}
            >
              <LuGlobe className="w-4 h-4 text-[#C4956A]" /> General & Contact
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("branding")}
              className={`flex items-center gap-3 px-4 py-3 rounded-md text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer text-left ${
                activeTab === "branding"
                  ? "bg-[#171514] text-white"
                  : "bg-white text-[#76726E] hover:text-[#151413] hover:bg-[#FAF9F6] border border-[#EAE8E4]"
              }`}
            >
              <LuPalette className="w-4 h-4 text-[#C4956A]" /> Theme &
              Categories
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("hero")}
              className={`flex items-center gap-3 px-4 py-3 rounded-md text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer text-left ${
                activeTab === "hero"
                  ? "bg-[#171514] text-white"
                  : "bg-white text-[#76726E] hover:text-[#151413] hover:bg-[#FAF9F6] border border-[#EAE8E4]"
              }`}
            >
              <LuImage className="w-4 h-4 text-[#C4956A]" /> Hero Banner Media
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("shipping")}
              className={`flex items-center gap-3 px-4 py-3 rounded-md text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer text-left ${
                activeTab === "shipping"
                  ? "bg-[#171514] text-white"
                  : "bg-white text-[#76726E] hover:text-[#151413] hover:bg-[#FAF9F6] border border-[#EAE8E4]"
              }`}
            >
              <LuTruck className="w-4 h-4 text-[#C4956A]" /> Delivery & States (
              {enabledStatesCount})
            </button>
          </aside>

          {/* Form Container */}
          <div className="flex-1 bg-white rounded-lg border border-[#EAE8E4] p-6 shadow-xs">
            <form
              onSubmit={handleSaveSettings}
              className="flex flex-col gap-6 text-xs text-[#151413]"
            >
              {/* TAB 1: GENERAL DETAILS */}
              {activeTab === "general" && (
                <div className="flex flex-col gap-5">
                  <div className="pb-3 border-b border-[#EAE8E4]">
                    <h2 className="font-heading text-base font-bold uppercase tracking-wider text-[#151413]">
                      Store Identity & Support
                    </h2>
                    <p className="text-[#76726E] text-xs mt-0.5">
                      Configure your storefront name, logo, description, and
                      customer contact details.
                    </p>
                  </div>

                  {/* Logo Upload */}
                  <div className="flex flex-col gap-2">
                    <label className="font-bold uppercase tracking-wider text-[#76726E]">
                      Store Logo
                    </label>
                    <div className="flex items-center gap-4">
                      {sysConfig.logoUrl ? (
                        <div className="relative w-24 h-24 rounded-md border border-[#EAE8E4] p-2 bg-[#FAF9F6] overflow-hidden group flex items-center justify-center">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={sysConfig.logoUrl}
                            alt="Store Logo"
                            className="w-full h-full object-contain"
                          />
                          <button
                            type="button"
                            onClick={handleRemoveLogo}
                            className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-md cursor-pointer opacity-90 hover:opacity-100 transition-opacity"
                            title="Remove logo"
                          >
                            <LuTrash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center w-36 h-24 border-2 border-dashed border-[#EAE8E4] rounded-md cursor-pointer bg-[#FAF9F6] hover:bg-[#FAF5EF] transition-colors">
                          {uploadingLogo ? (
                            <LuRefreshCw className="w-5 h-5 animate-spin text-[#C4956A]" />
                          ) : (
                            <>
                              <LuUpload className="w-5 h-5 text-[#C4956A] mb-1" />
                              <span className="text-[10px] font-bold text-[#151413]">
                                Upload Logo
                              </span>
                            </>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            disabled={uploadingLogo}
                            onChange={handleLogoUpload}
                            className="hidden"
                          />
                        </label>
                      )}
                      <p className="text-[10px] text-[#76726E] max-w-xs">
                        Recommended transparent PNG or SVG logo (Max 2MB).
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="font-bold uppercase tracking-wider text-[#76726E] flex items-center gap-1">
                        <LuBuilding className="w-3.5 h-3.5 text-[#C4956A]" />{" "}
                        Store Display Name
                      </label>
                      <input
                        type="text"
                        value={sysConfig.siteName}
                        onChange={(e) =>
                          setSysConfig((prev) => ({
                            ...prev,
                            siteName: e.target.value,
                          }))
                        }
                        className="w-full px-3.5 py-2.5 bg-[#FAF9F6] border border-[#EAE8E4] rounded-md font-bold focus:outline-hidden focus:border-[#C4956A]"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="font-bold uppercase tracking-wider text-[#76726E] flex items-center gap-1">
                        <LuPhone className="w-3.5 h-3.5 text-[#C4956A]" />{" "}
                        WhatsApp Contact
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., +2348000000000"
                        value={sysConfig.whatsappContact}
                        onChange={(e) =>
                          setSysConfig((prev) => ({
                            ...prev,
                            whatsappContact: e.target.value,
                          }))
                        }
                        className="w-full px-3.5 py-2.5 bg-[#FAF9F6] border border-[#EAE8E4] rounded-md font-mono focus:outline-hidden focus:border-[#C4956A]"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="font-bold uppercase tracking-wider text-[#76726E] flex items-center gap-1">
                        <LuMapPin className="w-3.5 h-3.5 text-[#C4956A]" /> City
                        / Country Location
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., Lagos, Nigeria"
                        value={sysConfig.location}
                        onChange={(e) =>
                          setSysConfig((prev) => ({
                            ...prev,
                            location: e.target.value,
                          }))
                        }
                        className="w-full px-3.5 py-2.5 bg-[#FAF9F6] border border-[#EAE8E4] rounded-md focus:outline-hidden focus:border-[#C4956A]"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="font-bold uppercase tracking-wider text-[#76726E] flex items-center gap-1">
                        <LuClock className="w-3.5 h-3.5 text-[#C4956A]" />{" "}
                        Business Hours
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., Mon - Sat: 9:00 AM - 6:00 PM"
                        value={sysConfig.businessHours}
                        onChange={(e) =>
                          setSysConfig((prev) => ({
                            ...prev,
                            businessHours: e.target.value,
                          }))
                        }
                        className="w-full px-3.5 py-2.5 bg-[#FAF9F6] border border-[#EAE8E4] rounded-md focus:outline-hidden focus:border-[#C4956A]"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="font-bold uppercase tracking-wider text-[#76726E]">
                      Store Tagline / Footer Bio
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Short description shown in your storefront footer..."
                      value={sysConfig.description || ""}
                      onChange={(e) =>
                        setSysConfig((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      className="w-full px-3.5 py-2.5 bg-[#FAF9F6] border border-[#EAE8E4] rounded-md focus:outline-hidden focus:border-[#C4956A]"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="font-bold uppercase tracking-wider text-[#76726E] flex items-center gap-1">
                      <LuMapPin className="w-3.5 h-3.5 text-[#C4956A]" /> Full
                      Store Address
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g., Suite 14, Admiralty Way, Lekki Phase 1"
                      value={sysConfig.contactAddress}
                      onChange={(e) =>
                        setSysConfig((prev) => ({
                          ...prev,
                          contactAddress: e.target.value,
                        }))
                      }
                      className="w-full px-3.5 py-2.5 bg-[#FAF9F6] border border-[#EAE8E4] rounded-md focus:outline-hidden focus:border-[#C4956A]"
                    />
                  </div>

                  {/* Social Media Handles */}
                  <div className="pt-4 border-t border-[#EAE8E4] flex flex-col gap-3">
                    <div>
                      <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-[#151413]">
                        Social Media Links (Footer)
                      </h3>
                      <p className="text-[11px] text-[#76726E] mt-0.5">
                        Only links you add here will appear in your storefront
                        footer.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="font-bold uppercase tracking-wider text-[#76726E] flex items-center gap-1.5">
                          <FaFacebookF className="w-3 h-3 text-[#C4956A]" />{" "}
                          Facebook URL
                        </label>
                        <input
                          type="url"
                          placeholder="https://facebook.com/yourstore"
                          value={sysConfig.facebookUrl || ""}
                          onChange={(e) =>
                            setSysConfig((prev) => ({
                              ...prev,
                              facebookUrl: e.target.value,
                            }))
                          }
                          className="w-full px-3.5 py-2.5 bg-[#FAF9F6] border border-[#EAE8E4] rounded-md font-mono text-[11px] focus:outline-hidden focus:border-[#C4956A]"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="font-bold uppercase tracking-wider text-[#76726E] flex items-center gap-1.5">
                          <FaInstagram className="w-3.5 h-3.5 text-[#C4956A]" />{" "}
                          Instagram URL
                        </label>
                        <input
                          type="url"
                          placeholder="https://instagram.com/yourstore"
                          value={sysConfig.instagramUrl || ""}
                          onChange={(e) =>
                            setSysConfig((prev) => ({
                              ...prev,
                              instagramUrl: e.target.value,
                            }))
                          }
                          className="w-full px-3.5 py-2.5 bg-[#FAF9F6] border border-[#EAE8E4] rounded-md font-mono text-[11px] focus:outline-hidden focus:border-[#C4956A]"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="font-bold uppercase tracking-wider text-[#76726E] flex items-center gap-1.5">
                          <FaTiktok className="w-3 h-3 text-[#C4956A]" /> TikTok
                          URL
                        </label>
                        <input
                          type="url"
                          placeholder="https://tiktok.com/@yourstore"
                          value={sysConfig.tiktokUrl || ""}
                          onChange={(e) =>
                            setSysConfig((prev) => ({
                              ...prev,
                              tiktokUrl: e.target.value,
                            }))
                          }
                          className="w-full px-3.5 py-2.5 bg-[#FAF9F6] border border-[#EAE8E4] rounded-md font-mono text-[11px] focus:outline-hidden focus:border-[#C4956A]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: BRAND COLORS & NAV CATEGORIES */}
              {activeTab === "branding" && (
                <div className="flex flex-col gap-6">
                  <div className="pb-3 border-b border-[#EAE8E4]">
                    <h2 className="font-heading text-base font-bold uppercase tracking-wider text-[#151413]">
                      Theme Colors & Header/Footer Categories
                    </h2>
                    <p className="text-[#76726E] text-xs mt-0.5">
                      Customize your store palette, hero headline, and up to 2
                      featured categories displayed in your header and footer.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="font-bold uppercase tracking-wider text-[#76726E]">
                        Primary Color
                      </label>
                      <div className="flex items-center gap-2 bg-[#FAF9F6] border border-[#EAE8E4] rounded-md p-2">
                        <input
                          type="color"
                          value={primaryColor}
                          onChange={(e) => setPrimaryColor(e.target.value)}
                          className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent"
                        />
                        <span className="font-mono text-xs">
                          {primaryColor}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="font-bold uppercase tracking-wider text-[#76726E]">
                        Accent Color
                      </label>
                      <div className="flex items-center gap-2 bg-[#FAF9F6] border border-[#EAE8E4] rounded-md p-2">
                        <input
                          type="color"
                          value={accentColor}
                          onChange={(e) => setAccentColor(e.target.value)}
                          className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent"
                        />
                        <span className="font-mono text-xs">{accentColor}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="font-bold uppercase tracking-wider text-[#76726E]">
                        Footer Background
                      </label>
                      <div className="flex items-center gap-2 bg-[#FAF9F6] border border-[#EAE8E4] rounded-md p-2">
                        <input
                          type="color"
                          value={backgroundColor}
                          onChange={(e) => setBackgroundColor(e.target.value)}
                          className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent"
                        />
                        <span className="font-mono text-xs">
                          {backgroundColor}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="font-bold uppercase tracking-wider text-[#76726E]">
                        Hero Headline
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., New Season Collection"
                        value={tagline}
                        onChange={(e) => setTagline(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-[#FAF9F6] border border-[#EAE8E4] rounded-md focus:outline-hidden focus:border-[#C4956A]"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="font-bold uppercase tracking-wider text-[#76726E]">
                        Hero Subtitle
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., Curated pieces crafted for everyday luxury."
                        value={subtitle}
                        onChange={(e) => setSubtitle(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-[#FAF9F6] border border-[#EAE8E4] rounded-md focus:outline-hidden focus:border-[#C4956A]"
                      />
                    </div>
                  </div>

                  {/* Featured Header/Footer Categories */}
                  <div className="flex flex-col gap-2 pt-2 border-t border-[#EAE8E4]">
                    <label className="font-bold uppercase tracking-wider text-[#76726E]">
                      Header & Footer Quick-Nav Categories (Select up to 2)
                    </label>
                    <p className="text-[11px] text-[#76726E]">
                      If none are selected, your storefront automatically
                      displays up to 2 categories from your published products.
                    </p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {categories.map((cat) => {
                        const selected = selectedNavCatIds.includes(cat.id);
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => toggleNavCategory(cat.id)}
                            className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-colors cursor-pointer ${
                              selected
                                ? "bg-[#151413] text-white"
                                : "bg-[#FAF9F6] border border-[#EAE8E4] text-[#76726E] hover:text-[#151413]"
                            }`}
                          >
                            {cat.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: HERO BANNER MEDIA */}
              {activeTab === "hero" && (
                <div className="flex flex-col gap-5">
                  <div className="pb-3 border-b border-[#EAE8E4]">
                    <h2 className="font-heading text-base font-bold uppercase tracking-wider text-[#151413]">
                      Hero Section Media
                    </h2>
                    <p className="text-[#76726E] text-xs mt-0.5">
                      Configure banner images or a YouTube video for your
                      storefront homepage hero.
                    </p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="font-bold uppercase tracking-wider text-[#76726E]">
                      Hero Display Type
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer p-3 bg-[#FAF9F6] border border-[#EAE8E4] rounded-md flex-1">
                        <input
                          type="radio"
                          name="heroType"
                          value={HeroType.IMAGE}
                          checked={sysConfig.heroType === HeroType.IMAGE}
                          onChange={() =>
                            setSysConfig((prev) => ({
                              ...prev,
                              heroType: HeroType.IMAGE,
                            }))
                          }
                          className="accent-[#C4956A]"
                        />
                        <LuImage className="w-4 h-4 text-[#C4956A]" />
                        <span className="font-bold">
                          Image Carousel (Max 4)
                        </span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer p-3 bg-[#FAF9F6] border border-[#EAE8E4] rounded-md flex-1">
                        <input
                          type="radio"
                          name="heroType"
                          value={HeroType.VIDEO}
                          checked={sysConfig.heroType === HeroType.VIDEO}
                          onChange={() =>
                            setSysConfig((prev) => ({
                              ...prev,
                              heroType: HeroType.VIDEO,
                            }))
                          }
                          className="accent-[#C4956A]"
                        />
                        <LuVideo className="w-4 h-4 text-[#C4956A]" />
                        <span className="font-bold">Video Embed</span>
                      </label>
                    </div>
                  </div>

                  {sysConfig.heroType === HeroType.IMAGE && (
                    <div className="flex flex-col gap-3">
                      <label className="font-bold uppercase tracking-wider text-[#76726E]">
                        Hero Images ({sysConfig.heroImages.length} / 4)
                      </label>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {sysConfig.heroImages.map((imgUrl, idx) => (
                          <div
                            key={idx}
                            className="relative aspect-video rounded-md border border-[#EAE8E4] overflow-hidden group bg-[#FAF9F6]"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={imgUrl}
                              alt={`Hero ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveHeroImage(imgUrl)}
                              className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-md cursor-pointer opacity-90 hover:opacity-100 transition-opacity"
                              title="Remove image"
                            >
                              <LuTrash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}

                        {sysConfig.heroImages.length < 4 && (
                          <label className="flex flex-col items-center justify-center aspect-video border-2 border-dashed border-[#EAE8E4] rounded-md cursor-pointer bg-[#FAF9F6] hover:bg-[#FAF5EF] transition-colors">
                            {uploadingHeroImage ? (
                              <LuRefreshCw className="w-5 h-5 animate-spin text-[#C4956A]" />
                            ) : (
                              <>
                                <LuUpload className="w-5 h-5 text-[#C4956A] mb-1" />
                                <span className="text-[10px] font-bold text-[#151413]">
                                  Upload Image
                                </span>
                              </>
                            )}
                            <input
                              type="file"
                              accept="image/*"
                              disabled={uploadingHeroImage}
                              onChange={handleHeroFileUpload}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  )}

                  {sysConfig.heroType === HeroType.VIDEO && (
                    <div className="flex flex-col gap-1.5">
                      <label className="font-bold uppercase tracking-wider text-[#76726E]">
                        YouTube Video ID / URL
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., dQw4w9WgXcQ"
                        value={sysConfig.heroVideoId}
                        onChange={(e) =>
                          setSysConfig((prev) => ({
                            ...prev,
                            heroVideoId: e.target.value,
                          }))
                        }
                        className="w-full px-3.5 py-2.5 bg-[#FAF9F6] border border-[#EAE8E4] rounded-md font-mono focus:outline-hidden focus:border-[#C4956A]"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: 36-STATE SHIPPING & DELIVERY OPTIONS */}
              {activeTab === "shipping" && (
                <div className="flex flex-col gap-6">
                  <div className="pb-3 border-b border-[#EAE8E4]">
                    <h2 className="font-heading text-base font-bold uppercase tracking-wider text-[#151413]">
                      36-State Delivery Coverage & Fees
                    </h2>
                    <p className="text-[#76726E] text-xs mt-0.5">
                      When no states are enabled below, your storefront
                      automatically ships nationwide across all 36 states + FCT
                      at the platform default flat rate. As soon as you enable
                      one or more states, checkout will only allow customers in
                      your selected states and apply your custom fees.
                    </p>
                  </div>

                  {enabledStatesCount === 0 && (
                    <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900">
                      <strong>Nationwide Default Flat-Rate Active:</strong> You
                      have not enabled custom states yet, so customers can order
                      from any Nigerian state at the platform default flat-rate
                      delivery fee. Enable specific states below to restrict
                      coverage or set custom per-state fees.
                    </div>
                  )}

                  {/* Bulk Fee Helper + Free Shipping Banner Threshold */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#FAF9F6] p-4 rounded-lg border border-[#EAE8E4]">
                    <div className="flex flex-col gap-1.5">
                      <label className="font-bold uppercase tracking-wider text-[#76726E]">
                        Bulk Apply Fee to Enabled States (₦)
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          min="0"
                          placeholder="e.g. 3500"
                          value={bulkFee}
                          onChange={(e) => setBulkFee(e.target.value)}
                          className="flex-1 px-3 py-2 bg-white border border-[#EAE8E4] rounded-md font-bold focus:outline-hidden focus:border-[#C4956A]"
                        />
                        <button
                          type="button"
                          onClick={applyBulkFeeToEnabled}
                          className="px-3 py-2 bg-[#151413] text-white text-[11px] font-bold uppercase rounded-md hover:bg-[#2A2725] cursor-pointer"
                        >
                          Apply
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="font-bold uppercase tracking-wider text-[#76726E] flex items-center gap-1">
                        <LuTruck className="w-3.5 h-3.5 text-[#C4956A]" /> Free
                        Shipping Promo Threshold (₦)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={sysConfig.minFreeDeliveryFare}
                        onChange={(e) =>
                          setSysConfig((prev) => ({
                            ...prev,
                            minFreeDeliveryFare: Number(e.target.value),
                          }))
                        }
                        className="w-full px-3 py-2 bg-white border border-[#EAE8E4] rounded-md font-bold focus:outline-hidden focus:border-[#C4956A]"
                      />
                    </div>
                  </div>

                  {/* 36 States + FCT Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-112 overflow-y-auto pr-1">
                    {shippingRates.map((item) => (
                      <div
                        key={item.state}
                        className={`p-3 rounded-lg border transition-colors flex flex-col gap-2 ${
                          item.enabled
                            ? "bg-[#FAF9F6] border-[#C4956A]"
                            : "bg-white border-[#EAE8E4] opacity-75"
                        }`}
                      >
                        <label className="flex items-center justify-between gap-2 cursor-pointer">
                          <span className="font-bold text-[#151413]">
                            {item.state}
                          </span>
                          <input
                            type="checkbox"
                            checked={item.enabled}
                            onChange={() => toggleStateShipping(item.state)}
                            className="accent-[#C4956A] w-4 h-4 cursor-pointer"
                          />
                        </label>

                        {item.enabled ? (
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] font-bold text-[#76726E]">
                              ₦
                            </span>
                            <input
                              type="number"
                              min="0"
                              value={item.fee}
                              onChange={(e) =>
                                updateStateFee(
                                  item.state,
                                  Number(e.target.value),
                                )
                              }
                              placeholder="Delivery fee"
                              className="w-full px-2.5 py-1.5 bg-white border border-[#EAE8E4] rounded text-xs font-bold focus:outline-hidden focus:border-[#C4956A]"
                            />
                          </div>
                        ) : (
                          <span className="text-[10px] text-[#76726E]">
                            Delivery disabled
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Bar */}
              <div className="pt-4 border-t border-[#EAE8E4] flex justify-end">
                <button
                  type="submit"
                  disabled={saving || loading}
                  className="px-6 py-2.5 bg-[#171514] text-white text-xs font-bold uppercase tracking-wider rounded-md hover:bg-[#2A2725] transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <LuCheck className="w-4 h-4 text-[#C4956A]" /> Save Storefront
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
