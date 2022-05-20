export class CreateArticleDto {
  title: string;
  content?: string;
  tags?: string;
  category: string;
  hiden?: boolean;
  private?: boolean;
  password?: string;
  desc: string;
}
export class UpdateArticleDto {
  title?: string;
  content?: string;
  tags?: string;
  category?: string;
  hiden?: boolean;
  private?: boolean;
  password?: string;
  desc?: string;
}
