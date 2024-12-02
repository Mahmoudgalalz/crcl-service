import { OtpEmailProps } from '../types/email.type';

export class SendOtpEvent {
  constructor(
    public readonly to: string,
    public readonly data: OtpEmailProps,
  ) {}
}
