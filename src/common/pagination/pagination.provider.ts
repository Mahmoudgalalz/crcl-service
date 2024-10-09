import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { PrismaService } from 'src/prisma.service';
import { Paginated } from './paginated.interface';
import { Prisma } from '@prisma/client';

@Injectable()
export class PaginationProvider {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    private readonly prisma: PrismaService,
  ) {}

  public async paginateQuery<T>(
    page: number,
    limit: number,
    model: keyof PrismaService,
    filter: Prisma.PrismaClientKnownRequestError | any = {},
  ): Promise<Paginated<T>> {
    const prismaModel = this.prisma[model] as any;

    if (!prismaModel) {
      throw new Error(`Model ${model.toString()} not found in PrismaService`);
    }

    const [results, totalItems] = await this.prisma.$transaction([
      prismaModel.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: filter,
      }),
      prismaModel.count({
        where: filter,
      }),
    ]);

    const totalPages = Math.ceil(totalItems / limit);
    const nextPage = page === totalPages ? page : page + 1;
    const previousPage = page === 1 ? page : page - 1;

    const baseURL = this.request.protocol + '://' + this.request.headers.host + '/';
    const newUrl = new URL(this.request.url, baseURL);

    const finalResponse = {
      data: results,
      meta: {
        itemsPerPage: limit,
        totalItems: totalItems,
        currentPage: page,
        totalPages: totalPages,
      },
      links: {
        first: `${newUrl.origin}${newUrl.pathname}?limit=${limit}&page=1`,
        last: `${newUrl.origin}${newUrl.pathname}?limit=${limit}&page=${totalPages}`,
        current: `${newUrl.origin}${newUrl.pathname}?limit=${limit}&page=${page}`,
        next: `${newUrl.origin}${newUrl.pathname}?limit=${limit}&page=${nextPage}`,
        previous: `${newUrl.origin}${newUrl.pathname}?limit=${limit}&page=${previousPage}`,
      },
    };

    return finalResponse;
  }
}
