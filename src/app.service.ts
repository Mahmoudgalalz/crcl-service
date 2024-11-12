import { HttpStatus, Injectable, Res } from '@nestjs/common';
import { Response } from 'express';

@Injectable()
export class AppService {
  getHello(@Res() res: Response) {
    res.send('Crcl Live').status(HttpStatus.I_AM_A_TEAPOT);
    return;
  }
}
