import { Injectable } from '@nestjs/common';
import { StaticType, StoragePath } from 'src/dto/setting.dto';
import * as fs from 'fs';
import * as path from 'path';
import { config } from 'src/config';
import { imageSize } from 'image-size';
@Injectable()
export class LocalProvider {
  async saveFile(fileName: string, buffer: Buffer, type: StaticType) {
    const storagePath = StoragePath[type] || StoragePath['img'];
    const srcPath = path.join(config.staticPath, storagePath, fileName);
    const result = imageSize(buffer);

    fs.writeFileSync(srcPath, buffer);
    return {
      meta: result,
      realPath: srcPath,
    };
  }
  async deleteFile(fileName: string, type: StaticType) {
    const storagePath = StoragePath[type] || StoragePath['img'];
    const srcPath = path.join(config.staticPath, storagePath, fileName);
    fs.rmSync(srcPath);
  }
}
