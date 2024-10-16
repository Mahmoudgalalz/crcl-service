import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Seed for SuperUser
  const superUser = await prisma.superUser.upsert({
    where: { id: 'superuser1' },
    update: {},
    create: {
      id: 'superuser12',
      name: 'Admin',
      email: 'admin@site.com',
      password: 'securepassword123',
    },
  });

  // Seed for Users
  const user1 = await prisma.user.create({
    data: {
      id: 'user1s2',
      name: 'John Doe',
      email: 'johnas.doe@example.com',
      number: '1134567890',
      password: 'password123',
      type: 'USER',
      status: 'ACTIVE',
      wallet: {
        create: {
          id: 'asdsad',
          balance: 100,
        },
      },
    },
  });

  const user2 = await prisma.user.create({
    data: {
      id: 'user2s2',
      name: 'Jane Smith',
      email: 'janea.smith@example.com',
      number: '09876a4321',
      password: 'password456',
      type: 'USER',
      status: 'ACTIVE',
    },
  });

  // Seed for Events
  const event1 = await prisma.event.create({
    data: {
      id: 'event12',
      title: 'Music Concert',
      description: 'An amazing music concert featuring various artists.',
      location: 'Central Park, NY',
      date: new Date('2024-10-20'),
      time: '18:00',
      status: 'PUBLISHED',
      capacity: 500,
      artists: ['Artist1', 'Artist2'],
      createdBy: user1.id,
    },
  });

  // Seed for Tickets
  const ticket1 = await prisma.ticket.create({
    data: {
      id: 'ticket12',
      title: 'General Admission',
      description: 'Basic entry ticket',
      price: 50.0,
      capacity: 200,
      event: {
        connect: {
          id: event1.id,
        },
      },
    },
  });

  const ticket2 = await prisma.ticket.create({
    data: {
      id: 'ticket22',
      title: 'VIP Ticket',
      description: 'VIP access with backstage pass',
      price: 150.0,
      capacity: 50,
      eventId: event1.id,
    },
  });

  // Seed for Ticket Purchases
  await prisma.ticketPurchase.create({
    data: {
      id: 'purchase12',
      userId: user1.id,
      ticketId: ticket1.id,
      payment: 'PAID',
      status: 'UPCOMMING',
    },
  });

  // Seed for Event Requests
  await prisma.eventRequest.create({
    data: {
      id: 'request12',
      userId: user2.id,
      eventId: event1.id,
      meta: {
        ticketType: 'VIP',
        specialRequest: 'Wheelchair access needed',
      },
      status: 'BOOKED',
    },
  });

  console.log('Database has been seeded successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
