export type SocialType = 'bilibili' | 'email' | 'github' | 'wechat';
export class SocialItem {
  createdAt: Date;
  updatedAt: Date;
  value: string;
  type: SocialType;
}
