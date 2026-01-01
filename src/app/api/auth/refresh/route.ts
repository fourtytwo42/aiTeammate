import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { generateRefreshToken, generateToken, verifyRefreshToken } from '@/lib/auth/jwt';
import { AppError, handleError } from '@/lib/errors';
import { refreshTokenExists, revokeToken, storeRefreshToken } from '@/lib/auth/session';
import { validationError } from '@/lib/api/responses';

const RefreshSchema = z.object({
  refreshToken: z.string().min(1)
});

function refreshExpiry(): Date {
  const days = 7;
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = RefreshSchema.safeParse(body);
    if (!parsed.success) {
      return validationError(parsed.error.flatten().fieldErrors);
    }

    const payload = verifyRefreshToken(parsed.data.refreshToken);
    const exists = await refreshTokenExists(parsed.data.refreshToken);
    if (!exists) {
      throw new AppError('Invalid or expired refresh token', 401, 'UNAUTHORIZED');
    }

    await revokeToken(parsed.data.refreshToken);

    const token = generateToken(payload.userId);
    const refreshToken = generateRefreshToken(payload.userId);
    await storeRefreshToken(payload.userId, refreshToken, refreshExpiry());

    return NextResponse.json({ token, refreshToken });
  } catch (error) {
    return handleError(error);
  }
}
