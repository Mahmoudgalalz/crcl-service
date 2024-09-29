import { PrismaClient } from '@prisma/client';
import {
  UserType,
  UserStatus,
  TicketStatus,
  EventStatus,
  NewsStatus,
} from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log(`Start seeding ...`);

  // Create SuperUser
  const superUser = await prisma.superUser.create({
    data: {
      id: 'superuser-1',
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'password123', // Replace with a hashed password in production
    },
  });

  console.log(`Created SuperUser with id: ${superUser.id}`);

  // Create Users
  const user1 = await prisma.user.create({
    data: {
      id: 'user-1',
      email: 'user1@example.com',
      number: '123456789',
      password: 'password123',
      facebook: 'user1_fb',
      instagram: 'user1_ig',
      gender: 'Male',
      picture: 'https://example.com/user1.jpg',
      type: UserType.USER,
      status: UserStatus.ACTIVE,
      wallet: {
        create: {
          balance: 100.0,
        },
      },
    },
  });

  const user2 = await prisma.user.create({
    data: {
      id: 'user-2',
      email: 'user2@example.com',
      number: '987654321',
      password: 'password123',
      gender: 'Female',
      type: UserType.READER,
      status: UserStatus.ACTIVE,
    },
  });

  console.log(`Created Users: ${user1.id}, ${user2.id}`);

  // Create Events
  const event1 = await prisma.event.create({
    data: {
      id: 'event-1',
      title: 'Music Concert',
      description: 'A grand music concert featuring top artists.',
      location: 'Main Auditorium',
      image: 'https://example.com/concert.jpg',
      date: new Date('2024-12-31'),
      time: '18:00',
      capacity: 500,
      status: EventStatus.PUBLISHED,
      artists: ['Artist 1', 'Artist 2'],
      createdBy: user1.id,
    },
  });

  console.log(`Created Event with id: ${event1.id}`);

  // Create Tickets for the Event
  const ticket1 = await prisma.ticket.create({
    data: {
      id: 'ticket-1',
      title: 'VIP Ticket',
      description: 'Access to VIP lounge and front row seats.',
      price: 100.0,
      capacity: 50,
      status: TicketStatus.BOOKED,
      eventId: event1.id,
    },
  });

  console.log(`Created Ticket with id: ${ticket1.id}`);

  // Create Ticket Purchases
  const ticketPurchase1 = await prisma.ticketPurchase.create({
    data: {
      id: 'purchase-1',
      ticketId: ticket1.id,
      userId: user1.id,
      status: TicketStatus.APPROVED,
      externalEmail: 'guest1@example.com',
      externalPhone: '999888777',
    },
  });

  console.log(`Created Ticket Purchase with id: ${ticketPurchase1.id}`);

  // Create a Newspaper
  const newspaper1 = await prisma.newspaper.create({
    data: {
      id: 'news-1',
      title: 'Weekly Updates',
      description: 'All the updates from last week.',
      status: NewsStatus.PUBLISHED,
      image: 'https://example.com/news.jpg',
    },
  });

  console.log(`Created Newspaper with id: ${newspaper1.id}`);

  console.log(`Seeding finished.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
