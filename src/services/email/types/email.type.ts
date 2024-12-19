export enum EmailType {
  NOTIFICATION_EMAIL = 'NOTIFICATION_EMAIL',

  RESEND_EMAIL_HANDLER = 'RESEND_EMAIL_HANDLER',
  TICKET_PAID = 'TICKET_PAID',
}

export interface TicketEmailProps {
  recipientName: string;
  eventName: string;
  eventImage: string; // Event image URL
  ticketDetails: {
    id: string;
    date: string;
    type: string;
    time: string;
    location: string;
  };
  qrCodeSVG?: string; // QR Code SVG string
}

export interface TicketProps {
  eventName: string;
  date: string;
  time: string;
  ticketType: string;
  qrCodeSvg: string;
  organizerName: string;
  ticketOwner: string;
}

export interface OtpEmailProps {
  recipientName: string;
  otp: string;
}

export interface TicketEmail {
  id: string;
  type: string;
  price: number;
  quantity: number;
}

export interface TicketApprovalEmailProps {
  recipientName: string;
  eventName: string;
  eventImage: string; // Event image URL
  eventDetails: {
    location: string;
    date: string;
    time: string;
  };
  redirectUrl: string; // URL to redirect to pay
}

export interface TicketPayEmailProps {
  recipientName: string;
  eventName: string;
  eventImage: string; // Event image URL
  eventDetails: {
    location: string;
    date: string;
    time: string;
  };
  ticket: {
    price: number;
    type: string;
  };
  redirectUrl: string; // URL to redirect to pay
}
