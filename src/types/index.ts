export type UserRole = 'trainer' | 'trainee' | 'admin' | 'employer';

export type EnrollmentStatus = 'pending_approval' | 'approved' | 'rejected';

export type AppPage = 
  | 'home' 
  | 'courses' 
  | 'classroom'
  | 'assessments'
  | 'trainer' 
  | 'trainee' 
  | 'qr_display' 
  | 'scanner' 
  | 'verify' 
  | 'admin' 
  | 'employer'
  | 'jobs'
  | 'database' 
  | 'login' 
  | 'register';

export interface JobPosting {
  id: string;
  employerId: string;
  employerName: string;
  title: string;
  description: string;
  requirements: string;
  location: string;
  salary: string;
  createdAt: string;
  deadline: string;
  requiredCategory?: string;
}

export interface JobApplication {
  id: string;
  jobId: string;
  traineeId: string;
  traineeName: string;
  traineeEmail: string;
  traineeMobile: string;
  institute: string;
  status: 'pending' | 'shortlisted' | 'hired' | 'rejected';
  appliedAt: string;
  coverNote?: string;
}

export type UserAccountStatus = 'pending_approval' | 'approved' | 'rejected';

export interface UserProfile {
  id: string;
  username: string;
  password?: string;
  fullName: string;
  email: string;
  mobileNumber: string;
  role: UserRole;
  institute: string;
  avatarUrl?: string;
  joinedDate: string;
  status: UserAccountStatus;
  designation?: string;
  qualification?: string;
  idProofType?: string;
  idProofNumber?: string;
  applicationReason?: string;
  approvedAt?: string;
  approvedBy?: string;
  rejectionReason?: string;
}

export type ConnectionStatus = 'connected' | 'connecting' | 'offline' | 'error' | 'syncing';

export interface TursoConfig {
  status: ConnectionStatus;
  lastSyncedAt?: string;
  errorMsg?: string;
  pendingWrites?: number;
}

export interface PDFChapter {
  page: number;
  title: string;
  content: string;
  highlights?: string[];
  keyTerms?: { term: string; definition: string }[];
  diagramDescription?: string;
}

export interface CoursePDF {
  id: string;
  title: string;
  filename: string;
  pageCount: number;
  author: string;
  department: string;
  summary: string;
  chapters: PDFChapter[];
}

export interface CourseLesson {
  id: string;
  title: string;
  durationMinutes: number;
  youtubeVideoId: string; // YouTube video ID to embed directly
  description: string;
  learningObjectives: string[];
  pdfResources?: CoursePDF[];
}

export interface AssessmentQuestion {
  id: string;
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  category: string;
}

export interface CourseAssessment {
  id: string;
  courseId: string;
  courseTitle: string;
  title: string;
  description: string;
  timeLimitMinutes: number;
  passingScorePct: number;
  questions: AssessmentQuestion[];
}

export interface AssessmentSubmission {
  id: string;
  assessmentId: string;
  courseId: string;
  courseTitle: string;
  traineeId: string;
  traineeName: string;
  institute: string;
  scorePct: number;
  totalQuestions: number;
  correctAnswersCount: number;
  passed: boolean;
  submittedAt: string;
  answers: Record<string, number>; // questionId -> selectedOptionIndex
  certificateNumber?: string;
  trainerApproved?: boolean;
  trainerRemarks?: string;
}

export interface LessonProgress {
  lessonId: string;
  courseId: string;
  traineeId: string;
  watchedPercentage: number;
  completed: boolean; // TRUE ONLY when YouTube video finishes
  completedAt?: string;
}

export type CourseApprovalStatus = 'pending_approval' | 'approved' | 'rejected';

export interface CourseResourceItem {
  id: string;
  title: string;
  type: 'pdf' | 'notes' | 'document' | 'video';
  url: string;
  summary?: string;
  uploadedAt: string;
}

export interface Course {
  id: string;
  trainerId: string;
  trainerName: string;
  title: string;
  code: string;
  category: string;
  description: string;
  minPassPct: number;
  minAttendancePct: number;
  institute: string;
  createdAt: string;
  totalSessionsExpected: number;
  thumbnailUrl?: string;
  modules?: CourseLesson[];
  assessmentId?: string;
  approvalStatus: CourseApprovalStatus;
  adminRemarks?: string;
  approvedAt?: string;
  approvedBy?: string;
  notes?: string;
  resources?: CourseResourceItem[];
  offlineDownloadEnabled?: boolean;
}

export interface Enrollment {
  id: string;
  courseId: string;
  traineeId: string;
  traineeName: string;
  traineeEmail: string;
  traineeMobile: string;
  status: EnrollmentStatus;
  requestedAt: string;
  decidedAt?: string;
  notes?: string;
}

export interface CourseSession {
  id: string;
  courseId: string;
  courseTitle: string;
  topic: string;
  sessionDate: string;
  startTime: string;
  endTime: string;
  venue: string;
  status: 'scheduled' | 'active' | 'completed';
  createdAt: string;
}

export interface QRAttendanceToken {
  id: string;
  sessionId: string;
  courseId: string;
  token: string;
  expiresAt: string; // ISO String
  isActive: boolean;
  createdAt: string;
}

export type QRToken = QRAttendanceToken;

export interface AttendanceLog {
  id: string;
  sessionId: string;
  courseId: string;
  traineeId: string;
  traineeName: string;
  scannedAt: string;
  ipAddress: string;
  verified: boolean;
  method: 'web_qr_scan' | 'manual_token';
}

export interface AttendanceStats {
  totalSessions: number;
  attendedSessions: number;
  attendancePercentage: number;
  minRequiredPct: number;
  isEligible: boolean;
}

