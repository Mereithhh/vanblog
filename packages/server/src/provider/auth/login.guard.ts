import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import dayjs from 'dayjs';
import { Request } from 'express';
import { CacheProvider } from '../cache/cache.provider';
import { getNetIp } from '../log/utils';
import { SettingProvider } from '../setting/setting.provider';

@Injectable()
export class LoginGuard implements CanActivate {
  logger = new Logger(LoginGuard.name);
  constructor(
    private cacheProvider: CacheProvider,
    private settingProvider: SettingProvider,
  ) {}
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    return await this.validateRequest(request);
  }
  async validateRequest(request: Request) {
    const loginSetting = await this.settingProvider.getLoginSetting();
    if (!loginSetting) {
      return true;
    } else {
      const { enableMaxLoginRetry } = loginSetting || {};
      if (!enableMaxLoginRetry) {
        return true;
      }
    }
    const { ip } = await getNetIp(request);
    if (ip.trim() == '') {
      // 获取不到 ip 就当你🐂吧
      return true;
    }
    const key = `login-${ip.trim()}`;
    const { count, lastLoginTime } = this.cacheProvider.get(key);

    if (!lastLoginTime) {
      this.cacheProvider.set(key, {
        count: 1,
        lastLoginTime: new Date(),
      });
    } else {
      const now = dayjs();
      const diff = now.diff(dayjs(lastLoginTime), 'seconds');
      if (diff > 60) {
        this.cacheProvider.set(key, {
          count: 1,
          lastLoginTime: new Date(),
        });
      } else {
        if (count >= 3) {
          this.logger.warn(
            `登录频繁失败检测触发\nip: ${ip}\ncount: ${count}\nlastLoginTime: ${lastLoginTime}\ndiff: ${diff}`,
          );
          this.cacheProvider.set(key, {
            count: count + 1,
            lastLoginTime: new Date(),
          });
          throw new UnauthorizedException({
            statusCode: 401,
            message: '错误次数过多！请一分钟之后再试！',
          });
        } else {
          this.cacheProvider.set(key, {
            count: count + 1,
            lastLoginTime: new Date(),
          });
        }
      }
    }
    return true;
  }
}
