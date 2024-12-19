import { IsString, IsPhoneNumber, IsEmail } from 'class-validator';
import { IsRequiredForFieldValue } from 'src/shared/decorators/validation/required-with.decorator';

export class CreateInvitationDto {
  @IsString()
  name: string;

  @IsPhoneNumber()
  number: string;

  @IsString()
  type: string;

  @IsEmail()
  email: string;

  @IsString()
  eventId: string;

  @IsRequiredForFieldValue('type', 'paid', {
    message: 'Ticket ID is required for paid invitations.',
  })
  ticketId?: string;
}
