import { NextResponse } from 'next/server';

export class AppError extends Error {
  public statusCode: number;
  public code?: string;

  public constructor(message: string, statusCode: number, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

export function handleError(error: unknown) {
  if (error instanceof AppError) {
    return NextResponse.json({ error: error.message, code: error.code }, { status: error.statusCode });
  }

  return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
}
