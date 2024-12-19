import {
  Html,
  Head,
  Container,
  Section,
  Text,
  Img,
  Button,
} from '@react-email/components';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import * as React from 'react';

// interface Ticket {
//   id: string;
//   type: string;
//   price: number;
//   quantity: number;
// }

interface TicketPayEmailProps {
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

export default function TicketPayEmail({
  recipientName,
  eventName,
  eventImage,
  eventDetails,
  ticket,
  redirectUrl,
}: TicketPayEmailProps) {
  const { location, date, time } = eventDetails;

  // // Calculate total price and ticket count
  // const totalPrice = tickets.reduce(
  //   (acc, ticket) => acc + ticket.price * ticket.quantity,
  //   0,
  // );
  // const totalTickets = tickets.reduce(
  //   (acc, ticket) => acc + ticket.quantity,
  //   0,
  // );

  return (
    <Html>
      <Head />
      <Container style={styles.container}>
        <Section style={styles.header}>
          <Text style={styles.title}>CRCL Events</Text>
        </Section>
        <Section style={styles.eventImageContainer}>
          <Img src={eventImage} alt={eventName} style={styles.eventImage} />
        </Section>
        <Section style={styles.header}>
          <Text style={styles.title}>🎟️ Your Invited for {eventName}!</Text>
        </Section>
        <Section style={styles.body}>
          <Text style={styles.greeting}>
            Dear <strong>{recipientName}</strong>,
          </Text>
          <Text style={styles.message}>
            Your invitation for {eventName} is here! 🎉
          </Text>
          <Text style={styles.details}>
            <strong>Event:</strong> {eventName} <br />
            <strong>Date:</strong> {date} <br />
            <strong>Time:</strong> {time} <br />
            <strong>Location:</strong> {location} <br />
          </Text>
          <Section>
            <Text style={styles.details}>
              Complete your payment in the, Once payment is completed, you'll
              receive your tickets details. See you at the event! Best regards,
            </Text>
          </Section>
          <Section style={styles.ticketDetails}>
            {/* <Text style={styles.subTitle}>🎫 Ticket Details:</Text> */}
            <Section style={styles.ticketCardsContainer}>
              <Section style={styles.ticketCard}>
                <Text style={styles.ticketType}>
                  <strong>{ticket.type} Ticket</strong>
                </Text>
                <Text style={styles.ticketInfo}>
                  <strong>Price:</strong> EGP{ticket.price.toFixed(2)} <br />
                </Text>
              </Section>
            </Section>
            {/* <Text style={styles.total}>
              <strong>Total Tickets:</strong> {totalTickets} <br />
              <strong>Total Price:</strong> EGP{totalPrice.toFixed(2)}
            </Text> */}
          </Section>
          <Section style={styles.paymentButtonContainer}>
            <Button style={styles.paymentButton} href={redirectUrl}>
              Pay it now!
            </Button>
          </Section>
        </Section>
        <Section style={styles.footer}>
          <Text style={styles.footerText}>
            If you have any questions, feel free to reach out to us. Enjoy the
            event!
          </Text>
        </Section>
      </Container>
    </Html>
  );
}

const styles = {
  container: {
    fontFamily: 'Arial, sans-serif',
    padding: '20px',
    backgroundColor: '#f9f9f9',
  },
  eventImageContainer: {
    textAlign: 'center',
    marginBottom: '20px',
  },
  eventImage: {
    width: '100%',
    maxWidth: '600px',
    height: 'auto',
    borderRadius: '8px',
    aspectRatio: '16/9',
    objectFit: 'cover',
  },
  header: {
    textAlign: 'center',
    paddingBottom: '20px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#333',
  },
  body: {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  greeting: {
    fontSize: '18px',
    marginBottom: '10px',
  },
  message: {
    fontSize: '16px',
    marginBottom: '20px',
  },
  details: {
    fontSize: '16px',
    lineHeight: '1.5',
    marginBottom: '20px',
  },
  ticketDetails: {
    marginBottom: '20px',
  },
  subTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '10px',
  },
  ticketCardsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '50px',
  },
  ticketCard: {
    backgroundColor: '#f4f4f4',
    paddingLeft: '10px',
    marginTop: '15px',
    width: '24.5vw',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
  ticketType: {
    fontSize: '16px',
    fontWeight: 'bold',
    marginBottom: '8px',
    color: '#007bff',
  },
  ticketInfo: {
    fontSize: '14px',
    lineHeight: '1.5',
  },
  total: {
    fontSize: '16px',
    fontWeight: 'bold',
    marginTop: '20px',
  },
  paymentButtonContainer: {
    textAlign: 'center',
    marginTop: '20px',
  },
  paymentButton: {
    backgroundColor: '#007bff',
    color: '#fff',
    fontSize: '16px',
    padding: '10px 20px',
    textDecoration: 'none',
    borderRadius: '8px',
    display: 'inline-block',
  },
  footer: {
    textAlign: 'center',
    marginTop: '20px',
  },
  footerText: {
    fontSize: '14px',
    color: '#666',
  },
};
