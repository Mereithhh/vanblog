import { BuiltinSocialType, CUSTOM_SOCIAL_TYPE } from 'src/utils/social';

export type SocialType = BuiltinSocialType | typeof CUSTOM_SOCIAL_TYPE | string;

export class SocialItem {
  updatedAt: Date;
  value: string;
  type: SocialType;
  label?: string;
  icon?: string;
  id?: string;
}

export class SocialDto {
  value: string;
  type: SocialType;
  label?: string;
  icon?: string;
  id?: string;
}
