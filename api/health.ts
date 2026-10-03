import { getClient } from './_lib/db.js';
import { ensureSchema, seedIfEmpty } from './_lib/schema.js';
import { json, Req, Res } from './_lib/reqres.js';

export default async function handler(req: Req, res: Res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(204).json(null);
    return;
  }
  if (req.method !== 'GET') {
    json(res, 405, { error: 'Method not allowed. Use GET.' });
    return;
  }

  const client = getClient();
  if (!client) {
    json(res, 503, {
      connected: false,
      error: 'Database not configured on server. Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN.',
    });
    return;
  }

  const startedAt = Date.now();
  try {
    await client.execute('SELECT 1');
  } catch (err: any) {
    json(res, 503, { connected: false, error: String(err?.message ?? err) });
    return;
  }
  const latencyMs = Date.now() - startedAt;

  const result: Record<string, any> = { connected: true, latencyMs };
  try {
    await ensureSchema();
  } catch (err: any) {
    result.schemaError = String(err?.message ?? err);
  }
  try {
    await seedIfEmpty();
  } catch (err: any) {
    result.seedError = String(err?.message ?? err);
  }
  json(res, 200, result);
}
