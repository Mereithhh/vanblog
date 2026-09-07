import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import {
  applyNoStoreCacheHeaders,
  isAdminNoStorePath,
  pathFromRequest,
} from 'src/utils/cacheControl';

@Injectable()
export class NoStoreCacheMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    if (isAdminNoStorePath(pathFromRequest(req))) {
      applyNoStoreCacheHeaders(res);
    }
    next();
  }
}
