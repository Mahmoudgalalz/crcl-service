import {
  Controller,
  Res,
  HttpStatus,
  Logger,
  Post,
  Body,
} from '@nestjs/common';
import { Response } from 'express';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { Role } from 'src/shared/interface/roles';
import { CreateInvitationDto } from './dtos/create-invitation.dto';
import { InvitationsService } from './invitations.service';

@Controller('invitations')
@Roles(Role.Admin)
export class InvitationsController {
  constructor(private readonly invitationsService: InvitationsService) {}

  @Post()
  async listen(@Res() res: Response, @Body() payload: CreateInvitationDto) {
    try {
      const invitation =
        await this.invitationsService.createInvitation(payload);
      res.status(HttpStatus.ACCEPTED).send({
        status: 'success',
        message: 'Invitatation created',
        data: invitation,
      });
      return;
    } catch (error) {
      Logger.log(error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
        status: 'error',
        message: 'error creating invitation',
        error,
      });
      return;
    }
  }
}
