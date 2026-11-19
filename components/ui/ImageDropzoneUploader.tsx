"use client";

import { LuRefreshCw, LuTrash2, LuUpload } from "react-icons/lu";

interface ImageDropzoneUploaderProps {
  images: string[];
  maxFiles?: number;
  uploading?: boolean;
  uploadLabel?: string;
  helperText?: string;
  layout?: "single" | "grid";
  objectFit?: "contain" | "cover";
  onUpload: (file: File) => Promise<void> | void;
  onRemove: (url: string) => Promise<void> | void;
}

export default function ImageDropzoneUploader({
  images,
  maxFiles = 4,
  uploading = false,
  uploadLabel = "Upload Image",
  helperText,
  layout = "grid",
  objectFit = "cover",
  onUpload,
  onRemove,
}: ImageDropzoneUploaderProps) {
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await onUpload(file);
    e.target.value = "";
  };

  if (layout === "single") {
    const currentUrl = images[0];
    return (
      <div className="flex items-center gap-4">
        {currentUrl ? (
          <div className="relative w-24 h-24 rounded-md border border-[#EAE8E4] p-2 bg-[#FAF9F6] overflow-hidden group flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentUrl}
              alt="Uploaded preview"
              className={`w-full h-full ${
                objectFit === "contain" ? "object-contain" : "object-cover"
              }`}
            />
            <button
              type="button"
              onClick={() => onRemove(currentUrl)}
              className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-md cursor-pointer opacity-90 hover:opacity-100 transition-opacity"
              title="Remove image"
            >
              <LuTrash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-36 h-24 border-2 border-dashed border-[#EAE8E4] rounded-md cursor-pointer bg-[#FAF9F6] hover:bg-[#FAF5EF] transition-colors">
            {uploading ? (
              <LuRefreshCw className="w-5 h-5 animate-spin text-[#C4956A]" />
            ) : (
              <>
                <LuUpload className="w-5 h-5 text-[#C4956A] mb-1" />
                <span className="text-[10px] font-bold text-[#151413]">
                  {uploadLabel}
                </span>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              disabled={uploading}
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        )}
        {helperText && (
          <p className="text-[10px] text-[#76726E] max-w-xs">{helperText}</p>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {images.map((imgUrl, idx) => (
          <div
            key={`${imgUrl}-${idx}`}
            className="relative aspect-video rounded-md border border-[#EAE8E4] overflow-hidden group bg-[#FAF9F6]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imgUrl}
              alt={`Uploaded ${idx + 1}`}
              className={`w-full h-full ${
                objectFit === "contain" ? "object-contain" : "object-cover"
              }`}
            />
            <button
              type="button"
              onClick={() => onRemove(imgUrl)}
              className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-md cursor-pointer opacity-90 hover:opacity-100 transition-opacity"
              title="Remove image"
            >
              <LuTrash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}

        {images.length < maxFiles && (
          <label className="flex flex-col items-center justify-center aspect-video border-2 border-dashed border-[#EAE8E4] rounded-md cursor-pointer bg-[#FAF9F6] hover:bg-[#FAF5EF] transition-colors">
            {uploading ? (
              <LuRefreshCw className="w-5 h-5 animate-spin text-[#C4956A]" />
            ) : (
              <>
                <LuUpload className="w-5 h-5 text-[#C4956A] mb-1" />
                <span className="text-[10px] font-bold text-[#151413]">
                  {uploadLabel}
                </span>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              disabled={uploading}
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        )}
      </div>
      {helperText && <p className="text-[10px] text-[#76726E]">{helperText}</p>}
    </div>
  );
}
