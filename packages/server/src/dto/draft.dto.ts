export class CreateDraftDto {
  title: string;
  content?: string;
  tags?: string[];
  category: string;
}
export class UpdateDraftDto {
  title?: string;
  content?: string;
  tags?: string[];
  category?: string;
  deleted?: boolean;
}
export class PublishDraftDto {
  hidden?: boolean;
  private?: boolean;
  password?: string;
}
