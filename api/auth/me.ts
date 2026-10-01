import { dbUnavailable, getClient } from '../_lib/db';
import { ensureSchema } from '../_lib/schema';
import { ENTITIES } from '../_lib/entities';
import { getAuthUserId } from '../_lib/auth';
import { json, Req, Res } from '../_lib/reqres';

export default async function handler(req: Req, res: Res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(204).json(null);
    return;
  }
  if (req.method !== 'GET') {
    json(res, 405, { error: 'Method not allowed. Use GET.' });
    return;
  }
  if (dbUnavailable(res)) return;
  await ensureSchema();

  const userId = getAuthUserId(req);
  if (!userId) {
    json(res, 401, { error: 'Unauthorized. Please sign in.' });
    return;
  }

  const client = getClient()!;
  const found = await client.execute({
    sql: 'SELECT * FROM users WHERE id = ?',
    args: [userId],
  });
  if (found.rows.length === 0) {
    json(res, 401, { error: 'Unauthorized. Please sign in.' });
    return;
  }

  json(res, 200, { user: ENTITIES['users'].toRow(found.rows[0]) });
}
