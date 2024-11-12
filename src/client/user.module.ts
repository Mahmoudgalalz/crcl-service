import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { BoothController } from './booth.controller';
import { ReaderController } from './reader.controller';
import { BcryptService } from 'src/shared/auth/shared/bcrypt.service';
import { PaymentService } from 'src/services/payment/payment.service';

@Module({
  controllers: [UserController, BoothController, ReaderController],
  providers: [UserService, PrismaService, BcryptService, PaymentService],
})
export class UserModule {}
