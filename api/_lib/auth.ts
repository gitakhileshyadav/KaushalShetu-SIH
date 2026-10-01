import { createHmac, timingSafeEqual } from 'crypto';
import { bearerToken, Req } from './reqres';

const SECRET = process.env.SESSION_SECRET || 'insecure-dev-secret-change-me';
const TTL_MS = 7 * 24 * 60 * 60 * 1000;

function sign(payload: string): string {
  return createHmac('sha256', SECRET).update(payload).digest('base64url');
}

export function createSessionToken(userId: string): string {
  const body = Buffer.from(JSON.stringify({ userId, exp: Date.now() + TTL_MS })).toString('base64url');
  return `${body}.${sign(body)}`;
}

export function verifySessionToken(token: string | null): string | null {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const expected = sign(parts[0]);
  const a = Buffer.from(expected);
  const b = Buffer.from(parts[1]);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(Buffer.from(parts[0], 'base64url').toString());
    if (!payload.userId || typeof payload.exp !== 'number' || Date.now() > payload.exp) return null;
    return payload.userId;
  } catch {
    return null;
  }
}

export function getAuthUserId(req: Req): string | null {
  return verifySessionToken(bearerToken(req));
}
