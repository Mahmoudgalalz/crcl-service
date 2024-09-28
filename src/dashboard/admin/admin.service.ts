import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { customUUID } from 'src/common/uniqueId.utils';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Omit<Prisma.SuperUserCreateInput, 'id'>) {
    const id = customUUID(20);
    return await this.prisma.superUser.create({
      data: {
        id,
        ...data,
      },
    });
  }

  async findAll() {
    return await this.prisma.superUser.findMany();
  }

  async findOne(id: string) {
    return await this.prisma.superUser.findFirst({ where: { id } });
  }

  update(id: number) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
