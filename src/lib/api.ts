import type {
  AssessmentSubmission,
  AttendanceLog,
  Course,
  CourseAssessment,
  CourseSession,
  Enrollment,
  JobApplication,
  JobPosting,
  LessonProgress,
  QRAttendanceToken,
  UserProfile,
  UserRole,
} from '../types';

const TOKEN_KEY = 'ncct_session_token';
const QUEUE_KEY = 'ncct_pending_writes';

export type EntityName =
  | 'users'
  | 'courses'
  | 'enrollments'
  | 'sessions'
  | 'qr_tokens'
  | 'attendance'
  | 'assessments'
  | 'submissions'
  | 'progress'
  | 'jobs'
  | 'applications';

export interface EntitySnapshot {
  users: UserProfile[];
  courses: Course[];
  enrollments: Enrollment[];
  sessions: CourseSession[];
  qrTokens: QRAttendanceToken[];
  attendance: AttendanceLog[];
  assessments: CourseAssessment[];
  submissions: AssessmentSubmission[];
  progress: LessonProgress[];
  jobs: JobPosting[];
  applications: JobApplication[];
}

export interface ScanResult {
  success: boolean;
  reason?: 'invalid' | 'expired' | 'not_enrolled' | 'pending' | 'rejected' | 'duplicate';
  message: string;
  log?: AttendanceLog;
  session?: CourseSession;
  course?: Course | null;
}

export interface RegisterData {
  username: string;
  password: string;
  fullName: string;
  role: UserRole;
  institute: string;
  mobileNumber: string;
  email?: string;
  designation?: string;
  qualification?: string;
  idProofType?: string;
  idProofNumber?: string;
  applicationReason?: string;
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export class OfflineQueuedError extends Error {
  entity: EntityName;
  records: any[];

  constructor(entity: EntityName, records: any[]) {
    super(`Offline: ${records.length} ${entity} record(s) queued for sync when back online.`);
    this.name = 'OfflineQueuedError';
    this.entity = entity;
    this.records = records;
  }
}

interface PendingWrite {
  entity: EntityName;
  records: any[];
  queuedAt: string;
}

export function getToken(): string | null {
  try {
    return window.localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string | null): void {
  try {
    if (token === null) {
      window.localStorage.removeItem(TOKEN_KEY);
    } else {
      window.localStorage.setItem(TOKEN_KEY, token);
    }
  } catch {
    return;
  }
}

async function toApiError(res: Response): Promise<ApiError> {
  let message = '';
  try {
    const data = await res.json();
    if (data && typeof data === 'object') {
      message = String((data as any).message ?? (data as any).error ?? '');
    } else if (typeof data === 'string') {
      message = data;
    }
  } catch {
    message = '';
  }
  return new ApiError(message || `Request failed with status ${res.status}`, res.status);
}

export interface ApiRequestOptions {
  method?: string;
  headers?: HeadersInit;
  body?: unknown;
  signal?: AbortSignal;
}

export async function apiFetch<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);
  const token = getToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const init: RequestInit = { method: options.method, headers, signal: options.signal };
  if (options.body != null && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
    init.body = typeof options.body === 'string' ? options.body : JSON.stringify(options.body);
  }

  const url = `/api${path.startsWith('/') ? path : `/${path}`}`;
  const res = await fetch(url, init);
  if (!res.ok) {
    throw await toApiError(res);
  }
  return (await res.json()) as T;
}

export async function authLogin(username: string, password: string): Promise<{ token: string; user: UserProfile }> {
  return apiFetch<{ token: string; user: UserProfile }>('/auth/login', {
    method: 'POST',
    body: { username, password },
  });
}

export async function authRegister(data: RegisterData): Promise<{ user: UserProfile }> {
  return apiFetch<{ user: UserProfile }>('/auth/register', {
    method: 'POST',
    body: data,
  });
}

export async function authMe(): Promise<{ user: UserProfile }> {
  return apiFetch<{ user: UserProfile }>('/auth/me');
}

async function fetchEntityRows<T>(entity: EntityName): Promise<T[]> {
  const data = await apiFetch<{ rows: T[] }>(`/data/${entity}`);
  return data.rows ?? [];
}

