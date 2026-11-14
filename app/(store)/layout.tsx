import { ReactNode } from "react";
import { headers } from "next/headers";
import SiteHeader from "@/components/layouts/SiteHeader";
import Footer from "@/components/layouts/Footer";
import CartDrawer from "@/components/products/CartDrawer";
import { WishlistProvider } from "@/context/WishlistContext";
import { CartProvider } from "@/context/CartContext";
import {
  extractSubdomainFromHeaders,
  resolveSubdomainBranding,
} from "@/lib/utils/storefront-branding";

export default async function StoreLayout({
  children,
}: {
  children: ReactNode;
}) {
  const headerList = await headers();
  const vendorSlug = extractSubdomainFromHeaders(headerList);
  const vendorBranding = await resolveSubdomainBranding(vendorSlug);

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
