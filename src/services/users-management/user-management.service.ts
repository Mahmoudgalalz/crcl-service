import { Injectable } from '@nestjs/common';
import { User, UserStatus, UserType } from '@prisma/client';
import { customUUID } from 'src/common/uniqueId.utils';
import { PrismaService } from 'src/prisma.service';
import { CreateUserViaAdminDto } from './dto/create-user.dto';
import { CreateSuperUserViaAdminDto } from './dto/create-admin.dto';

@Injectable()
export class UsersManagmentService {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(data: CreateUserViaAdminDto) {
    const id = customUUID(20);
    return await this.prisma.user.create({
      data: {
        id,
        ...data,
      },
    });
  }

  async listAllUsers(
    page: number = 1,
    limit: number = 10,
    filters?: {
      status?: UserStatus;
      gender?: 'Male' | 'Female';
      type?: UserType;
    },
  ): Promise<Omit<User, 'password'>[]> {
    const users = await this.prisma.user.findMany({
      where: {
        ...filters,
      },
      select: {
        id: true,
        email: true,
        number: true,
        facebook: true,
        instagram: true,
        gender: true,
        picture: true,
        type: true,
        wallet: {
          select: {
            balance: true,
          },
        },
        status: true,
        createdAt: true,
        updatedAt: true,
      },
      skip: (page - 1) * limit,
      take: limit,
    });
    return users;
  }

  async changeUserStatus(userId: string, status: UserStatus): Promise<User> {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { status },
    });
    return user;
  }

  async findUser(id: string) {
    return await this.prisma.user.findFirst({ where: { id } });
  }

  /* Super User functionality */

  async createSuperUser(data: CreateSuperUserViaAdminDto) {
    const id = customUUID(20);
    return await this.prisma.superUser.create({
      data: {
        id,
        ...data,
      },
    });
  }

  async findAllSuperUsers() {
    return this.prisma.superUser.findMany({
      select: {
        email: true,
        name: true,
        id: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
}
