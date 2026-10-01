import bcrypt from 'bcryptjs';
import { Client } from '@libsql/client';
import { getClient } from './db';
import { ENTITIES, type EntityName } from './entities';
import {
  INITIAL_USERS,
  INITIAL_COURSES,
  INITIAL_ENROLLMENTS,
  INITIAL_SESSIONS,
  INITIAL_ATTENDANCE_LOGS,
} from '../../src/data/initialData';
import {
  COMPREHENSIVE_COURSES,
  COMPREHENSIVE_ASSESSMENTS,
  INITIAL_SUBMISSIONS,
} from '../../src/data/coursesData';

const BASE_SCHEMA_SQL = [
  `CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE,
    password TEXT,
    full_name TEXT,
    email TEXT,
    mobile_number TEXT,
    role TEXT,
    institute TEXT,
    avatar_url TEXT,
    joined_date TEXT
  );`,
  `CREATE TABLE IF NOT EXISTS courses (
    id TEXT PRIMARY KEY,
    trainer_id TEXT,
    trainer_name TEXT,
    title TEXT,
    code TEXT,
    category TEXT,
    description TEXT,
    min_pass_pct REAL,
    min_attendance_pct REAL,
    institute TEXT,
    created_at TEXT,
    total_sessions_expected INTEGER
  );`,
  `CREATE TABLE IF NOT EXISTS enrollments (
    id TEXT PRIMARY KEY,
    course_id TEXT,
    trainee_id TEXT,
    trainee_name TEXT,
    trainee_email TEXT,
    trainee_mobile TEXT,
    status TEXT,
    requested_at TEXT,
    decided_at TEXT,
    notes TEXT
  );`,
  `CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    course_id TEXT,
    course_title TEXT,
    topic TEXT,
    session_date TEXT,
    start_time TEXT,
    end_time TEXT,
    venue TEXT,
    status TEXT,
    created_at TEXT
  );`,
  `CREATE TABLE IF NOT EXISTS qr_tokens (
    id TEXT PRIMARY KEY,
    session_id TEXT,
    course_id TEXT,
    token TEXT UNIQUE,
    expires_at TEXT,
    is_active INTEGER,
    created_at TEXT
  );`,
  `CREATE TABLE IF NOT EXISTS attendance_logs (
    id TEXT PRIMARY KEY,
    session_id TEXT,
    course_id TEXT,
    trainee_id TEXT,
    trainee_name TEXT,
    scanned_at TEXT,
    ip_address TEXT,
    verified INTEGER,
    method TEXT
  );`,
  `CREATE TABLE IF NOT EXISTS assessments (
    id TEXT PRIMARY KEY,
    course_id TEXT,
    course_title TEXT,
    title TEXT,
    description TEXT,
    time_limit_minutes INTEGER,
    passing_score_pct REAL,
    questions TEXT
  );`,
  `CREATE TABLE IF NOT EXISTS submissions (
    id TEXT PRIMARY KEY,
    assessment_id TEXT,
    course_id TEXT,
    course_title TEXT,
    trainee_id TEXT,
    trainee_name TEXT,
    institute TEXT,
    score_pct REAL,
    total_questions INTEGER,
    correct_answers_count INTEGER,
    passed INTEGER,
    submitted_at TEXT,
    answers TEXT,
    certificate_number TEXT,
    trainer_approved INTEGER,
    trainer_remarks TEXT
  );`,
  `CREATE TABLE IF NOT EXISTS lesson_progress (
    id TEXT PRIMARY KEY,
    course_id TEXT,
    lesson_id TEXT,
    trainee_id TEXT,
    watched_percentage REAL,
    completed INTEGER,
    completed_at TEXT
  );`,
  `CREATE TABLE IF NOT EXISTS job_postings (
    id TEXT PRIMARY KEY,
    employer_id TEXT,
    employer_name TEXT,
    title TEXT,
    description TEXT,
    requirements TEXT,
    location TEXT,
    salary TEXT,
    created_at TEXT,
    deadline TEXT,
    required_category TEXT
  );`,
  `CREATE TABLE IF NOT EXISTS job_applications (
    id TEXT PRIMARY KEY,
    job_id TEXT,
    trainee_id TEXT,
    trainee_name TEXT,
    trainee_email TEXT,
    trainee_mobile TEXT,
    institute TEXT,
    status TEXT,
    applied_at TEXT,
    cover_note TEXT
  );`
];

