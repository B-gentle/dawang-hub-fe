import { LuStore } from "react-icons/lu";
import { getStoreInitials } from "@/lib/utils/store-initials";

interface StoreLoaderProps {
  /** Store name, if known. Drives the initials and the label. */
  storeName?: string | null;
  message?: string;
  /** true: fills the screen (layout load). false: fills the content area. */
  fullScreen?: boolean;
}

export default function StoreLoader({
  storeName,
  message = "Loading your workspace...",
  fullScreen = false,
}: StoreLoaderProps) {
  const initials = getStoreInitials(storeName);

  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex w-full flex-col items-center justify-center px-4 font-sans ${
        fullScreen ? "min-h-screen bg-[#FAF9F6]" : "min-h-[60vh]"
      }`}
    >
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="relative h-20 w-20">
          {/* Track */}
          <div className="absolute inset-0 rounded-full border-2 border-[#EAE8E4]" />
          {/* Gold arc */}
          <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-[#C4956A] motion-reduce:animate-none" />
          {/* Store badge */}
          <div className="absolute inset-2.5 flex items-center justify-center rounded-full bg-[#151413] text-white shadow-sm">
            {initials ? (
              <span
                aria-hidden="true"
                className="font-heading text-sm font-bold tracking-widest"
              >
                {initials}
              </span>
            ) : (
              <LuStore className="h-5 w-5 text-[#C4956A]" aria-hidden="true" />
            )}
          </div>
        </div>

        <div className="flex flex-col items-center gap-1">
          {storeName && (
            <span className="max-w-[16rem] truncate font-heading text-sm font-bold uppercase tracking-[0.25em] text-[#151413]">
              {storeName}
            </span>
          )}
          <p className="animate-pulse text-[11px] font-medium uppercase tracking-widest text-[#C4956A] motion-reduce:animate-none">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
}
