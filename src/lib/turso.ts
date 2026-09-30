import { createClient, Client } from '@libsql/client/web';
import { 
  UserProfile, 
  Course, 
  Enrollment, 
  CourseSession, 
  QRAttendanceToken, 
  AttendanceLog, 
  TursoConfig 
} from '../types';
import { 
  INITIAL_USERS, 
  INITIAL_COURSES, 
  INITIAL_ENROLLMENTS, 
  INITIAL_SESSIONS, 
  INITIAL_ATTENDANCE_LOGS 
} from '../data/initialData';

const STORAGE_KEY_TURSO_URL = 'ncct_turso_db_url';
const STORAGE_KEY_TURSO_TOKEN = 'ncct_turso_auth_token';

let cachedClient: Client | null = null;
let currentConfig: TursoConfig = {
  url: '',
  authToken: '',
  status: 'offline_local'
};

export function getSavedTursoCredentials(): { url: string; authToken: string } {
  const envUrl = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_TURSO_DATABASE_URL) || '';
  const envToken = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_TURSO_AUTH_TOKEN) || '';

  const storedUrl = localStorage.getItem(STORAGE_KEY_TURSO_URL) || '';
  const storedToken = localStorage.getItem(STORAGE_KEY_TURSO_TOKEN) || '';

  return {
    url: (storedUrl || envUrl).trim(),
    authToken: (storedToken || envToken).trim()
  };
}

export function saveTursoCredentials(url: string, authToken: string) {
  if (url) {
    localStorage.setItem(STORAGE_KEY_TURSO_URL, url.trim());
  } else {
    localStorage.removeItem(STORAGE_KEY_TURSO_URL);
  }

  if (authToken) {
    localStorage.setItem(STORAGE_KEY_TURSO_TOKEN, authToken.trim());
  } else {
    localStorage.removeItem(STORAGE_KEY_TURSO_TOKEN);
  }

  cachedClient = null;
}

export function getTursoClient(): Client | null {
  if (cachedClient) return cachedClient;

  const { url, authToken } = getSavedTursoCredentials();
  if (!url) return null;

  try {
    // Normalizing URL for browser HTTP client:
    // If user provided libsql://..., web client requires https:// or libsql:// which gets translated
    let httpUrl = url;
    if (httpUrl.startsWith('libsql://')) {
      httpUrl = httpUrl.replace('libsql://', 'https://');
    }

    cachedClient = createClient({
      url: httpUrl,
      authToken: authToken || undefined
    });
    return cachedClient;
  } catch (err) {
    console.error('Failed to initialize Turso client:', err);
    return null;
  }
}

// Check connection
export async function testTursoConnection(url: string, authToken: string): Promise<{ success: boolean; latencyMs?: number; error?: string }> {
  try {
    let httpUrl = url.trim();
    if (httpUrl.startsWith('libsql://')) {
      httpUrl = httpUrl.replace('libsql://', 'https://');
    }
    const start = performance.now();
    const tempClient = createClient({
      url: httpUrl,
      authToken: authToken.trim() || undefined
    });
    await tempClient.execute('SELECT 1 as ping;');
    const latencyMs = Math.round(performance.now() - start);
    return { success: true, latencyMs };
  } catch (err: any) {
    return { 
      success: false, 
      error: err?.message || 'Failed to connect to Turso SQLite database' 
    };
  }
}

