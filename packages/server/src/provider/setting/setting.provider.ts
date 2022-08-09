import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
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
      return res.value;
    }
    return null;
  }
}
