import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  Query,
  Delete,
} from '@nestjs/common';
import { NewspaperService } from './newspaper.service';
import { CreateNewspaperDto, UpdateNewspaperDto } from './dto/newspaper.dto';
import { SuccessResponse } from 'src/common/success.response';
import { ErrorResponse } from 'src/common/error.response';
import { NewsStatus } from '@prisma/client';
import { Role } from 'src/shared/interface/roles';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { PaginationQueryDto } from 'src/common/pagination/pagination-query-dto';

@Controller('newspaper')
@Roles(Role.Admin)
export class NewspaperController {
  constructor(private readonly newspaperService: NewspaperService) {}

  @Post()
  async createNewspaper(@Body() data: CreateNewspaperDto) {
    try {
      const newspaper = await this.newspaperService.createNewspaper(data);
      return new SuccessResponse('Created Newspaper', newspaper);
    } catch (error) {
      return new ErrorResponse();
    }
  }

  @Get()
  async getAllNewspapers(@Query() query: PaginationQueryDto) {
    try {
      const { page, limit } = query;
      const newspapers = await this.newspaperService.listNewspapers(
        page,
        limit,
      );
      return new SuccessResponse('All Newspapers', newspapers);
    } catch (error) {
      return new ErrorResponse();
    }
  }

  @Get(':id')
  async getNewspaper(@Param('id') newspaperId: string) {
    try {
      const newspaper = await this.newspaperService.getNewspaper(newspaperId);
      return new SuccessResponse('Newspaper data', newspaper);
    } catch (error) {
      return new ErrorResponse();
    }
  }

  @Put(':id')
  async updateNewspaper(
    @Param('id') newspaperId: string,
    @Body() data: UpdateNewspaperDto,
  ) {
    try {
      const newspaper = await this.newspaperService.updateNewspaper(
        newspaperId,
        data,
      );
      return new SuccessResponse('Updated Newspaper', newspaper);
    } catch (error) {
      return new ErrorResponse();
    }
  }

  @Delete(':id')
  async deleteNewspaper(@Param('id') newspaperId: string) {
    try {
      const updateData = { status: NewsStatus.DELETED };
      const newspaper = await this.newspaperService.updateNewspaper(
        newspaperId,
        updateData,
      );
      return new SuccessResponse('Marked as DELETED', newspaper);
    } catch (error) {
      return new ErrorResponse();
    }
  }
}
