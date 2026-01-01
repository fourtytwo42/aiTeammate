import { ImapFlow } from 'imapflow';

export async function connectImap(config: {
  host: string;
  port: number;
  username: string;
  password: string;
}) {
  const client = new ImapFlow({
    host: config.host,
    port: config.port,
    secure: true,
    auth: {
      user: config.username,
      pass: config.password
    }
  });

  await client.connect();
  return client;
}
