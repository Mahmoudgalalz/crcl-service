import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class RouteRedirectMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const clientType = req.headers['x-client-type'];

    if (clientType === 'dashboard') {
      req.url = '/dashboard' + req.url;
    } else if (clientType === 'mobile') {
      req.url = '/mobile' + req.url;
    }

    next();
  }
}
