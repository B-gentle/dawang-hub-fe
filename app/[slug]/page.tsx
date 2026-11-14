import { notFound } from "next/navigation";
import { FaWhatsapp } from "react-icons/fa";
import Hero from "@/components/home/Hero";
import ProductGrid from "@/components/products/ProductGrid";
import { productApi } from "@/lib/api/product-api";
import {
  HeroType,
  SystemConfig,
  systemConfigApi,
} from "@/lib/api/system-config-api";
import { Product } from "@/types/product";

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"
).replace(/\/+$/, "");

interface PublicVendor {
  id: string;
  storeName: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  whatsappNumber?: string;
  themeConfig?: {
    tagline?: string;
    subtitle?: string;
    heroType?: "IMAGE" | "VIDEO" | "image" | "video";
    heroImages?: string[];
    heroVideoId?: string;
    minFreeDeliveryFare?: number;
    primaryColor?: string;
    accentColor?: string;
    backgroundColor?: string;
  };
}

function extractProducts(
  payload: Product[] | { items: Product[]; meta: unknown } | null,
): Product[] {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  return payload.items || [];
}

async function getStorefrontData(slug: string) {
  const normalizedSlug = decodeURIComponent(slug).toLowerCase().trim();
  const vendorUrl = `${API_BASE}/vendors/storefront/${encodeURIComponent(normalizedSlug)}`;

  const vendorRes = await fetch(vendorUrl, { cache: "no-store" });
  if (!vendorRes.ok) {
    return null;
  }

  const vendor = (await vendorRes.json()) as PublicVendor;

  const [rawConfig, newArrivalsRes, popularRes, featuredRes] =
    await Promise.all([
      systemConfigApi
        .getPublicConfig(vendor.id)
        .catch(() => ({}) as Partial<SystemConfig>),
      productApi
        .getProducts({
          vendorId: vendor.id,
          limit: 10,
          sortBy: "createdAt",
          sortOrder: "DESC",
        })
        .catch(() => null),
      productApi
        .getProducts({
          vendorId: vendor.id,
          limit: 8,
          isPopular: true,
          sortBy: "createdAt",
          sortOrder: "DESC",
        })
        .catch(() => null),
      productApi
        .getProducts({
          vendorId: vendor.id,
          limit: 8,
          isFeatured: true,
          sortBy: "createdAt",
          sortOrder: "DESC",
        })
        .catch(() => null),
    ]);

  return {
    vendor,
    rawConfig,
    newArrivals: extractProducts(newArrivalsRes),
    popularProducts: extractProducts(popularRes),
    featuredProducts: extractProducts(featuredRes),
  };
}

export default async function PublicVendorStorePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getStorefrontData(slug);

  if (!data) notFound();

  const { vendor, rawConfig, newArrivals, popularProducts, featuredProducts } =
    data;

  const storeName = rawConfig.siteName || vendor.storeName;
  const heroImages =
    rawConfig.heroImages && rawConfig.heroImages.length > 0
      ? rawConfig.heroImages
      : vendor.themeConfig?.heroImages || [];

  const vendorHeroType = vendor.themeConfig?.heroType?.toLowerCase();
  const resolvedHeroType =
    rawConfig.heroType ??
    (vendorHeroType === "video"
      ? HeroType.VIDEO
      : heroImages.length > 0
        ? HeroType.IMAGE
        : HeroType.VIDEO);

  const heroConfig: Partial<SystemConfig> = {
    ...rawConfig,
    siteName: storeName,
    logoUrl: rawConfig.logoUrl || vendor.logoUrl,
    heroType: resolvedHeroType,
    heroImages,
    heroVideoId:
      rawConfig.heroVideoId || vendor.themeConfig?.heroVideoId || "t1Nbqpse8kc",
    themeConfig: {
      primaryColor:
        rawConfig.themeConfig?.primaryColor ||
        vendor.themeConfig?.primaryColor ||
        "#151413",
      accentColor:
        rawConfig.themeConfig?.accentColor ||
        vendor.themeConfig?.accentColor ||
        "#C4956A",
      backgroundColor:
        rawConfig.themeConfig?.backgroundColor ||
        vendor.themeConfig?.backgroundColor ||
        "#FAF9F6",
    },
  };

  const resolvedTagline =
    rawConfig.tagline ||
    rawConfig.themeConfig?.tagline ||
    vendor.themeConfig?.tagline ||
    storeName;

  const resolvedDescription =
    rawConfig.subtitle ||
    rawConfig.themeConfig?.subtitle ||
    rawConfig.description ||
    vendor.description ||
    "Style that speaks, Quality that lasts";

  const whatsapp = (
    rawConfig.whatsappContact ||
    vendor.whatsappNumber ||
    ""
  ).replace(/\D/g, "");

  return (
    <div
      className="min-h-screen font-sans"
      style={{
        backgroundColor: heroConfig.themeConfig?.backgroundColor || "#FAF9F6",
      }}
    >
      {/* Store Hero driven by Vendor SystemConfig */}
      <Hero
        initialConfig={heroConfig}
        subtitle={`Welcome to ${storeName}`}
        title={resolvedTagline}
        description={resolvedDescription}
        primaryCtaText="Explore Catalog"
        primaryCtaHref="#new-arrivals"
        secondaryCtaText="Popular Picks"
        secondaryCtaHref="#popular-products"
      />

      {/* 1. New Arrivals Section Anchor */}
      <section id="new-arrivals" className="scroll-mt-20">
        <ProductGrid
          title="New Arrivals"
          subtitle={`The latest additions to the ${storeName} catalog`}
          products={newArrivals}
          viewAllHref={`/shop?vendorId=${vendor.id}`}
        />
      </section>

      {/* 2. Popular Products Section Anchor */}
      <section id="popular-products" className="scroll-mt-20">
        <ProductGrid
          title="Popular Right Now"
          subtitle="Trending styles favored by our customers"
          products={popularProducts}
          viewAllHref={`/shop?vendorId=${vendor.id}`}
        />
      </section>

      {/* 3. Featured Products Section */}
      <section id="featured-products" className="scroll-mt-20">
        <ProductGrid
          title="Featured Selection"
          subtitle="Handpicked collection highlights"
          products={featuredProducts}
          viewAllHref={`/shop?vendorId=${vendor.id}`}
        />
      </section>

      {/* Floating WhatsApp */}
      {whatsapp && (
        <a
          href={`https://wa.me/${whatsapp}`}
          target="_blank"
          rel="noreferrer"
          className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
        >
          <FaWhatsapp className="w-6 h-6" />
        </a>
      )}
    </div>
  );
}
