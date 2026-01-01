import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { generateRefreshToken, generateToken } from '@/lib/auth/jwt';
import { verifyPassword } from '@/lib/auth/password';
import { AppError, handleError } from '@/lib/errors';
import { storeRefreshToken } from '@/lib/auth/session';
import { validationError } from '@/lib/api/responses';

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

function refreshExpiry(): Date {
  const days = 7;
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = LoginSchema.safeParse(body);
    if (!parsed.success) {
      return validationError(parsed.error.flatten().fieldErrors);
    }

    const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
    if (!user || !user.isActive) {
      throw new AppError('Invalid email or password', 401, 'UNAUTHORIZED');
    }

    const valid = await verifyPassword(parsed.data.password, user.passwordHash);
    if (!valid) {
      throw new AppError('Invalid email or password', 401, 'UNAUTHORIZED');
    }

    const token = generateToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    await storeRefreshToken(user.id, refreshToken, refreshExpiry());
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      token,
      refreshToken
    });
  } catch (error) {
    return handleError(error);
  }
}
