import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { UsersManagmentController } from './user-management.controller';
import { UsersManagmentService } from './user-management.service';
import { BcryptService } from 'src/shared/auth/shared/bcrypt.service';

@Module({
  controllers: [UsersManagmentController],
  providers: [UsersManagmentService, PrismaService, BcryptService],
  exports: [UsersManagmentService],
})
export class UsersManagmentModule {}
