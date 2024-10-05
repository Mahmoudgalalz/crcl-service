import { IsString, Length, IsNotEmpty } from 'class-validator';

export class VerifyOtpDto {
  @IsString()
  @Length(10, 15)
  @IsNotEmpty()
  number: string;

  @IsString()
  @Length(4, 6)
  @IsNotEmpty()
  otp: string;
}
