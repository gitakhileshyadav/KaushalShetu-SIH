import { dbUnavailable, getClient } from './_lib/db';
import { ensureSchema } from './_lib/schema';
import { ENTITIES } from './_lib/entities';
import { json, Req, Res } from './_lib/reqres';

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
  if (dbUnavailable(res)) return;
  const client = getClient()!;
  await ensureSchema();

  const rawCode = req.query.code;
  const code = String((Array.isArray(rawCode) ? rawCode[0] : rawCode) ?? '').trim();
  if (!code) {
    json(res, 400, { found: false, message: 'Please enter a token, session ID, or attendance code.' });
    return;
  }

  try {
    // 1. Search attendance logs by log id or session id (case-insensitive)
    const logRes = await client.execute({
      sql: 'SELECT * FROM attendance_logs WHERE LOWER(id) = ? OR LOWER(session_id) = ?',
      args: [code.toLowerCase(), code.toLowerCase()],
    });
    if (logRes.rows.length > 0) {
      const log = ENTITIES['attendance'].toRow(logRes.rows[0]);
      const sessionRes = await client.execute({
        sql: 'SELECT * FROM sessions WHERE id = ?',
        args: [log.sessionId],
      });
      const session = sessionRes.rows.length > 0 ? ENTITIES['sessions'].toRow(sessionRes.rows[0]) : null;
      const courseRes = await client.execute({
        sql: 'SELECT * FROM courses WHERE id = ?',
        args: [log.courseId],
      });
      const course = courseRes.rows.length > 0 ? ENTITIES['courses'].toRow(courseRes.rows[0]) : null;
      const traineeRes = await client.execute({
        sql: 'SELECT * FROM users WHERE id = ?',
        args: [log.traineeId],
      });
      const trainee = traineeRes.rows.length > 0 ? ENTITIES['users'].toRow(traineeRes.rows[0]) : null;
      json(res, 200, { found: true, log, session, course, trainee });
      return;
    }

    // 2. Search qr_tokens by token (case-insensitive)
    const tokenRes = await client.execute({
      sql: 'SELECT * FROM qr_tokens WHERE LOWER(token) = ?',
      args: [code.toLowerCase()],
    });
    if (tokenRes.rows.length > 0) {
      const matchedToken = ENTITIES['qr_tokens'].toRow(tokenRes.rows[0]);
      const sessionRes = await client.execute({
        sql: 'SELECT * FROM sessions WHERE id = ?',
        args: [matchedToken.sessionId],
      });
      const session = sessionRes.rows.length > 0 ? ENTITIES['sessions'].toRow(sessionRes.rows[0]) : null;
      const courseRes = await client.execute({
        sql: 'SELECT * FROM courses WHERE id = ?',
        args: [matchedToken.courseId],
      });
      const course = courseRes.rows.length > 0 ? ENTITIES['courses'].toRow(courseRes.rows[0]) : null;
      json(res, 200, {
        found: true,
        session,
        course,
        message: `Valid active session QR token. Generated for "${session?.topic}".`,
      });
      return;
    }

    // 3. Search submissions by certificate number (case-insensitive)
    const submissionRes = await client.execute({
      sql: 'SELECT * FROM submissions WHERE LOWER(certificate_number) = ?',
      args: [code.toLowerCase()],
    });
    if (submissionRes.rows.length > 0) {
      const submission = ENTITIES['submissions'].toRow(submissionRes.rows[0]);
      const traineeRes = await client.execute({
        sql: 'SELECT * FROM users WHERE id = ?',
        args: [submission.traineeId],
      });
      const trainee = traineeRes.rows.length > 0 ? ENTITIES['users'].toRow(traineeRes.rows[0]) : null;
      json(res, 200, { found: true, submission, trainee });
      return;
    }

    json(res, 200, { found: false, message: `No verified NCCT record found matching "${code}".` });
  } catch (err: any) {
    json(res, 500, { found: false, error: String(err?.message ?? err) });
  }
}
