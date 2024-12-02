import OtpEmail from './template/Otp';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import * as React from 'react';

export default function RenderEmail() {
  const emailProps = {
    recipientName: 'John Doe',
    otp: '2323',
  };

  return <OtpEmail {...emailProps} />;
}
