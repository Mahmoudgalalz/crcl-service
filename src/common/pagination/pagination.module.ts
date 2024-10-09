import { Module } from '@nestjs/common';
import { PaginationProvider } from './pagination.provider';
import { PrismaService } from 'src/prisma.service';

@Module({
  providers: [PaginationProvider, PrismaService],
  exports: [PaginationProvider],
})
export class PaginationModule {}
