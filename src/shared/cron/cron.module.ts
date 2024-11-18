import { Module } from '@nestjs/common';
import { UsdPriceService } from './usd-price.job';
import { PrismaService } from 'src/prisma.service';

@Module({
  providers: [UsdPriceService, PrismaService],
})
export class CronModule {}
