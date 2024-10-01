import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { MulterModule } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { PrismaService } from 'src/prisma.service';

@Module({
  imports: [MulterModule],
  providers: [PrismaService, UploadService],
  controllers: [UploadController],
})
export class UploadModule {}
