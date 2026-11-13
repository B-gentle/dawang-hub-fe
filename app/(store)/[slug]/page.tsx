import { notFound } from "next/navigation";
import { FaWhatsapp } from "react-icons/fa";

async function getVendorStorefront(slug: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/vendors/storefront/${slug}`,
    { next: { revalidate: 60 } },
  );
  if (!res.ok) return null;
  return res.json();
}

export default async function PublicVendorStorePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const vendor = await getVendorStorefront(slug);

  if (!vendor) notFound();

  const theme = vendor.themeConfig || {};
  const heroImages: string[] = theme.heroImages || [];

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#151413] font-sans">
      {/* Announcement Bar */}
      {theme.minFreeDeliveryFare > 0 && (
        <div className="w-full bg-[#151413] text-white text-[10px] font-bold tracking-[0.2em] py-2 text-center uppercase">
          Free delivery on orders over ₦
          {Number(theme.minFreeDeliveryFare).toLocaleString()}
        </div>
      )}

      {/* Store Header */}
      <header className="px-6 h-20 border-b border-[#EAE8E4] bg-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          {vendor.logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={vendor.logoUrl}
              alt={vendor.storeName}
              className="w-10 h-10 object-contain"
            />
          )}
          <span className="font-heading text-base font-bold tracking-[0.18em] uppercase">
            {vendor.storeName}
          </span>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="relative h-96 bg-[#151413] text-white flex items-center justify-center overflow-hidden">
        {heroImages[0] && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={heroImages[0]}
            alt={vendor.storeName}
            className="absolute inset-0 w-full h-full object-cover opacity-55"
          />
        )}
        <div className="relative z-10 text-center px-6 max-w-2xl space-y-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#C4956A]">
            Welcome to {vendor.storeName}
          </p>
          <h1 className="font-heading text-4xl font-extrabold uppercase">
            {theme.tagline || vendor.storeName}
          </h1>
          {vendor.description && (
            <p className="text-sm text-gray-200">{vendor.description}</p>
          )}
        </div>
      </section>

      {/* Floating WhatsApp */}
      {vendor.whatsappNumber && (
        <a
          href={`https://wa.me/${vendor.whatsappNumber.replace(/\D/g, "")}`}
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
