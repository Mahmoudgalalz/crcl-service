import { Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { customUUID } from './uniqueId.utils';
// import * as bcrypt from 'bcrypt';

// async function hashPassword(password: string): Promise<string> {
//   const saltRounds = 10;
//   return await bcrypt.hash(password, saltRounds);
// }

export async function createRootUser(
  name: string,
  email: string,
  password: string,
) {
  const prisma = new PrismaClient();
  try {
    const user = await prisma.superUser.findFirst({
      where: {
        email,
      },
    });
    if (user) {
      Logger.log('Root User Exists');
      return;
    }

    await prisma.superUser.create({
      data: {
        id: customUUID(20),
        email,
        password: password,
        name,
      },
    });
    Logger.log('Created Root User');
    return;
  } catch (err) {
    Logger.error('Error in connecting to the database', err);
  }
}

export async function creatRootTokenPrice(value: number) {
  const prisma = new PrismaClient();
  try {
    const token = await prisma.walletToken.findFirst({
      where: {
        id: 1,
      },
    });
    if (token) {
      Logger.log('Root Token Exists');
      return;
    }
    const create = await prisma.walletToken.create({
      data: {
        tokenPrice: value,
      },
    });
    Logger.log('Created Root Token Price', create);
    return;
  } catch (err) {
    Logger.error('Error in connecting to the database', err);
  }
}
