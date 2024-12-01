import TicketEmail from './template/Ticket';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import * as React from 'react';

export default function RenderEmail() {
  const emailProps = {
    recipientName: 'John Doe',
    eventName: 'React Conference 2024',
    eventImage: 'https://placehold.co/600x600', // Replace with your event image URL
    ticketDetails: {
      id: 'dsd',
      date: '2024-12-15',
      time: '10:00 AM',
      type: 'VIP',
      location: 'Hello',
    },
    qrCodeSVG: 'https://placehold.co/600x600'.toString(), // Replace with QR code URL
  };

  return <TicketEmail {...emailProps} />;
}
