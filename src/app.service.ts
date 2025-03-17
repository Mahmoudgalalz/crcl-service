import { HttpStatus, Injectable, Res } from '@nestjs/common';
import { Response } from 'express';
import { PrismaService } from './prisma.service';
import { ApplicationStatusDto } from './dto/update-status.dto';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}

  async applicationStatus() {
    const meta = await this.prisma.meta.findFirst({
      where: {
        key: 1,
      },
    });
    if (!meta) {
      return await this.prisma.meta.create({
        data: {
          key: 1,
          maintenance: false,
        },
      });
    }
    return meta;
  }

  async updateApplicationStatus(data: ApplicationStatusDto) {
    const status = await this.applicationStatus();
    const meta = await this.prisma.meta.update({
      where: {
        id: status.id,
      },
      data,
    });
    return meta;
  }
  getHello(@Res() res: Response) {
    res.send('Crcl Live').status(HttpStatus.I_AM_A_TEAPOT);
    return;
  }
}
