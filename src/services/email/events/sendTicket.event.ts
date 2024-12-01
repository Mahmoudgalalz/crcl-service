import { TicketEmailProps } from '../types/email.type';

export class SendTicketEmailEvent {
  constructor(
    public readonly to: string,
    public readonly data: TicketEmailProps,
  ) {}
}
