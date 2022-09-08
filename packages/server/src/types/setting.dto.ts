import { MenuItem } from './menu.dto';

export type SettingType =
  | 'static'
  | 'https'
  | 'waline'
  | 'layout'
  | 'login'
  | 'menu'
  | 'version';
export type SettingValue =
  | StaticSetting
  | HttpsSetting
  | WalineSetting
  | LayoutSetting
  | VersionSetting;

export interface MenuSetting {
  data: MenuItem[];
}

export type StorageType = 'picgo' | 'local';
export type StaticType = 'img';
export interface LoginSetting {
  enableMaxLoginRetry: boolean;
  maxRetryTimes: number;
  durationSeconds: number;
}
export interface VersionSetting {
  version: string;
}

// export interface ScriptItem {
//   type: 'code' | 'link';
//   value: string;
// }

export interface LayoutSetting {
  customScripts: string;
  customHtml: string;
  customCSS: string;
}

export interface WalineSetting {
  'smtp.enabled': boolean;
  'smtp.port': number;
  'smtp.host': string;
  'smtp.user': string;
  'smtp.password': string;
  'sender.name': string;
  'sender.email': string;
  authorEmail: string;
  webhook?: string;
  forceLoginComment: boolean;
}

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
