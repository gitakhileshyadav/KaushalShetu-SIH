import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  UserProfile, 
  Course, 
  Enrollment, 
  CourseSession, 
  QRAttendanceToken, 
  AttendanceLog, 
  AttendanceStats,
  UserRole,
  AppPage,
  TursoConfig,
  CourseLesson,
  CourseAssessment,
  AssessmentSubmission,
  LessonProgress,
  AssessmentQuestion,
  CourseResourceItem,
  JobPosting,
  JobApplication
} from '../types';
import { 
  INITIAL_USERS, 
  INITIAL_COURSES, 
  INITIAL_ENROLLMENTS, 
  INITIAL_SESSIONS, 
  INITIAL_ATTENDANCE_LOGS 
} from '../data/initialData';
import {
  COMPREHENSIVE_COURSES,
  COMPREHENSIVE_ASSESSMENTS,
  INITIAL_SUBMISSIONS
} from '../data/coursesData';
import {
  fetchAllEntities,
  upsertEntity,
  enqueueWrite,
  OfflineQueuedError,
  ApiError,
  authLogin,
  authRegister,
  scanAttendance,
  healthCheck,
  initOfflineSync,
  replayPendingWrites,
  getPendingWrites,
  getToken,
  setToken,
  EntityName
} from '../lib/api';
import bcrypt from 'bcryptjs';
import confetti from 'canvas-confetti';

interface AppContextType {
  // Navigation & Multi-page
  currentPage: AppPage;
  navigateTo: (page: AppPage, queryParam?: string) => void;
  verificationQueryCode: string;
  setVerificationQueryCode: (code: string) => void;

  // Auth & Profile
  currentUser: UserProfile | null;
  isAuthenticated: boolean;
  allUsers: UserProfile[];
  signIn: (username: string, password: string) => Promise<{ success: boolean; message: string; user?: UserProfile }>;
  signUp: (data: {
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
  }) => Promise<{ success: boolean; message: string; user?: UserProfile }>;
  signOut: () => void;
  switchUser: (userId: string) => void;
  switchRole: (role: UserRole) => void;
  updateProfile: (data: Partial<UserProfile>) => void;
  approveUserProfile: (userId: string, adminRemarks?: string) => void;
  rejectUserProfile: (userId: string, reason: string) => void;
  updateUserRole: (userId: string, newRole: UserRole) => void;

  // Server Sync Status
  tursoConfig: TursoConfig;
  syncNow: () => Promise<{ success: boolean; message: string }>;
  refreshServer: () => Promise<void>;

  // Domain Data
  courses: Course[];
  enrollments: Enrollment[];
  sessions: CourseSession[];
  activeTokens: Record<string, QRAttendanceToken>; // sessionId -> Token
  attendanceLogs: AttendanceLog[];

  // Course Management & Accreditation
  createCourse: (data: {
    title: string;
    code: string;
    category: string;
    description: string;
    minPassPct: number;
    minAttendancePct: number;
    institute: string;
    totalSessionsExpected: number;
    notes?: string;
  }) => Course;
  updateCourse: (id: string, data: Partial<Course>) => void;
  deleteCourse: (id: string) => void;
  approveCourse: (courseId: string, remarks?: string) => void;
  rejectCourse: (courseId: string, reason: string) => void;
  updateCourseNotes: (courseId: string, notes: string) => void;
  addCourseResource: (courseId: string, resource: { title: string; type: 'pdf' | 'notes' | 'document' | 'video'; url: string; summary?: string }) => void;
  addCourseLesson: (courseId: string, lesson: Omit<CourseLesson, 'id'>) => void;

  // Trainee Admission
  requestAdmission: (courseId: string, notes?: string, customTraineeId?: string) => { success: boolean; message: string };
  decideAdmission: (enrollmentId: string, status: 'approved' | 'rejected') => void;

  // Session & QR Attendance
  createSession: (data: {
    courseId: string;
    topic: string;
    sessionDate: string;
    startTime: string;
    endTime: string;
    venue: string;
  }) => CourseSession;
  generateQRToken: (sessionId: string, durationMinutes?: number) => QRAttendanceToken;
  verifyAndMarkAttendance: (tokenString: string, manualTraineeId?: string) => Promise<{
    success: boolean;
    message: string;
    session?: CourseSession;
    course?: Course;
    log?: AttendanceLog;
  }>;

  // Public Verification
  lookupVerificationRecord: (tokenOrCode: string) => {
    found: boolean;
    log?: AttendanceLog;
    session?: CourseSession;
    course?: Course;
    trainee?: UserProfile;
    message?: string;
  };

  // Attendance metrics
  getCourseAttendanceStats: (courseId: string, traineeId: string) => AttendanceStats;
  getSessionAttendees: (sessionId: string) => AttendanceLog[];
  resetAllData: () => void;

  // In-Platform Classroom & Interactive Courses
  activeClassroomCourseId: string | null;
  openClassroom: (courseId: string) => void;
  lessonProgress: LessonProgress[];
  markLessonComplete: (courseId: string, lessonId: string) => void;

  // Assessments & Certification
  assessments: CourseAssessment[];
  submissions: AssessmentSubmission[];
  activeAssessmentId: string | null;
  openAssessment: (assessmentId: string) => void;
  submitAssessment: (data: {
    assessmentId: string;
    courseId: string;
    courseTitle: string;
    scorePct: number;
    totalQuestions: number;
    correctAnswersCount: number;
    passed: boolean;
    answers: Record<string, number>;
  }) => AssessmentSubmission;
  approveSubmission: (subId: string, remarks?: string) => void;
  addAssessmentQuestion: (assessmentId: string, question: Omit<AssessmentQuestion, 'id'>) => void;

  // Job Postings & Placements
  jobPostings: JobPosting[];
  jobApplications: JobApplication[];
  createJobPosting: (data: {
    title: string;
    description: string;
    requirements: string;
    location: string;
    salary: string;
    deadline: string;
    requiredCategory?: string;
  }) => JobPosting;
  applyForJob: (jobId: string, coverNote?: string) => { success: boolean; message: string };
  updateJobApplicationStatus: (appId: string, status: 'pending' | 'shortlisted' | 'hired' | 'rejected') => void;
  verifyCertificate: (codeOrName: string) => {
    valid: boolean;
    message: string;
    submission?: AssessmentSubmission;
    trainee?: UserProfile;
  };
}

const STORAGE_KEY = 'ncct_coop_ecosystem_v1';
const PENDING_SCANS_KEY = 'ncct_pending_scans';

// Seeded demo accounts: their credentials are public (shown on the login page),
// so auto-authenticating the demo state adds no new exposure. It makes the
// demo's mutations (sessions, courses, QR tokens) sync to the server without
// requiring an explicit sign-in first.
const DEMO_CREDENTIALS: Record<string, string> = {
  usr_trainer_1: 'trainer1',
  usr_trainee_1: 'trainee1',
  usr_admin_1: 'admin1',
  usr_recruiter_1: 'recruiter1'
};
const DEMO_PASSWORD = 'password123';

const AppContext = createContext<AppContextType | undefined>(undefined);

