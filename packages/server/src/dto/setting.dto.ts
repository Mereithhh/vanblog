import { config } from 'src/config';

export type SettingType = 'static';
export type SettingValue = StaticSetting;
export type StorageType = 'picgo' | 'local';
export type StaticType = 'img';
export interface SearchStaticOption {
  staticType: StaticType;
  page: number;
  pageSize: number;
  view: 'admin' | 'public';
}
export const StoragePath: Record<StaticType, string> = {
  img: `img`,
};
export class StaticSetting {
  storageType: StorageType;
}