// DDL statements for Turso SQLite
export const SCHEMA_SQL = [
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
  );`
];

export async function initializeTursoSchema(): Promise<{ success: boolean; message: string }> {
  const client = getTursoClient();
  if (!client) {
    return { success: false, message: 'No Turso credentials configured. Operating in Local SQLite fallback.' };
  }

  try {
    for (const sql of SCHEMA_SQL) {
      await client.execute(sql);
    }
    return { success: true, message: 'Turso SQLite database tables verified & initialized.' };
  } catch (err: any) {
    console.error('Error initializing Turso schema:', err);
    return { success: false, message: err?.message || 'Failed to initialize schema on Turso.' };
  }
}

// Seed initial data to Turso if tables are empty
export async function seedTursoIfEmpty(): Promise<{ seeded: boolean; message: string }> {
  const client = getTursoClient();
  if (!client) return { seeded: false, message: 'Turso client not available.' };

  try {
    const res = await client.execute('SELECT COUNT(*) as count FROM users;');
    const userCount = Number(res.rows[0]?.count ?? 0);

    if (userCount === 0) {
      // Seed users
      for (const u of INITIAL_USERS) {
        await client.execute({
          sql: `INSERT OR REPLACE INTO users (id, username, password, full_name, email, mobile_number, role, institute, avatar_url, joined_date)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
          args: [u.id, u.username, u.password || 'password123', u.fullName, u.email, u.mobileNumber, u.role, u.institute, u.avatarUrl || '', u.joinedDate]
        });
      }

      // Seed courses
      for (const c of INITIAL_COURSES) {
        await client.execute({
          sql: `INSERT OR REPLACE INTO courses (id, trainer_id, trainer_name, title, code, category, description, min_pass_pct, min_attendance_pct, institute, created_at, total_sessions_expected)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
          args: [c.id, c.trainerId, c.trainerName, c.title, c.code, c.category, c.description, c.minPassPct, c.minAttendancePct, c.institute, c.createdAt, c.totalSessionsExpected]
        });
      }

      // Seed enrollments
      for (const e of INITIAL_ENROLLMENTS) {
        await client.execute({
          sql: `INSERT OR REPLACE INTO enrollments (id, course_id, trainee_id, trainee_name, trainee_email, trainee_mobile, status, requested_at, decided_at, notes)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
          args: [e.id, e.courseId, e.traineeId, e.traineeName, e.traineeEmail, e.traineeMobile, e.status, e.requestedAt, e.decidedAt || null, e.notes || '']
        });
      }

      // Seed sessions
      for (const s of INITIAL_SESSIONS) {
        await client.execute({
          sql: `INSERT OR REPLACE INTO sessions (id, course_id, course_title, topic, session_date, start_time, end_time, venue, status, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
          args: [s.id, s.courseId, s.courseTitle, s.topic, s.sessionDate, s.startTime, s.endTime, s.venue, s.status, s.createdAt]
        });
      }

      // Seed attendance logs
      for (const a of INITIAL_ATTENDANCE_LOGS) {
        await client.execute({
          sql: `INSERT OR REPLACE INTO attendance_logs (id, session_id, course_id, trainee_id, trainee_name, scanned_at, ip_address, verified, method)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
          args: [a.id, a.sessionId, a.courseId, a.traineeId, a.traineeName, a.scannedAt, a.ipAddress, a.verified ? 1 : 0, a.method]
        });
      }

      return { seeded: true, message: 'Successfully seeded NCCT cooperative data into Turso SQLite.' };
    }

    return { seeded: false, message: `Turso database already contains ${userCount} users.` };
  } catch (err: any) {
    console.error('Error seeding Turso:', err);
    return { seeded: false, message: err?.message || 'Failed to seed Turso' };
  }
}

// Run custom SQL query
export async function runTursoQuery(sql: string): Promise<{ columns: string[]; rows: any[]; affectedRows?: number; error?: string }> {
  const client = getTursoClient();
  if (!client) {
    return { columns: [], rows: [], error: 'Turso client not connected. Please configure your Turso Database URL and Auth Token in settings.' };
  }

  try {
    const result = await client.execute(sql);
    const columns = result.columns || [];
    const rows = result.rows.map(row => {
      const obj: Record<string, any> = {};
      columns.forEach((col, idx) => {
        obj[col] = (row as any)[idx] !== undefined ? (row as any)[idx] : (row as any)[col];
      });
      return obj;
    });

    return {
      columns,
      rows,
      affectedRows: result.rowsAffected
    };
  } catch (err: any) {
    return {
      columns: [],
      rows: [],
      error: err?.message || 'SQL Execution error'
    };
  }
}
