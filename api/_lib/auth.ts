import { createHmac, timingSafeEqual } from 'crypto';
import { bearerToken, Req } from './reqres.js';

const SESSION_SECRET = process.env.SESSION_SECRET;
const SECRET = SESSION_SECRET || 'insecure-dev-secret-change-me';

if (!SESSION_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('SESSION_SECRET is not set. Refusing to start in production: session tokens would be forgeable.');
  }
  console.warn('WARNING: SESSION_SECRET is not set. Using insecure dev fallback — tokens are forgeable. Set SESSION_SECRET (no VITE_ prefix) before deploying.');
}
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
