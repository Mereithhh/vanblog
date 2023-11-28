import { Injectable, Logger } from '@nestjs/common';

import { TokenDocument } from 'src/scheme/token.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { SettingProvider } from '../setting/setting.provider';

@Injectable()
export class TokenProvider {
  logger = new Logger(TokenProvider.name);
  timer = null;
  constructor(
    @InjectModel('Token') private tokenModel: Model<TokenDocument>,
    private readonly jwtService: JwtService,
    private readonly settingProvider: SettingProvider,
  ) {}

  async getAllAPIToken() {
    this.logger.log(`获取所有 API Token`);
    return await this.tokenModel.find({ userId: 666666, disabled: false }).exec();
  }

  async disableAPIToken(token: string) {
    return await this.tokenModel.updateOne({ token }, { disabled: true });
  }
  async disableAPITokenByName(name: string) {
    return await this.tokenModel.updateOne({ name }, { disabled: true });
  }
  async disableAPITokenById(id: string) {
    return await this.tokenModel.updateOne({ _id: id }, { disabled: true });
  }

  async createAPIToken(name: string) {
    this.logger.log(`创建 API Token`);
    // 100年过期
    const expiresIn = 3600 * 24 * 365 * 100;
    const token = this.jwtService.sign(
      {
        sub: 0,
        username: name,
        role: 'admin',
      },
      {
        expiresIn,
      },
    );
    // 默认666666是 api token
    this.tokenModel.create({ userId: 666666, name, token, expiresIn });
    return token;
  }

  async createToken(payload: any) {
    this.logger.debug(`用户 ${payload.username} 登录，创建 Token。`);
    const loginSetting = await this.settingProvider.getLoginSetting();
    const expiresIn = loginSetting?.expiresIn || 3600 * 24 * 7;
    const token = this.jwtService.sign(payload, {
      expiresIn,
    });
    this.tokenModel.create({ userId: payload.sub, token, expiresIn });
    return token;
  }
  async disableToken(token: string) {
    return await this.tokenModel.updateOne({ token }, { disabled: true });
  }
  async disableAll() {
    return await this.tokenModel.updateMany({ disabled: false }, { disabled: true });
  }
  async disableAllAdmin() {
    return await this.tokenModel.updateMany({ disabled: false, userId: 0 }, { disabled: true });
  }
  async disableAllCollaborator() {
    return await this.tokenModel.updateMany(
      { disabled: false, userId: { $ne: 0 } },
      { disabled: true },
    );
  }
  async disableByUserId(id: number) {
    return await this.tokenModel.updateMany({ disabled: false, userId: id }, { disabled: true });
  }
  async checkToken(token: string) {
    const result = await this.tokenModel.findOne({ token, disabled: false });
    if (!result) {
      return false;
    }
    return true;
  }
}
