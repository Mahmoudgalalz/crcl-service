import { Controller, Get, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { Role } from 'src/shared/interface/roles';

@Controller('analytics')
@Roles(Role.Admin)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get()
  async getAllAnalytics(
    @Query('totalMoney') totalMoney?: boolean,
    @Query('boothTransactions') boothTransactions?: boolean,
    @Query('eventStats') eventStats?: boolean,
    @Query('eventRequestCounts') eventRequestCounts?: boolean,
    @Query('totalPaidTickets') totalPaidTickets?: boolean,
    @Query('userRequestCounts') userRequestCounts?: boolean,
    @Query('all') all?: boolean,
  ) {
    const params = {
      totalMoney: totalMoney === true,
      boothTransactions: boothTransactions === true,
      eventStats: eventStats === true,
      eventRequestCounts: eventRequestCounts === true,
      totalPaidTickets: totalPaidTickets === true,
      userRequestCounts: userRequestCounts === true,
      all: all === true,
    };

    return await this.analyticsService.getAllAnalytics(params);
  }
}
