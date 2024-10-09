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
@Global()
@Module({
  imports: [
    AuthModule,
    NewspaperModule,
    UsersManagmentModule,
    EventsManagementModule,
    UploadModule,
    ClientModule,
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
