import { SiteInfo } from './site.dto';

export class InitDto {
  user: {
    username: string;
    password: string;
  };
  siteInfo: SiteInfo;
}
