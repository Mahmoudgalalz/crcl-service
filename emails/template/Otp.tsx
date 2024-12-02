import { Html, Head, Container, Section, Text } from '@react-email/components';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import * as React from 'react';

interface OtpEmailProps {
  recipientName: string;
  otp: string;
}

export default function OtpEmail({ recipientName, otp }: OtpEmailProps) {
  return (
    <Html>
      <Head />
      <Container style={styles.container}>
        <Section style={styles.header}>
          <Text style={styles.title}>CRCL Events</Text>
        </Section>
        <Section style={styles.body}>
          <Text style={styles.greeting}>
            Hello <strong>{recipientName}</strong>,
          </Text>
          <Text style={styles.message}>
            Use the following One-Time Password (OTP) to complete your
            verification process:
          </Text>
          <Text style={styles.otp}>{otp}</Text>
          <Text style={styles.message}>
            This OTP is valid for the next 5 minutes. Please do not share it
            with anyone.
          </Text>
        </Section>
        <Section style={styles.footer}>
          <Text style={styles.footerText}>
            If you didn't request this, please ignore this email or contact our
            support team.
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
    lineHeight: '1.5',
  },
  otp: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    margin: '20px 0',
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
