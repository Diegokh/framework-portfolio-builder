export interface Category {
  id: number;
  userId: number;
  name: string;
  color: string;
  description?: string;
  projectCount: number;
  createdAt: string;
}

export interface CategoriesResponse {
  success: boolean;
  data: Category[];
}

export interface CreateCategoryResponse {
  success: boolean;
  id: number;
}
