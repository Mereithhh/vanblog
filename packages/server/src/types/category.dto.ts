export class CreateCategoryDto {
  name: string;
}

export class UpdateCategoryDto {
  name?: string;
  password?: string;
  private?: boolean;
}
export type CategoryType = 'category' | 'column';
