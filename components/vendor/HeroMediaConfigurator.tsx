"use client";

import { LuImage, LuVideo } from "react-icons/lu";
import { HeroType } from "@/lib/api/system-config-api";
import ImageDropzoneUploader from "@/components/ui/ImageDropzoneUploader";

interface HeroMediaConfiguratorProps {
  heroType: HeroType;
  heroImages: string[];
  heroVideoId: string;
  uploading: boolean;
  maxImages?: number;
  onHeroTypeChange: (type: HeroType) => void;
  onUploadImage: (file: File) => Promise<void> | void;
  onRemoveImage: (url: string) => Promise<void> | void;
  onVideoIdChange: (videoId: string) => void;
}

export default function HeroMediaConfigurator({
  heroType,
  heroImages,
  heroVideoId,
  uploading,
  maxImages = 4,
  onHeroTypeChange,
  onUploadImage,
  onRemoveImage,
  onVideoIdChange,
}: HeroMediaConfiguratorProps) {
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
              checked={heroType === HeroType.IMAGE}
              onChange={() => onHeroTypeChange(HeroType.IMAGE)}
              className="accent-[#C4956A]"
            />
            <LuImage className="w-4 h-4 text-[#C4956A]" />
            <span className="font-bold">Image Carousel (Max {maxImages})</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer p-3 bg-[#FAF9F6] border border-[#EAE8E4] rounded-md flex-1">
            <input
              type="radio"
              name="heroType"
              value={HeroType.VIDEO}
              checked={heroType === HeroType.VIDEO}
              onChange={() => onHeroTypeChange(HeroType.VIDEO)}
              className="accent-[#C4956A]"
            />
            <LuVideo className="w-4 h-4 text-[#C4956A]" />
            <span className="font-bold">Video Embed</span>
          </label>
        </div>
      </div>

      {heroType === HeroType.IMAGE && (
        <div className="flex flex-col gap-3">
          <label className="font-bold uppercase tracking-wider text-[#76726E]">
            Hero Images ({heroImages.length} / {maxImages})
          </label>

          <ImageDropzoneUploader
            images={heroImages}
            maxFiles={maxImages}
            uploading={uploading}
            uploadLabel="Upload Image"
            layout="grid"
            objectFit="cover"
            onUpload={onUploadImage}
            onRemove={onRemoveImage}
          />
        </div>
      )}

      {heroType === HeroType.VIDEO && (
        <div className="flex flex-col gap-1.5">
          <label className="font-bold uppercase tracking-wider text-[#76726E]">
            YouTube Video ID / URL
          </label>
          <input
            type="text"
            placeholder="e.g., dQw4w9WgXcQ"
            value={heroVideoId}
            onChange={(e) => onVideoIdChange(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-[#FAF9F6] border border-[#EAE8E4] rounded-md font-mono focus:outline-hidden focus:border-[#C4956A]"
          />
        </div>
      )}
    </div>
  );
}
