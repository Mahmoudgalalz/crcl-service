import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { UsersManagmentController } from './user-management.controller';
import { UsersManagmentService } from './user-management.service';

@Module({
  controllers: [UsersManagmentController],
  providers: [UsersManagmentService, PrismaService],
  exports: [UsersManagmentService],
})
export class UsersManagmentModule {}