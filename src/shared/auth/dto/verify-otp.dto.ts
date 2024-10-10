import { IsString, Length, IsNotEmpty, IsPhoneNumber } from 'class-validator';

export class VerifyOtpDto {
  @IsString()
  @IsPhoneNumber()
  @IsNotEmpty()
  number: string;

  @IsString()
  @Length(4, 6)
  @IsNotEmpty()
  otp: string;
}

export class NumberDto {
  @IsPhoneNumber()
  @IsString()
  @IsNotEmpty()
  number: string;
}
