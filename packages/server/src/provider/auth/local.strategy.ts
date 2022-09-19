import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { Injectable } from '@nestjs/common';
import { AuthProvider } from './auth.provider';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authProvider: AuthProvider) {
    super();
    this.authProvider = authProvider;
  }

  async validate(username: string, password: string): Promise<any> {
    const user = await this.authProvider.validateUser(username, password);
    if (user) return user;
    else {
      return { fail: true };
    }
  }
}
