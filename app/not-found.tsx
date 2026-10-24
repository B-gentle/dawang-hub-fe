import Link from "next/link";
import { FiArrowLeft, FiShoppingBag } from "react-icons/fi";

export default function NotFound() {
  return (
    <div className="min-h-[75vh] w-full bg-white flex items-center justify-center px-4 py-16 font-sans">
      <div className="max-w-md w-full flex flex-col items-center text-center gap-6">
        {/* Decorative Badge */}
        <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#C4956A] bg-[#FAF9F6] px-3.5 py-1.5 rounded-full border border-[#EAE8E4]">
          404 ERROR
        </span>

        {/* Main Heading */}
        <div className="flex flex-col gap-2">
          <h1 className="font-heading text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-[#151413]">
            Page Not Found
          </h1>
          <p className="text-xs sm:text-sm text-[#76726E] leading-relaxed max-w-sm">
            The collection or item you are looking for does not exist or may
            have been moved.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full pt-2">
          <Link
            href="/"
            className="w-full sm:w-1/2 py-3 bg-[#151413] text-white text-xs font-bold uppercase tracking-widest rounded-md hover:bg-[#2A2725] transition-colors flex items-center justify-center gap-2"
          >
            <FiArrowLeft className="w-4 h-4" /> Go Home
          </Link>

          <Link
            href="/shop"
            className="w-full sm:w-1/2 py-3 bg-[#FAF9F6] border border-[#EAE8E4] text-[#151413] text-xs font-bold uppercase tracking-widest rounded-md hover:border-[#C4956A] hover:text-[#C4956A] transition-colors flex items-center justify-center gap-2"
          >
            <FiShoppingBag className="w-4 h-4" /> Shop Store
          </Link>
        </div>
      </div>
    </div>
  );
}
