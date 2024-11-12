import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './shared/decorators/roles.decorator';
import { Response } from 'express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Public()
  getHello(@Res() res: Response) {
    res.status(HttpStatus.I_AM_A_TEAPOT).json('Crcl Live');
    return;
  }
}
