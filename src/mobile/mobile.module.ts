import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma.service';
import { UserAuthGuard } from 'src/shared/auth/guards';
import { UserModule } from './user/user.module';

@Module({
  providers: [
    PrismaService,
    JwtService,
    UserModule,
    {
      provide: APP_GUARD,
      useClass: UserAuthGuard,
    },
  ],
})
export class MobileModule {}
