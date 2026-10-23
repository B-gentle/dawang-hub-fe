import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import SiteHeader from "@/components/layouts/SiteHeader";
import Footer from "@/components/layouts/Footer";

// Primary Body Font
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

// Display / Heading Font
const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

export const metadata: Metadata = {
  title: "DawangStores - Modern Fashion & Beauty Essentials",
  description:
    "DawangHub Official Store. Modern fashion and beauty essentials for the woman becoming everything she imagined.'",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${plusJakarta.variable} h-full antialiased`}
    >
      <body className="min-h-screen flex flex-col antialiased bg-background text-foreground font-sans">
        {/* Global Navigation Site Header */}
        <SiteHeader />

        {/* Content Region grows to push footer downward */}
        <div className="flex-1">{children}</div>

        {/* Global Navigation Site Footer */}
        <Footer />
      </body>
    </html>
  );
}
