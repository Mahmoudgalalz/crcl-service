import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import axios from 'axios';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class UsdPriceService {
  constructor(private readonly prismaService: PrismaService) {}
  private readonly logger = new Logger(UsdPriceService.name);

  @Cron(CronExpression.EVERY_3_HOURS)
  async handleCron() {
    this.logger.debug('Updating USD PRICE');
    if (!process.env.PRICE_API_KEY) {
      this.logger.debug('Api Key does not exist');
      return;
    }
    const result = await axios.get(
      `https://api.currencyapi.com/v3/latest?apikey=${process.env.PRICE_API_KEY}&currencies=EGP`,
    );
    if (result.status === 200) {
      await this.prismaService.walletToken.updateMany({
        where: {
          id: {
            gte: 1,
          },
        },
        data: {
          usd_price: result.data.data.EGP.value,
        },
      });
      this.logger.debug(`USD Updated to: ${result.data.data.EGP.value}`);
      return;
    }
    this.logger.debug(`API is not responeding`);
  }
}
