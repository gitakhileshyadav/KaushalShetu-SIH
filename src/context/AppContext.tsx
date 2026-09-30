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
  getSavedTursoCredentials, 
  saveTursoCredentials, 
  getTursoClient, 
  testTursoConnection, 
  initializeTursoSchema, 
  seedTursoIfEmpty, 
  runTursoQuery 
} from '../lib/turso';
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
  signIn: (username: string, password: string) => { success: boolean; message: string; user?: UserProfile };
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
  }) => { success: boolean; message: string; user?: UserProfile };
  signOut: () => void;
  switchUser: (userId: string) => void;
  switchRole: (role: UserRole) => void;
  updateProfile: (data: Partial<UserProfile>) => void;
  approveUserProfile: (userId: string, adminRemarks?: string) => void;
  rejectUserProfile: (userId: string, reason: string) => void;
  updateUserRole: (userId: string, newRole: UserRole) => void;

  // Database & Turso
  tursoConfig: TursoConfig;
  connectTurso: (url: string, authToken: string) => Promise<{ success: boolean; message: string; latencyMs?: number }>;
  disconnectTurso: () => void;
  syncLocalWithTurso: () => Promise<{ success: boolean; message: string }>;
  runCustomQuery: (sql: string) => Promise<{ columns: string[]; rows: any[]; affectedRows?: number; error?: string }>;

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
  verifyAndMarkAttendance: (tokenString: string, manualTraineeId?: string) => {
    success: boolean;
    message: string;
    session?: CourseSession;
    course?: Course;
    log?: AttendanceLog;
  };

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

