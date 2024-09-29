import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { customUUID } from 'src/common/uniqueId.utils';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Omit<Prisma.UserCreateInput, 'id'>) {
    const id = customUUID(20);
    return await this.prisma.user.create({
      data: {
        id,
        ...data,
      },
    });
  }

  findAll() {
    return `This action returns all user`;
  }

  async findOne(id: string) {
    return `This action returns a #${id} user`;
  }

  // update() {
  //   return `This action updates a #${id} user`;
  // }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
