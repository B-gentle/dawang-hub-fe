"use client";

import Link from "next/link";

interface HeroProps {
  videoId?: string;
  subtitle?: string;
  title?: string;
  description?: string;
  primaryCtaText?: string;
  primaryCtaHref?: string;
  secondaryCtaText?: string;
  secondaryCtaHref?: string;
}

export default function Hero({
  videoId = "dQw4w9WgXcQ",
  subtitle = "Autumn / Winter Collection 2026",
  title = "Elegance Defined By Distinction",
  description = "Discover curated luxury apparel, handcrafted footwear, and premium lifestyle accessories built for the modern individual.",
  primaryCtaText = "Explore Catalog",
  primaryCtaHref = "/shop",
  secondaryCtaText = "View Clothing",
  secondaryCtaHref = "/clothes",
}: HeroProps) {
  return (
    <section className="relative w-full h-[80vh] min-h-[500px] max-h-[800px] bg-[#151413] text-white overflow-hidden flex items-center justify-center">
      {/* Background YouTube Video iFrame Container */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${videoId}&showinfo=0&rel=0&iv_load_policy=3&enablejsapi=1`}
          title="Dawang Hub Brand Reel"
          className="w-[300%] h-[300%] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 object-cover opacity-60"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        />
      </div>

      {/* Dark Luxury Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#151413] via-[#151413]/50 to-black/60" />

      {/* Hero Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 flex flex-col items-center text-center gap-5">
        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.35em] text-[#C4956A]">
          {subtitle}
        </span>
        <h1 className="font-heading text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight max-w-4xl uppercase leading-tight text-white drop-shadow-xs">
          {title}
        </h1>
        <p className="text-xs sm:text-sm text-gray-200 max-w-xl font-normal leading-relaxed">
          {description}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 mt-2 w-full sm:w-auto">
          <Link
            href={primaryCtaHref}
            className="px-8 py-3.5 bg-[#C4956A] text-white text-xs font-bold uppercase tracking-widest rounded-md hover:bg-[#b08259] transition-colors text-center shadow-lg"
          >
            {primaryCtaText}
          </Link>
          <Link
            href={secondaryCtaHref}
            className="px-8 py-3.5 border border-white/40 backdrop-blur-xs text-white text-xs font-bold uppercase tracking-widest rounded-md hover:bg-white hover:text-[#151413] transition-colors text-center"
          >
            {secondaryCtaText}
          </Link>
        </div>
      </div>
    </section>
  );
}
