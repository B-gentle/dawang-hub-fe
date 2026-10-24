import SiteHeader from "@/components/layouts/SiteHeader";
import Footer from "@/components/layouts/Footer";
import WhatsAppButton from "@/components/common/WhatsAppButton";

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <Footer />
      <WhatsAppButton phoneNumber="2349030657610" />
    </div>
  );
}
