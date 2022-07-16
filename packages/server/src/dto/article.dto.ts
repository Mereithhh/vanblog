export class CreateArticleDto {
  title: string;
  content?: string;
  tags?: string[];
  category: string;
  hidden?: boolean;
  private?: boolean;
  password?: string;
}
export class UpdateArticleDto {
  title?: string;
  content?: string;
  tags?: string;
  category?: string;
  hidden?: boolean;
  private?: boolean;
  password?: string;
}
