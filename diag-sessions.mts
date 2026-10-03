import 'dotenv/config';
import { getClient } from './api/_lib/db.js';

(async () => {
  const client = getClient();
  if (!client) { console.log('NO DB CLIENT'); return; }
  const sessions = await client.execute('SELECT id, course_title, topic, status, created_at FROM sessions ORDER BY created_at DESC LIMIT 8');
  console.log(`recent sessions: ${sessions.rows.length}`);
  sessions.rows.forEach((r: any) => console.log(`  ${r.id} | ${r.topic} | ${r.status} | ${r.created_at}`));
  const tokens = await client.execute('SELECT id, session_id, token, expires_at, is_active, created_at FROM qr_tokens ORDER BY created_at DESC LIMIT 8');
  console.log(`recent qr_tokens: ${tokens.rows.length}`);
  tokens.rows.forEach((r: any) => console.log(`  ${r.token} | session=${r.session_id} | active=${r.is_active} | ${r.created_at}`));
})();