const AppContext = createContext<AppContextType | undefined>(undefined);

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

  // Turso Database Config State
  const [tursoConfig, setTursoConfig] = useState<TursoConfig>(() => {
    const creds = getSavedTursoCredentials();
    return {
      url: creds.url,
      authToken: creds.authToken,
      status: creds.url ? 'connecting' : 'offline_local'
    };
  });

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
    let merged = [...INITIAL_COURSES, ...COMPREHENSIVE_COURSES];
    if (saved) {
      try {
        const parsed: Course[] = JSON.parse(saved);
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

  // Turso initialization & connection check on mount
  useEffect(() => {
    let isMounted = true;
    const initTurso = async () => {
      const creds = getSavedTursoCredentials();
      if (!creds.url) {
        if (isMounted) {
          setTursoConfig(prev => ({ ...prev, status: 'offline_local' }));
        }
        return;
      }

      try {
        if (isMounted) setTursoConfig(prev => ({ ...prev, status: 'connecting' }));
        const testRes = await testTursoConnection(creds.url, creds.authToken);
        if (testRes.success) {
          // Schema initialize & seed if empty
          await initializeTursoSchema();
          await seedTursoIfEmpty();
          if (isMounted) {
            setTursoConfig({
              url: creds.url,
              authToken: creds.authToken,
              status: 'connected',
              lastSyncedAt: new Date().toLocaleTimeString()
            });
          }
        } else {
          if (isMounted) {
            setTursoConfig({
              url: creds.url,
              authToken: creds.authToken,
              status: 'error',
              errorMsg: testRes.error
            });
          }
        }
      } catch (err: any) {
        if (isMounted) {
          setTursoConfig(prev => ({
            ...prev,
            status: 'error',
            errorMsg: err?.message || 'Connection failed'
          }));
        }
      }
    };

    initTurso();
    return () => { isMounted = false; };
  }, []);

  // Sync state into Turso SQLite
  const syncLocalWithTurso = async (): Promise<{ success: boolean; message: string }> => {
    const client = getTursoClient();
    if (!client) {
      return { success: false, message: 'No Turso credentials configured. Please configure your Turso Database URL and Auth Token.' };
    }

    try {
      await initializeTursoSchema();

      // Upsert users
      for (const u of allUsers) {
        await client.execute({
          sql: `INSERT OR REPLACE INTO users (id, username, password, full_name, email, mobile_number, role, institute, avatar_url, joined_date)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
          args: [u.id, u.username, u.password || 'password123', u.fullName, u.email, u.mobileNumber, u.role, u.institute, u.avatarUrl || '', u.joinedDate]
        });
      }

      // Upsert courses
      for (const c of courses) {
        await client.execute({
          sql: `INSERT OR REPLACE INTO courses (id, trainer_id, trainer_name, title, code, category, description, min_pass_pct, min_attendance_pct, institute, created_at, total_sessions_expected)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
          args: [c.id, c.trainerId, c.trainerName, c.title, c.code, c.category, c.description, c.minPassPct, c.minAttendancePct, c.institute, c.createdAt, c.totalSessionsExpected]
        });
      }

      // Upsert enrollments
      for (const e of enrollments) {
        await client.execute({
          sql: `INSERT OR REPLACE INTO enrollments (id, course_id, trainee_id, trainee_name, trainee_email, trainee_mobile, status, requested_at, decided_at, notes)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
          args: [e.id, e.courseId, e.traineeId, e.traineeName, e.traineeEmail, e.traineeMobile, e.status, e.requestedAt, e.decidedAt || null, e.notes || '']
        });
      }

      // Upsert sessions
      for (const s of sessions) {
        await client.execute({
          sql: `INSERT OR REPLACE INTO sessions (id, course_id, course_title, topic, session_date, start_time, end_time, venue, status, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
          args: [s.id, s.courseId, s.courseTitle, s.topic, s.sessionDate, s.startTime, s.endTime, s.venue, s.status, s.createdAt]
        });
      }

      // Upsert active tokens
      const tokenList = Object.values(activeTokens) as QRAttendanceToken[];
      for (const t of tokenList) {
        await client.execute({
          sql: `INSERT OR REPLACE INTO qr_tokens (id, session_id, course_id, token, expires_at, is_active, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?);`,
          args: [t.id, t.sessionId, t.courseId, t.token, t.expiresAt, t.isActive ? 1 : 0, t.createdAt]
        });
      }

      // Upsert attendance logs
      for (const a of attendanceLogs) {
        await client.execute({
          sql: `INSERT OR REPLACE INTO attendance_logs (id, session_id, course_id, trainee_id, trainee_name, scanned_at, ip_address, verified, method)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
          args: [a.id, a.sessionId, a.courseId, a.traineeId, a.traineeName, a.scannedAt, a.ipAddress, a.verified ? 1 : 0, a.method]
        });
      }

      setTursoConfig(prev => ({
        ...prev,
        status: 'connected',
        lastSyncedAt: new Date().toLocaleTimeString()
      }));

      return { success: true, message: 'All local records successfully synchronized to Turso SQLite database!' };
    } catch (err: any) {
      console.error('Turso sync error:', err);
      return { success: false, message: err?.message || 'Synchronization failed.' };
    }
  };

  const connectTurso = async (url: string, authToken: string): Promise<{ success: boolean; message: string; latencyMs?: number }> => {
    setTursoConfig(prev => ({ ...prev, status: 'connecting', errorMsg: undefined }));
    const test = await testTursoConnection(url, authToken);
    if (!test.success) {
      setTursoConfig(prev => ({
        ...prev,
        status: 'error',
        errorMsg: test.error
      }));
      return { success: false, message: test.error || 'Connection failed' };
    }

    saveTursoCredentials(url, authToken);
    await initializeTursoSchema();
    await syncLocalWithTurso();

    setTursoConfig({
      url,
      authToken,
      status: 'connected',
      lastSyncedAt: new Date().toLocaleTimeString()
    });

    return { success: true, message: 'Connected to Turso SQLite cloud database successfully!', latencyMs: test.latencyMs };
  };

  const disconnectTurso = () => {
    saveTursoCredentials('', '');
    setTursoConfig({
      url: '',
      authToken: '',
      status: 'offline_local'
    });
  };

  const runCustomQuery = async (sql: string) => {
    return await runTursoQuery(sql);
  };

  // Current authenticated user
  const currentUser: UserProfile | null = allUsers.find(u => u.id === currentUserId) || null;
  const isAuthenticated = currentUser !== null;

  // Sign in using Username and Password ONLY
  const signIn = (username: string, password: string): { success: boolean; message: string; user?: UserProfile } => {
    const trimmedUser = username.trim().toLowerCase();
    const foundUser = allUsers.find(
      u => u.username.toLowerCase() === trimmedUser && (u.password === password || (!u.password && password === 'password123'))
    );

    if (!foundUser) {
      return {
        success: false,
        message: 'Invalid username or password. Please verify your credentials or use the quick test logins below.'
      };
    }

    if (foundUser.status === 'rejected') {
      return {
        success: false,
        message: `Your account registration was not approved by NCCT Administration. ${foundUser.rejectionReason ? `Reason: ${foundUser.rejectionReason}` : 'Please contact the institute administrator.'}`
      };
    }

    setCurrentUserId(foundUser.id);
    return {
      success: true,
      message: foundUser.status === 'pending_approval' 
        ? `Signed in as ${foundUser.fullName}. Your registration profile is currently pending NCCT Admin approval.`
        : `Welcome back, ${foundUser.fullName}! Signed in successfully.`,
      user: foundUser
    };
  };

  // Sign up using Username and Password ONLY with Admin Approval workflow
  const signUp = (data: {
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
  }): { success: boolean; message: string; user?: UserProfile } => {
    const trimmedUser = data.username.trim().toLowerCase();

    if (!trimmedUser || !data.password) {
      return { success: false, message: 'Username and password are required.' };
    }

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

    // Asynchronously write to Turso if connected
    const client = getTursoClient();
    if (client) {
      client.execute({
        sql: `INSERT OR REPLACE INTO users (id, username, password, full_name, email, mobile_number, role, institute, avatar_url, joined_date)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        args: [newUser.id, newUser.username, newUser.password, newUser.fullName, newUser.email, newUser.mobileNumber, newUser.role, newUser.institute, '', newUser.joinedDate]
      }).catch(err => console.warn('Background Turso insert failed:', err));
    }

    return {
      success: true,
      message: isApexAdmin
        ? `Administrator profile created and verified.`
        : `Registration profile submitted successfully! Your account is submitted for NCCT Admin Approval.`,
      user: newUser
    };
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

    // Turso update
    const client = getTursoClient();
    if (client) {
      client.execute({
        sql: `UPDATE users SET full_name = ?, mobile_number = ?, institute = ? WHERE id = ?;`,
        args: [updated.fullName, updated.mobileNumber, updated.institute, updated.id]
      }).catch(err => console.warn('Background Turso user update failed:', err));
    }
  };

  // Admin user approvals
  const approveUserProfile = (userId: string, adminRemarks?: string) => {
    setAllUsers(prev => prev.map(u => {
      if (u.id === userId) {
        return {
          ...u,
          status: 'approved',
          approvedAt: new Date().toISOString(),
          approvedBy: currentUser?.fullName || 'Director K. N. Rao',
          rejectionReason: undefined
        };
      }
      return u;
    }));
  };

  const rejectUserProfile = (userId: string, reason: string) => {
    setAllUsers(prev => prev.map(u => {
      if (u.id === userId) {
        return {
          ...u,
          status: 'rejected',
          rejectionReason: reason || 'Application details did not satisfy NCCT affiliation criteria.'
        };
      }
      return u;
    }));
  };

  const updateUserRole = (userId: string, newRole: UserRole) => {
    setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
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

    // Turso insert
    const client = getTursoClient();
    if (client) {
      client.execute({
        sql: `INSERT INTO courses (id, trainer_id, trainer_name, title, code, category, description, min_pass_pct, min_attendance_pct, institute, created_at, total_sessions_expected)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        args: [newCourse.id, newCourse.trainerId, newCourse.trainerName, newCourse.title, newCourse.code, newCourse.category, newCourse.description, newCourse.minPassPct, newCourse.minAttendancePct, newCourse.institute, newCourse.createdAt, newCourse.totalSessionsExpected]
      }).catch(err => console.warn('Background Turso course insert failed:', err));
    }

    return newCourse;
  };

  const updateCourse = (id: string, data: Partial<Course>) => {
    setCourses(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
  };

  const deleteCourse = (id: string) => {
    setCourses(prev => prev.filter(c => c.id !== id));
    setEnrollments(prev => prev.filter(e => e.courseId !== id));
    setSessions(prev => prev.filter(s => s.courseId !== id));
  };

  // Course Governance & Accreditation
  const approveCourse = (courseId: string, remarks?: string) => {
    setCourses(prev => prev.map(c => {
      if (c.id === courseId) {
        return {
          ...c,
          approvalStatus: 'approved',
          approvedAt: new Date().toISOString(),
          approvedBy: currentUser?.fullName || 'Director K. N. Rao',
          adminRemarks: remarks || 'Curriculum approved for National Cooperative Education delivery.'
        };
      }
      return c;
    }));
  };

  const rejectCourse = (courseId: string, reason: string) => {
    setCourses(prev => prev.map(c => {
      if (c.id === courseId) {
        return {
          ...c,
          approvalStatus: 'rejected',
          adminRemarks: reason || 'Syllabus requires revisions as per NCCT apex guidelines.'
        };
      }
      return c;
    }));
  };

  const updateCourseNotes = (courseId: string, notes: string) => {
    setCourses(prev => prev.map(c => c.id === courseId ? { ...c, notes } : c));
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
    setCourses(prev => prev.map(c => {
      if (c.id === courseId) {
        return {
          ...c,
          resources: [...(c.resources || []), newItem]
        };
      }
      return c;
    }));
  };

  const addCourseLesson = (courseId: string, lesson: Omit<CourseLesson, 'id'>) => {
    const newLesson: CourseLesson = {
      ...lesson,
      id: `mod_${Date.now()}`
    };
    setCourses(prev => prev.map(c => {
      if (c.id === courseId) {
        return {
          ...c,
          modules: [...(c.modules || []), newLesson]
        };
      }
      return c;
    }));
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

    // Turso insert
    const client = getTursoClient();
    if (client) {
      client.execute({
        sql: `INSERT INTO enrollments (id, course_id, trainee_id, trainee_name, trainee_email, trainee_mobile, status, requested_at, notes)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        args: [newEnrollment.id, newEnrollment.courseId, newEnrollment.traineeId, newEnrollment.traineeName, newEnrollment.traineeEmail, newEnrollment.traineeMobile, newEnrollment.status, newEnrollment.requestedAt, newEnrollment.notes]
      }).catch(err => console.warn('Background Turso enrollment insert failed:', err));
    }

    return { success: true, message: `Admission requested for "${course.title}". Awaiting trainer approval.` };
  };

  const decideAdmission = (enrollmentId: string, status: 'approved' | 'rejected') => {
    const decidedAt = new Date().toISOString();
    setEnrollments(prev => prev.map(e => e.id === enrollmentId ? { ...e, status, decidedAt } : e));

    const client = getTursoClient();
    if (client) {
      client.execute({
        sql: `UPDATE enrollments SET status = ?, decided_at = ? WHERE id = ?;`,
        args: [status, decidedAt, enrollmentId]
      }).catch(err => console.warn('Background Turso enrollment update failed:', err));
    }
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

    const client = getTursoClient();
    if (client) {
      client.execute({
        sql: `INSERT INTO sessions (id, course_id, course_title, topic, session_date, start_time, end_time, venue, status, created_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        args: [newSession.id, newSession.courseId, newSession.courseTitle, newSession.topic, newSession.sessionDate, newSession.startTime, newSession.endTime, newSession.venue, newSession.status, newSession.createdAt]
      }).catch(err => console.warn('Background Turso session insert failed:', err));
    }

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

    const client = getTursoClient();
    if (client) {
      client.execute({
        sql: `INSERT OR REPLACE INTO qr_tokens (id, session_id, course_id, token, expires_at, is_active, created_at)
              VALUES (?, ?, ?, ?, ?, ?, ?);`,
        args: [newToken.id, newToken.sessionId, newToken.courseId, newToken.token, newToken.expiresAt, 1, newToken.createdAt]
      }).catch(err => console.warn('Background Turso token insert failed:', err));
    }

    return newToken;
  };

  // 5. Verification & Attendance Recording
  const verifyAndMarkAttendance = (tokenString: string, manualTraineeId?: string) => {
    const trainee = manualTraineeId 
      ? allUsers.find(u => u.id === manualTraineeId) 
      : currentUser;

    if (!trainee) {
      return { success: false, message: 'Please sign in first to mark attendance.' };
    }

    const cleanToken = tokenString.trim();
    let matchedToken: QRAttendanceToken | undefined = undefined;

    const tokenList = Object.values(activeTokens) as QRAttendanceToken[];
    for (const tok of tokenList) {
      if (tok && tok.token === cleanToken) {
        matchedToken = tok;
        break;
      }
    }

    if (!matchedToken) {
      return { 
        success: false, 
        message: 'Invalid QR Code token. Please scan an active session QR code generated by your trainer.' 
      };
    }

    // Expiry check
    const now = new Date();
    const expiryDate = new Date(matchedToken.expiresAt);
    if (now > expiryDate || !matchedToken.isActive) {
      return { 
        success: false, 
        message: 'This QR Code token has expired. Ask your trainer to project a refreshed QR code.' 
      };
    }

    const session = sessions.find(s => s.id === matchedToken!.sessionId);
    if (!session) {
      return { success: false, message: 'Associated training session could not be found.' };
    }

    const course = courses.find(c => c.id === session.courseId);

    // Trainee Enrollment Gate
    const enrollment = enrollments.find(e => e.courseId === session.courseId && e.traineeId === trainee.id);

    if (!enrollment) {
      return { 
        success: false, 
        message: `Attendance rejected: You are not enrolled in "${course?.title || 'this course'}". Request admission first.` 
      };
    }

    if (enrollment.status === 'pending_approval') {
      return { 
        success: false, 
        message: `Attendance rejected: Your enrollment in "${course?.title}" is awaiting trainer approval.` 
      };
    }

    if (enrollment.status === 'rejected') {
      return { 
        success: false, 
        message: `Attendance rejected: Your enrollment in this course was rejected.` 
      };
    }

    // Duplicate Prevention
    const alreadyLogged = attendanceLogs.find(
      log => log.sessionId === session.id && log.traineeId === trainee.id
    );

    if (alreadyLogged) {
      const timeStr = new Date(alreadyLogged.scannedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return { 
        success: false, 
        message: `Duplicate attendance prevented: You already recorded attendance for this session at ${timeStr}.` 
      };
    }

    // Record verified attendance log
    const newLog: AttendanceLog = {
      id: `att_log_${Date.now()}`,
      sessionId: session.id,
      courseId: session.courseId,
      traineeId: trainee.id,
      traineeName: trainee.fullName,
      scannedAt: new Date().toISOString(),
      ipAddress: '192.168.1.' + Math.floor(20 + Math.random() * 80),
      verified: true,
      method: cleanToken.includes('MANUAL') ? 'manual_token' : 'web_qr_scan'
    };

    setAttendanceLogs(prev => [newLog, ...prev]);

    // Save to Turso SQLite in background
    const client = getTursoClient();
    if (client) {
      client.execute({
        sql: `INSERT INTO attendance_logs (id, session_id, course_id, trainee_id, trainee_name, scanned_at, ip_address, verified, method)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        args: [newLog.id, newLog.sessionId, newLog.courseId, newLog.traineeId, newLog.traineeName, newLog.scannedAt, newLog.ipAddress, 1, newLog.method]
      }).catch(err => console.warn('Background Turso attendance insert failed:', err));
    }

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
      message: `Attendance verified successfully for "${session.topic}"!`,
      session,
      course,
      log: newLog
    };
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
    setLessonProgress(prev => {
      const exists = prev.some(p => p.courseId === courseId && p.lessonId === lessonId && p.traineeId === currentUser.id);
      if (exists) {
        return prev.map(p => 
          p.courseId === courseId && p.lessonId === lessonId && p.traineeId === currentUser.id
            ? { ...p, completed: true, watchedPercentage: 100, completedAt: new Date().toISOString() }
            : p
        );
      }
      return [
        ...prev,
        {
          courseId,
          lessonId,
          traineeId: currentUser.id,
          completed: true,
          watchedPercentage: 100,
          completedAt: new Date().toISOString()
        }
      ];
    });
  }, [currentUser]);

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

    return newSub;
  }, [currentUser]);

  const approveSubmission = useCallback((subId: string, remarks?: string) => {
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
  }, []);

  const addAssessmentQuestion = useCallback((assessmentId: string, question: Omit<AssessmentQuestion, 'id'>) => {
    const newQ: AssessmentQuestion = {
      ...question,
      id: `q_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`
    };

    setAssessments(prev => prev.map(a => {
      if (a.id === assessmentId) {
        return {
          ...a,
          questions: [...a.questions, newQ]
        };
      }
      return a;
    }));
  }, []);

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
    return { success: true, message: `Application successfully submitted to ${job.employerName}!` };
  };

  const updateJobApplicationStatus = (appId: string, status: 'pending' | 'shortlisted' | 'hired' | 'rejected') => {
    setJobApplications(prev => prev.map(a => a.id === appId ? { ...a, status } : a));
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
    localStorage.clear();
    setAllUsers(INITIAL_USERS);
    setCurrentUserId('usr_trainer_1');
    setCourses([...INITIAL_COURSES, ...COMPREHENSIVE_COURSES]);
    setEnrollments(INITIAL_ENROLLMENTS);
    setSessions(INITIAL_SESSIONS);
    setAttendanceLogs(INITIAL_ATTENDANCE_LOGS);
    setAssessments(COMPREHENSIVE_ASSESSMENTS);
    setSubmissions(INITIAL_SUBMISSIONS);
    setLessonProgress([]);

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
        connectTurso,
        disconnectTurso,
        syncLocalWithTurso,
        runCustomQuery,

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
