import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/auth/middleware';
import { prisma } from '@/lib/db/prisma';
import { unauthorized } from '@/lib/api/responses';

export async function GET(request: NextRequest) {
  const user = await authenticate(request);
  if (!user) {
    return unauthorized();
  }

  const page = Number(request.nextUrl.searchParams.get('page') ?? '1');
  const limit = Number(request.nextUrl.searchParams.get('limit') ?? '50');
  const category = request.nextUrl.searchParams.get('category');
  const search = request.nextUrl.searchParams.get('search');
  const skip = (page - 1) * limit;

  const where = {
    ...(category ? { category } : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { description: { contains: search, mode: 'insensitive' as const } }
          ]
        }
      : {})
  };

  const [total, tools] = await Promise.all([
    prisma.tool.count({ where }),
    prisma.tool.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } })
  ]);

  return NextResponse.json({
    data: tools,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  });
}
