export type ResendEmailInput = {
  to: string;
  subject: string;
  html: string;
  from: string;
  reply_to?: string;
  headers?: Record<string, string>;
};
