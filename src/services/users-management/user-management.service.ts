import { Injectable, Logger } from '@nestjs/common';
import { User, UserStatus, UserType } from '@prisma/client';
import { customUUID, newId } from 'src/common/uniqueId.utils';
import { PrismaService } from 'src/prisma.service';
import { CreateUserViaAdminDto } from './dto/create-user.dto';
import { CreateSuperUserViaAdminDto } from './dto/create-admin.dto';
import { BcryptService } from 'src/shared/auth/shared/bcrypt.service';
import { UpdateSuperUserViaAdminDto } from './dto/update-admin.dto';
import { Role } from 'src/shared/interface/roles';
import { getFuse } from 'src/shared/auth/shared/fues';

@Injectable()
export class UsersManagmentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly bycrptService: BcryptService,
  ) {}

  async createUser(data: CreateUserViaAdminDto) {
    const id = customUUID(20);
    const { password, ...rest } = data;
    const hashedPassword = await this.bycrptService.hashPassword(password);
    const user = await this.prisma.user.create({
      data: {
        id,
        password: hashedPassword,
        ...rest,
      },
    });
    await this.prisma.wallet.create({
      data: {
        id: newId('wallet', 16),
        userId: user.id,
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
      notification?: boolean;
    },
  ) {
    try {
      const { types, notification, ...filter } = filters || {};
      const skip = (page - 1) * limit || 0;
      const take = limit || 10;

      let typeFilter;
      if (types) {
        typeFilter = Array.isArray(types) ? types : [types];
      }

      const whereClause = {
        ...(filter?.status ? { status: filter.status } : {}),
        ...(filter?.gender ? { gender: filter.gender } : {}),
        ...(typeFilter && typeFilter.length > 0
          ? { type: { in: typeFilter } }
          : {}),
        ...(notification ? { notificationToken: { not: null } } : {}),
      };

      const [users, total] = await this.prisma.$transaction([
        this.prisma.user.findMany({
          where: whereClause,
          select: {
            id: true,
            name: true,
            email: true,
            number: true,
            facebook: true,
            instagram: true,
            gender: true,
            picture: true,
            Notifications: true,
            type: true,
            deletedAt: true,
            notificationToken: true,
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
        }),
        this.prisma.user.count({ where: whereClause }),
      ]);

      return {
        users,
        meta: {
          total,
          page,
          pageSize: limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      Logger.error('Error fetching users:', error);
      throw new Error('Unable to fetch users at the moment.');
    }
  }

  async searchUsers(
    searchQuery: string,
    filters?: {
      status?: UserStatus;
      gender?: 'Male' | 'Female';
      types?: UserType[] | UserType;
      notification?: boolean;
    },
  ) {
    try {
      const { users } = await this.listAllUsers(
        1,
        Number.MAX_SAFE_INTEGER,
        filters,
      ); // Fetch all users
      const Fuse = await getFuse();

      const fuse = new Fuse(users, {
        keys: ['name', 'email', 'number'], // Search by name, email, or phone
        threshold: 0.2, // Adjust for desired match sensitivity
      });

      // Step 3: Perform search
      const filteredUsers = searchQuery
        ? fuse.search(searchQuery).map((result) => result.item)
        : users;

      return {
        users: filteredUsers,
        meta: {
          total: filteredUsers.length,
        },
      };
    } catch (error) {
      Logger.error('Error searching users:', error);
      throw new Error('Unable to search users at the moment.');
    }
  }

  async topUpOrDownWallet(
    userId: string,
    data: { top?: number; down?: number },
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
      if (data.top > 0) {
        const up = await this.prisma.wallet.update({
          where: { userId },
          data: {
            balance: wallet.wallet.balance + data.top,
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
      const user = await this.findUser(userId);
      if (!user) throw Error('User not found');
      if (user.type === 'BOOTH') {
        const deleted = await this.prisma.user.update({
          where: {
            id: userId,
            type: {
              in: ['BOOTH'],
            },
          },
          data: {
            deletedAt: Date.now().toString(),
          },
        });
        return deleted;
      }
      const deleted = await this.prisma.user.delete({
        where: {
          id: userId,
          type: {
            in: ['READER'],
          },
        },
      });
      return deleted;
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
    const { password, ...restData } = data;
    const hashedPassword = await this.bycrptService.hashPassword(password);
    return await this.prisma.superUser.create({
      data: {
        id,
        password: hashedPassword,
        ...restData,
      },
    });
  }

  async updateSuperUser(
    user: any,
    userId: string,
    data: UpdateSuperUserViaAdminDto,
  ) {
    if (user.type === Role.Admin) {
      if (data.password) {
        const { password, ...restData } = data;
        const hashedPassword = await this.bycrptService.hashPassword(password);
        return await this.prisma.superUser.update({
          where: {
            id: userId,
          },
          data: {
            password: hashedPassword,
            ...restData,
          },
        });
      }
      return await this.prisma.superUser.update({
        where: {
          id: userId,
        },
        data,
      });
    }
    throw Error('Have no access to this');
  }

  async deleteSuperUser(userId: string) {
    return await this.prisma.superUser.delete({
      where: {
        id: userId,
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
        type: true,
      },
    });
  }
}
