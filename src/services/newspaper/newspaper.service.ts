import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Newspaper } from '@prisma/client';
import { CreateNewspaperDto, UpdateNewspaperDto } from './dto/newspaper.dto';
import { customUUID } from 'src/common/uniqueId.utils';
import { PaginationProvider } from 'src/common/pagination/pagination.provider';
import { Paginated } from 'src/common/pagination/paginated.interface';

@Injectable()
export class NewspaperService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paginationProvider: PaginationProvider,
  ) {}

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
  ): Promise<Paginated<Newspaper>> {
    const result = await this.paginationProvider.paginateQuery<Newspaper>(
      page,
      limit,
      'newspaper',
      {},
    );
    return result;
  }
}
