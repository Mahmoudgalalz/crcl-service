import { Module } from '@nestjs/common';
import { NewspaperController } from './newspaper.controller';
import { NewspaperService } from './newspaper.service';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [NewspaperController],
  providers: [NewspaperService, PrismaService],
})
export class NewspaperModule {}
