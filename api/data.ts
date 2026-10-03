import { dbUnavailable, getClient } from './_lib/db.js';
import { ensureSchema } from './_lib/schema.js';
import { ENTITIES, EntityConfig } from './_lib/entities.js';
import { getAuthUserId } from './_lib/auth.js';
import { json, Req, Res } from './_lib/reqres.js';

const SENSITIVE_ENTITIES: ReadonlySet<string> = new Set(['qr_tokens']);

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

function entityNameFrom(req: Req): string {
  const raw = req.query.entity;
  const value = Array.isArray(raw) ? raw[0] : raw;
  return value ?? '';
}

export default async function handler(req: Req, res: Res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(204).json(null);
    return;
  }
  if (req.method !== 'GET' && req.method !== 'POST') {
    json(res, 405, { error: 'Method not allowed. Use GET or POST.' });
    return;
  }

  const name = entityNameFrom(req);
  const cfg = (ENTITIES as Record<string, EntityConfig | undefined>)[name];
  if (!cfg) {
    json(res, 404, { error: `Unknown entity: ${name}` });
    return;
  }
  if (dbUnavailable(res)) return;
  const client = getClient()!;

  if (req.method === 'GET') {
    if (SENSITIVE_ENTITIES.has(name)) {
      const userId = getAuthUserId(req);
      if (!userId) {
        json(res, 401, { error: 'Unauthorized' });
        return;
      }
    }
    try {
      const result = await client.execute(`SELECT * FROM ${cfg.table}`);
      json(res, 200, { rows: result.rows.map(cfg.toRow) });
    } catch (err: any) {
      json(res, 500, { error: String(err?.message ?? err) });
    }
    return;
  }

  const userId = getAuthUserId(req);
  if (!userId) {
    json(res, 401, { error: 'Unauthorized' });
    return;
  }
  await ensureSchema();

  const body = readBody(req);
  const records = body.records;
  if (!Array.isArray(records)) {
    json(res, 400, { error: 'Body must include a records array.' });
    return;
  }

  try {
    const columns = cfg.columns.join(', ');
    const placeholders = cfg.columns.map(() => '?').join(', ');
    const sql = `INSERT OR REPLACE INTO ${cfg.table} (${columns}) VALUES (${placeholders})`;
    for (const rec of records) {
      if (name === 'users') {
        // INSERT OR REPLACE rewrites every column: when an incoming record carries no
        // password (the GET response strips it), preserve the stored hash instead of
        // nulling it out and bricking that account's login.
        const incomingPw = rec && typeof rec === 'object' ? (rec as any).password : undefined;
        if (!incomingPw) {
          const existingPw = await client.execute({
            sql: 'SELECT password FROM users WHERE id = ?',
            args: [(rec as any)?.id]
          });
          const stored = existingPw.rows[0]?.password;
          if (stored != null) (rec as any).password = stored;
        }
      }
      await client.execute({ sql, args: cfg.toArgs(rec) });
    }
    json(res, 200, { upserted: records.length });
  } catch (err: any) {
    json(res, 500, { error: String(err?.message ?? err) });
  }
}
