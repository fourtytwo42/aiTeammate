import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { revokeToken } from '@/lib/auth/session';
import { handleError } from '@/lib/errors';
import { authenticate } from '@/lib/auth/middleware';
import { prisma } from '@/lib/db/prisma';
import { unauthorized, validationError } from '@/lib/api/responses';

const LogoutSchema = z.object({
  refreshToken: z.string().min(1)
});

export async function POST(request: NextRequest) {
  try {
    const user = await authenticate(request);
    const body = await request.json().catch(() => null);
    let refreshToken: string | null = null;

    if (body) {
      const parsed = LogoutSchema.safeParse(body);
      if (!parsed.success) {
        return validationError(parsed.error.flatten().fieldErrors);
      }
      refreshToken = parsed.data.refreshToken;
    }

    if (refreshToken) {
      await revokeToken(refreshToken);
    } else if (user) {
      await prisma.session.deleteMany({ where: { userId: user.id } });
    } else {
      return unauthorized('Unauthorized');
    }

    return NextResponse.json({ message: 'Logged out successfully' });
  } catch (error) {
    return handleError(error);
  }
}
