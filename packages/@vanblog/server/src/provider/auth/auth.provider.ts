import { Injectable } from '@nestjs/common';
import { TokenProvider } from '../token/token.provider';
import { UserProvider } from '../user/user.provider';

@Injectable()
export class AuthProvider {
  constructor(
    private readonly usersService: UserProvider,
    private readonly tokenProvider: TokenProvider,
  ) {}
  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.validateUser(username, pass);
    if (user) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = {
      username: user.name,
      sub: user.id,
      type: (user?._doc || user)?.type || undefined,
      nickname: (user?._doc || user)?.nickname || undefined,
      permissions: (user?._doc || user)?.permissions || undefined,
    };
    if (user._doc) {
      payload.username = user._doc.name;
      payload.sub = user._doc.id;
    }
    const token = await this.tokenProvider.createToken(payload);
    return {
      token,
      user: {
        name: payload.username,
        id: payload.sub,
        type: payload.type,
        nickname: payload.nickname,
        permissions: payload.permissions,
      },
    };
  }
}
