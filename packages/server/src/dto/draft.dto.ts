export class CreateDraftDto {
  title: string;
  content?: string;
  tags?: string;
  category: string;
}
export class UpdateDraftDto {
  title?: string;
  content?: string;
  tags?: string;
  category?: string;
}
export class PublishDraftDto {
  hiden?: boolean;
  private?: boolean;
  password?: string;
}
