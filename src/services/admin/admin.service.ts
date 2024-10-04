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
    return await this.prisma.superUser.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  // root user can delete, update, create users
  // root user can delete, update, create admins
  // user himself can update
  async findOne(id: string) {
    return await this.prisma.superUser.findFirst({ where: { id } });
  }

  async update(id: string, data: Prisma.SuperUserUpdateInput) {
    return await this.prisma.superUser.update({ where: { id }, data });
  }

  async remove(id: string) {
    return await this.prisma.superUser.delete({ where: { id } });
  }
}
