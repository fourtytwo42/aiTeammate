import type { NextRequest } from 'next/server';
import { verifyToken } from './jwt';
import { prisma } from '@/lib/db/prisma';

export async function authenticate(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return null;

  try {
    const payload = verifyToken(token);
    return prisma.user.findUnique({ where: { id: payload.userId } });
  } catch {
    return null;
  }
}
