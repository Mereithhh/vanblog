import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { InitProvider } from '../init/init.provider';

@Injectable()
export class InitMiddleware implements NestMiddleware {
  constructor(private readonly initProvider: InitProvider) {}
  use(req: Request, res: Response, next: NextFunction) {
    this.initProvider.checkHasInited().then((hasInit) => {
      if (hasInit) {
        next();
      } else {
        res.json({
          statusCode: 233,
          message: '未初始化!',
        });
      }
    });
  }
}
