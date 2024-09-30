import { Module } from '@nestjs/common';
import { EventsManagementService } from './events.service';
import { EventsManagementController } from './events.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [EventsManagementController],
  providers: [EventsManagementService, PrismaService],
})
export class EventsManagementModule {}
