export class LinkItem {
  updatedAt: Date;
  url: string;
  name: string;
  desc: string;
  logo: string;
}
export class LinkDto {
  url: string;
  name: string;
  desc: string;
  logo: string;
  /** Original 伙伴名 when renaming, so a URL name updates in place instead of inserting. */
  oldName?: string;
}
