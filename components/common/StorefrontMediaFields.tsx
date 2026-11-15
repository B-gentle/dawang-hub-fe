"use client";

import {
  LuImage,
  LuUpload,
  LuTrash2,
  LuVideo,
  LuRefreshCw,
} from "react-icons/lu";
import { HeroType, SystemConfig } from "@/lib/api/system-config-api";

interface LogoUploaderProps {
  logoUrl?: string;
  uploadingLogo: boolean;
  onLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveLogo: () => void;
}

export function LogoUploaderField({
  logoUrl,
  uploadingLogo,
  onLogoUpload,
  onRemoveLogo,
}: LogoUploaderProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="font-bold uppercase tracking-wider text-[#76726E]">
        Store Logo
      </label>
      <div className="flex items-center gap-4">
        {logoUrl ? (
          <div className="relative w-24 h-24 rounded-md border border-[#EAE8E4] p-2 bg-[#FAF9F6] overflow-hidden group flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logoUrl}
              alt="Store Logo"
              className="w-full h-full object-contain"
            />
            <button
              type="button"
              onClick={onRemoveLogo}
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
              onChange={onLogoUpload}
              className="hidden"
            />
          </label>
        )}
        <p className="text-[10px] text-[#76726E] max-w-xs">
          Recommended PNG or SVG format with transparent background (Max 2MB).
        </p>
      </div>
    </div>
  );
}

interface HeroMediaFieldsProps {
  sysConfig: SystemConfig;
  setSysConfig: React.Dispatch<React.SetStateAction<SystemConfig>>;
  uploadingHeroImage: boolean;
  onHeroFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveHeroImage: (url: string) => void;
}

export function HeroMediaFields({
  sysConfig,
  setSysConfig,
  uploadingHeroImage,
  onHeroFileUpload,
  onRemoveHeroImage,
}: HeroMediaFieldsProps) {
  return (
    <div className="flex flex-col gap-5">
      <div className="pb-3 border-b border-[#EAE8E4]">
        <h2 className="font-heading text-base font-bold uppercase tracking-wider text-[#151413]">
          Hero Section Media
        </h2>
        <p className="text-[#76726E] text-xs mt-0.5">
          Configure banner images or a YouTube video for your storefront
          homepage hero.
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
            <span className="font-bold">Image Carousel (Max 4)</span>
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
                  onClick={() => onRemoveHeroImage(imgUrl)}
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
                  onChange={onHeroFileUpload}
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
  );
}
