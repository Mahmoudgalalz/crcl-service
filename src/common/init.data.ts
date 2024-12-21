import { Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { customUUID } from './uniqueId.utils';
import * as bcrypt from 'bcrypt';
import axios from 'axios';

async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
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
    if (user) {
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

export async function createTempUser(
  name: string,
  email: string,
  password: string,
) {
  const prisma = new PrismaClient();
  try {
    const user = await prisma.user.findFirst({
      where: {
        email,
      },
    });
    if (user) {
      Logger.log('Temp User Exists');
      return;
    }

    const hashedPassword = await hashPassword(password);
    await prisma.user.create({
      data: {
        id: 'kroking0',
        email,
        password: hashedPassword,
        name,
        number: '010009955133', // or any appropriate value
        type: 'USER', // or any appropriate value
      },
    });
    Logger.log('Created Temp User');
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
        usd_price: await usdPrice(),
      },
    });
    Logger.log('Created Root Token Price', create);
    return;
  } catch (err) {
    Logger.error('Error in connecting to the database', err);
  }
}

export async function usdPrice() {
  if (!process.env.PRICE_API_KEY) {
    Logger.debug('currency api: Api Key does not exist');
    return 49.35;
  }
  const result = await axios.get(
    `https://api.currencyapi.com/v3/latest?apikey=${process.env.PRICE_API_KEY}&currencies=EGP`,
  );
  if (result.status === 200) {
    Logger.debug('currency api called and returned price correctly');
    return result.data.data.EGP.value;
  }
  Logger.debug('currency api: failed request');
  return 49.35;
}