// Shared course-state builder: merges server/local rows with the COMPREHENSIVE_COURSES
// catalog and guarantees default approval for initial + core curriculum courses.
// Used by BOTH the initial state initializer and refreshFromServer().
function buildCourses(saved: Course[] | null): Course[] {
  let merged = [...INITIAL_COURSES, ...COMPREHENSIVE_COURSES];
  if (saved) {
    try {
      const parsed: Course[] = saved;
      merged = [...parsed];
      COMPREHENSIVE_COURSES.forEach(cc => {
        const idx = merged.findIndex(m => m.id === cc.id);
        if (idx === -1) {
          merged.push(cc);
        } else if (!merged[idx].modules || merged[idx].modules?.length === 0) {
          merged[idx] = { ...merged[idx], ...cc };
        }
      });
    } catch (e) {
      // fallback
    }
  }
  // Ensure all standard initial and catalog courses are accredited & approved by default
  merged = merged.map(c => {
    if (!c.approvalStatus) {
      return { ...c, approvalStatus: 'approved' };
    }
    return c;
  });

  // Explicitly guarantee all core curriculum courses are approved and visible to all trainees
  const coreCourseIds = [
    'crs_pacs_101', 
    'crs_dairy_202', 
    'crs_finance_303', 
    'crs_fisheries_404', 
    'crs_solar_606', 
    'crs_gov_501', 
    'crs_poultry_101', 
    'crs_electrician_201'
  ];
  merged = merged.map(c => {
    if (coreCourseIds.includes(c.id)) {
      return { ...c, approvalStatus: 'approved' };
    }
    return c;
  });

  return merged;
}

