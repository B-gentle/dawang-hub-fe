import { NavCategoryItem } from "@/components/layouts/SiteHeader";
import { SystemConfig, systemConfigApi } from "@/lib/api/system-config-api";
import { productApi } from "@/lib/api/product-api";
import { Product } from "@/types/product";

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"
).replace(/\/+$/, "");

const ROOT_DOMAIN = (process.env.NEXT_PUBLIC_ROOT_DOMAIN || "globexmall.com")
  .split(":")[0]
  .toLowerCase()
  .trim();

const RESERVED_SUBDOMAINS = new Set(["www", "api", "admin", "mail", "app"]);

export interface PublicVendor {
  id: string;
  storeName: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  whatsappNumber?: string;
  themeConfig?: {
    primaryColor?: string;
    accentColor?: string;
    backgroundColor?: string;
    navCategories?: Array<{
      label?: string;
      name?: string;
      slug?: string;
      id?: string;
    }>;
  };
}

export interface ResolvedStorefrontBranding {
  vendor: PublicVendor;
  vendorId: string;
  mergedConfig: Partial<SystemConfig>;
  categoryLinks: NavCategoryItem[];
}

export function extractSubdomainFromHeaders(
  headerList: Headers,
): string | null {
  const fromProxy = headerList.get("x-vendor-slug");
  if (fromProxy) return fromProxy.toLowerCase().trim();

  const rawHost =
    headerList.get("x-forwarded-host") || headerList.get("host") || "";
  const cleanHost = rawHost.split(":")[0].toLowerCase().trim();

  if (
    !cleanHost ||
    cleanHost === ROOT_DOMAIN ||
    cleanHost === `www.${ROOT_DOMAIN}` ||
    cleanHost === "localhost" ||
    cleanHost === "127.0.0.1"
  ) {
    return null;
  }

  let sub = "";
  if (cleanHost.endsWith(`.${ROOT_DOMAIN}`)) {
    sub = cleanHost.slice(0, -(ROOT_DOMAIN.length + 1));
  } else if (cleanHost.endsWith(".localhost")) {
    sub = cleanHost.slice(0, -".localhost".length);
  }

  if (sub && !sub.includes(".") && !RESERVED_SUBDOMAINS.has(sub)) {
    return sub;
  }

  return null;
}

function extractProducts(
  payload: Product[] | { items: Product[]; meta: unknown } | null,
): Product[] {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  return payload.items || [];
}

export async function resolveSubdomainBranding(
  vendorSlug: string | null,
): Promise<ResolvedStorefrontBranding | null> {
  if (!vendorSlug) return null;

  const normalizedSlug = decodeURIComponent(vendorSlug).toLowerCase().trim();
  const vendorRes = await fetch(
    `${API_BASE}/vendors/storefront/${encodeURIComponent(normalizedSlug)}`,
    { cache: "no-store" },
  ).catch(() => null);

  if (!vendorRes || !vendorRes.ok) return null;

  const vendor = (await vendorRes.json()) as PublicVendor;

  const [rawConfig, productsPayload] = await Promise.all([
    systemConfigApi
      .getPublicConfig(vendor.id)
      .catch(() => ({}) as Partial<SystemConfig>),
    productApi
      .getProducts({ vendorId: vendor.id, limit: 30 })
      .catch(() => null),
  ]);

  const mergedConfig: Partial<SystemConfig> = {
    ...rawConfig,
    vendorId: vendor.id,
    siteName: rawConfig.siteName || vendor.storeName,
    logoUrl: rawConfig.logoUrl || vendor.logoUrl || "",
    description: rawConfig.description || vendor.description || "",
    whatsappContact: rawConfig.whatsappContact || vendor.whatsappNumber || "",
    minFreeDeliveryFare: Number(rawConfig.minFreeDeliveryFare) || 0,
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

  const configuredCats =
    (
      rawConfig.themeConfig as
        | {
            navCategories?: Array<{
              label?: string;
              name?: string;
              slug?: string;
              id?: string;
            }>;
          }
        | undefined
    )?.navCategories ||
    vendor.themeConfig?.navCategories ||
    [];

  let categoryLinks: NavCategoryItem[] = [];

  if (configuredCats.length > 0) {
    categoryLinks = configuredCats
      .slice(0, 2)
      .map((cat) => {
        const label = cat.label || cat.name || "";
        const categoryParam = cat.slug || cat.id || label.toLowerCase();
        return {
          label,
          href: `/shop?category=${encodeURIComponent(categoryParam)}`,
        };
      })
      .filter((c) => Boolean(c.label));
  } else {
    const products = extractProducts(productsPayload);
    const seen = new Map<string, NavCategoryItem>();

    for (const p of products) {
      if (p.category && typeof p.category === "object" && p.category.name) {
        const key = p.category.slug || p.category.id || p.category.name;
        if (!seen.has(key)) {
          seen.set(key, {
            label: p.category.name,
            href: `/shop?category=${encodeURIComponent(key)}`,
          });
        }
        if (seen.size === 2) break;
      }
    }

    categoryLinks = Array.from(seen.values());
  }

  return {
    vendor,
    vendorId: vendor.id,
    mergedConfig,
    categoryLinks,
  };
}
