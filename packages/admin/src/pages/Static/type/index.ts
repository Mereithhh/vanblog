export interface StaticItem {
  storageType: StorageType;
  fileType: string;
  realPath: string;
  meta: any;
  name: string;
  sign: string;
}
export type StorageType = 'local';
