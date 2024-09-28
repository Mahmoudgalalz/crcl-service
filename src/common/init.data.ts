import { Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { customUUID } from './uniqueId.utils';

export async function createRootUser(
  name: string,
  email: string,
  password: string,
) {
  const prisma = new PrismaClient();
  try {
    const find = await prisma.superUser.findFirst({
      where: {
        email,
      },
    });
    if (find) {
      Logger.log('Root User Exists');
      return;
    }

    await prisma.superUser.create({
      data: {
        id: customUUID(20),
        email,
        password,
        name,
      },
    });
    Logger.log('Created Root User');
    return;
  } catch (err) {
    Logger.error('Error in connecting to the database', err);
  }
}
