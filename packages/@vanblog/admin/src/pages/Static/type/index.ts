export interface StaticItem {
  storageType: StorageType;
  staticType: string;
  fileType: string;
  realPath: string;
  meta: any;
  name: string;
  sign: string;
}
export type StorageType = 'local' | 'picgo';
