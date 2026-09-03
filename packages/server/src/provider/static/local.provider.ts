import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { StaticType, StoragePath } from 'src/types/setting.dto';
import * as fs from 'fs';
import * as path from 'path';
import { config } from 'src/config';
import { imageSize } from 'image-size';
import { formatBytes } from 'src/utils/size';
import { ImgMeta } from 'src/types/img';
import { isProd } from 'src/utils/isProd';
import compressing from 'compressing';
import dayjs from 'dayjs';
import { checkOrCreate, checkOrCreateByFilePath } from 'src/utils/checkFolder';
import { rmDir } from 'src/utils/deleteFolder';
import { readDirs } from 'src/utils/readFileList';
import { checkOrCreateFile } from 'src/utils/checkFile';
import { normalizeCustomPageRel, resolveCustomPageAbs } from 'src/utils/customPagePath';
@Injectable()
export class LocalProvider {
  async saveFile(fileName: string, buffer: Buffer, type: StaticType, toRootPath?: boolean) {
    if (type == 'img') {
      return await this.saveImg(fileName, buffer, type, toRootPath);
    } else if (type == 'customPage') {
      const storagePath = StoragePath[type];
      const realName = normalizeCustomPageRel(fileName);
      const srcPath = resolveCustomPageAbs(fileName);
      const byteLength = buffer.byteLength;
      const realPath = `/static/${storagePath}/${realName}`;
      checkOrCreateByFilePath(srcPath);
      fs.writeFileSync(srcPath, buffer);
      const meta = { size: formatBytes(byteLength) };
      return {
        meta,
        realPath,
      };
    }
  }

  async getFolderFiles(p: string) {
    const absPath = resolveCustomPageAbs(p);
    return readDirs(absPath, absPath);
  }
  async createFile(p: string, subPath: string) {
    checkOrCreateFile(resolveCustomPageAbs(p, subPath));
  }
  async createFolder(p: string, subPath: string) {
    checkOrCreate(resolveCustomPageAbs(p, subPath));
  }
  async getFileContent(p: string, subPath: string) {
    return fs.readFileSync(resolveCustomPageAbs(p, subPath), { encoding: 'utf-8' });
  }
  async updateCustomPageFileContent(pathname: string, filePath: string, content: string) {
    fs.writeFileSync(resolveCustomPageAbs(pathname, filePath), content, { encoding: 'utf-8' });
  }
  async deleteCustomPageFile(pathname: string, filePath: string) {
    const absPath = resolveCustomPageAbs(pathname, filePath);
    if (!fs.existsSync(absPath) || !fs.statSync(absPath).isFile()) {
      throw new HttpException('文件不存在', HttpStatus.NOT_FOUND);
    }
    fs.rmSync(absPath);
  }

  async saveImg(fileName: string, buffer: Buffer, type: StaticType, toRootPath?: boolean) {
    const storagePath = StoragePath[type] || StoragePath['img'];
    const srcPath = path.join(config.staticPath, storagePath, fileName);
    let realPath = `/static/${type}/${fileName}`;

    if (isProd()) {
      if (toRootPath) {
        realPath = `/${fileName}`;
      }
    }
    const result = imageSize(buffer);
    const byteLength = buffer.byteLength;

    fs.writeFileSync(srcPath, buffer);
    const meta: ImgMeta = { ...result, size: formatBytes(byteLength) };
    return {
      meta,
      realPath,
    };
  }

  async deleteCustomPageFolder(name: string) {
    const storagePath = StoragePath['customPage'];
    const srcPath = path.join(config.staticPath, storagePath, name);
    try {
      rmDir(srcPath);
    } catch (err) {
      console.log('删除实际文件夹失败：', name);
    }
  }

  async deleteFile(fileName: string, type: StaticType) {
    try {
      const storagePath = StoragePath[type] || StoragePath['img'];
      const srcPath = path.join(config.staticPath, storagePath, fileName);
      fs.rmSync(srcPath);
    } catch (err) {
      console.log('删除实际文件失败：', fileName, '可能是更新版本后没映射静态文件目录导致的');
    }
  }
  async exportAllImg() {
    const src = path.join(config.staticPath, 'img');
    const dst = path.join(
      config.staticPath,
      'export',
      `export-img-${dayjs().format('YYYY-MM-DD')}.zip`,
    );
    const dstSrc = `/static/export/export-img-${dayjs().format('YYYY-MM-DD')}.zip`;

    const compressPromise = new Promise((resolve, reject) => {
      compressing.zip
        .compressDir(src, dst)
        .then((v) => {
          resolve(v);
        })
        .catch((e) => {
          reject(e);
        });
    });
    try {
      const r = await Promise.all([compressPromise]);
      console.log(r);
      return {
        success: true,
        path: dstSrc,
      };
    } catch (err) {
      console.log(err);
      return {
        success: false,
        error: err,
      };
    }
  }
}
