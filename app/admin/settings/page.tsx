"use client";

import { useEffect, useState } from "react";
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
  LuCreditCard,
  LuMapPin,
  LuClock,
  LuPhone,
  LuBuilding,
  LuLayers,
} from "react-icons/lu";
import { toast } from "sonner";
import {
  systemConfigApi,
  HeroType,
  SystemConfig,
  VendorPlanConfig,
} from "@/lib/api/system-config-api";

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<
    "general" | "hero" | "shipping" | "plans"
  >("general");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingHeroImage, setUploadingHeroImage] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const [sysConfig, setSysConfig] = useState<SystemConfig>({
    siteName: "Dawang Stores",
    logoUrl: "",
    contactAddress: "",
    location: "Lagos, Nigeria",
    businessHours: "Mon - Sat: 9:00 AM - 8:00 PM",
    whatsappContact: "",
    heroType: HeroType.IMAGE,
    heroImages: [],
    heroVideoId: "",
    minFreeDeliveryFare: 150000,
    paymentEnv: "test",
    vendorPlans: [],
  });

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await systemConfigApi.getPublicConfig();
      if (data) {
        setSysConfig({
          siteName: data.siteName || "Dawang Stores",
          logoUrl: data.logoUrl || "",
          contactAddress: data.contactAddress || "",
          location: data.location || "Lagos, Nigeria",
          businessHours: data.businessHours || "Mon - Sat: 9:00 AM - 8:00 PM",
          whatsappContact: data.whatsappContact || "",
          heroType: data.heroType || HeroType.IMAGE,
          heroImages: data.heroImages || [],
          heroVideoId: data.heroVideoId || "",
          minFreeDeliveryFare: Number(data.minFreeDeliveryFare) || 0,
          paymentEnv: data.paymentEnv || "test",
          vendorPlans: data.vendorPlans || [],
        });
      }
    } catch (err) {
      console.error("Failed to fetch system config:", err);
      toast.error("Could not load system configuration from server");
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

  const handlePlanFieldChange = (
    planId: string,
    field: keyof VendorPlanConfig,
    value: string | number | boolean,
  ) => {
    setSysConfig((prev) => ({
      ...prev,
      vendorPlans: (prev.vendorPlans || []).map((plan) => {
        if (field === "recommended" && value === true) {
          return { ...plan, recommended: plan.id === planId };
        }
        return plan.id === planId ? { ...plan, [field]: value } : plan;
      }),
    }));
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);

      const cleanedHeroImages = Array.isArray(sysConfig.heroImages)
        ? sysConfig.heroImages.filter(
            (img) => typeof img === "string" && img.trim() !== "",
          )
        : [];

      const updated = await systemConfigApi.updateSystemConfig({
        siteName: sysConfig.siteName,
        logoUrl: sysConfig.logoUrl,
        contactAddress: sysConfig.contactAddress,
        location: sysConfig.location,
        businessHours: sysConfig.businessHours,
        whatsappContact: sysConfig.whatsappContact,
        heroType: sysConfig.heroType,
        heroImages: cleanedHeroImages,
        heroVideoId: sysConfig.heroVideoId || "",
        minFreeDeliveryFare: Number(sysConfig.minFreeDeliveryFare) || 0,
        paymentEnv: sysConfig.paymentEnv || "test",
        vendorPlans: sysConfig.vendorPlans,
      });

      setSysConfig({
        siteName: updated.siteName || "Dawang Stores",
        logoUrl: updated.logoUrl || "",
        contactAddress: updated.contactAddress || "",
        location: updated.location || "",
        businessHours: updated.businessHours || "",
        whatsappContact: updated.whatsappContact || "",
        heroType: updated.heroType || HeroType.IMAGE,
        heroImages: Array.isArray(updated.heroImages) ? updated.heroImages : [],
        heroVideoId: updated.heroVideoId || "",
        minFreeDeliveryFare: Number(updated.minFreeDeliveryFare) || 0,
        paymentEnv: updated.paymentEnv || "test",
        vendorPlans: updated.vendorPlans || [],
      });

      toast.success("System configuration updated successfully");
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to save settings";
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
      toast.info("Uploading logo to Cloudinary...");
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
      await systemConfigApi.deleteSystemImage(sysConfig.logoUrl);
      setSysConfig((prev) => ({
        ...prev,
        logoUrl: "",
      }));
      toast.success("Logo removed");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to delete logo";
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
      toast.info("Uploading hero image to Cloudinary...");
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
      await systemConfigApi.deleteSystemImage(url);
      setSysConfig((prev) => ({
        ...prev,
        heroImages: prev.heroImages.filter((img) => img !== url),
      }));
      toast.success("Image removed from Cloudinary");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to delete image";
      toast.error(msg);
    }
  };

  return (
    <div className="flex flex-col gap-8 font-sans pb-12 text-[#151413]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold tracking-[0.15em] uppercase text-[#C4956A]">
            PREFERENCES
          </span>
          <h1 className="font-heading text-3xl font-bold text-[#151413] mt-1">
            System Settings
          </h1>
          <p className="text-sm text-[#76726E] mt-1">
            Manage site branding, vendor subscription plans, hero banner media,
            and payment options.
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
          {saving ? "Saving Changes..." : "Save Settings"}
        </button>
      </div>

      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-2 text-xs text-[#76726E]">
          <LuRefreshCw className="w-6 h-6 animate-spin text-[#C4956A]" />
          Loading system preferences...
        </div>
      ) : (
        <div className="flex flex-col md:flex-row gap-8">
          {/* Settings Navigation Sidebar */}
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
              <LuGlobe className="w-4 h-4 text-[#C4956A]" /> General Details
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
              <LuTruck className="w-4 h-4 text-[#C4956A]" /> Delivery & Payment
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("plans")}
              className={`flex items-center gap-3 px-4 py-3 rounded-md text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer text-left ${
                activeTab === "plans"
                  ? "bg-[#171514] text-white"
                  : "bg-white text-[#76726E] hover:text-[#151413] hover:bg-[#FAF9F6] border border-[#EAE8E4]"
              }`}
            >
              <LuLayers className="w-4 h-4 text-[#C4956A]" /> Vendor Plans
            </button>
          </aside>

          {/* Settings Form Container */}
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
                      General Information
                    </h2>
                    <p className="text-[#76726E] text-xs mt-0.5">
                      Configure store identity, branding logo, and customer
                      support channels.
                    </p>
                  </div>

                  {/* Logo Upload Section */}
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
                        Recommended PNG or SVG format with transparent
                        background (Max 2MB).
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="font-bold uppercase tracking-wider text-[#76726E] flex items-center gap-1">
                        <LuBuilding className="w-3.5 h-3.5 text-[#C4956A]" />{" "}
                        Store Title / Site Name
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
                        WhatsApp Support Contact
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
                        Business Working Hours
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., Mon - Sat: 9:00 AM - 8:00 PM"
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
                    <label className="font-bold uppercase tracking-wider text-[#76726E] flex items-center gap-1">
                      <LuMapPin className="w-3.5 h-3.5 text-[#C4956A]" /> Full
                      Contact Address
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g., 12 Luxury Ave, Victoria Island, Lagos"
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
                </div>
              )}

              {/* TAB 2: HERO BANNER MEDIA */}
              {activeTab === "hero" && (
                <div className="flex flex-col gap-5">
                  <div className="pb-3 border-b border-[#EAE8E4]">
                    <h2 className="font-heading text-base font-bold uppercase tracking-wider text-[#151413]">
                      Hero Section Media
                    </h2>
                    <p className="text-[#76726E] text-xs mt-0.5">
                      Configure image carousels or video embeds for the homepage
                      hero banner.
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
                              title="Delete image from Cloudinary"
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

              {/* TAB 3: SHIPPING & PAYMENT */}
              {activeTab === "shipping" && (
                <div className="flex flex-col gap-5">
                  <div className="pb-3 border-b border-[#EAE8E4]">
                    <h2 className="font-heading text-base font-bold uppercase tracking-wider text-[#151413]">
                      Delivery & Payment Environment
                    </h2>
                    <p className="text-[#76726E] text-xs mt-0.5">
                      Set logistics parameters and active payment gateway mode.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="font-bold uppercase tracking-wider text-[#76726E] flex items-center gap-1">
                        <LuTruck className="w-3.5 h-3.5 text-[#C4956A]" /> Free
                        Shipping Threshold (₦)
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
                        className="w-full px-3.5 py-2.5 bg-[#FAF9F6] border border-[#EAE8E4] rounded-md font-bold focus:outline-hidden focus:border-[#C4956A]"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="font-bold uppercase tracking-wider text-[#76726E] flex items-center gap-1">
                        <LuCreditCard className="w-3.5 h-3.5 text-[#C4956A]" />{" "}
                        Payment Environment
                      </label>
                      <select
                        value={sysConfig.paymentEnv || "test"}
                        onChange={(e) =>
                          setSysConfig((prev) => ({
                            ...prev,
                            paymentEnv: e.target.value,
                          }))
                        }
                        className="w-full px-3.5 py-2.5 bg-[#FAF9F6] border border-[#EAE8E4] rounded-md font-bold cursor-pointer focus:outline-hidden focus:border-[#C4956A]"
                      >
                        <option value="test">Test / Sandbox Mode</option>
                        <option value="live">Live Production Mode</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: VENDOR SUBSCRIPTION PLANS (ADMIN ONLY) */}
              {activeTab === "plans" && (
                <div className="flex flex-col gap-5">
                  <div className="pb-3 border-b border-[#EAE8E4]">
                    <h2 className="font-heading text-base font-bold uppercase tracking-wider text-[#151413]">
                      Vendor Storefront Subscription Plans
                    </h2>
                    <p className="text-[#76726E] text-xs mt-0.5">
                      Adjust billing cycle prices and badges shown during vendor
                      onboarding. Changes take effect immediately on checkout.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(sysConfig.vendorPlans || []).map((plan) => (
                      <div
                        key={plan.id}
                        className="p-4 rounded-lg border border-[#EAE8E4] bg-[#FAF9F6] flex flex-col gap-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-heading font-bold text-sm uppercase">
                            {plan.name}
                          </span>
                          <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider cursor-pointer">
                            <input
                              type="checkbox"
                              checked={Boolean(plan.recommended)}
                              onChange={(e) =>
                                handlePlanFieldChange(
                                  plan.id,
                                  "recommended",
                                  e.target.checked,
                                )
                              }
                              className="accent-[#C4956A]"
                            />
                            Recommended
                          </label>
                        </div>

                        <div className="grid grid-cols-2 gap-2.5">
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold uppercase text-[#76726E]">
                              Price (₦)
                            </span>
                            <input
                              type="number"
                              min={0}
                              value={plan.price}
                              onChange={(e) =>
                                handlePlanFieldChange(
                                  plan.id,
                                  "price",
                                  Number(e.target.value),
                                )
                              }
                              className="px-3 py-2 bg-white border border-[#EAE8E4] rounded-md font-bold"
                            />
                          </div>

                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold uppercase text-[#76726E]">
                              Effective Monthly
                            </span>
                            <input
                              type="text"
                              value={plan.effectiveMonthlyLabel}
                              onChange={(e) =>
                                handlePlanFieldChange(
                                  plan.id,
                                  "effectiveMonthlyLabel",
                                  e.target.value,
                                )
                              }
                              className="px-3 py-2 bg-white border border-[#EAE8E4] rounded-md"
                            />
                          </div>

                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold uppercase text-[#76726E]">
                              Savings Badge
                            </span>
                            <input
                              type="text"
                              placeholder="e.g. Save ₦10,000 (17%)"
                              value={plan.savingsLabel || ""}
                              onChange={(e) =>
                                handlePlanFieldChange(
                                  plan.id,
                                  "savingsLabel",
                                  e.target.value,
                                )
                              }
                              className="px-3 py-2 bg-white border border-[#EAE8E4] rounded-md"
                            />
                          </div>

                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold uppercase text-[#76726E]">
                              Positioning Label
                            </span>
                            <input
                              type="text"
                              value={plan.positioning}
                              onChange={(e) =>
                                handlePlanFieldChange(
                                  plan.id,
                                  "positioning",
                                  e.target.value,
                                )
                              }
                              className="px-3 py-2 bg-white border border-[#EAE8E4] rounded-md"
                            />
                          </div>
                        </div>
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
                  <LuCheck className="w-4 h-4 text-[#C4956A]" /> Save
                  Preferences
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
