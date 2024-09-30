import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { SuperUserAuthGuard, UserAuthGuard } from './guards';
import { AdminModule } from 'src/dashboard/admin/admin.module';
import { UserModule } from 'src/mobile/user/user.module';
import { AuthController } from './auth.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  imports: [
    AdminModule,
    UserModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, SuperUserAuthGuard, UserAuthGuard, PrismaService],
  exports: [AuthService],
})
export class AuthModule {}
