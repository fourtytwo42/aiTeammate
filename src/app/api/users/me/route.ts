import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/auth/middleware';
import { unauthorized } from '@/lib/api/responses';

export async function GET(request: NextRequest) {
  const user = await authenticate(request);
  if (!user) {
    return unauthorized();
  }

  return NextResponse.json({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: user.createdAt,
    lastLoginAt: user.lastLoginAt
  });
}
