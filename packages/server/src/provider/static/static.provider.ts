import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SearchStaticOption, StaticType } from 'src/dto/setting.dto';
import { Static, StaticDocument } from 'src/scheme/static.schema';
import { encryptFileMD5 } from 'src/utils/crypto';
import { SettingProvider } from '../setting/setting.provider';
import { LocalProvider } from './local.provider';
import { PicgoProvider } from './picgo.provider';

@Injectable()
export class StaticProvider {
  constructor(
    @InjectModel('Static')
    private staticModel: Model<StaticDocument>,
    private readonly settingProvider: SettingProvider,
    private readonly localProvider: LocalProvider,
    private readonly picgoProvider: PicgoProvider,
  ) {}
  publicView = {
    _id: 0,
  };
  adminView = undefined;
  getView(view: 'admin' | 'public') {
    if (view == 'admin') {
      return this.adminView;
    }
    return this.publicView;
  }
  async upload(file: any, type: StaticType) {
    const { buffer } = file;

    const currentSign = encryptFileMD5(buffer);
    const hasPicture = await this.getOneBySign(currentSign);

    if (hasPicture) {
      return {
        src: hasPicture.realPath,
        isNew: false,
      };
    }

    const arr = file.originalname.split('.');
    const fileType = arr[arr.length - 1];
    const fileName = currentSign + '.' + file.originalname;
    const realPath = await this.saveFile(
      fileType,
      fileName,
      buffer,
      type,
      currentSign,
    );
    if (!realPath) {
      throw new HttpException('上传失败', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return {
      src: realPath,
      isNew: true,
    };
  }
  async saveFile(
    fileType: string,
    fileName: string,
    buffer: Buffer,
    type: StaticType,
    sign: string,
  ) {
    const storageSetting = await this.settingProvider.getStaticSetting();
    const storageType = storageSetting?.storageType || 'local';
    switch (storageType) {
      case 'local':
        const { realPath, meta } = await this.localProvider.saveFile(
          fileName,
          buffer,
          type,
        );
        await this.createInDB({
          fileType: meta?.type || fileType,
          staticType: type,
          storageType: storageType,
          sign,
          name: fileName,
          realPath,
          meta,
        });
        return realPath;
      case 'picgo':
        const picgoRes = await this.picgoProvider.saveFile(
          fileName,
          buffer,
          type,
        );
        await this.createInDB({
          fileType: picgoRes.meta?.type || fileType,
          staticType: type,
          storageType: storageType,
          sign,
          name: fileName,
          realPath: picgoRes.realPath,
          meta: picgoRes.meta,
        });
        return picgoRes.realPath;
    }
  }
  async createInDB(dto: Partial<Static>) {
    const newModal = new this.staticModel(dto);
    return await newModal.save();
  }
  async getOneBySign(sign: string) {
    return await this.staticModel.findOne({ sign }).exec();
  }
  async getAll(type: StaticType, view: 'admin' | 'public') {
    return await this.staticModel
      .find({ staticType: type }, this.getView(view))
      .exec();
  }
  async getByOption(option: SearchStaticOption) {
    const query: any = {};
    if (option.staticType) {
      query.staticType = option.staticType;
    }
    const total = await this.staticModel.count(query);
    const items = await this.staticModel
      .find(query, this.getView(option.view))
      .sort({ updatedAt: -1 })
      .limit(option.pageSize)
      .skip(option.page * option.pageSize - option.pageSize);
    return {
      total,
      data: items,
    };
  }
  async deleteOneBySign(sign: string) {
    // 先删除实际上的。
    const toDeleteData = await this.staticModel.findOne({ sign }).exec();
    const storageType = toDeleteData.storageType;
    switch (storageType) {
      case 'local':
        await this.localProvider.deleteFile(
          toDeleteData.name,
          toDeleteData.staticType,
        );
        break;
      case 'picgo':
        console.log('实际上只删了数据库，网盘上还有的。');
    }
    return await this.staticModel.deleteOne({ sign }).exec();
  }
  async deleteAllIMG() {
    // 调试用的
    const all = await this.getAll('img', 'admin');
    for (const each of all) {
      await this.deleteOneBySign(each.sign);
    }
  }
}
