import { createClient, Client } from '@libsql/client';

let cachedClient: Client | null = null;

export function getClient(): Client | null {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  if (!url || !authToken) return null;
  if (cachedClient) return cachedClient;
  cachedClient = createClient({ url, authToken });
  return cachedClient;
}

export function dbUnavailable(res: any): boolean {
  if (!getClient()) {
    res.status(503).json({ error: 'Database not configured on server. Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN.' });
    return true;
  }
  return false;
}
