"use client";

import { useEffect, useState } from "react";
import {
  LuTruck,
  LuSave,
  LuRefreshCw,
  LuCheck,
  LuImage,
  LuUpload,
  LuTrash2,
  LuVideo,
  LuCreditCard,
} from "react-icons/lu";
import { toast } from "sonner";
import {
  systemConfigApi,
  HeroType,
  SystemConfig,
} from "@/lib/api/system-config-api";

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<"hero" | "shipping">("hero");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // System Configuration state connected directly to system-config-api
  const [sysConfig, setSysConfig] = useState<SystemConfig>({
    heroType: HeroType.IMAGE,
    heroImages: [],
    heroVideoId: "",
    minFreeDeliveryFare: 150000,
    paymentEnv: "test",
  });

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await systemConfigApi.getPublicConfig();
      if (data) {
        setSysConfig({
          heroType: data.heroType || HeroType.IMAGE,
          heroImages: data.heroImages || [],
          heroVideoId: data.heroVideoId || "",
          minFreeDeliveryFare: Number(data.minFreeDeliveryFare) || 0,
          paymentEnv: data.paymentEnv || "test",
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
      if (isMounted) {
        loadSettings();
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);

      // Ensure heroImages is explicitly a clean string array
      const cleanedHeroImages = Array.isArray(sysConfig.heroImages)
        ? sysConfig.heroImages.filter(
            (img) => typeof img === "string" && img.trim() !== "",
          )
        : [];

      const updated = await systemConfigApi.updateSystemConfig({
        heroType: sysConfig.heroType,
        heroImages: cleanedHeroImages,
        heroVideoId: sysConfig.heroVideoId || "",
        minFreeDeliveryFare: Number(sysConfig.minFreeDeliveryFare) || 0,
        paymentEnv: sysConfig.paymentEnv || "test",
      });

      setSysConfig({
        heroType: updated.heroType || HeroType.IMAGE,
        heroImages: Array.isArray(updated.heroImages) ? updated.heroImages : [],
        heroVideoId: updated.heroVideoId || "",
        minFreeDeliveryFare: Number(updated.minFreeDeliveryFare) || 0,
        paymentEnv: updated.paymentEnv || "test",
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
      setUploadingImage(true);
      toast.info("Uploading image to Cloudinary...");
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
      setUploadingImage(false);
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
            Configure homepage hero media, delivery free-fare thresholds, and
            payment environments.
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
              onClick={() => setActiveTab("shipping")}
              className={`flex items-center gap-3 px-4 py-3 rounded-md text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer text-left ${
                activeTab === "shipping"
                  ? "bg-[#171514] text-white"
                  : "bg-white text-[#76726E] hover:text-[#151413] hover:bg-[#FAF9F6] border border-[#EAE8E4]"
              }`}
            >
              <LuTruck className="w-4 h-4 text-[#C4956A]" /> Delivery & Payment
            </button>
          </aside>

          {/* Settings Form Container */}
          <div className="flex-1 bg-white rounded-lg border border-[#EAE8E4] p-6 shadow-xs">
            <form
              onSubmit={handleSaveSettings}
              className="flex flex-col gap-6 text-xs text-[#151413]"
            >
              {/* TAB 1: HERO BANNER MEDIA */}
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

                  {/* IMAGE CAROUSEL SECTION */}
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
                            {uploadingImage ? (
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
                              disabled={uploadingImage}
                              onChange={handleHeroFileUpload}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  )}

                  {/* VIDEO EMBED SECTION */}
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
                      <p className="text-[10px] text-[#76726E]">
                        Enter YouTube video ID or full video embed URL.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: SHIPPING & PAYMENT */}
              {activeTab === "shipping" && (
                <div className="flex flex-col gap-5">
                  <div className="pb-3 border-b border-[#EAE8E4]">
                    <h2 className="font-heading text-base font-bold uppercase tracking-wider text-[#151413]">
                      Delivery & Payment Environment
                    </h2>
                    <p className="text-[#76726E] text-xs mt-0.5">
                      Set logistics parameters and active Paystack gateway mode.
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
                      <p className="text-[10px] text-[#76726E]">
                        Cart totals equal to or exceeding this amount qualify
                        for free delivery.
                      </p>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="font-bold uppercase tracking-wider text-[#76726E] flex items-center gap-1">
                        <LuCreditCard className="w-3.5 h-3.5 text-[#C4956A]" />{" "}
                        Paystack Environment
                      </label>
                      <select
                        value={sysConfig.paymentEnv}
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
                      <p className="text-[10px] text-[#76726E]">
                        Controls which Paystack secret API key is used during
                        transactions.
                      </p>
                    </div>
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
