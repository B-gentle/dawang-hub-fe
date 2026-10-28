import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

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

// Configure base URL for Open Graph images
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "DawangStores - Modern Fashion & Beauty Essentials",
    template: "%s | DawangStores",
  },
  description:
    "DawangHub Official Store. Modern fashion and beauty essentials for the woman becoming everything she imagined.'",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "DawangStores",
    title: "DawangStores - Modern Fashion & Beauty Essentials",
    description:
      "Modern fashion and beauty essentials for the woman becoming everything she imagined.",
    images: [
      {
        url: "/og-image.jpeg", // Create and put this image in your public/ folder (1200x630px recommended)
        width: 1200,
        height: 630,
        alt: "DawangStores Official Store",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DawangStores - Modern Fashion & Beauty Essentials",
    description:
      "Modern fashion and beauty essentials for the woman becoming everything she imagined.",
    images: ["/og-image.jpeg"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${plusJakarta.variable} h-full antialiased`}
    >
      <body className="min-h-screen bg-background text-foreground font-sans antialiased">
        {children}
        <Toaster
          position="top-right"
          richColors
          closeButton
          toastOptions={{
            style: {
              background: "#171514",
              color: "#FFFFFF",
              borderColor: "#2A2725",
              fontSize: "12px",
              fontFamily: "var(--font-sans)",
            },
          }}
        />
      </body>
    </html>
  );
}
