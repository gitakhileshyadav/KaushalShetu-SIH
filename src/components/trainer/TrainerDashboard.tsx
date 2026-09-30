import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Course, CourseSession } from '../../types';
import { 
  BookOpen, 
  Calendar, 
  UserCheck, 
  Plus, 
  QrCode, 
  Clock, 
  Users, 
  Trash2, 
  MapPin, 
  Percent,
  CheckCircle2,
  AlertTriangle,
  Play,
  PlayCircle,
  Award,
  FileText,
  ShieldCheck,
  Sparkles,
  Lock,
  ChevronRight
} from 'lucide-react';
import { CreateCourseModal } from './CreateCourseModal';
import { CreateSessionModal } from './CreateSessionModal';
import { SessionQRModal } from './SessionQRModal';
import { AdmissionDesk } from './AdmissionDesk';
import { CourseNotesModal } from './CourseNotesModal';

export const TrainerDashboard: React.FC = () => {
  const { 
    currentUser, 
    courses, 
    sessions, 
    enrollments, 
    deleteCourse, 
    getSessionAttendees,
    openClassroom,
    openAssessment,
    navigateTo 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'courses' | 'sessions' | 'admissions'>('courses');
  const [showCreateCourse, setShowCreateCourse] = useState(false);
  const [showCreateSession, setShowCreateSession] = useState(false);
  const [selectedSessionForQR, setSelectedSessionForQR] = useState<CourseSession | null>(null);
  const [selectedCourseForNotes, setSelectedCourseForNotes] = useState<Course | null>(null);

  // Strict Faculty Jurisdiction: ONLY courses authored by this trainer (or all if admin)
  const myCourses = courses.filter(c => c.trainerId === currentUser.id || currentUser.role === 'admin');
  const myCourseIds = myCourses.map(c => c.id);

  const approvedCourses = myCourses.filter(c => c.approvalStatus === 'approved');
  const pendingCourses = myCourses.filter(c => c.approvalStatus === 'pending_approval');
  const approvedCourseIds = approvedCourses.map(c => c.id);

  // Only sessions for this trainer's courses
  const mySessions = sessions.filter(s => myCourseIds.includes(s.courseId));

  // Only admissions for this trainer's courses
  const pendingAdmissions = enrollments.filter(
    e => myCourseIds.includes(e.courseId) && e.status === 'pending_approval'
  );

  return (
    <div className="space-y-6">
      {/* Trainer Hero Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl text-white p-6 sm:p-8 shadow-xl border border-indigo-900/50">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="bg-amber-400 text-slate-950 text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Faculty Portal • Strict Jurisdiction
              </span>
              <span className="text-xs text-indigo-300 font-medium">{currentUser.institute}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Welcome, {currentUser.fullName}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Faculty jurisdiction console for managing your accredited cooperative courses, teaching notes, YouTube lessons, student admissions, and live 30-minute QR attendance projections.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowCreateCourse(true)}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center space-x-2 shadow-lg shadow-indigo-600/30 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Course Proposal</span>
            </button>
            <button
              onClick={() => {
                if (approvedCourses.length === 0) {
                  alert('Session scheduling requires at least one NCCT Admin-approved course.');
                  return;
                }
                setShowCreateSession(true);
              }}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-amber-300" />
              <span>Schedule Session</span>
            </button>
          </div>
        </div>

        {/* Quick KPI stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/10 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">Accredited Courses</span>
            <span className="text-xl font-black text-white">{approvedCourses.length}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Pending Admin Review</span>
            <span className="text-xl font-black text-amber-400">{pendingCourses.length}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Pending Admissions</span>
            <span className="text-xl font-black text-white">{pendingAdmissions.length}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Total Sessions</span>
            <span className="text-xl font-black text-emerald-400">{mySessions.length}</span>
          </div>
        </div>
      </div>

      {/* Notice if any course is pending admin accreditation */}
      {pendingCourses.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start justify-between gap-4 text-xs">
          <div className="flex items-start space-x-3">
            <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-900">
                {pendingCourses.length} Course Proposal{pendingCourses.length > 1 ? 's' : ''} Awaiting NCCT Admin Accreditation
              </p>
              <p className="text-amber-700 mt-0.5">
                Your submitted course ({pendingCourses.map(c => c.title).join(', ')}) is under review by Director K. N. Rao. You can manage syllabus notes and learning materials now. Student enrollment and session scheduling will unlock automatically upon admin approval.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 space-x-2 sm:space-x-4">
        <button
          onClick={() => setActiveTab('courses')}
          className={`pb-3 px-2 sm:px-4 text-xs sm:text-sm font-bold border-b-2 flex items-center space-x-2 transition cursor-pointer ${
            activeTab === 'courses'
              ? 'border-indigo-600 text-indigo-700'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>My Courses ({myCourses.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('sessions')}
          className={`pb-3 px-2 sm:px-4 text-xs sm:text-sm font-bold border-b-2 flex items-center space-x-2 transition cursor-pointer ${
            activeTab === 'sessions'
              ? 'border-indigo-600 text-indigo-700'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <QrCode className="w-4 h-4 text-amber-600" />
          <span>QR Attendance & Sessions ({mySessions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('admissions')}
          className={`pb-3 px-2 sm:px-4 text-xs sm:text-sm font-bold border-b-2 flex items-center space-x-2 transition cursor-pointer ${
            activeTab === 'admissions'
              ? 'border-indigo-600 text-indigo-700'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Admission Approvals</span>
          {pendingAdmissions.length > 0 && (
            <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-1.5 py-0.5 rounded-full">
              {pendingAdmissions.length}
            </span>
          )}
        </button>

        <button
          onClick={() => navigateTo('assessments')}
          className="pb-3 px-2 sm:px-4 text-xs sm:text-sm font-bold border-b-2 border-transparent text-slate-500 hover:text-slate-700 flex items-center space-x-2 transition cursor-pointer"
        >
          <Award className="w-4 h-4 text-amber-500" />
          <span>Assessments & Grading Desk</span>
        </button>
      </div>

      {/* Tab 1: Course Management */}
      {activeTab === 'courses' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                Faculty Curriculum Jurisdiction Registry
              </h3>
              <p className="text-xs text-slate-500">
                You can access, edit syllabus notes, and manage learning content for courses within your jurisdiction.
              </p>
            </div>
            <button
              onClick={() => setShowCreateCourse(true)}
              className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-semibold flex items-center space-x-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Course</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {myCourses.map(course => {
              const enrolledCount = enrollments.filter(e => e.courseId === course.id && e.status === 'approved').length;
              const pendingCount = enrollments.filter(e => e.courseId === course.id && e.status === 'pending_approval').length;
              const sessionCount = sessions.filter(s => s.courseId === course.id).length;
              const isApproved = course.approvalStatus === 'approved';
              const isPending = course.approvalStatus === 'pending_approval';

              return (
                <div 
                  key={course.id}
                  className={`bg-white rounded-2xl border p-5 shadow-xs transition flex flex-col justify-between ${
                    isPending ? 'border-amber-300 bg-amber-50/10' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[11px] font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                            {course.code}
                          </span>
                          <span className="text-xs text-slate-400 font-medium">
                            {course.category}
                          </span>

                          {isApproved ? (
                            <span className="inline-flex items-center space-x-1 bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-md text-[10px]">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Admin Accredited</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1 bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-md text-[10px]">
                              <Clock className="w-3 h-3 text-amber-600" />
                              <span>Pending Admin Review</span>
                            </span>
                          )}
                        </div>
                        <h4 className="text-base font-bold text-slate-900 mt-1.5 leading-snug">
                          {course.title}
                        </h4>
                      </div>
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete course "${course.title}"? This removes related sessions and enrollments.`)) {
                            deleteCourse(course.id);
                          }
                        }}
                        className="text-slate-400 hover:text-rose-500 p-1 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                        title="Delete Course"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2">
                      {course.description || 'Comprehensive training program governed by NCCT guidelines.'}
                    </p>

                    {/* Minimum Gates Badges */}
                    <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 text-xs">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-md bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[10px]">
                          %
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">Min. Attendance Gate</span>
                          <span className="font-bold text-slate-800">{course.minAttendancePct}%</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px]">
                          ✓
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">Min. Pass Score</span>
                          <span className="font-bold text-slate-800">{course.minPassPct}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Faculty Notes preview snippet */}
                    {course.notes && (
                      <div className="p-2 bg-indigo-50/60 rounded-xl border border-indigo-100 text-xs text-indigo-900">
                        <span className="font-bold flex items-center space-x-1 text-[11px] text-indigo-800">
                          <FileText className="w-3.5 h-3.5" />
                          <span>Teaching Notes Included</span>
                        </span>
                        <p className="text-[11px] text-indigo-700 line-clamp-1 mt-0.5 italic">
                          "{course.notes}"
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Bottom metrics & action bar */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center space-x-4 text-slate-500">
                      <span className="flex items-center space-x-1" title="Approved Trainees">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <strong className="text-slate-700">{enrolledCount}</strong> Trainees
                      </span>
                      <span className="flex items-center space-x-1" title="Sessions">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <strong className="text-slate-700">{sessionCount}</strong> Sessions
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {/* Notes & Content button */}
                      <button
                        onClick={() => setSelectedCourseForNotes(course)}
                        className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold rounded-lg text-xs transition flex items-center space-x-1 cursor-pointer"
                        title="Edit faculty notes, reading materials, and video lessons"
                      >
                        <FileText className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Notes & Content</span>
                      </button>

                      {/* Classroom Preview */}
                      <button
                        onClick={() => openClassroom(course.id)}
                        className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs transition flex items-center space-x-1 cursor-pointer"
                        title="Preview YouTube in-platform classroom & PDF reader"
                      >
                        <PlayCircle className="w-3.5 h-3.5 text-slate-950" />
                        <span>Classroom</span>
                      </button>

                      {/* Add Session (only if approved) */}
                      {isApproved ? (
                        <button
                          onClick={() => setShowCreateSession(true)}
                          className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold transition flex items-center space-x-1 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add Session</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-amber-700 font-semibold bg-amber-100 px-2 py-1 rounded-lg">
                          Awaiting Admin Approval
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Sessions & QR Generator (V2.0 Core) */}
      {activeTab === 'sessions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                Course Sessions & QR Attendance Terminal
              </h3>
              <p className="text-xs text-slate-500">
                Click "Project Live QR" to display time-bound 30-min attendance QR codes on projector screens
              </p>
            </div>
            <button
              onClick={() => {
                if (approvedCourses.length === 0) {
                  alert('Session scheduling requires an approved course.');
                  return;
                }
                setShowCreateSession(true);
              }}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center space-x-1 cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Schedule Session</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mySessions.map(ses => {
              const attendees = getSessionAttendees(ses.id);
              const c = courses.find(item => item.id === ses.courseId);

              return (
                <div
                  key={ses.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                        {ses.sessionDate}
                      </span>
                      <span className="text-[11px] font-semibold text-indigo-600 truncate max-w-[140px]">
                        {c?.code}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-900 leading-snug">
                        {ses.topic}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5 truncate">
                        {c?.title}
                      </p>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200/70">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{ses.startTime} - {ses.endTime}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span className="truncate">{ses.venue}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="text-xs">
                      <span className="text-slate-400 block text-[10px]">Verified Attendees</span>
                      <strong className="text-emerald-700 font-bold">{attendees.length} scanned</strong>
                    </div>

                    <button
                      onClick={() => setSelectedSessionForQR(ses)}
                      className="px-3.5 py-1.5 bg-gradient-to-r from-indigo-700 to-indigo-900 hover:from-indigo-600 hover:to-indigo-800 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-xs cursor-pointer"
                    >
                      <QrCode className="w-3.5 h-3.5 text-amber-300" />
                      <span>Project Live QR</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Admission Approvals Desk */}
      {activeTab === 'admissions' && (
        <AdmissionDesk />
      )}

      {/* Modals */}
      {showCreateCourse && (
        <CreateCourseModal onClose={() => setShowCreateCourse(false)} />
      )}

      {showCreateSession && (
        <CreateSessionModal onClose={() => setShowCreateSession(false)} />
      )}

      {selectedSessionForQR && (
        <SessionQRModal
          session={selectedSessionForQR}
          onClose={() => setSelectedSessionForQR(null)}
        />
      )}

      {selectedCourseForNotes && (
        <CourseNotesModal
          course={selectedCourseForNotes}
          onClose={() => setSelectedCourseForNotes(null)}
        />
      )}
    </div>
  );
};
