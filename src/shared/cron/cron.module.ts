import { Module } from '@nestjs/common';
import { UsdPriceService } from './usd-price.job';
import { PrismaService } from 'src/prisma.service';
import { CleanUpJob } from './cleanup.job';

@Module({
  providers: [UsdPriceService, PrismaService, CleanUpJob],
})
export class CronModule {}
