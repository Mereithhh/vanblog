import { Injectable, Logger } from '@nestjs/common';
import { StaticType, StoragePath } from 'src/types/setting.dto';
import * as fs from 'fs';
import * as path from 'path';
import { config } from 'src/config';
import { imageSize } from 'image-size';
import { formatBytes } from 'src/utils/size';
import { PicGo } from 'picgo';
import { ImgMeta } from 'src/types/img';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SettingDocument } from 'src/scheme/setting.schema';
@Injectable()
export class PicgoProvider {
  picgo: PicGo;
  logger = new Logger(PicgoProvider.name);
  constructor(
    @InjectModel('Setting')
    private settingModel: Model<SettingDocument>,
  ) {
    this.picgo = new PicGo();
    this.initDriver();
  }
  async getSetting(): Promise<any> {
    const res = await this.settingModel.findOne({ type: 'static' }).exec();
    if (res) {
      return res?.value || { storageType: 'local', picgoConfig: null };
    }
    return null;
  }
  async initDriver() {
    const staticSetting = await this.getSetting();
    const picgoConfig = staticSetting?.picgoConfig;
    const plugins = staticSetting?.picgoPlugins;
    if (picgoConfig) {
      this.picgo.setConfig(picgoConfig);
    }
    if (plugins) {
      this.installPlugins(plugins.split(','));
    }
  }
  async installPlugins(plugins: string[]) {
    if (plugins && plugins.length > 0) {
      this.logger.log(`尝试安装 picgo 插件：${plugins}`);
      const res = this.picgo.pluginHandler.install(plugins);
      res.then((result) => {
        if (result.success) {
          this.logger.log(`picgo 安装插件成功！${result.body}`);
        } else {
          this.logger.error(`picgo 插件安装失败！${result.body}`);
        }
      });
    }
  }
  async saveFile(fileName: string, buffer: Buffer, type: StaticType) {
    const result = imageSize(buffer);
    const byteLength = buffer.byteLength;

    const meta: ImgMeta = { ...result, size: formatBytes(byteLength) };
    // 搞一个临时的
    const srcPath = path.join(config.staticPath, 'tmp', fileName);
    fs.writeFileSync(srcPath, buffer);
    let realPath = undefined;
    try {
      const res = await this.picgo.upload([srcPath]);
      realPath = res[0].imgUrl;
    } catch (err) {
      throw err;
    } finally {
      try {
        fs.rmSync(srcPath);
      } catch (err) {
        // console.log(err);
      }
    }
    return {
      meta,
      realPath,
    };
  }
  async deleteFile(fileName: string, type: StaticType) {
    const storagePath = StoragePath[type] || StoragePath['img'];
    const srcPath = path.join(config.staticPath, storagePath, fileName);
    fs.rmSync(srcPath);
  }
}
