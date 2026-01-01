import crypto from 'node:crypto';
import { prisma } from '@/lib/db/prisma';

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export async function storeRefreshToken(userId: string, refreshToken: string, expiresAt: Date): Promise<void> {
  const tokenHash = hashToken(refreshToken);
  await prisma.session.create({
    data: {
      userId,
      tokenHash,
      expiresAt
    }
  });
}

export async function refreshTokenExists(token: string): Promise<boolean> {
  const tokenHash = hashToken(token);
  const session = await prisma.session.findFirst({
    where: {
      tokenHash,
      expiresAt: { gt: new Date() }
    }
  });
  return Boolean(session);
}

export async function revokeToken(token: string): Promise<void> {
  const tokenHash = hashToken(token);
  await prisma.session.deleteMany({ where: { tokenHash } });
}
