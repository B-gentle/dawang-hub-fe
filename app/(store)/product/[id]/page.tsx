import type { Metadata } from "next";
import { apiClient } from "@/lib/api-client";
import ProductDetailClient from "./ProductDetailClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

/**
 * 1. Server-side Metadata Generator for WhatsApp, Twitter, and Social Crawlers
 */
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const product = await apiClient.getProductById(id);

    if (!product) {
      return {
        title: "Product Not Found | DawangStores",
      };
    }

    const title = `${product.name} | DawangStores`;
    const description =
      product.description ||
      `Shop ${product.name} for ₦${Number(product.price).toLocaleString()} at DawangStores. Express nationwide delivery available.`;

    // Get the primary product image
    const imageUrl =
      product.images && product.images.length > 0
        ? product.images[0]
        : "/og-image.jpeg";

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: "article",
        images: [
          {
            url: imageUrl,
            width: 800,
            height: 1000,
            alt: product.name,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [imageUrl],
      },
    };
  } catch (error) {
    console.error("Error generating metadata for product page:", error);
    return {
      title: "Luxury Collection | DawangStores",
    };
  }
}

/**
 * 2. Server Page Shell passing initial params to Client View
 */
export default async function ProductPage({ params }: PageProps) {
  return <ProductDetailClient params={params} />;
}
