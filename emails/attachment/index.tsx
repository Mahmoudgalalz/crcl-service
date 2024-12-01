/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';

interface TicketProps {
  eventName: string;
  date: string;
  time: string;
  ticketType: string;
  qrCodeSvg: string;
  organizerName: string;
  ticketOwner: string;
}

export default function EventTicket({
  eventName,
  date,
  time,
  ticketType,
  qrCodeSvg,
  organizerName,
  ticketOwner,
}: TicketProps) {
  return (
    <div className="w-[400px] h-[600px] bg-white rounded-xl overflow-hidden shadow-lg flex flex-col">
      {/* Top - Organizer name */}
      <div className="bg-blue-500 text-white py-2 px-4 text-center">
        <p className="text-sm font-semibold">{organizerName}</p>
      </div>

      {/* Event details */}
      <div className="p-8 flex-grow flex flex-col justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">{eventName}</h2>
          <div className="text-lg text-gray-600 mb-4">
            <p>{date}</p>
            <p>{time}</p>
          </div>
          <div className="text-xl font-semibold text-blue-600 mb-4">
            {ticketType}
          </div>
          <div className="text-lg font-medium text-gray-800 mb-4">
            <span className="font-normal text-gray-600">Ticket Owner: </span>
            {ticketOwner}
          </div>
        </div>
      </div>

      {/* Bottom - QR code */}
      <div className="bg-gray-100 flex items-center justify-center p-8">
        <div
          dangerouslySetInnerHTML={{ __html: qrCodeSvg }}
          className="w-48 h-48"
        />
      </div>

      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-2 h-full bg-blue-500"></div>
      <div className="absolute top-0 right-0 w-2 h-full bg-blue-500"></div>
    </div>
  );
}
