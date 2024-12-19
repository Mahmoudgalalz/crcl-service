import {
  OtpEmailProps,
  TicketApprovalEmailProps,
  TicketPayEmailProps,
} from '../types/email.type';

export class SendOtpEvent {
  constructor(
    public readonly to: string,
    public readonly data: OtpEmailProps,
  ) {}
}

export class RequestApprovedEvent {
  constructor(
    public readonly to: string,
    public readonly data: TicketApprovalEmailProps,
  ) {}
}
export class TicketPayEvent {
  constructor(
    public readonly to: string,
    public readonly data: TicketPayEmailProps,
  ) {}
}
