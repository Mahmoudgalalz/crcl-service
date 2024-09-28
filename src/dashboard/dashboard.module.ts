import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { PrismaService } from 'src/prisma.service';
import { SuperUserAuthGuard } from 'src/shared/auth/guards';
import { AdminModule } from './admin/admin.module';
import { JwtService } from '@nestjs/jwt';
import { AdminService } from './admin/admin.service';

@Module({
  imports: [AdminModule],
  providers: [
    PrismaService,
    AdminService,
    JwtService,
    {
      provide: APP_GUARD,
      useClass: SuperUserAuthGuard,
    },
  ],
})
export class DashboardModule {}
