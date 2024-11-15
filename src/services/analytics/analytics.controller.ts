import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { Role } from 'src/shared/interface/roles';
import { AnalyticsQueryDto } from './dto/anylytics.dto';

@Controller('analytics')
@Roles(Role.Admin)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  // Static Booth Analytics, doesn't need dates
  @Get('booth')
  async getBoothAnalytics() {
    return await this.analyticsService.getBoothTransactionsWithTotal();
  }

  @Get()
  async getAllAnalytics(@Query() query: AnalyticsQueryDto) {
    // Ensure startDate and endDate are provided if "all" is requested
    if (query.all && (!query.startDate || !query.endDate)) {
      throw new BadRequestException(
        'startDate and endDate are required for "all" analytics',
      );
    }

    const params = {
      totalMoney: query.totalMoney === true,
      eventStats: query.eventStats === true,
      eventRequestCounts: query.eventRequestCounts === true,
      totalPaidTickets: query.totalPaidTickets === true,
      userRequestCounts: query.userRequestCounts === true,
      all: query.all === true,
    };

    return await this.analyticsService.getAllAnalytics(
      params,
      new Date(query.startDate),
      new Date(query.endDate),
    );
  }
}