export async function fetchAllEntities(): Promise<EntitySnapshot> {
  const qrTokensPromise = fetchEntityRows<QRAttendanceToken>('qr_tokens').catch((err) => {
    if (err instanceof ApiError && err.status === 401) {
      return [] as QRAttendanceToken[];
    }
    throw err;
  });

  const [
    users,
    courses,
    enrollments,
    sessions,
    qrTokens,
    attendance,
    assessments,
    submissions,
    progress,
    jobs,
    applications,
  ] = await Promise.all([
    fetchEntityRows<UserProfile>('users'),
    fetchEntityRows<Course>('courses'),
    fetchEntityRows<Enrollment>('enrollments'),
    fetchEntityRows<CourseSession>('sessions'),
    qrTokensPromise,
    fetchEntityRows<AttendanceLog>('attendance'),
    fetchEntityRows<CourseAssessment>('assessments'),
    fetchEntityRows<AssessmentSubmission>('submissions'),
    fetchEntityRows<LessonProgress>('progress'),
    fetchEntityRows<JobPosting>('jobs'),
    fetchEntityRows<JobApplication>('applications'),
  ]);

  return {
    users,
    courses,
    enrollments,
    sessions,
    qrTokens,
    attendance,
    assessments,
    submissions,
    progress,
    jobs,
    applications,
  };
}

async function rawUpsert(entity: EntityName, records: any[]): Promise<void> {
  await apiFetch<{ upserted: number }>(`/data/${entity}`, {
    method: 'POST',
    body: { records },
  });
}

export async function upsertEntity(entity: EntityName, records: any[]): Promise<void> {
  try {
    await rawUpsert(entity, records);
  } catch (err) {
    if (err instanceof ApiError && err.status >= 400 && err.status < 500) {
      throw err;
    }
    enqueueWrite(entity, records);
    throw new OfflineQueuedError(entity, records);
  }
}

export function scanAttendance(
  token: string,
  traineeId?: string,
  method?: 'web_qr_scan' | 'manual_token'
): Promise<ScanResult> {
  return apiFetch<ScanResult>('/attendance/scan', {
    method: 'POST',
    body: { token, traineeId, method },
  });
}

export function verifyLookup(code: string): Promise<any> {
  return apiFetch<any>(`/verify?code=${encodeURIComponent(code)}`);
}

export async function healthCheck(): Promise<{ connected: boolean; latencyMs?: number }> {
  try {
    return await apiFetch<{ connected: boolean; latencyMs?: number }>('/health');
  } catch (err) {
    if (err instanceof ApiError && err.status === 503) {
      return { connected: false };
    }
    throw err;
  }
}

function readQueue(): PendingWrite[] {
  try {
    const raw = window.localStorage.getItem(QUEUE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as PendingWrite[]) : [];
  } catch {
    return [];
  }
}

function writeQueue(queue: PendingWrite[]): void {
  try {
    window.localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch {
    return;
  }
}

export function enqueueWrite(entity: EntityName, records: any[]): void {
  const queue = readQueue();
  queue.push({ entity, records, queuedAt: new Date().toISOString() });
  writeQueue(queue);
}

export function getPendingWrites(): number {
  return readQueue().length;
}

export async function replayPendingWrites(): Promise<number> {
  let replayed = 0;
  for (;;) {
    const queue = readQueue();
    if (queue.length === 0) break;
    const next = queue[0];
    try {
      await rawUpsert(next.entity, next.records);
    } catch (err) {
      if (err instanceof ApiError && err.status >= 400 && err.status < 500) {
        writeQueue(readQueue().slice(1));
        continue;
      }
      return replayed;
    }
    writeQueue(readQueue().slice(1));
    replayed += 1;
  }
  return replayed;
}

export function clearQueue(): void {
  try {
    window.localStorage.removeItem(QUEUE_KEY);
  } catch {
    return;
  }
}

export function initOfflineSync(onSettled: () => void): () => void {
  if (typeof window === 'undefined') {
    return () => undefined;
  }
  const handler = async () => {
    try {
      await replayPendingWrites();
    } catch {
      return;
    }
    onSettled();
  };
  window.addEventListener('online', handler);
  return () => window.removeEventListener('online', handler);
}
