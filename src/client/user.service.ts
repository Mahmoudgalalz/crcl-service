import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { UserUpdateDto } from './dto/user-update.dto';
import { newId } from 'src/common/uniqueId.utils';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async update(id: string, data: UserUpdateDto) {
    const user = await this.prisma.user.update({
      where: { id },
      data,
    });
    if (!user) {
      throw new NotFoundException('User not Found');
    }
    return user;
  }

  async UserWallet(id: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        id,
        type: {
          in: ['BOOTH', 'USER'],
        },
      },
      select: {
        wallet: true,
        type: true,
      },
    });
    if (user) throw new Error();
    if (user.wallet?.id && user.type === 'USER') {
      return await this.prisma.wallet.update({
        where: { id: user.wallet.id },
        data: {
          id: newId('wallet', 14),
        },
      });
    } else {
      return await this.prisma.wallet.create({
        data: {
          id: newId('wallet', 14),
          balance: 0,
          user: {
            connect: { id: id },
          },
        },
      });
    }
  }
}
