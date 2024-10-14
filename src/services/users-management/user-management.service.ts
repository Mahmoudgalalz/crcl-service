import { Injectable, Logger } from '@nestjs/common';
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
      types?: UserType[] | UserType;
    },
  ): Promise<Omit<User, 'password'>[]> {
    try {
      const { types, ...filter } = filters || {};
      const skip = (page - 1) * limit || 0;
      const take = limit || 10;

      let typeFilter;
      if (types) {
        typeFilter = Array.isArray(types) ? types : [types];
      }
      const users = await this.prisma.user.findMany({
        where: {
          ...(filter?.status ? { status: filter.status } : {}),
          ...(filter?.gender ? { gender: filter.gender } : {}),
          ...(typeFilter && typeFilter.length > 0
            ? { type: { in: typeFilter } }
            : {}),
        },
        select: {
          id: true,
          name: true,
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
        skip,
        take,
      });

      return users;
    } catch (error) {
      Logger.error('Error fetching users:', error);
      throw new Error('Unable to fetch users at the moment.');
    }
  }

  async topUpOrDownWallet(
    userId: string,
    data: { up?: number; down?: number },
  ) {
    try {
      const wallet = await this.prisma.user.findFirst({
        where: { id: userId },
        select: {
          wallet: true,
        },
      });
      if (data.down > 0 && wallet.wallet.balance >= data.down) {
        const down = await this.prisma.wallet.update({
          where: { userId },
          data: {
            balance: wallet.wallet.balance - data.down,
          },
        });
        return down;
      }
      if (data.up > 0) {
        const up = await this.prisma.wallet.update({
          where: { userId },
          data: {
            balance: wallet.wallet.balance + data.up,
          },
        });
        return up;
      }
    } catch (error) {
      Logger.error('Error in Wallet:', error);
      throw new Error('Unable to top up wallet for user at the moment.');
    }
  }

  async changeUserStatus(userId: string, status: UserStatus): Promise<User> {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { status },
    });
    return user;
  }

  async deleteUser(userId: string) {
    try {
      const user = await this.prisma.user.delete({
        where: {
          id: userId,
          type: {
            in: ['BOOTH', 'READER'],
          },
        },
      });
      return user;
    } catch (error) {
      Logger.error('Delete User error ', error);
      throw new Error('Cannot delete this user, or server error');
    }
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
