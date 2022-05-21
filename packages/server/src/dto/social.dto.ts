export type SocialType = 'bilibili' | 'email' | 'github' | 'wechat';
export class SocialItem {
  updatedAt: Date;
  value: string;
  type: SocialType;
}
