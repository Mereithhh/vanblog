import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { User } from '../../scheme/user.schema';
import { AuthProvider } from './auth.provider';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authProvider: AuthProvider) {
    super();
    this.authProvider = authProvider;
  }

  async validate(username: string, password: string): Promise<User> {
    const user = await this.authProvider.validateUser(username, password);
    if (user) return user;
    else throw new UnauthorizedException('incorrect username or password');
  }
}
