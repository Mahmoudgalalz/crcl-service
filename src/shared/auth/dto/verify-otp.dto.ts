import { IsString, Length, IsNotEmpty } from 'class-validator';

export class VerifyOtpDto {
  @IsString()
  @Length(10, 15)  // Assuming phone number length between 10 and 15 characters
  @IsNotEmpty()
  number: string;

  @IsString()
  @Length(4, 6)  // Assuming OTP length between 4 and 6 characters
  @IsNotEmpty()
  otp: string;
}
