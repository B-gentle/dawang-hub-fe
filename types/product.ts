export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string | null;
  isActive?: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  discountPrice?: number;
  stockQuantity: number;
  sku: string;
  images: string[];
  isFeatured?: boolean;
  isPopular?: boolean;
  categoryId?: string;
  category?: ProductCategory;
  createdAt: string;
  updatedAt?: string;
}

export type CreateProductInput = Omit<
  Product,
  "id" | "createdAt" | "updatedAt" | "slug"
>;

export type UpdateProductInput = Partial<CreateProductInput>;

export interface ProductsApiResponse {
  products: Product[];
  total: number;
  page: number;
  totalPages: number;
}
