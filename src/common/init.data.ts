import { Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { customUUID } from './uniqueId.utils';
import * as bcrypt from 'bcrypt';

async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}
async function comparePassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}
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
    const validPassword = await comparePassword(password, user.password);
    if (user && validPassword) {
      Logger.log('Root User Exists');
      return;
    }

    const hashedPassword = await hashPassword(password);
    await prisma.superUser.create({
      data: {
        id: customUUID(20),
        email,
        password: hashedPassword,
        name,
      },
    });
    Logger.log('Created Root User');
    return;
  } catch (err) {
    Logger.error('Error in connecting to the database', err);
  }
}
