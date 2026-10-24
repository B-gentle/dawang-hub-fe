export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  parentId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type CreateCategoryInput = {
  name: string;
  description?: string;
  imageUrl?: string;
  parentId?: string;
};

export type UpdateCategoryInput = Partial<CreateCategoryInput>;
