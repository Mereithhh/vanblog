import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/scheme/user.schema';
import { UserProvider } from '../user/user.provider';

@Injectable()
export class AuthProvider {
  constructor(
    private readonly usersService: UserProvider,
    private readonly jwtService: JwtService,
  ) {}
  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.getUser();
    if (user && user.password === pass && user.name === username) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { username: user.name, sub: user.id };
    if (user._doc) {
      payload.username = user._doc.name;
      payload.sub = user._doc.id;
    }
    return {
      token: this.jwtService.sign(payload),
      user: {
        name: payload.username,
        id: payload.sub,
      },
    };
  }
}
