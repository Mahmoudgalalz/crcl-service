import {
  Html,
  Head,
  Container,
  Section,
  Text,
  Img,
} from '@react-email/components';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import * as React from 'react';

interface TicketEmailProps {
  recipientName: string;
  eventName: string;
  eventImage: string; // Event image URL
  ticketDetails: {
    id: string;
    date: string;
    location: string;
    type: string;
    time: string;
  };
  qrCodeSVG: string;
}

export default function TicketEmail({
  recipientName,
  eventName,
  eventImage,
  qrCodeSVG,
  ticketDetails,
}: TicketEmailProps) {
  const { location, date, time, type } = ticketDetails;

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
          <Text style={styles.title}>🎟️ Your Ticket for {eventName}!</Text>
        </Section>
        <Section style={styles.body}>
          <Text style={styles.greeting}>
            Hello <strong>{recipientName}</strong>,
          </Text>
          <Text style={styles.message}>
            Thank you for your purchase! Here are the details of your ticket:
          </Text>
          <Text style={styles.details}>
            <strong>Event:</strong> {eventName} <br />
            <strong>Date:</strong> {date} <br />
            <strong>Time:</strong> {time} <br />
            <strong>Type:</strong> {type} <br />
            <strong>Location:</strong> {location} <br />
          </Text>
          <Container style={styles.qrContainer}>
            {/* Render QR code as inline SVG */}
            <img
              alt="QR Code"
              src={`data:image/jpeg;base64,${qrCodeSVG}`}
              style={styles.qrCode}
            />
          </Container>
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
  qrContainer: {
    textAlign: 'center',
    margin: '20px 0',
  },
  qrCode: {
    width: '200px',
    height: '200px',
    margin: '0 auto',
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
