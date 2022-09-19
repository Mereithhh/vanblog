import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { TokenProvider } from '../token/token.provider';

@Injectable()
export class TokenGuard implements CanActivate {
  logger = new Logger(TokenGuard.name);
  constructor(private readonly tokenProvider: TokenProvider) {}
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    return await this.validateRequest(request);
  }
  async validateRequest(request: Request) {
    const token = request.headers['token'];
    const ok = await this.tokenProvider.checkToken(token);
    if (!ok) {
      throw new UnauthorizedException();
    }
    return true;
  }
}
