import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { BoothManagementService } from './booth.services';
import { BoothController } from './booth.controller';

@Module({
  providers: [BoothManagementService, PrismaService],
  controllers: [BoothController],
})
export class BoothModule {}
