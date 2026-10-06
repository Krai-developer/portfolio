import nodemailer from 'nodemailer';

export interface ContactNotification {
  to: string;
  name: string;
  email: string;
  projectBrief: string;
  subject?: string;
}

export interface PasswordResetEmail {
  to: string;
  name: string;
  resetUrl: string;
}

export const isEmailDeliveryConfigured = (): boolean =>
  Boolean(process.env.SMTP_PASSWORD && (process.env.SMTP_USER || process.env.ADMIN_EMAIL));

export const sendContactNotification = async ({
  to,
  name,
  email,
  projectBrief,
  subject
}: ContactNotification): Promise<void> => {
  const user = process.env.SMTP_USER || process.env.ADMIN_EMAIL;
  const password = process.env.SMTP_PASSWORD?.replace(/\s/g, '');
  if (!user || !password) throw new Error('SMTP credentials are not configured.');

  const port = Number(process.env.SMTP_PORT || 465);
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port,
    secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : port === 465,
    auth: { user, pass: password }
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM || user,
    to,
    replyTo: { name, address: email },
    subject: subject || 'New portfolio contact submission',
    text: [
      `Name: ${name}`,
      `Email: ${email}`,
      '',
      'Project brief:',
      projectBrief
    ].join('\n')
  });
};

export const sendPasswordResetEmail = async ({ to, name, resetUrl }: PasswordResetEmail): Promise<void> => {
  const user = process.env.SMTP_USER || process.env.ADMIN_EMAIL;
  const password = process.env.SMTP_PASSWORD?.replace(/\s/g, '');
  if (!user || !password) throw new Error('SMTP credentials are not configured.');

  const port = Number(process.env.SMTP_PORT || 465);
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port,
    secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : port === 465,
    auth: { user, pass: password }
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM || user,
    to,
    subject: 'Reset your client portal password',
    text: [
      `Hi ${name},`,
      '',
      'We received a request to reset your client portal password.',
      'Use the link below to choose a new password. This link expires in 60 minutes and can only be used once.',
      '',
      resetUrl,
      '',
      "If you didn't request this, you can ignore this email. Your password will not change."
    ].join('\n')
  });
};
