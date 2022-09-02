import { Injectable } from '@nestjs/common';
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
@Injectable()
export class LocalProvider {
  async saveFile(
    fileName: string,
    buffer: Buffer,
    type: StaticType,
    toRootPath?: boolean,
  ) {
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
  async deleteFile(fileName: string, type: StaticType) {
    try {
      const storagePath = StoragePath[type] || StoragePath['img'];
      const srcPath = path.join(config.staticPath, storagePath, fileName);
      fs.rmSync(srcPath);
    } catch (err) {
      console.log(
        '删除实际文件失败：',
        fileName,
        '可能是更新版本后没映射静态文件目录导致的',
      );
    }
  }
  async exportAllImg() {
    const src = path.join(config.staticPath, 'img');
    const dst = path.join(
      config.staticPath,
      'export',
      `export-img-${dayjs().format('YYYY-MM-DD')}.zip`,
    );
    const dstSrc = `/static/export/export-img-${dayjs().format(
      'YYYY-MM-DD',
    )}.zip`;

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
