import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { InitProvider } from '../init/init.provider';

@Injectable()
export class InitMiddleware implements NestMiddleware {
  constructor(private readonly initProvider: InitProvider) {}
  async use(req: Request, res: Response, next: NextFunction) {
    if (req.path == '/api/admin/init') {
      next();
    } else {
      const hasInit = await this.initProvider.checkHasInited();
      if (hasInit) {
        next();
      } else {
        res.json({
          statusCode: 233,
          message: '未初始化!',
          data: {
            allowDomains: process.env.VAN_BLOG_ALLOW_DOMAINS || '',
          },
        });
      }
    }
  }
}