export const MIGRATION_COLUMNS: Record<string, string[]> = {
  users: [
    'status TEXT',
    'designation TEXT',
    'qualification TEXT',
    'id_proof_type TEXT',
    'id_proof_number TEXT',
    'application_reason TEXT',
    'approved_at TEXT',
    'approved_by TEXT',
    'rejection_reason TEXT',
  ],
  courses: [
    'thumbnail_url TEXT',
    'assessment_id TEXT',
    'approval_status TEXT',
    'admin_remarks TEXT',
    'approved_at TEXT',
    'approved_by TEXT',
    'notes TEXT',
    'resources TEXT',
    'modules TEXT',
    'offline_download_enabled INTEGER',
  ],
};

let schemaReady = false;

async function countOf(client: Client, table: string): Promise<number> {
  const res = await client.execute(`SELECT COUNT(*) as count FROM ${table}`);
  return Number(res.rows[0]?.count ?? 0);
}

async function insertRecords(client: Client, entity: EntityName, records: any[]): Promise<void> {
  if (records.length === 0) return;
  const cfg = ENTITIES[entity];
  const columns = cfg.columns.join(', ');
  const placeholders = cfg.columns.map(() => '?').join(', ');
  const sql = `INSERT OR REPLACE INTO ${cfg.table} (${columns}) VALUES (${placeholders})`;
  for (const rec of records) {
    await client.execute({ sql, args: cfg.toArgs(rec) });
  }
}

async function migrateColumns(client: Client): Promise<void> {
  for (const [table, columnDefs] of Object.entries(MIGRATION_COLUMNS)) {
    const info = await client.execute(`pragma table_info(${table})`);
    const existing = new Set(info.rows.map((row) => String(row.name)));
    for (const columnDef of columnDefs) {
      const columnName = columnDef.split(' ')[0];
      if (!existing.has(columnName)) {
        await client.execute(`ALTER TABLE ${table} ADD COLUMN ${columnDef}`);
      }
    }
  }
}

export async function ensureSchema(): Promise<void> {
  if (schemaReady) return;
  const client = getClient();
  if (!client) return;
  for (const sql of BASE_SCHEMA_SQL) {
    await client.execute(sql);
  }
  await migrateColumns(client);
  schemaReady = true;
}

export async function seedIfEmpty(): Promise<void> {
  const client = getClient();
  if (!client) return;
  await ensureSchema();

  try {
    if ((await countOf(client, 'courses')) === 0) {
      await insertRecords(client, 'courses', COMPREHENSIVE_COURSES);
      await insertRecords(client, 'courses', INITIAL_COURSES);
    }
  } catch {}

  try {
    if ((await countOf(client, 'users')) === 0) {
      const hashedUsers = INITIAL_USERS.map((u) => ({
        ...u,
        password: bcrypt.hashSync(u.password || 'password123', 10),
      }));
      await insertRecords(client, 'users', hashedUsers);
    }
  } catch {}

  try {
    if ((await countOf(client, 'enrollments')) === 0) {
      await insertRecords(client, 'enrollments', INITIAL_ENROLLMENTS);
    }
  } catch {}

  try {
    if ((await countOf(client, 'sessions')) === 0) {
      await insertRecords(client, 'sessions', INITIAL_SESSIONS);
    }
  } catch {}

  try {
    if ((await countOf(client, 'attendance_logs')) === 0) {
      await insertRecords(client, 'attendance', INITIAL_ATTENDANCE_LOGS);
    }
  } catch {}

  try {
    if ((await countOf(client, 'assessments')) === 0) {
      await insertRecords(client, 'assessments', COMPREHENSIVE_ASSESSMENTS);
    }
  } catch {}

  try {
    if ((await countOf(client, 'submissions')) === 0) {
      await insertRecords(client, 'submissions', INITIAL_SUBMISSIONS);
    }
  } catch {}
}
