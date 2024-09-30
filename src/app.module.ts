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
import { PrismaService } from './prisma.service';
import { AuthModule } from './shared/auth/auth.module';

@Module({
  imports: [
    AuthModule,
    DashboardModule,
    // MobileModule,
    RouterModule.register([
      {
        path: 'dashboard',
        module: DashboardModule,
      },
      // {
      //   path: 'mobile',
      //   module: MobileModule,
      // },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RouteRedirectMiddleware)
      .exclude({ path: 'auth', method: RequestMethod.ALL })
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
