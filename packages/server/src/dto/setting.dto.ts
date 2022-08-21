export type SettingType = 'static' | 'https';
export type SettingValue = StaticSetting | HttpsSetting;
export type StorageType = 'picgo' | 'local';
export type StaticType = 'img';
export interface HttpsSetting {
  redirect: boolean;
}
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
  picgoConfig: any;
}
