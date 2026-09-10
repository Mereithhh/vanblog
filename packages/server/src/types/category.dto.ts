export class CreateCategoryDto {
  name: string;
}

export class UpdateCategoryDto {
  name?: string;
  password?: string;
  private?: boolean;
  hidden?: boolean;
  order?: number;
}

export class ReorderCategoriesDto {
  names: string[];
}
export type CategoryType = 'category' | 'column';
