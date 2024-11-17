import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Newspaper } from '@prisma/client';
import { CreateNewspaperDto, UpdateNewspaperDto } from './dto/newspaper.dto';
import { customUUID } from 'src/common/uniqueId.utils';

@Injectable()
export class NewspaperService {
  constructor(private readonly prisma: PrismaService) {}

  async createNewspaper(data: CreateNewspaperDto): Promise<Newspaper> {
    const id = customUUID(20);
    return await this.prisma.newspaper.create({
      data: {
        id,
        ...data,
      },
    });
  }

  async updateNewspaper(
    id: string,
    data: UpdateNewspaperDto,
  ): Promise<Newspaper> {
    const newspaper = await this.prisma.newspaper.update({
      where: { id },
      data,
    });
    if (!newspaper) {
      throw new NotFoundException('Newspaper not found');
    }
    return newspaper;
  }

  async getNewspaper(id: string): Promise<Newspaper> {
    const newspaper = await this.prisma.newspaper.findUnique({
      where: { id },
    });
    if (!newspaper) {
      throw new NotFoundException('Newspaper not found');
    }
    return newspaper;
  }

  async listNewspapers(
    page: number,
    limit: number,
  ): Promise<{ newspapers: Newspaper[]; total: number }> {
    const [newspapers, total] = await this.prisma.$transaction([
      this.prisma.newspaper.findMany({
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.newspaper.count(),
    ]);
    return { newspapers, total };
  }

  async searchNewspapers(
    search: string,
  ): Promise<{ newspapers: Newspaper[]; total: number }> {
    const [newspapers, total] = await this.prisma.$transaction([
      this.prisma.newspaper.findMany({
        where: {
          title: {
            contains: search,
            mode: 'insensitive',
          },
        },
      }),
      this.prisma.newspaper.count({
        where: {
          title: {
            contains: search,
            mode: 'insensitive',
          },
        },
      }),
    ]);
    return { newspapers, total };
  }
}
