import bcrypt from 'bcryptjs';
import { dbUnavailable, getClient } from '../_lib/db.js';
import { ensureSchema } from '../_lib/schema.js';
import { ENTITIES } from '../_lib/entities.js';
import { createSessionToken } from '../_lib/auth.js';
import { json, Req, Res } from '../_lib/reqres.js';

const BCRYPT_PREFIXES = ['$2a$', '$2b$', '$2y$'];

function isBcryptHash(value: string): boolean {
  return BCRYPT_PREFIXES.some((prefix) => value.startsWith(prefix));
}

function readBody(req: Req): any {
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return req.body ?? {};
}

export default async function handler(req: Req, res: Res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(204).json(null);
    return;
  }
  if (req.method !== 'POST') {
    json(res, 405, { error: 'Method not allowed. Use POST.' });
    return;
  }
  if (dbUnavailable(res)) return;
  await ensureSchema();

  const body = readBody(req);
  const username = String(body.username ?? '').trim().toLowerCase();
  const password = String(body.password ?? '');
  if (!username || !password) {
    json(res, 400, { error: 'Username and password are required.' });
    return;
  }

  const client = getClient()!;

  const found = await client.execute({
    sql: 'SELECT * FROM users WHERE LOWER(username) = ?',
    args: [username],
  });
  if (found.rows.length === 0) {
    json(res, 401, { error: 'Invalid username or password.' });
    return;
  }

  const row = found.rows[0];
  const stored = String(row.password ?? '');
  const legacyHash = !isBcryptHash(stored);
  const matches = legacyHash ? stored === password : bcrypt.compareSync(password, stored);
  if (!matches) {
    json(res, 401, { error: 'Invalid username or password.' });
    return;
  }

  if (legacyHash) {
    await client.execute({
      sql: 'UPDATE users SET password = ? WHERE id = ?',
      args: [bcrypt.hashSync(password, 10), String(row.id)],
    });
  }

  if (String(row.status ?? '') === 'rejected') {
    const reason = row.rejection_reason ? String(row.rejection_reason) : '';
    json(res, 403, {
      error: `Your account registration was not approved by NCCT Administration. ${
        reason ? `Reason: ${reason}` : 'Please contact the institute administrator.'
      }`,
    });
    return;
  }

  json(res, 200, {
    token: createSessionToken(String(row.id)),
    user: ENTITIES['users'].toRow(row),
  });
}
