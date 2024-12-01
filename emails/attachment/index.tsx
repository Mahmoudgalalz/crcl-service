const eventTicketTemplate = (
  organizerName: string,
  eventName: string,
  date: string,
  time: string,
  ticketType: string,
  ticketOwner: string,
  qrCodeSvg: string,
): string => `
<div tw="flex flex-col bg-white rounded-xl overflow-hidden shadow-lg w-[400px] h-[600px] relative">
  <!-- Top - Organizer Name -->
  <div tw="bg-blue-500 text-white py-2 px-4 text-center">
    <p tw="text-sm font-semibold">${organizerName}</p>
  </div>

  <!-- Event Details -->
  <div tw="flex flex-col justify-between p-8 flex-grow">
    <div>
      <h2 tw="text-3xl font-bold text-gray-800 mb-2">${eventName}</h2>
      <div tw="text-lg text-gray-600 mb-4">
        <p>${date}</p>
        <p>${time}</p>
      </div>
      <div tw="text-xl font-semibold text-blue-600 mb-4">${ticketType}</div>
      <div tw="text-lg font-medium text-gray-800 mb-4">
        <span tw="font-normal text-gray-600">Ticket Owner: </span>${ticketOwner}
      </div>
    </div>
  </div>

  <!-- Bottom - QR Code -->
  <div tw="bg-gray-100 flex items-center justify-center p-8">
    <div tw="w-48 h-48" dangerouslySetInnerHTML="${qrCodeSvg}"></div>
  </div>

  <!-- Decorative Elements -->
  <div tw="absolute top-0 left-0 w-2 h-full bg-blue-500"></div>
  <div tw="absolute top-0 right-0 w-2 h-full bg-blue-500"></div>
</div>
`;

export default eventTicketTemplate;
