import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { InitDto } from 'src/types/init.dto';
import { MetaDocument } from 'src/scheme/meta.schema';
import { UserDocument } from 'src/scheme/user.schema';
import { WalineProvider } from '../waline/waline.provider';
import { SettingProvider } from '../setting/setting.provider';
import { version } from '../../utils/loadConfig';
import { encryptPassword, makeSalt } from 'src/utils/crypto';

@Injectable()
export class InitProvider {
  logger = new Logger(InitProvider.name);
  constructor(
    @InjectModel('Meta') private metaModel: Model<MetaDocument>,
    @InjectModel('User') private userModel: Model<UserDocument>,
    private readonly walineProvider: WalineProvider,
    private readonly settingProvider: SettingProvider,
  ) {}

  async init(initDto: InitDto) {
    const { user, siteInfo } = initDto;
    let toUpdateDto = siteInfo;
    if (!siteInfo.since) {
      toUpdateDto = { ...siteInfo, since: new Date() };
    }
    try {
      const salt = makeSalt();
      await this.userModel.create({
        id: 0,
        name: user.username,
        password: encryptPassword(user.username, user.password, salt),
        mickname: user?.nickname || user.username,
        type: 'admin',
        salt,
      });
      await this.metaModel.create({
        siteInfo: toUpdateDto,
        links: [],
        socials: [],
        rewards: [],
        about: {
          updatedAt: new Date(),
          content: '',
        },
        categories: [],
      });
      // 运行 waline
      this.walineProvider.init();
      return '初始化成功!';
    } catch (err) {
      throw new BadRequestException('初始化失败');
    }
  }

  async checkHasInited() {
    const user = await this.userModel.findOne({}).exec();
    if (!user) {
      return false;
    }
    return true;
  }
  async initVersion() {
    if (!version || version == 'dev') {
      this.logger.debug('开发版本');
      return;
    }
    try {
      const versionSetting = await this.settingProvider.getVersionSetting();
      if (!versionSetting || !versionSetting?.version) {
        // 没有版本信息，加进去
        await this.settingProvider.updateVersionSetting({
          version: version,
        });
      } else {
        // TODO 后面这里会判断版本执行一些版本迁移的数据清洗脚本
        await this.settingProvider.updateVersionSetting({
          version,
        });
      }
    } catch (err) {
      this.logger.error(`初始化版本信息失败: ${JSON.stringify(err, null, 2)}`);
    }
  }
}
