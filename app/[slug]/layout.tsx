import { ReactNode } from "react";
import SiteHeader from "@/components/layouts/SiteHeader";
import Footer from "@/components/layouts/Footer";
import CartDrawer from "@/components/products/CartDrawer";
import { WishlistProvider } from "@/context/WishlistContext";
import { CartProvider } from "@/context/CartContext";
import { resolveSubdomainBranding } from "@/lib/utils/storefront-branding";

export default async function VendorStoreLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const vendorBranding = await resolveSubdomainBranding(slug);

  return (
    <WishlistProvider>
      <CartProvider>
        <div className="min-h-screen flex flex-col">
          <SiteHeader
            vendorId={vendorBranding?.vendorId}
            initialConfig={vendorBranding?.mergedConfig}
            categoryLinks={vendorBranding?.categoryLinks}
          />
          <main className="flex-1">{children}</main>
          <Footer
            vendorId={vendorBranding?.vendorId}
            initialConfig={vendorBranding?.mergedConfig}
            categoryLinks={vendorBranding?.categoryLinks}
          />
          <CartDrawer />
        </div>
      </CartProvider>
    </WishlistProvider>
  );
}
