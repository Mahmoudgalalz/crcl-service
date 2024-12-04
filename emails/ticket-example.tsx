/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';
import TicketApprovalEmail from './template/TicketApprovalEmail';

const App = () => {
  const dummyData = {
    recipientName: 'John Doe',
    eventName: 'Summer Music Festival 2024',
    eventImage:
      'https://via.placeholder.com/600x300?text=Summer+Music+Festival+2024',
    eventDetails: {
      location: 'Central Park, New York',
      date: '2024-08-15',
      time: '6:00 PM',
    },
    tickets: [
      { id: '1', type: 'VIP', price: 150, quantity: 2 },
      { id: '2', type: 'General Admission', price: 50, quantity: 4 },
    ],
    redirectUrl: 'https://example.com/pay-for-tickets',
  };

  return <TicketApprovalEmail {...dummyData} />;
};

export default App;
