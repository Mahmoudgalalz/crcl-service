import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { BoothController } from './booth.controller';
import { ReaderController } from './reader.controller';
import { BcryptService } from 'src/shared/auth/shared/bcrypt.service';

@Module({
  controllers: [UserController, BoothController, ReaderController],
  providers: [UserService, PrismaService, BcryptService],
})
export class UserModule {}
