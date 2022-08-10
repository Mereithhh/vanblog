import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { StaticSetting } from 'src/dto/setting.dto';
import { SettingDocument } from 'src/scheme/setting.schema';

@Injectable()
export class SettingProvider {
  constructor(
    @InjectModel('Setting')
    private settingModel: Model<SettingDocument>,
  ) {}
  async getStaticSetting() {
    const res = await this.settingModel.findOne({ type: 'static' }).exec();
    if (res) {
      return res?.value || { storageType: 'local' };
    }
    return null;
  }
  async updateStaticSetting(dto: StaticSetting) {
    const oldValue = await this.getStaticSetting();
    const newValue = { ...oldValue, ...dto };
    if (!oldValue) {
      return await this.settingModel.create({
        type: 'static',
        value: newValue,
      });
    }
    return await this.settingModel.updateOne(
      { type: 'static' },
      { value: newValue },
    );
  }
}
