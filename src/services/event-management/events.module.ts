import { Module } from '@nestjs/common';
import { EventsManagementService } from './events.service';
import { EventsManagementController } from './events.controller';
import { PrismaService } from 'src/prisma.service';
import { GlobalNotificationEventListener } from './listener/send-notification.listener';

@Module({
  controllers: [EventsManagementController],
  providers: [
    EventsManagementService,
    GlobalNotificationEventListener,
    PrismaService,
  ],
})
export class EventsManagementModule {}
