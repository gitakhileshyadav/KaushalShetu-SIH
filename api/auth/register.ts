import bcrypt from 'bcryptjs';
import { dbUnavailable, getClient } from '../_lib/db.js';
import { ensureSchema } from '../_lib/schema.js';
import { ENTITIES } from '../_lib/entities.js';
import { json, Req, Res } from '../_lib/reqres.js';

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
  const rawUsername = String(body.username ?? '').trim();
  const username = rawUsername.toLowerCase();
  const password = String(body.password ?? '');
  if (!username || !password) {
    json(res, 400, { error: 'Username and password are required.' });
    return;
  }

  const client = getClient()!;

  const existing = await client.execute({
    sql: 'SELECT id FROM users WHERE LOWER(username) = ?',
    args: [username],
  });
  if (existing.rows.length > 0) {
    json(res, 409, { error: `Username "${rawUsername}" is already taken. Please choose another.` });
    return;
  }

  const role = typeof body.role === 'string' && body.role ? body.role : 'trainee';
  const isAdmin = role === 'admin';
  const now = new Date();
  const user = {
    id: `usr_${role}_${Date.now()}`,
    username,
    password: bcrypt.hashSync(password, 10),
    fullName: String(body.fullName ?? '').trim() || rawUsername,
    email: String(body.email ?? '').trim() || `${username}@coop-ncct.in`,
    mobileNumber: String(body.mobileNumber ?? '').trim() || '+91 90000 00000',
    role,
    institute: String(body.institute ?? '').trim() || 'NCCT Cooperative Institution',
    joinedDate: now.toISOString().split('T')[0],
    status: isAdmin ? 'approved' : 'pending_approval',
    designation:
      String(body.designation ?? '').trim() ||
      (role === 'trainer'
        ? 'Certified Faculty Candidate'
        : role === 'trainee'
          ? 'Vocational Trainee'
          : 'Recruitment Officer'),
    qualification: String(body.qualification ?? '').trim() || undefined,
    idProofType: String(body.idProofType ?? '').trim() || 'Aadhaar / National ID',
    idProofNumber: String(body.idProofNumber ?? '').trim() || undefined,
    applicationReason: String(body.applicationReason ?? '').trim() || undefined,
    approvedAt: isAdmin ? now.toISOString() : undefined,
    approvedBy: isAdmin ? 'NCCT Apex Directorate' : undefined,
  };

  const cfg = ENTITIES['users'];
  const sql = `INSERT INTO ${cfg.table} (${cfg.columns.join(', ')}) VALUES (${cfg.columns
    .map(() => '?')
    .join(', ')})`;
  try {
    await client.execute({ sql, args: cfg.toArgs(user) });
  } catch (err) {
    const message = String((err as any)?.message ?? err ?? '');
    if (/unique/i.test(message)) {
      json(res, 409, { error: `Username "${rawUsername}" is already taken. Please choose another.` });
      return;
    }
    json(res, 500, { error: 'Failed to create user.' });
    return;
  }

  const { password: _hashedPassword, ...safeUser } = user;
  json(res, 200, { user: safeUser });
}
