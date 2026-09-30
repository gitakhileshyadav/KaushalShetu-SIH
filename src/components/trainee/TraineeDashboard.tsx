import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Course } from '../../types';
import { 
  BookOpen, 
  QrCode, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Calendar, 
  ShieldCheck, 
  TrendingUp, 
  Building2,
  Send,
  Camera,
  Search,
  Check,
  PlayCircle,
  Award
} from 'lucide-react';
import { QRScannerModal } from './QRScannerModal';

export const TraineeDashboard: React.FC = () => {
  const { 
    currentUser, 
    courses, 
    enrollments, 
    sessions, 
    attendanceLogs, 
    requestAdmission, 
    getCourseAttendanceStats,
    openClassroom,
    openAssessment,
    navigateTo 
  } = useApp();

  const [showScanner, setShowScanner] = useState(false);
  const [activeTab, setActiveTab] = useState<'my_courses' | 'browse_catalog' | 'history'>('my_courses');
  const [requestNotes, setRequestNotes] = useState<string>('');
  const [requestingCourseId, setRequestingCourseId] = useState<string | null>(null);
  const [catalogSearch, setCatalogSearch] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Trainee enrollments
  const myEnrollments = enrollments.filter(e => e.traineeId === currentUser.id);
  const approvedEnrollmentIds = myEnrollments.filter(e => e.status === 'approved').map(e => e.courseId);
  const pendingEnrollmentIds = myEnrollments.filter(e => e.status === 'pending_approval').map(e => e.courseId);

  const approvedCourses = courses.filter(c => approvedEnrollmentIds.includes(c.id));

  // Trainee attendance logs
  const myAttendanceLogs = attendanceLogs.filter(log => log.traineeId === currentUser.id);

  const handleApply = (courseId: string) => {
    const res = requestAdmission(courseId, requestNotes || 'Self-registration from course catalog');
    setFeedbackMsg(res.message);
    setRequestingCourseId(null);
    setRequestNotes('');
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Trainee Banner */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-900 rounded-3xl text-white p-6 sm:p-8 shadow-xl border border-indigo-800/40">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="bg-emerald-400 text-slate-950 text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Trainee Portal • V1.0 + V2.0
              </span>
              <span className="text-xs text-indigo-200">{currentUser.institute}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Trainee: {currentUser.fullName}
            </h2>
            <p className="text-xs sm:text-sm text-indigo-200 max-w-xl leading-relaxed">
              Track your cooperative training courses, monitor minimum attendance percentages for certification, and scan live session QR codes using your device browser.
            </p>
          </div>

          {/* High Priority Web QR Scan Action Button */}
          <button
            onClick={() => setShowScanner(true)}
            className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black rounded-2xl text-xs sm:text-sm transition flex items-center justify-center space-x-2.5 shadow-xl shadow-amber-400/20 cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <Camera className="w-5 h-5 text-slate-950" />
            <span>Mark Session Attendance</span>
          </button>
        </div>

        {feedbackMsg && (
          <div className="mt-4 p-3 rounded-xl bg-amber-400/20 border border-amber-400/40 text-amber-200 text-xs font-semibold flex items-center space-x-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-amber-300 shrink-0" />
            <span>{feedbackMsg}</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 space-x-2 sm:space-x-4">
        <button
          onClick={() => setActiveTab('my_courses')}
          className={`pb-3 px-3 sm:px-4 text-xs sm:text-sm font-bold border-b-2 flex items-center space-x-2 transition cursor-pointer ${
            activeTab === 'my_courses'
              ? 'border-indigo-600 text-indigo-700'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Enrolled Courses ({approvedCourses.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('browse_catalog')}
          className={`pb-3 px-3 sm:px-4 text-xs sm:text-sm font-bold border-b-2 flex items-center space-x-2 transition cursor-pointer ${
            activeTab === 'browse_catalog'
              ? 'border-indigo-600 text-indigo-700'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Course Catalog & Admissions</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`pb-3 px-3 sm:px-4 text-xs sm:text-sm font-bold border-b-2 flex items-center space-x-2 transition cursor-pointer ${
            activeTab === 'history'
              ? 'border-indigo-600 text-indigo-700'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Clock className="w-4 h-4 text-emerald-600" />
          <span>Attendance Audit Log ({myAttendanceLogs.length})</span>
        </button>

        <button
          onClick={() => navigateTo('assessments')}
          className="pb-3 px-3 sm:px-4 text-xs sm:text-sm font-bold border-b-2 border-transparent text-slate-500 hover:text-slate-700 flex items-center space-x-2 transition cursor-pointer"
        >
          <Award className="w-4 h-4 text-amber-500" />
          <span>Assessments & Certificates</span>
        </button>
      </div>

      {/* Tab 1: My Enrolled Courses & Available Courses Catalog */}
      {activeTab === 'my_courses' && (
        <div className="space-y-8">
          {/* Active Enrolled Courses */}
          {approvedCourses.length > 0 ? (
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                <span>My Enrolled & Active Courses ({approvedCourses.length})</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {approvedCourses.map(course => {
                  const stats = getCourseAttendanceStats(course.id, currentUser.id);
                  const courseSessions = sessions.filter(s => s.courseId === course.id);

                  return (
                    <div 
                      key={course.id}
                      className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between"
                    >
                      <div className="space-y-4">
                        {/* Top Header */}
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[10px] font-bold font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                              {course.code}
                            </span>
                            <h3 className="text-base font-bold text-slate-900 mt-1">
                              {course.title}
                            </h3>
                            <p className="text-xs text-slate-500">
                              Trainer: {course.trainerName}
                            </p>
                          </div>
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
                            Enrolled
                          </span>
                        </div>

                        {/* Attendance Progress & Compliance Gate */}
                        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-3">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-700 flex items-center space-x-1.5">
                              <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
                              <span>Attendance Compliance</span>
                            </span>
                            <div className="text-right">
                              <span className="font-black text-slate-900 text-sm">{stats.attendancePercentage}%</span>
                              <span className="text-slate-400 text-[10px] ml-1">({stats.attendedSessions}/{stats.totalSessions} Sessions)</span>
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                stats.attendancePercentage >= course.minAttendancePct
                                  ? 'bg-emerald-500'
                                  : stats.attendancePercentage >= 50
                                  ? 'bg-amber-500'
                                  : 'bg-rose-500'
                              }`}
                              style={{ width: `${Math.min(100, Math.max(8, stats.attendancePercentage))}%` }}
                            />
                          </div>

                          {/* Gate Status Message */}
                          <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200/60">
                            <span className="text-slate-500">
                              Min Required: <strong>{course.minAttendancePct}%</strong>
                            </span>
                            {stats.isEligible ? (
                              <span className="text-emerald-700 font-bold flex items-center space-x-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Eligible for Certification Gate</span>
                              </span>
                            ) : (
                              <span className="text-amber-700 font-medium flex items-center space-x-1">
                                <AlertCircle className="w-3.5 h-3.5" />
                                <span>Need {course.minAttendancePct - stats.attendancePercentage}% more attendance</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Sessions List preview */}
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1.5">
                            Course Sessions Roster ({courseSessions.length})
                          </span>
                          <div className="space-y-1.5 max-h-36 overflow-y-auto">
                            {courseSessions.map(ses => {
                              const isAttended = attendanceLogs.some(
                                l => l.sessionId === ses.id && l.traineeId === currentUser.id
                              );

                              return (
                                <div
                                  key={ses.id}
                                  className="flex items-center justify-between p-2 rounded-lg bg-slate-50 text-xs border border-slate-100"
                                >
                                  <div className="truncate mr-2">
                                    <span className="font-semibold text-slate-800 block truncate">{ses.topic}</span>
                                    <span className="text-[10px] text-slate-400">{ses.sessionDate} • {ses.startTime}</span>
                                  </div>
                                  {isAttended ? (
                                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-0.5 shrink-0">
                                      <Check className="w-3 h-3" />
                                      <span>Attended</span>
                                    </span>
                                  ) : (
                                    <span className="bg-slate-200 text-slate-600 text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0">
                                      Not Marked
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                        <button
                          onClick={() => openClassroom(course.id)}
                          className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black rounded-xl text-xs flex items-center space-x-1.5 cursor-pointer shadow-xs shadow-amber-500/20"
                        >
                          <PlayCircle className="w-3.5 h-3.5 text-slate-950" />
                          <span>Video Classroom</span>
                        </button>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              const matchedAsm = course.assessmentId;
                              if (matchedAsm) openAssessment(matchedAsm);
                              else navigateTo('assessments');
                            }}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center space-x-1 cursor-pointer border border-slate-200"
                          >
                            <Award className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Exam</span>
                          </button>
                          <button
                            onClick={() => setShowScanner(true)}
                            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 cursor-pointer shadow-xs"
                          >
                            <QrCode className="w-3.5 h-3.5 text-amber-300" />
                            <span>Scan QR</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3 shadow-xs">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">No Enrolled Courses Yet</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                You are currently not enrolled in any active courses. Explore all available accredited NCCT courses below to request admission!
              </p>
              <button
                onClick={() => {
                  setActiveTab('browse_catalog');
                  setCatalogSearch('');
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition shadow-xs cursor-pointer inline-flex items-center space-x-1.5"
              >
                <span>Show All Available Courses</span>
                <Building2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Available Courses Catalog for Enrollment */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            {/* Accreditation Rule Notice Banner */}
            <div className="bg-gradient-to-r from-emerald-50 via-indigo-50 to-emerald-50 border border-emerald-200/80 rounded-2xl p-3.5 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center space-x-2 text-emerald-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>NCCT Admin Accreditation Rule:</strong> All courses listed here are official, NCCT Admin-approved curriculum. As soon as an Admin accredits a course, it automatically becomes visible to all Trainees nationwide for enrollment.
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-2">
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                  <span>Available Accredited Courses for Enrollment</span>
                </h4>
                <p className="text-xs text-slate-500">Official accredited curriculum across VAMNICOM & RICM Institutes</p>
              </div>

              <button
                onClick={() => {
                  setActiveTab('browse_catalog');
                  setCatalogSearch('');
                }}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1 cursor-pointer bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-100 self-start sm:self-auto"
              >
                <span>Show All Courses</span>
                <Building2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {courses
                .filter(c => !c.approvalStatus || c.approvalStatus === 'approved' || (c.approvalStatus !== 'pending_approval' && c.approvalStatus !== 'rejected'))
                .map(course => {
                  const enrollment = myEnrollments.find(e => e.courseId === course.id);
                  const isApproved = enrollment?.status === 'approved';
                  const isPending = enrollment?.status === 'pending_approval';

                  return (
                    <div key={course.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-3 hover:border-indigo-200 transition">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                            {course.code}
                          </span>
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium truncate max-w-[150px]">
                            {course.institute}
                          </span>
                        </div>
                        <h5 className="text-sm font-bold text-slate-900 leading-snug">{course.title}</h5>
                        <p className="text-xs text-slate-600 line-clamp-2">{course.description}</p>

                        <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2 rounded-xl text-[11px]">
                          <div>
                            <span className="text-[10px] text-slate-400 block">Min Attendance</span>
                            <span className="font-bold text-indigo-700">{course.minAttendancePct}%</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block">Min Pass Score</span>
                            <span className="font-bold text-emerald-700">{course.minPassPct}%</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                        <button
                          onClick={() => openClassroom(course.id)}
                          className="px-2.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-lg text-xs flex items-center space-x-1 cursor-pointer shrink-0"
                          title="Preview Video Classroom"
                        >
                          <PlayCircle className="w-3.5 h-3.5 text-slate-950" />
                          <span>Classroom</span>
                        </button>

                        <div className="flex-1">
                          {isApproved ? (
                            <div className="w-full text-center py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold flex items-center justify-center space-x-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Enrolled</span>
                            </div>
                          ) : isPending ? (
                            <div className="w-full text-center py-1.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1">
                              <Clock className="w-3.5 h-3.5 text-amber-600" />
                              <span>Pending</span>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleApply(course.id)}
                              className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1 cursor-pointer shadow-xs"
                            >
                              <Building2 className="w-3.5 h-3.5" />
                              <span>Apply</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Pending requests notices */}
          {pendingEnrollmentIds.length > 0 && (
            <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 space-y-2">
              <h4 className="text-xs font-bold text-amber-900 flex items-center space-x-1.5">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>Admission Requests Awaiting Trainer Approval ({pendingEnrollmentIds.length})</span>
              </h4>
              <div className="space-y-1">
                {pendingEnrollmentIds.map(cid => {
                  const c = courses.find(item => item.id === cid);
                  return (
                    <div key={cid} className="text-xs text-amber-800 bg-white/70 p-2 rounded-lg border border-amber-200/60 flex items-center justify-between">
                      <span>{c?.title || 'Cooperative Course'} ({c?.code})</span>
                      <span className="text-[10px] font-semibold bg-amber-200/80 px-2 py-0.5 rounded-full">
                        Pending Approval
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Browse Catalog & Request Admission */}
      {activeTab === 'browse_catalog' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative flex-1 w-full max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={catalogSearch}
                onChange={e => setCatalogSearch(e.target.value)}
                placeholder="Search courses by title, category, or institute..."
                className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            {catalogSearch && (
              <button
                onClick={() => setCatalogSearch('')}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold cursor-pointer transition shrink-0"
              >
                Show All Courses
              </button>
            )}
          </div>

          {courses
            .filter(c => !c.approvalStatus || c.approvalStatus === 'approved' || (c.approvalStatus !== 'pending_approval' && c.approvalStatus !== 'rejected'))
            .filter(c => {
              if (!catalogSearch.trim()) return true;
              const q = catalogSearch.toLowerCase();
              return (
                c.title.toLowerCase().includes(q) ||
                c.category.toLowerCase().includes(q) ||
                c.institute.toLowerCase().includes(q)
              );
            }).length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3 shadow-xs">
              <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto">
                <Search className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-800">No courses match "{catalogSearch}"</h4>
              <p className="text-xs text-slate-500">Try searching for keywords like "PACS", "Dairy", "Banking", or "Governance".</p>
              <button
                onClick={() => setCatalogSearch('')}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Show All Courses
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {courses
                .filter(c => !c.approvalStatus || c.approvalStatus === 'approved' || (c.approvalStatus !== 'pending_approval' && c.approvalStatus !== 'rejected'))
                .filter(c => {
                  if (!catalogSearch.trim()) return true;
                  const q = catalogSearch.toLowerCase();
                  return (
                    c.title.toLowerCase().includes(q) ||
                    c.category.toLowerCase().includes(q) ||
                    c.institute.toLowerCase().includes(q)
                  );
                })
                .map(course => {
                  const enrollment = myEnrollments.find(e => e.courseId === course.id);
                  const isApproved = enrollment?.status === 'approved';
                  const isPending = enrollment?.status === 'pending_approval';

                  return (
                    <div
                      key={course.id}
                      className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:border-indigo-300 transition"
                    >
                      <div className="space-y-3">
                        <div>
                          <span className="text-[10px] font-bold font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                            {course.code}
                          </span>
                          <h4 className="text-sm font-bold text-slate-900 mt-1.5 leading-snug">
                            {course.title}
                          </h4>
                          <p className="text-xs text-slate-400 mt-0.5">{course.category}</p>
                        </div>

                        <p className="text-xs text-slate-600 line-clamp-3">
                          {course.description}
                        </p>

                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/70 text-xs space-y-1 text-slate-600">
                          <div className="flex items-center justify-between">
                            <span>Conducting:</span>
                            <strong className="text-slate-800 truncate max-w-[140px]">{course.institute}</strong>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Min Attendance:</span>
                            <strong className="text-indigo-700">{course.minAttendancePct}%</strong>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Min Pass Score:</span>
                            <strong className="text-emerald-700">{course.minPassPct}%</strong>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                        <button
                          onClick={() => openClassroom(course.id)}
                          className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-lg text-xs flex items-center space-x-1 cursor-pointer shrink-0"
                        >
                          <PlayCircle className="w-3.5 h-3.5 text-slate-950" />
                          <span>Classroom</span>
                        </button>

                        <div className="flex-1">
                          {isApproved ? (
                            <div className="w-full text-center py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold flex items-center justify-center space-x-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Enrolled</span>
                            </div>
                          ) : isPending ? (
                            <div className="w-full text-center py-1.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1">
                              <Clock className="w-3.5 h-3.5 text-amber-600" />
                              <span>Pending</span>
                            </div>
                          ) : requestingCourseId === course.id ? (
                            <div className="space-y-2">
                              <input
                                type="text"
                                placeholder="Optional note for trainer..."
                                value={requestNotes}
                                onChange={e => setRequestNotes(e.target.value)}
                                className="w-full px-2.5 py-1 text-xs border border-slate-300 rounded-lg"
                              />
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => setRequestingCourseId(null)}
                                  className="w-1/2 py-1.5 text-xs text-slate-500 hover:text-slate-700"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => handleApply(course.id)}
                                  className="w-1/2 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700"
                                >
                                  Submit
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => setRequestingCourseId(course.id)}
                              className="w-full py-1.5 bg-slate-900 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1 cursor-pointer"
                            >
                              <Send className="w-3.5 h-3.5 text-amber-300" />
                              <span>Apply</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Attendance Audit History Log */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Your Verified Attendance Records</h3>
              <p className="text-xs text-slate-500">Cryptographically recorded timestamps and client IP signatures</p>
            </div>
            <span className="text-xs font-mono font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              {myAttendanceLogs.length} Verified Records
            </span>
          </div>

          {myAttendanceLogs.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {myAttendanceLogs.map(log => {
                const ses = sessions.find(s => s.id === log.sessionId);
                const crs = courses.find(c => c.id === log.courseId);

                return (
                  <div key={log.id} className="p-4 sm:px-6 flex items-center justify-between text-xs hover:bg-slate-50 transition">
                    <div>
                      <span className="font-bold text-slate-800 text-sm">{ses?.topic || 'Cooperative Session'}</span>
                      <p className="text-slate-500 text-xs mt-0.5">
                        {crs?.title} ({crs?.code})
                      </p>
                      <div className="flex items-center space-x-3 text-[11px] text-slate-400 font-mono mt-1">
                        <span>Timestamp: {new Date(log.scannedAt).toLocaleString()}</span>
                        <span>•</span>
                        <span>IP: {log.ipAddress}</span>
                        <span>•</span>
                        <span className="capitalize">{log.method.replace(/_/g, ' ')}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        <span>Valid Attendance</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 text-xs">
              <QrCode className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="font-medium text-slate-600">No attendance records logged yet.</p>
              <p className="text-slate-400 mt-0.5">Click "Mark Session Attendance" above when your trainer shows the QR code.</p>
            </div>
          )}
        </div>
      )}

      {/* QR Scanner Modal */}
      {showScanner && (
        <QRScannerModal onClose={() => setShowScanner(false)} />
      )}
    </div>
  );
};
