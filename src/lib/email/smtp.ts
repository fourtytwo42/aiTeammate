import nodemailer from 'nodemailer';

export function createSmtpTransport(config: {
  host: string;
  port: number;
  username: string;
  password: string;
}) {
  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: false,
    auth: {
      user: config.username,
      pass: config.password
    }
  });
}
