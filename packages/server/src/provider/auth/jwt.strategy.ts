import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { MetaProvider } from '../meta/meta.provider';
import { UserProvider } from '../user/user.provider';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly userProvider: UserProvider,
    private readonly metaProvider: MetaProvider,
  ) {
    super({
      // 获取请求header token值
      jwtFromRequest: ExtractJwt.fromHeader('token'),
      // 从 initJwtSecret 获取 jwt 密钥
      secretOrKey: global.jwtSecret,
    });
  }

  async validate(payload: any): Promise<any> {
    //payload：jwt-passport认证jwt通过后解码的结果
    // 权限需要在库里查最新的，不然用老的 token 解码获得权限还是可以用。
    const moreDto = { ...payload };
    if (payload.sub != 0) {
      const user = await this.userProvider.getCollaboratorById(payload.sub);
      moreDto.permissions = user.permissions;
      moreDto.nickname = user.nickname;
    } else {
      const user = await this.userProvider.getUser();
      const siteInfo = await this.metaProvider.getSiteInfo();
      const authorName = siteInfo.author;
      moreDto.nickname = authorName || user.nickname;
    }
    return { name: payload.username, id: payload.sub, ...moreDto };
  }
}
