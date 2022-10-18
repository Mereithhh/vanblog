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
import { defaultMenu } from 'src/types/menu.dto';
import { CacheProvider } from '../cache/cache.provider';
import fs from 'fs';
import path from 'path';
import { config } from 'src/config';
import { WebsiteProvider } from '../website/website.provider';
@Injectable()
export class InitProvider {
  logger = new Logger(InitProvider.name);
  constructor(
    @InjectModel('Meta') private metaModel: Model<MetaDocument>,
    @InjectModel('User') private userModel: Model<UserDocument>,
    private readonly walineProvider: WalineProvider,
    private readonly settingProvider: SettingProvider,
    private readonly cacheProvider: CacheProvider,
    private readonly websiteProvider: WebsiteProvider,
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
      await this.settingProvider.updateMenuSetting({ data: defaultMenu });
      // 运行 waline
      this.walineProvider.init();
      // 重启前台
      this.websiteProvider.restart('初始化');
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
  async initRestoreKey() {
    const key = makeSalt();
    await this.cacheProvider.set('restoreKey', key);
    const filePath = path.join('/var/log/', 'restore.key');
    try {
      fs.writeFileSync(filePath, key, { encoding: 'utf-8' });
    } catch (err) {
      this.logger.error('写入恢复密钥到文件失败！');
    }
    this.logger.warn(
      `忘记密码恢复密钥为： ${key}\n 注意此密钥也会同时写入到日志目录中的 restore.key 文件中，每次重启 vanblog 或老密钥被使用时都会重新生成此密钥`,
    );
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
