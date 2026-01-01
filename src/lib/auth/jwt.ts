import jwt from 'jsonwebtoken';

export type JwtPayload = {
  userId: string;
};

function jwtSecret(): string {
  return process.env.JWT_SECRET ?? '';
}

function refreshSecret(): string {
  return process.env.JWT_REFRESH_SECRET ?? '';
}

export function generateToken(userId: string): string {
  return jwt.sign({ userId }, jwtSecret(), {
    expiresIn: process.env.JWT_EXPIRES_IN ?? '24h'
  });
}

export function generateRefreshToken(userId: string): string {
  return jwt.sign({ userId }, refreshSecret(), {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d'
  });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, jwtSecret()) as JwtPayload;
}

export function verifyRefreshToken(token: string): JwtPayload {
  return jwt.verify(token, refreshSecret()) as JwtPayload;
}