// Helper to parse route from URL hash
function getPageFromHash(): { page: AppPage; query?: string } {
  const hash = window.location.hash.replace(/^#\/?/, '').trim();
  if (!hash) return { page: 'home' };

  const [pathPart, queryPart] = hash.split('?');
  const cleanPath = pathPart.replace(/\/$/, '');

  let query: string | undefined = undefined;
  if (queryPart) {
    const params = new URLSearchParams(queryPart);
    query = params.get('code') || params.get('token') || params.get('q') || params.get('courseId') || params.get('assessmentId') || undefined;
  }

  switch (cleanPath) {
    case 'home':
      return { page: 'home' };
    case 'courses':
      return { page: 'courses' };
    case 'classroom':
      return { page: 'classroom', query };
    case 'assessments':
      return { page: 'assessments', query };
    case 'trainer':
      return { page: 'trainer' };
    case 'trainee':
      return { page: 'trainee' };
    case 'qr-display':
    case 'qr_display':
      return { page: 'qr_display' };
    case 'scanner':
      return { page: 'scanner' };
    case 'verify':
      return { page: 'verify', query };
    case 'admin':
      return { page: 'admin' };
    case 'employer':
      return { page: 'employer' };
    case 'database':
      return { page: 'database' };
    case 'login':
      return { page: 'login' };
    case 'register':
      return { page: 'register' };
    default:
      return { page: 'home' };
  }
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Hash Routing & Multi-page
  const [currentPage, setCurrentPageState] = useState<AppPage>(() => getPageFromHash().page);
  const [verificationQueryCode, setVerificationQueryCode] = useState<string>(() => getPageFromHash().query || '');

  // Server Sync Config State (new shape: status/lastSyncedAt/errorMsg/pendingWrites)
  const [tursoConfig, setTursoConfig] = useState<TursoConfig>(() => ({ status: 'connecting' }));

  // State initialization from localStorage with initial fallback
  const [allUsers, setAllUsers] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_users`);
    let users = saved ? JSON.parse(saved) : INITIAL_USERS;
    INITIAL_USERS.forEach(iu => {
      if (iu.status === 'pending_approval') {
        const existing = users.find((u: UserProfile) => u.id === iu.id);
        if (!existing) {
          users.push(iu);
        } else if (existing.status === 'approved') {
          existing.status = 'pending_approval';
        }
      }
    });
    return users;
  });

  const [currentUserId, setCurrentUserId] = useState<string | null>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_cur_user`);
    // Default to trainer1 so initial experience is immediate, or null if signed out
    return saved !== null ? saved : 'usr_trainer_1';
  });

  const [courses, setCourses] = useState<Course[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_courses`);
    let parsed: Course[] | null = null;
    if (saved) {
      try {
        parsed = JSON.parse(saved);
      } catch (e) {
        parsed = null;
      }
    }
    return buildCourses(parsed);
  });

  const [enrollments, setEnrollments] = useState<Enrollment[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_enrollments`);
    if (saved) {
      try {
        const parsed: Enrollment[] = JSON.parse(saved);
        const merged = [...parsed];
        INITIAL_ENROLLMENTS.forEach(ie => {
          if (!merged.some(m => m.id === ie.id)) {
            merged.push(ie);
          }
        });
        return merged;
      } catch (e) {
        // fallback
      }
    }
    return INITIAL_ENROLLMENTS;
  });

  const [assessments, setAssessments] = useState<CourseAssessment[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_assessments`);
    return saved ? JSON.parse(saved) : COMPREHENSIVE_ASSESSMENTS;
  });

  const [submissions, setSubmissions] = useState<AssessmentSubmission[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_submissions`);
    return saved ? JSON.parse(saved) : INITIAL_SUBMISSIONS;
  });

  const [jobPostings, setJobPostings] = useState<JobPosting[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_job_postings`);
    return saved ? JSON.parse(saved) : [
      {
        id: 'job_1',
        employerId: 'usr_recruiter_1',
        employerName: 'IFFCO Cooperative Society Ltd.',
        title: 'Senior Cooperative Field Officer',
        description: 'Coordinate agricultural fertilizer distribution, farmer training camps, and cooperative society liaison across regional districts.',
        requirements: 'NCCT Diploma in Cooperative Management or Agri-Business.',
        location: 'Anand, Gujarat',
        salary: '₹5.5 LPA - ₹7.2 LPA',
        createdAt: '2026-09-01',
        deadline: '2026-10-30',
        requiredCategory: 'Cooperative Management'
      },
      {
        id: 'job_2',
        employerId: 'usr_recruiter_1',
        employerName: 'AMUL Dairy Federation (GCMMF)',
        title: 'PACS Dairy Processing Supervisor',
        description: 'Manage milk collection center digital ledger operations, quality testing protocols, and cooperative member disbursements.',
        requirements: 'Certified Dairy Farming & Cooperative Governance training certificate.',
        location: 'Mehsana, Gujarat',
        salary: '₹4.8 LPA - ₹6.5 LPA',
        createdAt: '2026-09-03',
        deadline: '2026-11-15',
        requiredCategory: 'Dairy Farming'
      }
    ];
  });

  const [jobApplications, setJobApplications] = useState<JobApplication[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_job_applications`);
    return saved ? JSON.parse(saved) : [
      {
        id: 'app_1',
        jobId: 'job_1',
        traineeId: 'usr_trainee_1',
        traineeName: 'Aarav Sharma',
        traineeEmail: 'aarav.sharma@ncct.gov.in',
        traineeMobile: '+91 98765 43210',
        institute: 'RICM Gandhinagar',
        status: 'shortlisted',
        appliedAt: '2026-09-04',
        coverNote: 'Completed VAMNICOM Cooperative Management diploma with distinction.'
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_job_postings`, JSON.stringify(jobPostings));
  }, [jobPostings]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_job_applications`, JSON.stringify(jobApplications));
  }, [jobApplications]);

  const [lessonProgress, setLessonProgress] = useState<LessonProgress[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_progress`);
    return saved ? JSON.parse(saved) : [];
  });

  const [activeClassroomCourseId, setActiveClassroomCourseId] = useState<string | null>(() => {
    const initialRoute = getPageFromHash();
    if (initialRoute.page === 'classroom' && initialRoute.query) {
      return initialRoute.query;
    }
    return 'crs_poultry_101';
  });

  const [activeAssessmentId, setActiveAssessmentId] = useState<string | null>(() => {
    const initialRoute = getPageFromHash();
    if (initialRoute.page === 'assessments' && initialRoute.query) {
      return initialRoute.query;
    }
    return null;
  });

  const [sessions, setSessions] = useState<CourseSession[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_sessions`);
    return saved ? JSON.parse(saved) : INITIAL_SESSIONS;
  });

  const [activeTokens, setActiveTokens] = useState<Record<string, QRAttendanceToken>>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_tokens`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    // Default pre-seeded active token for demonstration
    const expiry = new Date(Date.now() + 30 * 60 * 1000).toISOString();
    return {
      ses_pacs_s3: {
        id: 'tok_active_demo',
        sessionId: 'ses_pacs_s3',
        courseId: 'crs_pacs_101',
        token: 'NCCT-QR-PACS-SECURE-88219',
        expiresAt: expiry,
        isActive: true,
        createdAt: new Date().toISOString()
      }
    };
  });

  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceLog[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_attendance`);
    return saved ? JSON.parse(saved) : INITIAL_ATTENDANCE_LOGS;
  });

  // Keep Hash in sync with Browser URL and History
  const navigateTo = useCallback((page: AppPage, queryParam?: string) => {
    setCurrentPageState(page);
    if (queryParam) {
      setVerificationQueryCode(queryParam);
      window.location.hash = `#/${page}?code=${encodeURIComponent(queryParam)}`;
    } else {
      window.location.hash = `#/${page}`;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      const { page, query } = getPageFromHash();
      setCurrentPageState(page);
      if (query) setVerificationQueryCode(query);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Save to LocalStorage whenever state changes
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_users`, JSON.stringify(allUsers));
  }, [allUsers]);

  useEffect(() => {
    if (currentUserId) {
      localStorage.setItem(`${STORAGE_KEY}_cur_user`, currentUserId);
    } else {
      localStorage.removeItem(`${STORAGE_KEY}_cur_user`);
    }
  }, [currentUserId]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_courses`, JSON.stringify(courses));
  }, [courses]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_enrollments`, JSON.stringify(enrollments));
  }, [enrollments]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_sessions`, JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_tokens`, JSON.stringify(activeTokens));
  }, [activeTokens]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_attendance`, JSON.stringify(attendanceLogs));
  }, [attendanceLogs]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_assessments`, JSON.stringify(assessments));
  }, [assessments]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_submissions`, JSON.stringify(submissions));
  }, [submissions]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_progress`, JSON.stringify(lessonProgress));
  }, [lessonProgress]);

  // ===== Server-primary data flow =====

  // refreshFromServer(): fetch all entities from the backend, replace local state,
  // mirror into the ${STORAGE_KEY}_* localStorage read-cache, and mark sync status.
  const refreshFromServer = useCallback(async (opts?: { silent?: boolean }) => {
    try {
      const snapshot = await fetchAllEntities();

      setAllUsers(snapshot.users);
      const mergedCourses = buildCourses(snapshot.courses);
      setCourses(mergedCourses);
      setEnrollments(snapshot.enrollments);
      setSessions(snapshot.sessions);

      // qrTokens array -> Record keyed by sessionId, latest createdAt wins.
      // If the server returned no tokens (empty or unauthorized), keep the current
      // tokens (demo token / locally generated) so the live demo keeps working.
      const tokensRecord: Record<string, QRAttendanceToken> = {};
      snapshot.qrTokens.forEach(t => {
        const existing = tokensRecord[t.sessionId];
        if (!existing || new Date(t.createdAt) > new Date(existing.createdAt)) {
          tokensRecord[t.sessionId] = t;
        }
      });
      const hasTokens = snapshot.qrTokens.length > 0;
      if (hasTokens) {
        setActiveTokens(tokensRecord);
      }

      setAttendanceLogs(snapshot.attendance);
      setAssessments(snapshot.assessments);
      setSubmissions(snapshot.submissions);
      setLessonProgress(snapshot.progress);
      setJobPostings(snapshot.jobs);
      setJobApplications(snapshot.applications);

      // Mirror into the localStorage read-cache (PWA offline support)
      try {
        localStorage.setItem(`${STORAGE_KEY}_users`, JSON.stringify(snapshot.users));
        localStorage.setItem(`${STORAGE_KEY}_courses`, JSON.stringify(mergedCourses));
        localStorage.setItem(`${STORAGE_KEY}_enrollments`, JSON.stringify(snapshot.enrollments));
        localStorage.setItem(`${STORAGE_KEY}_sessions`, JSON.stringify(snapshot.sessions));
        if (hasTokens) {
          localStorage.setItem(`${STORAGE_KEY}_tokens`, JSON.stringify(tokensRecord));
        }
        localStorage.setItem(`${STORAGE_KEY}_attendance`, JSON.stringify(snapshot.attendance));
        localStorage.setItem(`${STORAGE_KEY}_assessments`, JSON.stringify(snapshot.assessments));
        localStorage.setItem(`${STORAGE_KEY}_submissions`, JSON.stringify(snapshot.submissions));
        localStorage.setItem(`${STORAGE_KEY}_progress`, JSON.stringify(snapshot.progress));
        localStorage.setItem(`${STORAGE_KEY}_job_postings`, JSON.stringify(snapshot.jobs));
        localStorage.setItem(`${STORAGE_KEY}_job_applications`, JSON.stringify(snapshot.applications));
      } catch {
        // ignore cache write failures
      }

      setTursoConfig(prev => ({
        ...prev,
        status: 'connected',
        lastSyncedAt: new Date().toLocaleTimeString(),
        errorMsg: undefined
      }));
    } catch (err) {
      if (!opts?.silent) {
        if (err instanceof ApiError) {
          setTursoConfig(prev => ({ ...prev, status: 'error', errorMsg: err.message }));
        } else {
          setTursoConfig(prev => ({ ...prev, status: 'offline' }));
        }
      }
      // State stays as cached — no data loss.
    }
  }, []);

  // persist(entity, records): the caller has already applied the optimistic local
  // update; this pushes the record(s) to the backend, queueing when offline.
  // 401 (not signed in / expired session) is surfaced — never silently dropped.
  const persist = useCallback((entity: EntityName, records: any[]) => {
    upsertEntity(entity, records).catch((err) => {
      if (err instanceof OfflineQueuedError) {
        setTursoConfig(prev => ({ ...prev, pendingWrites: getPendingWrites() }));
      } else if (err instanceof ApiError && err.status === 401) {
        // Not authenticated (or token expired): queue the write so it survives
        // refreshes and replays after sign-in — never dropped silently.
        enqueueWrite(entity, records);
        setTursoConfig(prev => ({
          ...prev,
          pendingWrites: getPendingWrites(),
          errorMsg: 'Sign in required to sync changes — your changes are saved on this device and will sync after sign in.'
        }));
      } else {
        console.warn(`[AppContext] Failed to persist ${entity}:`, err);
      }
    });
  }, []);

  // Offline scan queue: scans made while offline are stored here and replayed
  // (POSTed to /api/attendance/scan) when connectivity returns. Deliberately NOT
  // stored via enqueueWrite — replayPendingWrites targets /api/data/[entity],
  // which would 404 for scans and dead-letter them.
  const queuePendingScan = useCallback((token: string, traineeId?: string, method?: string) => {
    try {
      const raw = localStorage.getItem(PENDING_SCANS_KEY);
      const queue: { token: string; traineeId?: string; method?: string; queuedAt: string }[] = raw ? JSON.parse(raw) : [];
      if (Array.isArray(queue)) {
        queue.push({ token, traineeId, method, queuedAt: new Date().toISOString() });
        localStorage.setItem(PENDING_SCANS_KEY, JSON.stringify(queue));
      }
    } catch {
      // ignore
    }
  }, []);

  const readPendingScans = (): { token: string; traineeId?: string; method?: string; queuedAt: string }[] => {
    try {
      const raw = localStorage.getItem(PENDING_SCANS_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const replayPendingScans = useCallback(async (): Promise<number> => {
    const queue = readPendingScans();
    if (queue.length === 0) return 0;
    const remaining: { token: string; traineeId?: string; method?: string; queuedAt: string }[] = [];
    let replayed = 0;
    for (const item of queue) {
      try {
        const res = await scanAttendance(item.token, item.traineeId, item.method as 'web_qr_scan' | 'manual_token' | undefined);
        if (res.success && res.log) {
          replayed += 1;
          const log = res.log;
          setAttendanceLogs(prev => (prev.some(l => l.id === log.id) ? prev : [log, ...prev]));
        }
        // success:false = scan was validated and rejected at replay time — drop it (spec §7)
      } catch {
        // Still offline — keep the scan queued
        remaining.push(item);
      }
    }
    try {
      if (remaining.length === 0) {
        localStorage.removeItem(PENDING_SCANS_KEY);
      } else {
        localStorage.setItem(PENDING_SCANS_KEY, JSON.stringify(remaining));
      }
    } catch {
      // ignore
    }
    return replayed;
  }, []);

  const syncNow = useCallback(async (): Promise<{ success: boolean; message: string }> => {
    setTursoConfig(prev => ({ ...prev, status: 'syncing' }));
    try {
      const writesReplayed = await replayPendingWrites();
      const scansReplayed = await replayPendingScans();
      await refreshFromServer();
      setTursoConfig(prev => ({ ...prev, pendingWrites: getPendingWrites() }));
      const parts: string[] = [];
      if (writesReplayed > 0) parts.push(`${writesReplayed} pending write${writesReplayed === 1 ? '' : 's'} synced`);
      if (scansReplayed > 0) parts.push(`${scansReplayed} offline scan${scansReplayed === 1 ? '' : 's'} verified`);
      return {
        success: true,
        message: parts.length > 0
          ? `Sync complete: ${parts.join(', ')}.`
          : 'You are up to date. All records are synced with the NCCT server.'
      };
    } catch (err: any) {
      setTursoConfig(prev => ({ ...prev, status: 'offline', errorMsg: err?.message || 'Sync failed' }));
      return {
        success: false,
        message: 'Sync failed. You appear to be offline. Your changes are saved locally and will sync automatically when you reconnect.'
      };
    }
  }, [refreshFromServer, replayPendingScans]);

  // Mount: initialize the offline sync listener, refresh from the server, and run
  // a health check. Status flows 'connecting' -> 'connected' | 'offline'.
  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      // Demo auto-auth: the default demo state (e.g. usr_trainer_1) gets a real
      // session token silently, so trainer-created sessions/tokens sync to the
      // server without an explicit sign-in. Real accounts sign in themselves.
      const demoUsername = DEMO_CREDENTIALS[currentUserId ?? ''];
      if (!getToken() && demoUsername) {
        try {
          const res = await authLogin(demoUsername, DEMO_PASSWORD);
          setToken(res.token);
        } catch {
          // Demo auth unavailable — mutations will surface the 401 notice.
        }
      }

      try {
        const health = await healthCheck();
        if (!isMounted) return;
        if (!health.connected) {
          setTursoConfig(prev => ({ ...prev, status: 'offline' }));
        }
      } catch {
        if (isMounted) setTursoConfig(prev => ({ ...prev, status: 'offline' }));
      }
    };

    setTursoConfig(prev => ({ ...prev, pendingWrites: getPendingWrites() }));
    init();
    refreshFromServer();

    const cleanupSync = initOfflineSync(() => {
      replayPendingScans().finally(() => {
        refreshFromServer();
      });
    });

    return () => {
      isMounted = false;
      cleanupSync();
    };
  }, [refreshFromServer, replayPendingScans]);

  // Live sync: poll the server every 20s (only while the tab is visible) and
  // refresh whenever the tab becomes visible again — so sessions, QR tokens,
  // attendance, and approvals created on OTHER devices appear within seconds.
  useEffect(() => {
    const poll = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        refreshFromServer({ silent: true });
      }
    };
    const interval = setInterval(poll, 20000);
    document.addEventListener('visibilitychange', poll);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', poll);
    };
  }, [refreshFromServer]);

  // Manual/live refresh exposed to components (e.g. refresh right when the QR
  // scanner opens so trainees pick up freshly generated tokens immediately).
  const refreshServer = useCallback(() => refreshFromServer({ silent: true }), [refreshFromServer]);

  // Current authenticated user
  const currentUser: UserProfile | null = allUsers.find(u => u.id === currentUserId) || null;
  const isAuthenticated = currentUser !== null;

  // Sign in via the backend auth endpoint, with an offline fallback that verifies
  // against the cached user hash using bcryptjs (offline convenience mode).
  const signIn = async (username: string, password: string): Promise<{ success: boolean; message: string; user?: UserProfile }> => {
    const trimmedUser = username.trim().toLowerCase();

    try {
      const res = await authLogin(trimmedUser, password);
      setToken(res.token);
      setCurrentUserId(res.user.id);
      // Merge the fresh server user into local state so the UI reflects it immediately
      setAllUsers(prev => {
        const exists = prev.some(u => u.id === res.user.id);
        if (exists) {
          return prev.map(u => (u.id === res.user.id ? { ...u, ...res.user } : u));
        }
        return [res.user, ...prev];
      });

      // Recover anything queued before this sign-in (writes made while
      // unauthenticated, offline scans), then pull the latest server state.
      replayPendingWrites().catch(() => {});
      replayPendingScans().catch(() => {});
      refreshFromServer({ silent: true });

      return {
        success: true,
        message: res.user.status === 'pending_approval'
          ? `Signed in as ${res.user.fullName}. Your registration profile is currently pending NCCT Admin approval.`
          : `Welcome back, ${res.user.fullName}! Signed in successfully.`,
        user: res.user
      };
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          return {
            success: false,
            message: 'Invalid username or password. Please verify your credentials or use the quick test logins below.'
          };
        }
        if (err.status === 403) {
          return {
            success: false,
            message: err.message || 'Your account registration was not approved by NCCT Administration. Please contact the institute administrator.'
          };
        }
        return {
          success: false,
          message: err.message || 'Sign in failed. Please try again.'
        };
      }

      // Network failure (offline) — verify against the cached users hash
      let cachedUsers: UserProfile[] = [];
      try {
        const raw = localStorage.getItem(`${STORAGE_KEY}_users`);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) cachedUsers = parsed as UserProfile[];
        }
      } catch {
        cachedUsers = [];
      }

      const verifyCachedPassword = (plain: string, stored: string | undefined): boolean => {
        if (!stored) return false;
        try {
          return bcrypt.compareSync(plain, stored);
        } catch {
          // Stored value is not a valid bcrypt hash (e.g. plaintext) — direct comparison
          return stored === plain;
        }
      };

      const foundUser = cachedUsers.find(
        u => u && typeof u.username === 'string' && u.username.toLowerCase() === trimmedUser && verifyCachedPassword(password, u.password)
      );

      if (!foundUser) {
        return {
          success: false,
          message: 'You appear to be offline and no matching saved account was found on this device. Please reconnect to sign in.'
        };
      }

      setCurrentUserId(foundUser.id);
      return {
        success: true,
        message: `Offline mode: signed in with saved credentials as ${foundUser.fullName}. Data will sync when you reconnect.`,
        user: foundUser
      };
    }
  };

  // Sign up via the backend register endpoint (server inserts the user), with an
  // offline fallback that creates the user locally and queues it for sync.
  const signUp = async (data: {
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
  }): Promise<{ success: boolean; message: string; user?: UserProfile }> => {
    const trimmedUser = data.username.trim().toLowerCase();

    if (!trimmedUser || !data.password) {
      return { success: false, message: 'Username and password are required.' };
    }

    try {
      const res = await authRegister({ ...data, username: trimmedUser });
      const user = res.user;
      setCurrentUserId(user.id);
      setAllUsers(prev => (prev.some(u => u.id === user.id) ? prev : [user, ...prev]));

      return {
        success: true,
        message: user.status === 'approved'
          ? `Administrator profile created and verified.`
          : `Registration profile submitted successfully! Your account is submitted for NCCT Admin Approval.`,
        user
      };
    } catch (err) {
      if (err instanceof ApiError) {
        return {
          success: false,
          message: err.message || 'Registration failed. Please try again.'
        };
      }

      // Network failure (offline) — create the user locally with the same defaults
      // as before and queue it for server sync.
      if (allUsers.some(u => u.username.toLowerCase() === trimmedUser)) {
        return { success: false, message: `Username "${data.username}" is already taken. Please choose another.` };
      }

      // Role-based approval policy: Admins are auto-approved, while Trainee, Trainer, and Employer require Apex Admin approval
      const isApexAdmin = data.role === 'admin';

      const newUser: UserProfile = {
        id: `usr_${data.role}_${Date.now()}`,
        username: trimmedUser,
        password: data.password,
        fullName: data.fullName.trim() || data.username,
        email: data.email?.trim() || `${trimmedUser}@coop-ncct.in`,
        mobileNumber: data.mobileNumber.trim() || '+91 90000 00000',
        role: data.role,
        institute: data.institute.trim() || 'NCCT Cooperative Institution',
        joinedDate: new Date().toISOString().split('T')[0],
        status: isApexAdmin ? 'approved' : 'pending_approval',
        designation: data.designation?.trim() || (data.role === 'trainer' ? 'Certified Faculty Candidate' : data.role === 'trainee' ? 'Vocational Trainee' : 'Recruitment Officer'),
        qualification: data.qualification?.trim(),
        idProofType: data.idProofType?.trim() || 'Aadhaar / National ID',
        idProofNumber: data.idProofNumber?.trim(),
        applicationReason: data.applicationReason?.trim(),
        approvedAt: isApexAdmin ? new Date().toISOString() : undefined,
        approvedBy: isApexAdmin ? 'NCCT Apex Directorate' : undefined
      };

      setAllUsers(prev => [newUser, ...prev]);
      setCurrentUserId(newUser.id);
      persist('users', [newUser]);

      return {
        success: true,
        message: isApexAdmin
          ? `Offline mode: Administrator profile created on this device and will sync when you reconnect.`
          : `Offline mode: Registration profile saved on this device and queued for NCCT Admin Approval when you reconnect.`,
        user: newUser
      };
    }
  };

  const signOut = () => {
    setCurrentUserId(null);
    navigateTo('login');
  };

  const switchUser = (userId: string) => {
    const user = allUsers.find(u => u.id === userId);
    if (user) {
      setCurrentUserId(user.id);
    }
  };

  const switchRole = (role: UserRole) => {
    const targetUser = allUsers.find(u => u.role === role && u.status === 'approved') || allUsers.find(u => u.role === role);
    if (targetUser) {
      setCurrentUserId(targetUser.id);
    }
  };

  const updateProfile = (data: Partial<UserProfile>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...data };
    setAllUsers(prev => prev.map(u => u.id === currentUser.id ? updated : u));
    persist('users', [updated]);
  };

  // Admin user approvals
  const approveUserProfile = (userId: string, adminRemarks?: string) => {
    const target = allUsers.find(u => u.id === userId);
    if (!target) return;
    const updated: UserProfile = {
      ...target,
      status: 'approved',
      approvedAt: new Date().toISOString(),
      approvedBy: currentUser?.fullName || 'Director K. N. Rao',
      rejectionReason: undefined
    };
    setAllUsers(prev => prev.map(u => u.id === userId ? updated : u));
    persist('users', [updated]);
  };

  const rejectUserProfile = (userId: string, reason: string) => {
    const target = allUsers.find(u => u.id === userId);
    if (!target) return;
    const updated: UserProfile = {
      ...target,
      status: 'rejected',
      rejectionReason: reason || 'Application details did not satisfy NCCT affiliation criteria.'
    };
    setAllUsers(prev => prev.map(u => u.id === userId ? updated : u));
    persist('users', [updated]);
  };

  const updateUserRole = (userId: string, newRole: UserRole) => {
    const target = allUsers.find(u => u.id === userId);
    if (!target) return;
    const updated: UserProfile = { ...target, role: newRole };
    setAllUsers(prev => prev.map(u => u.id === userId ? updated : u));
    persist('users', [updated]);
  };

  // 1. Create Course with Admin Approval Status
  const createCourse = (data: {
    title: string;
    code: string;
    category: string;
    description: string;
    minPassPct: number;
    minAttendancePct: number;
    institute: string;
    totalSessionsExpected: number;
    notes?: string;
  }): Course => {
    const isApexAdmin = currentUser?.role === 'admin';
    const newCourse: Course = {
      id: `crs_${Date.now()}`,
      trainerId: currentUser?.id || 'usr_trainer_1',
      trainerName: currentUser?.fullName || 'Dr. Ramesh Chandra Joshi',
      title: data.title,
      code: data.code.toUpperCase(),
      category: data.category,
      description: data.description,
      minPassPct: data.minPassPct,
      minAttendancePct: data.minAttendancePct,
      institute: data.institute,
      createdAt: new Date().toISOString().split('T')[0],
      totalSessionsExpected: data.totalSessionsExpected,
      approvalStatus: isApexAdmin ? 'approved' : 'pending_approval',
      approvedAt: isApexAdmin ? new Date().toISOString() : undefined,
      approvedBy: isApexAdmin ? (currentUser?.fullName || 'Director K. N. Rao') : undefined,
      notes: data.notes || '',
      resources: []
    };

    setCourses(prev => [newCourse, ...prev]);
    persist('courses', [newCourse]);

    return newCourse;
  };

  const updateCourse = (id: string, data: Partial<Course>) => {
    const existing = courses.find(c => c.id === id);
    const updated = existing ? { ...existing, ...data } : null;
    setCourses(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
    if (updated) persist('courses', [updated]);
  };

  const deleteCourse = (id: string) => {
    setCourses(prev => prev.filter(c => c.id !== id));
    setEnrollments(prev => prev.filter(e => e.courseId !== id));
    setSessions(prev => prev.filter(s => s.courseId !== id));
  };

  // Course Governance & Accreditation
  const approveCourse = (courseId: string, remarks?: string) => {
    const target = courses.find(c => c.id === courseId);
    if (!target) return;
    const updated: Course = {
      ...target,
      approvalStatus: 'approved',
      approvedAt: new Date().toISOString(),
      approvedBy: currentUser?.fullName || 'Director K. N. Rao',
      adminRemarks: remarks || 'Curriculum approved for National Cooperative Education delivery.'
    };
    setCourses(prev => prev.map(c => c.id === courseId ? updated : c));
    persist('courses', [updated]);
  };

  const rejectCourse = (courseId: string, reason: string) => {
    const target = courses.find(c => c.id === courseId);
    if (!target) return;
    const updated: Course = {
      ...target,
      approvalStatus: 'rejected',
      adminRemarks: reason || 'Syllabus requires revisions as per NCCT apex guidelines.'
    };
    setCourses(prev => prev.map(c => c.id === courseId ? updated : c));
    persist('courses', [updated]);
  };

  const updateCourseNotes = (courseId: string, notes: string) => {
    const target = courses.find(c => c.id === courseId);
    const updated = target ? { ...target, notes } : null;
    setCourses(prev => prev.map(c => c.id === courseId ? { ...c, notes } : c));
    if (updated) persist('courses', [updated]);
  };

  const addCourseResource = (courseId: string, resource: { title: string; type: 'pdf' | 'notes' | 'document' | 'video'; url: string; summary?: string }) => {
    const newItem: CourseResourceItem = {
      id: `res_${Date.now()}`,
      title: resource.title,
      type: resource.type,
      url: resource.url,
      summary: resource.summary,
      uploadedAt: new Date().toISOString().split('T')[0]
    };
    const target = courses.find(c => c.id === courseId);
    if (target) {
      const updated: Course = { ...target, resources: [...(target.resources || []), newItem] };
      setCourses(prev => prev.map(c => c.id === courseId ? updated : c));
      persist('courses', [updated]);
    } else {
      setCourses(prev => prev.map(c => {
        if (c.id === courseId) {
          return {
            ...c,
            resources: [...(c.resources || []), newItem]
          };
        }
        return c;
      }));
    }
  };

  const addCourseLesson = (courseId: string, lesson: Omit<CourseLesson, 'id'>) => {
    const newLesson: CourseLesson = {
      ...lesson,
      id: `mod_${Date.now()}`
    };
    const target = courses.find(c => c.id === courseId);
    if (target) {
      const updated: Course = { ...target, modules: [...(target.modules || []), newLesson] };
      setCourses(prev => prev.map(c => c.id === courseId ? updated : c));
      persist('courses', [updated]);
    } else {
      setCourses(prev => prev.map(c => {
        if (c.id === courseId) {
          return {
            ...c,
            modules: [...(c.modules || []), newLesson]
          };
        }
        return c;
      }));
    }
  };

  // 2. Trainee Admission Requests
  const requestAdmission = (courseId: string, notes?: string, customTraineeId?: string): { success: boolean; message: string } => {
    const trainee = customTraineeId ? allUsers.find(u => u.id === customTraineeId) : currentUser;
    if (!trainee) return { success: false, message: 'Please sign in to apply for courses.' };

    const existing = enrollments.find(e => e.courseId === courseId && e.traineeId === trainee.id);
    if (existing) {
      if (existing.status === 'approved') return { success: false, message: 'You are already enrolled and approved for this course.' };
      if (existing.status === 'pending_approval') return { success: false, message: 'Your admission request is already pending trainer approval.' };
      if (existing.status === 'rejected') return { success: false, message: 'Your previous application was rejected. Please contact the institute.' };
    }

    const course = courses.find(c => c.id === courseId);
    if (!course) return { success: false, message: 'Course not found.' };

    const newEnrollment: Enrollment = {
      id: `enr_${Date.now()}`,
      courseId,
      traineeId: trainee.id,
      traineeName: trainee.fullName,
      traineeEmail: trainee.email,
      traineeMobile: trainee.mobileNumber,
      status: 'pending_approval',
      requestedAt: new Date().toISOString(),
      notes: notes || 'Student online admission request'
    };

    setEnrollments(prev => [newEnrollment, ...prev]);
    persist('enrollments', [newEnrollment]);

    return { success: true, message: `Admission requested for "${course.title}". Awaiting trainer approval.` };
  };

  const decideAdmission = (enrollmentId: string, status: 'approved' | 'rejected') => {
    const decidedAt = new Date().toISOString();
    const target = enrollments.find(e => e.id === enrollmentId);
    const updated = target ? { ...target, status, decidedAt } : null;
    setEnrollments(prev => prev.map(e => e.id === enrollmentId ? { ...e, status, decidedAt } : e));
    if (updated) persist('enrollments', [updated]);
  };

  // 3. Create Session
  const createSession = (data: {
    courseId: string;
    topic: string;
    sessionDate: string;
    startTime: string;
    endTime: string;
    venue: string;
  }): CourseSession => {
    const course = courses.find(c => c.id === data.courseId);
    const newSession: CourseSession = {
      id: `ses_${Date.now()}`,
      courseId: data.courseId,
      courseTitle: course?.title || 'Cooperative Session',
      topic: data.topic,
      sessionDate: data.sessionDate,
      startTime: data.startTime,
      endTime: data.endTime,
      venue: data.venue,
      status: 'active',
      createdAt: new Date().toISOString()
    };

    setSessions(prev => [newSession, ...prev]);
    persist('sessions', [newSession]);

    return newSession;
  };

  // 4. Time-Bound QR Attendance Token Generator
  const generateQRToken = (sessionId: string, durationMinutes: number = 30): QRAttendanceToken => {
    const session = sessions.find(s => s.id === sessionId);
    if (!session) throw new Error('Session not found');

    const expiresAt = new Date(Date.now() + durationMinutes * 60 * 1000).toISOString();
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const tokenString = `NCCT-SECURE-${session.courseId.slice(-4).toUpperCase()}-${randomSuffix}`;

    const newToken: QRAttendanceToken = {
      id: `tok_${Date.now()}`,
      sessionId,
      courseId: session.courseId,
      token: tokenString,
      expiresAt,
      isActive: true,
      createdAt: new Date().toISOString()
    };

    setActiveTokens(prev => ({
      ...prev,
      [sessionId]: newToken
    }));
    persist('qr_tokens', [newToken]);

    return newToken;
  };

  // 5. Verification & Attendance Recording — server-validated via /api/attendance/scan
  const verifyAndMarkAttendance = async (tokenString: string, manualTraineeId?: string) => {
    const trainee = manualTraineeId
      ? allUsers.find(u => u.id === manualTraineeId)
      : currentUser;

    if (!trainee) {
      return { success: false, message: 'Please sign in first to mark attendance.' };
    }

    const cleanToken = tokenString.trim();
    if (!cleanToken) {
      return { success: false, message: 'Invalid QR Code token. Please scan an active session QR code generated by your trainer.' };
    }

    try {
      const res = await scanAttendance(cleanToken, trainee.id, cleanToken.includes('MANUAL') ? 'manual_token' : 'web_qr_scan');

      if (res.success && res.log) {
        setAttendanceLogs(prev => (prev.some(l => l.id === res.log!.id) ? prev : [res.log!, ...prev]));

        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch {
          // ignore
        }

        return {
          success: true,
          message: res.message || `Attendance verified successfully for "${res.session?.topic}"!`,
          session: res.session,
          course: res.course ?? undefined,
          log: res.log
        };
      }

      // Server-validated rejection — map reason to the existing user-facing messages
      const reasonMessages: Record<string, string> = {
        invalid: 'Invalid QR Code token. Please scan an active session QR code generated by your trainer.',
        expired: 'This QR Code token has expired. Ask your trainer to project a refreshed QR code.',
        not_enrolled: 'Attendance rejected: You are not enrolled in this course. Request admission first.',
        pending: 'Attendance rejected: Your enrollment in this course is awaiting trainer approval.',
        rejected: 'Attendance rejected: Your enrollment in this course was rejected.',
        duplicate: res.message || 'Duplicate attendance prevented: You already recorded attendance for this session.'
      };
      return {
        success: false,
        message: (res.reason && reasonMessages[res.reason]) || res.message || 'Attendance could not be verified.'
      };
    } catch (err) {
      if (err instanceof ApiError) {
        return { success: false, message: err.message || 'Attendance could not be verified.' };
      }

      // Network failure (offline) — queue the scan for verification when back online.
      // Validated at replay time per spec §7.
      queuePendingScan(cleanToken, trainee.id, cleanToken.includes('MANUAL') ? 'manual_token' : 'web_qr_scan');
      return {
        success: false,
        message: 'You appear to be offline. Your scan has been saved and will be verified when you reconnect.'
      };
    }
  };

  // Public Verification Lookup
  const lookupVerificationRecord = (tokenOrCode: string) => {
    const clean = tokenOrCode.trim();
    if (!clean) return { found: false, message: 'Please enter a token, session ID, or attendance code.' };

    // 1. Search in attendance logs
    const log = attendanceLogs.find(
      l => l.id.toLowerCase() === clean.toLowerCase() || l.sessionId.toLowerCase() === clean.toLowerCase()
    );

    if (log) {
      const session = sessions.find(s => s.id === log.sessionId);
      const course = courses.find(c => c.id === log.courseId);
      const trainee = allUsers.find(u => u.id === log.traineeId);
      return { found: true, log, session, course, trainee };
    }

    // 2. Search in active tokens
    const tokenList = Object.values(activeTokens) as QRAttendanceToken[];
    const matchedToken = tokenList.find(t => t.token.toLowerCase() === clean.toLowerCase());
    if (matchedToken) {
      const session = sessions.find(s => s.id === matchedToken.sessionId);
      const course = courses.find(c => c.id === matchedToken.courseId);
      return {
        found: true,
        session,
        course,
        message: `Valid active session QR token. Generated for "${session?.topic}".`
      };
    }

    return { found: false, message: `No verified NCCT record found matching "${clean}".` };
  };

  const getCourseAttendanceStats = (courseId: string, traineeId: string): AttendanceStats => {
    const course = courses.find(c => c.id === courseId);
    const minRequiredPct = course ? course.minAttendancePct : 75;

    const courseSessions = sessions.filter(s => s.courseId === courseId);
    const totalSessions = courseSessions.length;

    const attended = attendanceLogs.filter(
      log => log.courseId === courseId && log.traineeId === traineeId
    );

    const attendedSessions = attended.length;
    const attendancePercentage = totalSessions === 0 ? 0 : Math.round((attendedSessions / totalSessions) * 100);
    const isEligible = attendancePercentage >= minRequiredPct;

    return {
      totalSessions,
      attendedSessions,
      attendancePercentage,
      minRequiredPct,
      isEligible
    };
  };

  const getSessionAttendees = (sessionId: string): AttendanceLog[] => {
    return attendanceLogs.filter(log => log.sessionId === sessionId);
  };

  // Classroom & Lecture Video Progress
  const openClassroom = useCallback((courseId: string) => {
    setActiveClassroomCourseId(courseId);
    navigateTo('classroom', courseId);
  }, [navigateTo]);

  const openAssessment = useCallback((assessmentId: string) => {
    setActiveAssessmentId(assessmentId);
    navigateTo('assessments', assessmentId);
  }, [navigateTo]);

  const markLessonComplete = useCallback((courseId: string, lessonId: string) => {
    if (!currentUser) return;
    const completedAt = new Date().toISOString();
    const existing = lessonProgress.find(p => p.courseId === courseId && p.lessonId === lessonId && p.traineeId === currentUser.id);
    const entry: LessonProgress = existing
      ? { ...existing, completed: true, watchedPercentage: 100, completedAt }
      : { courseId, lessonId, traineeId: currentUser.id, completed: true, watchedPercentage: 100, completedAt };
    setLessonProgress(prev => {
      const existsNow = prev.some(p => p.courseId === courseId && p.lessonId === lessonId && p.traineeId === currentUser.id);
      if (existsNow) {
        return prev.map(p =>
          p.courseId === courseId && p.lessonId === lessonId && p.traineeId === currentUser.id
            ? { ...p, completed: true, watchedPercentage: 100, completedAt }
            : p
        );
      }
      return [...prev, entry];
    });
    persist('progress', [entry]);
  }, [currentUser, lessonProgress]);

  const submitAssessment = useCallback((data: {
    assessmentId: string;
    courseId: string;
    courseTitle: string;
    scorePct: number;
    totalQuestions: number;
    correctAnswersCount: number;
    passed: boolean;
    answers: Record<string, number>;
  }): AssessmentSubmission => {
    const certNumber = data.passed
      ? `NCCT-CERT-${new Date().getFullYear()}-${data.courseId.replace('crs_', '').toUpperCase().slice(0, 3)}-${Math.floor(1000 + Math.random() * 9000)}`
      : undefined;

    const newSub: AssessmentSubmission = {
      id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      assessmentId: data.assessmentId,
      courseId: data.courseId,
      courseTitle: data.courseTitle,
      traineeId: currentUser?.id || 'usr_trainee_1',
      traineeName: currentUser?.fullName || 'Trainee Aarav Sharma',
      institute: currentUser?.institute || 'RICM Gandhinagar',
      scorePct: data.scorePct,
      totalQuestions: data.totalQuestions,
      correctAnswersCount: data.correctAnswersCount,
      passed: data.passed,
      submittedAt: new Date().toISOString(),
      answers: data.answers,
      certificateNumber: certNumber,
      trainerApproved: data.passed,
      trainerRemarks: data.passed ? 'Statutory competence verified by NCCT Technical Board.' : undefined
    };

    setSubmissions(prev => {
      const filtered = prev.filter(s => !(s.assessmentId === data.assessmentId && s.traineeId === (currentUser?.id || 'usr_trainee_1')));
      return [newSub, ...filtered];
    });
    persist('submissions', [newSub]);

    return newSub;
  }, [currentUser]);

  const approveSubmission = useCallback((subId: string, remarks?: string) => {
    const target = submissions.find(s => s.id === subId);
    if (target) {
      const updated: AssessmentSubmission = {
        ...target,
        trainerApproved: true,
        trainerRemarks: remarks || 'Approved by certified NCCT trainer.'
      };
      setSubmissions(prev => prev.map(s => s.id === subId ? updated : s));
      persist('submissions', [updated]);
    } else {
      setSubmissions(prev => prev.map(s => {
        if (s.id === subId) {
          return {
            ...s,
            trainerApproved: true,
            trainerRemarks: remarks || 'Approved by certified NCCT trainer.'
          };
        }
        return s;
      }));
    }
  }, [submissions]);

  const addAssessmentQuestion = useCallback((assessmentId: string, question: Omit<AssessmentQuestion, 'id'>) => {
    const newQ: AssessmentQuestion = {
      ...question,
      id: `q_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`
    };

    const target = assessments.find(a => a.id === assessmentId);
    if (target) {
      const updated: CourseAssessment = { ...target, questions: [...target.questions, newQ] };
      setAssessments(prev => prev.map(a => a.id === assessmentId ? updated : a));
      persist('assessments', [updated]);
    } else {
      setAssessments(prev => prev.map(a => {
        if (a.id === assessmentId) {
          return {
            ...a,
            questions: [...a.questions, newQ]
          };
        }
        return a;
      }));
    }
  }, [assessments]);

  const createJobPosting = (data: {
    title: string;
    description: string;
    requirements: string;
    location: string;
    salary: string;
    deadline: string;
    requiredCategory?: string;
  }): JobPosting => {
    const newJob: JobPosting = {
      id: `job_${Date.now()}`,
      employerId: currentUser?.id || 'usr_recruiter_1',
      employerName: currentUser?.fullName || 'Cooperative Employer Federation',
      title: data.title,
      description: data.description,
      requirements: data.requirements,
      location: data.location,
      salary: data.salary,
      createdAt: new Date().toISOString().split('T')[0],
      deadline: data.deadline,
      requiredCategory: data.requiredCategory || 'All Categories'
    };
    setJobPostings(prev => [newJob, ...prev]);
    persist('jobs', [newJob]);
    return newJob;
  };

  const applyForJob = (jobId: string, coverNote?: string): { success: boolean; message: string } => {
    if (!currentUser || currentUser.role !== 'trainee') {
      return { success: false, message: 'Only registered trainees can apply for job postings.' };
    }
    const job = jobPostings.find(j => j.id === jobId);
    if (!job) return { success: false, message: 'Job posting not found.' };

    const existing = jobApplications.find(a => a.jobId === jobId && a.traineeId === currentUser.id);
    if (existing) {
      return { success: false, message: 'You have already applied for this position.' };
    }

    const newApp: JobApplication = {
      id: `app_${Date.now()}`,
      jobId,
      traineeId: currentUser.id,
      traineeName: currentUser.fullName,
      traineeEmail: currentUser.email,
      traineeMobile: currentUser.mobileNumber,
      institute: currentUser.institute,
      status: 'pending',
      appliedAt: new Date().toISOString().split('T')[0],
      coverNote
    };

    setJobApplications(prev => [newApp, ...prev]);
    persist('applications', [newApp]);
    return { success: true, message: `Application successfully submitted to ${job.employerName}!` };
  };

  const updateJobApplicationStatus = (appId: string, status: 'pending' | 'shortlisted' | 'hired' | 'rejected') => {
    const target = jobApplications.find(a => a.id === appId);
    const updated = target ? { ...target, status } : null;
    setJobApplications(prev => prev.map(a => a.id === appId ? { ...a, status } : a));
    if (updated) persist('applications', [updated]);
  };

  const verifyCertificate = (codeOrName: string) => {
    const clean = codeOrName.trim().toLowerCase();
    const sub = submissions.find(
      s => (s.certificateNumber && s.certificateNumber.toLowerCase() === clean) ||
           s.traineeName.toLowerCase().includes(clean) ||
           s.id.toLowerCase() === clean
    );
    if (!sub) {
      const user = allUsers.find(u => u.fullName.toLowerCase().includes(clean) && u.role === 'trainee');
      if (user) {
        const userSub = submissions.find(s => s.traineeId === user.id && s.passed);
        return {
          valid: !!userSub,
          message: userSub ? `Trainee verified with certificate number ${userSub.certificateNumber}` : 'Trainee found but no passing certificate recorded yet.',
          trainee: user,
          submission: userSub
        };
      }
      return { valid: false, message: `No certificate or trainee record found matching "${codeOrName}".` };
    }
    const trainee = allUsers.find(u => u.id === sub.traineeId);
    return {
      valid: sub.passed,
      message: sub.passed ? `Authentic NCCT Certificate issued on ${sub.submittedAt.split('T')[0]}` : 'Assessment record indicates not passed.',
      submission: sub,
      trainee
    };
  };

  const resetAllData = () => {
    // Preserve the session token and pending scan queue; clear everything else
    const sessionToken = getToken();
    const pendingScans = (() => {
      try { return localStorage.getItem(PENDING_SCANS_KEY); } catch { return null; }
    })();
    try { localStorage.clear(); } catch {
      // ignore
    }
    if (sessionToken) setToken(sessionToken);
    if (pendingScans !== null) {
      try { localStorage.setItem(PENDING_SCANS_KEY, pendingScans); } catch {
        // ignore
      }
    }

    setAllUsers(INITIAL_USERS);
    setCurrentUserId('usr_trainer_1');
    setCourses([...INITIAL_COURSES, ...COMPREHENSIVE_COURSES]);
    setEnrollments(INITIAL_ENROLLMENTS);
    setSessions(INITIAL_SESSIONS);
    setAttendanceLogs(INITIAL_ATTENDANCE_LOGS);
    setAssessments(COMPREHENSIVE_ASSESSMENTS);
    setSubmissions(INITIAL_SUBMISSIONS);
    setLessonProgress([]);
    setJobPostings([]);
    setJobApplications([]);

    const expiry = new Date(Date.now() + 30 * 60 * 1000).toISOString();
    setActiveTokens({
      ses_pacs_s3: {
        id: 'tok_active_demo',
        sessionId: 'ses_pacs_s3',
        courseId: 'crs_pacs_101',
        token: 'NCCT-QR-PACS-SECURE-88219',
        expiresAt: expiry,
        isActive: true,
        createdAt: new Date().toISOString()
      }
    });

    refreshFromServer();
  };

  return (
    <AppContext.Provider
      value={{
        currentPage,
        navigateTo,
        verificationQueryCode,
        setVerificationQueryCode,

        currentUser,
        isAuthenticated,
        allUsers,
        signIn,
        signUp,
        signOut,
        switchUser,
        switchRole,
        updateProfile,
        approveUserProfile,
        rejectUserProfile,
        updateUserRole,

        tursoConfig,
        syncNow,
        refreshServer,

        courses,
        enrollments,
        sessions,
        activeTokens,
        attendanceLogs,

        createCourse,
        updateCourse,
        deleteCourse,
        approveCourse,
        rejectCourse,
        updateCourseNotes,
        addCourseResource,
        addCourseLesson,

        requestAdmission,
        decideAdmission,

        createSession,
        generateQRToken,
        verifyAndMarkAttendance,
        lookupVerificationRecord,

        getCourseAttendanceStats,
        getSessionAttendees,
        resetAllData,

        // Classroom & Assessments
        activeClassroomCourseId,
        openClassroom,
        lessonProgress,
        markLessonComplete,
        assessments,
        submissions,
        activeAssessmentId,
        openAssessment,
        submitAssessment,
        approveSubmission,
        addAssessmentQuestion,

        // Job Postings & Placements
        jobPostings,
        jobApplications,
        createJobPosting,
        applyForJob,
        updateJobApplicationStatus,
        verifyCertificate
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
