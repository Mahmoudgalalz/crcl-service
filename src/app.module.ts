import { Global, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { AuthModule } from './shared/auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './shared/auth/auth.guard';
import { RolesGuard } from './shared/auth/roles.guard';
import { NewspaperModule } from 'src/services/newspaper/newspaper.module';
import { UsersManagmentModule } from './services/users-management/user-management.module';
import { EventsManagementModule } from './services/event-management/events.module';
import { UploadModule } from './shared/upload/upload.module';
import Redis from 'ioredis';
import { ClientModule } from './client/consumer/client.module';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './client/user.module';
import { AnalyticsModule } from './services/analytics/analytics.module';
import { BoothModule } from './services/booth/booth.module';
import { PaymentModule } from './services/payment/payment.module';
import { NotificationsModule } from './services/notification/notification.module';
import { ScheduleModule } from '@nestjs/schedule';
import { CronModule } from './shared/cron/cron.module';
import { BullModule } from '@nestjs/bull';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { EmailModule } from './services/email/email.module';
import { InvitationsModule } from './services/invitations/invitations.module';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    CronModule,
    AuthModule,
    EventEmitterModule.forRoot(),
    BullModule.forRoot({
      redis: {
        port: 6379,
        host: 'localhost',
      },
    }),
    NewspaperModule,
    EmailModule,
    InvitationsModule,
    UsersManagmentModule,
    EventsManagementModule,
    UploadModule,
    ClientModule,
    AnalyticsModule,
    BoothModule,
    UserModule,
    PaymentModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    PrismaService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: 'REDIS_CLIENT',
      useFactory: async () => {
        const redis = new Redis({
          host: 'localhost',
          port: 6379,
        });
        return redis;
      },
    },
  ],
  exports: ['REDIS_CLIENT'],
})
export class AppModule {}
