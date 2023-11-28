import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  HttpsSetting,
  ISRSetting,
  LayoutSetting,
  LoginSetting,
  MenuSetting,
  StaticSetting,
  VersionSetting,
  WalineSetting,
  defaultStaticSetting,
} from 'src/types/setting.dto';
import { SettingDocument } from 'src/scheme/setting.schema';
import { PicgoProvider } from '../static/picgo.provider';
import { encode } from 'js-base64';
import { defaultMenu, MenuItem } from 'src/types/menu.dto';
import { MetaProvider } from '../meta/meta.provider';
import { parseHtmlToHeadTagArr } from 'src/utils/htmlParser';
@Injectable()
export class SettingProvider {
  logger = new Logger(SettingProvider.name);
  constructor(
    @InjectModel('Setting')
    private settingModel: Model<SettingDocument>,
    private readonly picgoProvider: PicgoProvider,
    private readonly metaProvider: MetaProvider,
  ) {}
  async getStaticSetting(): Promise<Partial<StaticSetting>> {
    const res = (await this.settingModel.findOne({ type: 'static' }).exec()) as {
      value: StaticSetting;
    };
    if (res) {
      return res?.value || defaultStaticSetting;
    } else {
      await this.settingModel.create({
        type: 'static',
        value: defaultStaticSetting,
      });
      return defaultStaticSetting;
    }
  }
  async getVersionSetting(): Promise<any> {
    const res = await this.settingModel.findOne({ type: 'version' }).exec();
    if (res) {
      return res?.value;
    }
    return null;
  }
  async getISRSetting(): Promise<any> {
    const res = await this.settingModel.findOne({ type: 'isr' }).exec();
    if (res) {
      return res?.value;
    } else {
      await this.settingModel.create({
        type: 'isr',
        value: {
          mode: 'onDemand',
        },
      });
      return {
        mode: 'onDemand',
      };
    }
  }
  async updateISRSetting(dto: ISRSetting) {
    const oldValue = await this.getISRSetting();
    const newValue = { ...oldValue, ...dto };
    if (!oldValue) {
      return await this.settingModel.create({
        type: 'isr',
        value: newValue,
      });
    }
    const res = await this.settingModel.updateOne({ type: 'isr' }, { value: newValue });
    return res;
  }
  async getMenuSetting(): Promise<any> {
    const res = await this.settingModel.findOne({ type: 'menu' }).exec();
    if (res) {
      return res?.value;
    }
    return null;
  }
  async updateMenuSetting(dto: MenuSetting) {
    const oldValue = await this.getMenuSetting();
    const newValue = { ...oldValue, ...dto };
    if (!oldValue) {
      return await this.settingModel.create({
        type: 'menu',
        value: newValue,
      });
    }
    const res = await this.settingModel.updateOne({ type: 'menu' }, { value: newValue });
    return res;
  }
  async importSetting(setting: any) {
    for (const [k, v] of Object.entries(setting)) {
      if (k == 'static') {
        await this.importStaticSetting(v as any);
      }
    }
  }
  async importStaticSetting(dto: StaticSetting) {
    await this.updateStaticSetting(dto);
  }
  async getHttpsSetting(): Promise<HttpsSetting> {
    const res = await this.settingModel.findOne({ type: 'https' }).exec();
    if (res) {
      return (res?.value as any) || { redirect: false };
    }
    return null;
  }
  async getLayoutSetting(): Promise<LayoutSetting> {
    const res = await this.settingModel.findOne({ type: 'layout' }).exec();
    if (res) {
      return res?.value as any;
    }
    return null;
  }
  async getLoginSetting(): Promise<LoginSetting> {
    const res = await this.settingModel.findOne({ type: 'login' }).exec();
    if (res) {
      return (
        (res?.value as any) || {
          enableMaxLoginRetry: false,
          maxRetryTimes: 3,
          durationSeconds: 60,
          expiresIn: 3600 * 24 * 7,
        }
      );
    }
    return null;
  }
  encodeLayoutSetting(dto: LayoutSetting) {
    if (!dto) {
      return null;
    }
    const res: any = {};
    for (const key of Object.keys(dto)) {
      if (key == 'head') {
        res[key] = parseHtmlToHeadTagArr(dto[key]);
      } else {
        res[key] = encode(dto[key]);
      }
    }
    return res;
  }
  async getWalineSetting(): Promise<WalineSetting> {
    const res = await this.settingModel.findOne({ type: 'waline' }).exec();
    if (res) {
      return (
        (res?.value as any) || {
          email: process.env.EMAIL || undefined,
          'smtp.enabled': false,
          forceLoginComment: false,
        }
      );
    }
    return null;
  }
  async updateLoginSetting(dto: LoginSetting) {
    const oldValue = await this.getLoginSetting();
    const newValue = { ...oldValue, ...dto };
    if (!oldValue) {
      return await this.settingModel.create({
        type: 'login',
        value: newValue,
      });
    }
    const res = await this.settingModel.updateOne({ type: 'login' }, { value: newValue });
    return res;
  }
  async updateVersionSetting(dto: VersionSetting) {
    const oldValue = await this.getVersionSetting();
    const newValue = { ...oldValue, ...dto };
    if (!oldValue) {
      return await this.settingModel.create({
        type: 'version',
        value: newValue,
      });
    }
    const res = await this.settingModel.updateOne({ type: 'version' }, { value: newValue });
    return res;
  }

  async updateWalineSetting(dto: WalineSetting) {
    const oldValue = await this.getWalineSetting();
    const newValue = { ...oldValue, ...dto };
    if (!oldValue) {
      return await this.settingModel.create({
        type: 'waline',
        value: newValue,
      });
    }
    const res = await this.settingModel.updateOne({ type: 'waline' }, { value: newValue });
    return res;
  }
  async updateLayoutSetting(dto: LayoutSetting) {
    const oldValue = await this.getLayoutSetting();
    const newValue = { ...oldValue, ...dto };
    if (!oldValue) {
      return await this.settingModel.create({
        type: 'layout',
        value: newValue,
      });
    }
    const res = await this.settingModel.updateOne({ type: 'layout' }, { value: newValue });
    return res;
  }
  async updateHttpsSetting(dto: HttpsSetting) {
    const oldValue = await this.getHttpsSetting();
    const newValue = { ...oldValue, ...dto };
    if (!oldValue) {
      return await this.settingModel.create({
        type: 'https',
        value: newValue,
      });
    }
    const res = await this.settingModel.updateOne({ type: 'https' }, { value: newValue });
    return res;
  }
  async updateStaticSetting(dto: Partial<StaticSetting>) {
    const oldValue = await this.getStaticSetting();
    const newValue = { ...oldValue, ...dto };
    if (!oldValue) {
      return await this.settingModel.create({
        type: 'static',
        value: newValue,
      });
    }
    const res = await this.settingModel.updateOne({ type: 'static' }, { value: newValue });

    await this.picgoProvider.initDriver();
    return res;
  }
  async washDefaultMenu() {
    const r = await this.settingModel.findOne({ type: 'menu' });
    if (!r) {
      // 没有的话需要清洗
      const toInsert: MenuItem[] = defaultMenu;
      const meta = await this.metaProvider.getAll();
      const oldMenus = meta.menus;
      const d = Date.now();
      oldMenus.forEach((item: any, index: number) => {
        toInsert.push({
          id: d + index,
          level: 0,
          name: item.name,
          value: item.value,
        });
      });
      await this.updateMenuSetting({ data: toInsert });
      this.logger.log('清洗老 menu 数据成功！');
    }
  }
}
