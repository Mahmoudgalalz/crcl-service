import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { AuthModule } from './shared/auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './shared/auth/auth.guard';
import { RolesGuard } from './shared/auth/roles.guard';
import { AdminModule } from './services/admin/admin.module';
import { UsersManagmentModule } from './services/users-management/user-management.module';
import { EventsManagementModule } from './services/event-management/events.module';
import { UploadModule } from './shared/upload/upload.module';
import { NewspaperModule } from './services/newspaper/newspaper.module';

@Module({
  imports: [
    AuthModule,
    AdminModule,
    UsersManagmentModule,
    EventsManagementModule,
    UploadModule,
    NewspaperModule,
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
  ],
})
export class AppModule {}
