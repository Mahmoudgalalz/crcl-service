import { Module } from '@nestjs/common';
import { NewspaperController } from './newspaper.controller';
import { NewspaperService } from './newspaper.service';
import { PrismaService } from 'src/prisma.service';
import { PaginationProvider } from 'src/common/pagination/pagination.provider';

@Module({
  controllers: [NewspaperController],
  providers: [NewspaperService, PrismaService, PaginationProvider],
})
export class NewspaperModule {}
