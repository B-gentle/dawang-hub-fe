export default function Loading() {
  return (
    <div className="min-h-[70vh] w-full flex flex-col items-center justify-center bg-white px-4 font-sans">
      <div className="flex flex-col items-center gap-6 text-center">
        {/* Animated Gold Ring & Brand Indicator */}
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 rounded-full border-2 border-[#EAE8E4] border-t-[#C4956A] animate-spin" />
          <span className="absolute font-heading font-bold text-[10px] tracking-[0.2em] text-[#151413]">
            DH
          </span>
        </div>

        {/* Brand Text */}
        <div className="flex flex-col items-center gap-1">
          <span className="font-heading text-sm font-bold tracking-[0.25em] text-[#151413] uppercase">
            DAWANG STORES
          </span>
          <p className="text-[11px] font-medium tracking-widest text-[#C4956A] uppercase animate-pulse">
            Loading Catalog...
          </p>
        </div>
      </div>
    </div>
  );
}
