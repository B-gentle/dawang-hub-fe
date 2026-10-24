import SiteHeader from "@/components/layouts/SiteHeader";
import Footer from "@/components/layouts/Footer";
import WhatsAppButton from "@/components/common/WhatsAppButton";
import { WishlistProvider } from "@/context/WishlistContext";
import { CartProvider } from "@/context/CartContext";
import CartDrawer from "@/components/products/CartDrawer";

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <WishlistProvider>
        <CartProvider>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <Footer />
          <CartDrawer />
          <WhatsAppButton phoneNumber="2349030657610" />
        </CartProvider>
      </WishlistProvider>
    </div>
  );
}
