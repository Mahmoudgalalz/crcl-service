import { Module } from '@nestjs/common';
import { UsdPriceService } from './usd-price.job';
import { PrismaService } from 'src/prisma.service';
import { CleanUpJob } from './cleanup.job';
import { GlobalNotificationTopic } from './addUsersToGlobalNotificationTopic.job';

@Module({
  providers: [
    UsdPriceService,
    GlobalNotificationTopic,
    PrismaService,
    CleanUpJob,
  ],
})
export class CronModule {}
