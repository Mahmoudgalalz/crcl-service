import {
  IsEmail,
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
  IsUrl,
} from 'class-validator';

export class MetaRequestDto {
  @IsString()
  @IsNotEmpty()
  ticketId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @IsPhoneNumber()
  number: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsUrl()
  @IsNotEmpty()
  social: string;
}
