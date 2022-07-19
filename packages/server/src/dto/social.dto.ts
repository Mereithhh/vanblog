export type SocialType =
  | 'bilibili'
  | 'email'
  | 'github'
  | 'wechat'
  | 'wechat-dark';
export class SocialItem {
  updatedAt: Date;
  value: string;
  type: SocialType;
}
export class SocialDto {
  value: string;
  type: SocialType;
}
