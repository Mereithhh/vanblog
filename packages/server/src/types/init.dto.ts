import { SiteInfo } from './site.dto';

export class InitDto {
  user: {
    username: string;
    password: string;
    nickname: string;
  };
  siteInfo: SiteInfo;
}
