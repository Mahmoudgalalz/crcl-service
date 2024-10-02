/* eslint-disable prettier/prettier */
import { Test, TestingModule } from '@nestjs/testing';
import { OTPService } from './otp.service';

describe('OtpService', () => {
  let service: OTPService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OTPService],
    }).compile();

    service = module.get<OTPService>(OTPService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
