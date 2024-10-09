import { Module } from '@nestjs/common';
import { EventsManagementService } from './events.service';
import { EventsManagementController } from './events.controller';
import { PrismaService } from 'src/prisma.service';
import { PaginationProvider } from 'src/common/pagination/pagination.provider';

@Module({
  controllers: [EventsManagementController],
  providers: [EventsManagementService, PrismaService, PaginationProvider],
})
export class EventsManagementModule {}
