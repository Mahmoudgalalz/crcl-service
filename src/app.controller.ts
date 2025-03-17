import { Body, Controller, Get, HttpStatus, Post, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { Public, Roles } from './shared/decorators/roles.decorator';
import { Response } from 'express';
import { Role } from './shared/interface/roles';
import { ApplicationStatusDto } from './dto/update-status.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Public()
  getHello(@Res() res: Response) {
    res.status(HttpStatus.I_AM_A_TEAPOT).json('Crcl Live');
    return;
  }

  @Get('status')
  @Public()
  async getApplicationMeta(@Res() res: Response) {
    const meta = await this.appService.applicationStatus();
    res.status(HttpStatus.OK).json(meta);
    return;
  }

  @Post('status')
  @Roles(Role.Admin)
  async updateStatus(@Res() res: Response, @Body() body: ApplicationStatusDto) {
    const meta = await this.appService.updateApplicationStatus(body);
    res.status(HttpStatus.ACCEPTED).json(meta);
    return;
  }
}
