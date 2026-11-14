import { notFound } from "next/navigation";
import Link from "next/link";
import { FaWhatsapp } from "react-icons/fa";
import { LuMapPin, LuClock, LuShoppingBag } from "react-icons/lu";

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
    heroImages?: string[];
    minFreeDeliveryFare?: number;
  };
}

interface VendorSystemConfig {
  siteName?: string;
  logoUrl?: string;
  tagline?: string;
  subtitle?: string;
  description?: string;
  heroImages?: string[];
  contactAddress?: string;
  location?: string;
  businessHours?: string;
  whatsappContact?: string;
  minFreeDeliveryFare?: number;
  themeConfig?: {
    primaryColor?: string;
    accentColor?: string;
    backgroundColor?: string;
  };
}

interface StoreProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  discountPrice?: number | null;
  images?: string[];
}

async function getStorefrontData(slug: string) {
  const normalizedSlug = decodeURIComponent(slug).toLowerCase().trim();
  const vendorUrl = `${API_BASE}/vendors/storefront/${encodeURIComponent(normalizedSlug)}`;

  const vendorRes = await fetch(vendorUrl, { cache: "no-store" });
  if (!vendorRes.ok) {
    console.error(
      `[Storefront 404] Failed fetching ${vendorUrl} -> HTTP ${vendorRes.status}`,
    );
    return null;
  }

  const vendor = (await vendorRes.json()) as PublicVendor;

  const [configRes, productsRes] = await Promise.all([
    fetch(`${API_BASE}/system-config?vendorId=${vendor.id}`, {
      cache: "no-store",
    }),
    fetch(`${API_BASE}/products?vendorId=${vendor.id}&limit=50`, {
      cache: "no-store",
    }),
  ]);

  const config: VendorSystemConfig = configRes.ok ? await configRes.json() : {};
  const productsPayload = productsRes.ok ? await productsRes.json() : {};
  const products: StoreProduct[] = Array.isArray(productsPayload)
    ? productsPayload
    : productsPayload.items || [];

  return { vendor, config, products };
}

export default async function PublicVendorStorePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getStorefrontData(slug);

  if (!data) notFound();

  const { vendor, config, products } = data;
  const primaryColor = config.themeConfig?.primaryColor || "#151413";
  const accentColor = config.themeConfig?.accentColor || "#C4956A";
  const backgroundColor = config.themeConfig?.backgroundColor || "#FAF9F6";

  const storeName = config.siteName || vendor.storeName;
  const logoUrl = config.logoUrl || vendor.logoUrl;
  const tagline = config.tagline || vendor.themeConfig?.tagline || storeName;
  const description = config.description || vendor.description;
  const heroImages =
    (config.heroImages && config.heroImages.length > 0
      ? config.heroImages
      : vendor.themeConfig?.heroImages) || [];
  const freeDelivery =
    Number(
      config.minFreeDeliveryFare ?? vendor.themeConfig?.minFreeDeliveryFare,
    ) || 0;
  const whatsapp = (
    config.whatsappContact ||
    vendor.whatsappNumber ||
    ""
  ).replace(/\D/g, "");

  return (
    <div
      className="min-h-screen font-sans"
      style={{ backgroundColor, color: primaryColor }}
    >
      {/* Announcement Bar */}
      {freeDelivery > 0 && (
        <div
          className="w-full text-white text-[10px] font-bold tracking-[0.2em] py-2 text-center uppercase"
          style={{ backgroundColor: primaryColor }}
        >
          Free delivery on orders over ₦{freeDelivery.toLocaleString()}
        </div>
      )}

      {/* Store Header */}
      <header className="px-6 h-20 border-b border-black/10 bg-white flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          {logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt={storeName}
              className="w-10 h-10 object-contain rounded"
            />
          )}
          <span className="font-heading text-base font-bold tracking-[0.18em] uppercase">
            {storeName}
          </span>
        </div>
      </header>

      {/* Hero Banner */}
      <section
        className="relative h-96 text-white flex items-center justify-center overflow-hidden"
        style={{ backgroundColor: primaryColor }}
      >
        {heroImages[0] && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={heroImages[0]}
            alt={storeName}
            className="absolute inset-0 w-full h-full object-cover opacity-55"
          />
        )}
        <div className="relative z-10 text-center px-6 max-w-2xl space-y-3">
          <p
            className="text-[11px] font-bold uppercase tracking-[0.3em]"
            style={{ color: accentColor }}
          >
            Welcome to {storeName}
          </p>
          <h1 className="font-heading text-4xl font-extrabold uppercase">
            {tagline}
          </h1>
          {config.subtitle && (
            <p className="text-xs uppercase tracking-widest text-white/80">
              {config.subtitle}
            </p>
          )}
          {description && (
            <p className="text-sm text-gray-200">{description}</p>
          )}
        </div>
      </section>

      {/* Store Info Bar */}
      {(config.contactAddress || config.location || config.businessHours) && (
        <div className="bg-white border-b border-black/10 px-6 py-3">
          <div className="max-w-7xl mx-auto flex flex-wrap gap-6 text-xs opacity-80">
            {(config.contactAddress || config.location) && (
              <span className="flex items-center gap-1.5">
                <LuMapPin
                  className="w-3.5 h-3.5"
                  style={{ color: accentColor }}
                />
                {config.contactAddress || config.location}
              </span>
            )}
            {config.businessHours && (
              <span className="flex items-center gap-1.5">
                <LuClock
                  className="w-3.5 h-3.5"
                  style={{ color: accentColor }}
                />
                {config.businessHours}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Storefront Catalog */}
      <main className="max-w-7xl mx-auto px-6 py-12 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-sm font-bold uppercase tracking-widest">
            Store Catalog ({products.length})
          </h2>
        </div>

        {products.length === 0 ? (
          <div className="bg-white rounded-xl border border-black/10 p-12 text-center space-y-2">
            <LuShoppingBag
              className="w-8 h-8 mx-auto opacity-50"
              style={{ color: accentColor }}
            />
            <p className="text-sm font-bold">No products listed yet</p>
            <p className="text-xs opacity-65">
              Check back soon for new arrivals from {storeName}.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => {
              const effectivePrice = product.discountPrice ?? product.price;
              return (
                <Link
                  key={product.id}
                  href={`/shop/${product.slug}`}
                  className="group bg-white rounded-xl border border-black/10 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="aspect-square bg-black/5 overflow-hidden">
                    {product.images?.[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs opacity-40">
                        No Image
                      </div>
                    )}
                  </div>
                  <div className="p-4 space-y-1">
                    <p className="text-xs font-bold line-clamp-1">
                      {product.name}
                    </p>
                    <p
                      className="text-sm font-bold"
                      style={{ color: accentColor }}
                    >
                      ₦{Number(effectivePrice).toLocaleString()}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>

      {/* Floating WhatsApp */}
      {whatsapp && (
        <a
          href={`https://wa.me/${whatsapp}`}
          target="_blank"
          rel="noreferrer"
          className="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-lg"
        >
          <FaWhatsapp className="w-6 h-6" />
        </a>
      )}
    </div>
  );
}
