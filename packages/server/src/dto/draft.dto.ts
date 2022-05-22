export class CreateDraftDto {
  title: string;
  content?: string;
  tags?: string;
  category: string;
  desc: string;
}
export class UpdateDraftDto {
  title?: string;
  content?: string;
  tags?: string;
  category?: string;
  desc?: string;
}
