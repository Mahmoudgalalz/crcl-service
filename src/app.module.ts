import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DashboardModule } from './dashboard/dashboard.module';
import { MobileModule } from './mobile/mobile.module';
import { RouteRedirectMiddleware } from './shared/middleware/route.middleware';
import { RouterModule } from '@nestjs/core';

@Module({
  imports: [
    DashboardModule,
    MobileModule,
    RouterModule.register([
      {
        path: 'dashboard',
        module: DashboardModule,
      },
      {
        path: 'mobile',
        module: MobileModule,
      },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RouteRedirectMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
