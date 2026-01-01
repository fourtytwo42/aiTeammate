import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authenticate } from '@/lib/auth/middleware';
import { canEditPersona } from '@/lib/auth/permissions';
import { setSecret } from '@/lib/security/secrets';
import { forbidden, unauthorized, validationError } from '@/lib/api/responses';

const EmailSchema = z.object({
  enabled: z.boolean(),
  imapHost: z.string().min(1),
  imapPort: z.number().int(),
  imapUsername: z.string().min(1),
  imapPassword: z.string().min(1),
  smtpHost: z.string().min(1),
  smtpPort: z.number().int(),
  smtpUsername: z.string().min(1),
  smtpPassword: z.string().min(1)
});

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const user = await authenticate(request);
  if (!user) {
    return unauthorized();
  }

  const { id } = await context.params;
  const canEdit = await canEditPersona(user.id, id);
  if (!canEdit) {
    return forbidden();
  }

  const body = await request.json();
  const parsed = EmailSchema.safeParse(body);
  if (!parsed.success) {
    return validationError(parsed.error.flatten().fieldErrors);
  }

  await setSecret(id, 'email_imap', 'host', parsed.data.imapHost);
  await setSecret(id, 'email_imap', 'port', String(parsed.data.imapPort));
  await setSecret(id, 'email_imap', 'username', parsed.data.imapUsername);
  await setSecret(id, 'email_imap', 'password', parsed.data.imapPassword);
  await setSecret(id, 'email_smtp', 'host', parsed.data.smtpHost);
  await setSecret(id, 'email_smtp', 'port', String(parsed.data.smtpPort));
  await setSecret(id, 'email_smtp', 'username', parsed.data.smtpUsername);
  await setSecret(id, 'email_smtp', 'password', parsed.data.smtpPassword);

  return NextResponse.json({
    enabled: parsed.data.enabled,
    imapHost: parsed.data.imapHost,
    imapPort: parsed.data.imapPort,
    smtpHost: parsed.data.smtpHost,
    smtpPort: parsed.data.smtpPort,
    username: parsed.data.imapUsername,
    updatedAt: new Date().toISOString()
  });
}
