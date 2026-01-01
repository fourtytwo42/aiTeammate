import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/auth/middleware';
import { canAccessPersona } from '@/lib/auth/permissions';
import { getSecret } from '@/lib/security/secrets';
import { forbidden, unauthorized } from '@/lib/api/responses';

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const user = await authenticate(request);
  if (!user) {
    return unauthorized();
  }

  const { id } = await context.params;
  const canAccess = await canAccessPersona(user.id, id);
  if (!canAccess) {
    return forbidden();
  }

  const imapHost = await getSecret(id, 'email_imap', 'host');
  const imapPort = await getSecret(id, 'email_imap', 'port');
  const smtpHost = await getSecret(id, 'email_smtp', 'host');
  const smtpPort = await getSecret(id, 'email_smtp', 'port');
  const username = await getSecret(id, 'email_imap', 'username');

  return NextResponse.json({
    email: {
      enabled: Boolean(imapHost && smtpHost),
      imapHost,
      imapPort: imapPort ? Number(imapPort) : null,
      smtpHost,
      smtpPort: smtpPort ? Number(smtpPort) : null,
      username
    },
    browser: {
      enabled: true,
      profilePath: '/cache/browser-profile'
    },
    desktopVm: {
      enabled: false,
      vncHost: null,
      vncPort: null
    }
  });
}
