"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  systemConfigApi,
  HeroType,
  SystemConfig,
} from "@/lib/api/system-config-api";

interface HeroProps {
  subtitle?: string;
  title?: string;
  description?: string;
  primaryCtaText?: string;
  primaryCtaHref?: string;
  secondaryCtaText?: string;
  secondaryCtaHref?: string;
  initialConfig?: Partial<SystemConfig>;
}

const DEFAULT_HERO_CONFIG: Partial<SystemConfig> = {
  heroType: HeroType.VIDEO,
  heroImages: [],
  heroVideoId: "t1Nbqpse8kc",
  minFreeDeliveryFare: 150000,
  paymentEnv: "test",
};

export default function Hero({
  subtitle = "Welcome to the Dawang Experience",
  title = "Fashion. Beauty. Lifestyle.",
  description = "Style that speaks, Quality that lasts",
  primaryCtaText = "Explore Catalog",
  primaryCtaHref = "/shop",
  secondaryCtaText = "View Clothing",
  secondaryCtaHref = "/shop?category=clothes",
  initialConfig,
}: HeroProps) {
  const [fetchedConfig, setFetchedConfig] =
    useState<Partial<SystemConfig>>(DEFAULT_HERO_CONFIG);

  useEffect(() => {
    if (initialConfig) return;

    let isMounted = true;
    const fetchConfig = async () => {
      try {
        const data = await systemConfigApi.getPublicConfig();
        if (isMounted && data) {
          setFetchedConfig(data);
        }
      } catch (err) {
        console.warn(
          "Could not load hero system config, falling back to defaults",
          err,
        );
      }
    };

    fetchConfig();
    return () => {
      isMounted = false;
    };
  }, [initialConfig]);

  const config = initialConfig ?? fetchedConfig;
  const videoId = config.heroVideoId || "t1Nbqpse8kc";
  const images = config.heroImages || [];
  const imageCount = images.length;
  const accentColor = config.themeConfig?.accentColor || "#C4956A";
  const primaryColor = config.themeConfig?.primaryColor || "#151413";

  return (
    <section
      className="relative w-full h-[80vh] min-h-125 max-h-200 text-white overflow-hidden flex items-center justify-center"
      style={{ backgroundColor: primaryColor }}
    >
      {/* BACKGROUND MEDIA DISPLAY */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
        {config.heroType === HeroType.VIDEO || imageCount === 0 ? (
          /* YouTube Video Background */
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${videoId}&showinfo=0&rel=0&iv_load_policy=3&enablejsapi=1`}
            title="Brand Reel"
            className="w-[300%] h-[300%] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 object-cover opacity-60"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        ) : (
          /* Dynamic Image Grid Layout */
          <div
            className={`w-full h-full grid gap-0.5 ${
              imageCount === 1
                ? "grid-cols-1"
                : imageCount === 2
                  ? "grid-cols-2"
                  : imageCount === 3
                    ? "grid-cols-2 grid-rows-2"
                    : "grid-cols-2 lg:grid-cols-4"
            }`}
          >
            {images.slice(0, 4).map((imgUrl, index) => {
              const isThirdInThreeGrid = imageCount === 3 && index === 2;
              return (
                <div
                  key={index}
                  className={`relative w-full h-full overflow-hidden ${
                    isThirdInThreeGrid ? "col-span-2" : ""
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imgUrl}
                    alt={`Hero Banner ${index + 1}`}
                    className="w-full h-full object-cover opacity-75 transform scale-105 transition-transform duration-1000 hover:scale-100"
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Dark Luxury Gradient Overlay */}
      <div className="absolute inset-0 bg-linear-to-t from-[#151413] via-[#151413]/60 to-black/70 z-0" />

      {/* Hero Text Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 flex flex-col items-center text-center gap-5">
        <span
          className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.35em]"
          style={{ color: accentColor }}
        >
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
            className="px-8 py-3.5 text-white text-xs font-bold uppercase tracking-widest rounded-md hover:opacity-90 transition-opacity text-center shadow-lg"
            style={{ backgroundColor: accentColor }}
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
