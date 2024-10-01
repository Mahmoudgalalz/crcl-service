import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { MulterModule } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { PrismaService } from 'src/prisma.service';
import { join } from 'path';

@Module({
  imports: [
    MulterModule.registerAsync({
      useFactory: () => ({
        dest: join(__dirname, '../../..', '../data'),
      }),
    }),
  ],
  providers: [PrismaService, UploadService],
  controllers: [UploadController],
})
export class UploadModule {}
