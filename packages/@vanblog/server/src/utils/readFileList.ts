import * as fs from 'fs';
import * as path from 'path';
import { checkOrCreate } from './checkFolder';
enum FileType {
  'directory',
  'file',
}

interface IFile {
  title: string;
  key: string;
  type: 'directory' | 'file';
  parent: string;
  mtime: number;
  children?: IFile[];
}

export function dirSort(a: IFile, b: IFile) {
  if (a.type !== b.type) return FileType[a.type] < FileType[b.type] ? -1 : 1;
  else if (a.mtime !== b.mtime) return a.mtime > b.mtime ? -1 : 1;
}
export function readDirs(dir: string, baseDir = '', blacklist: string[] = []) {
  const relativePath = path.relative(baseDir, dir);
  checkOrCreate(dir);
  const files = fs.readdirSync(dir);
  const result: any = files
    .filter((x) => !blacklist.includes(x))
    .map((file: string) => {
      const subPath = path.join(dir, file);
      const stats = fs.statSync(subPath);
      const key = path.join(relativePath, file);
      if (stats.isDirectory()) {
        return {
          title: file,
          key,
          type: 'directory',
          parent: relativePath,
          mtime: stats.mtime.getTime(),
          children: readDirs(subPath, baseDir).sort(dirSort),
        };
      }
      return {
        title: file,
        type: 'file',
        isLeaf: true,
        key,
        parent: relativePath,
        mtime: stats.mtime.getTime(),
      };
    });
  return result.sort(dirSort);
}

export function readDir(dir: string, baseDir = '', blacklist: string[] = []) {
  const relativePath = path.relative(baseDir, dir);
  const files = fs.readdirSync(dir);
  const result: any = files
    .filter((x) => !blacklist.includes(x))
    .map((file: string) => {
      const subPath = path.join(dir, file);
      const stats = fs.statSync(subPath);
      const key = path.join(relativePath, file);
      return {
        title: file,
        type: stats.isDirectory() ? 'directory' : 'file',
        key,
        parent: relativePath,
      };
    });
  return result;
}
