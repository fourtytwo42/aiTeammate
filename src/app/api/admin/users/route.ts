import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/auth/middleware';
import { prisma } from '@/lib/db/prisma';
import { forbidden, unauthorized, validationError } from '@/lib/api/responses';
import { UserRole } from '@prisma/client';

export async function GET(request: NextRequest) {
  const user = await authenticate(request);
  if (!user) {
    return unauthorized();
  }

  if (user.role !== 'admin') {
    return forbidden('Admin access required');
  }

  const page = Number(request.nextUrl.searchParams.get('page') ?? '1');
  const limit = Number(request.nextUrl.searchParams.get('limit') ?? '20');
  const roleParam = request.nextUrl.searchParams.get('role');
  const search = request.nextUrl.searchParams.get('search');
  const skip = (page - 1) * limit;

  let role: UserRole | undefined;
  if (roleParam) {
    role = Object.values(UserRole).includes(roleParam as UserRole)
      ? (roleParam as UserRole)
      : undefined;
    if (!role) {
      return validationError({ role: ['Invalid role'] });
    }
  }

  const where = {
    ...(role ? { role } : {}),
    ...(search
      ? {
          OR: [
            { email: { contains: search, mode: 'insensitive' as const } },
            { name: { contains: search, mode: 'insensitive' as const } }
          ]
        }
      : {})
  };

  const [total, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' }
    })
  ]);

  return NextResponse.json({
    data: users.map((entry) => ({
      id: entry.id,
      email: entry.email,
      name: entry.name,
      role: entry.role,
      isActive: entry.isActive,
      createdAt: entry.createdAt,
      lastLoginAt: entry.lastLoginAt
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  });
}
