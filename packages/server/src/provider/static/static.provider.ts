import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SearchStaticOption, StaticType } from 'src/dto/setting.dto';
import { Static, StaticDocument } from 'src/scheme/static.schema';
import { encryptFileMD5 } from 'src/utils/crypto';
import { SettingProvider } from '../setting/setting.provider';
import { LocalProvider } from './local.provider';

@Injectable()
export class StaticProvider {
  constructor(
    @InjectModel('Static')
    private staticModel: Model<StaticDocument>,
    private readonly settingProvider: SettingProvider,
    private readonly localProvider: LocalProvider,
  ) {}
  publicView = {
    _id: 0,
    realPath: 0,
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
        src: `${type}/${hasPicture.name}`,
        isNew: false,
      };
    }

    const arr = file.originalname.split('.');
    const fileType = arr[arr.length - 1];
    const fileName = currentSign + '.' + file.originalname;
    await this.saveFile(fileType, fileName, buffer, type, currentSign);
    return {
      src: `${type}/${fileName}`,
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
          fileType: fileType,
          staticType: type,
          storageType: storageType,
          sign,
          name: fileName,
          realPath,
          meta,
        });
        break;
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
    }
    return await this.staticModel.deleteOne({ sign }).exec();
  }
}
