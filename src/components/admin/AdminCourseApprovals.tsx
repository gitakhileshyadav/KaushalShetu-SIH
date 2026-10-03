import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Course } from '../../types';
import { CourseNotesModal } from '../trainer/CourseNotesModal';
import { 
  BookOpen, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search, 
  Building2, 
  GraduationCap, 
  FileText, 
  PlayCircle, 
  AlertCircle,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Percent,
  Calendar,
  Pencil
} from 'lucide-react';

export const AdminCourseApprovals: React.FC = () => {
  const { courses, allUsers, approveCourse, rejectCourse, openClassroom } = useApp();

  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCourseId, setExpandedCourseId] = useState<string | null>(null);
  const [rejectingCourseId, setRejectingCourseId] = useState<string | null>(null);
  const [rejectReasonInput, setRejectReasonInput] = useState('');
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  const pendingCourses = courses.filter(c => c.approvalStatus === 'pending_approval');
  const approvedCourses = courses.filter(c => c.approvalStatus === 'approved');
  const rejectedCourses = courses.filter(c => c.approvalStatus === 'rejected');

  const filteredCourses = courses.filter(c => {
    if (statusFilter === 'pending' && c.approvalStatus !== 'pending_approval') return false;
    if (statusFilter === 'approved' && c.approvalStatus !== 'approved') return false;
    if (statusFilter === 'rejected' && c.approvalStatus !== 'rejected') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        c.title.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        c.institute.toLowerCase().includes(q) ||
        c.trainerName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleApprove = (courseId: string) => {
    approveCourse(courseId, 'Accredited by NCCT Apex Academic Directorate');
  };

  const handleConfirmReject = () => {
    if (!rejectingCourseId) return;
    rejectCourse(rejectingCourseId, rejectReasonInput || 'Syllabus structure requires revisions to comply with national standards.');
    setRejectingCourseId(null);
    setRejectReasonInput('');
  };

  return (
    <div className="space-y-6">
      {/* Admin Accreditation Rule Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-2xl p-4 sm:p-5 border border-indigo-800 shadow-md space-y-2">
        <div className="flex items-center space-x-2 text-amber-300">
          <Sparkles className="w-4 h-4 shrink-0" />
          <h3 className="text-xs font-bold uppercase tracking-wider">NCCT Course Accreditation Governance Policy</h3>
        </div>
        <p className="text-xs text-slate-200 leading-relaxed">
          <strong>Publishing Rule:</strong> When a course proposal is created by a Trainer, it remains in <span className="text-amber-300 font-bold">Pending Accreditation</span> status. Upon Admin review and approval, the course status changes to <span className="text-emerald-400 font-bold">Accredited & Active</span>, making it <strong>instantly visible to all Trainees nationwide</strong> across all 15 RICM & VAMNICOM institutes so they can apply and enroll immediately.
        </p>
      </div>

      {/* Top summary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div 
          onClick={() => setStatusFilter('pending')}
          className={`p-4 rounded-2xl border transition cursor-pointer ${
            statusFilter === 'pending' 
              ? 'bg-amber-500/10 border-amber-500 ring-2 ring-amber-400/20' 
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">Pending Accreditation</span>
            <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <span className="text-2xl font-black text-amber-600 mt-2 block">{pendingCourses.length}</span>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Awaiting syllabus vetting</span>
        </div>

        <div 
          onClick={() => setStatusFilter('approved')}
          className={`p-4 rounded-2xl border transition cursor-pointer ${
            statusFilter === 'approved' 
              ? 'bg-emerald-500/10 border-emerald-500 ring-2 ring-emerald-400/20' 
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">Accredited Courses</span>
            <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <span className="text-2xl font-black text-emerald-600 mt-2 block">{approvedCourses.length}</span>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Active for trainee admissions</span>
        </div>

        <div 
          onClick={() => setStatusFilter('rejected')}
          className={`p-4 rounded-2xl border transition cursor-pointer ${
            statusFilter === 'rejected' 
              ? 'bg-rose-500/10 border-rose-500 ring-2 ring-rose-400/20' 
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-900 uppercase tracking-wider">Declined Proposals</span>
            <div className="w-6 h-6 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xs">
              <XCircle className="w-3.5 h-3.5" />
            </div>
          </div>
          <span className="text-2xl font-black text-rose-600 mt-2 block">{rejectedCourses.length}</span>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Revisions requested</span>
        </div>

        <div 
          onClick={() => setStatusFilter('all')}
          className={`p-4 rounded-2xl border transition cursor-pointer ${
            statusFilter === 'all' 
              ? 'bg-indigo-500/10 border-indigo-500 ring-2 ring-indigo-400/20' 
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-900 uppercase tracking-wider">Total Curriculum</span>
            <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
              <BookOpen className="w-3.5 h-3.5" />
            </div>
          </div>
          <span className="text-2xl font-black text-slate-900 mt-2 block">{courses.length}</span>
          <span className="text-[11px] text-slate-500 mt-0.5 block">All submitted courses</span>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex items-center justify-between gap-3">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by course title, code, trainer faculty, institute..."
            className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>
        <span className="text-xs text-slate-400 hidden sm:inline font-medium">
          Showing {filteredCourses.length} of {courses.length} Courses
        </span>
      </div>

      {/* Courses List */}
      <div className="space-y-4">
        {filteredCourses.length > 0 ? (
          filteredCourses.map(course => {
            const isPending = course.approvalStatus === 'pending_approval';
            const isApproved = course.approvalStatus === 'approved';
            const isRejected = course.approvalStatus === 'rejected';
            const isExpanded = expandedCourseId === course.id;

            return (
              <div 
                key={course.id}
                className={`bg-white rounded-2xl border transition shadow-xs overflow-hidden ${
                  isPending ? 'border-amber-300 bg-amber-50/20' : 'border-slate-200'
                }`}
              >
                <div className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded border border-indigo-100">
                        {course.code}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">{course.category}</span>

                      {isPending && (
                        <span className="inline-flex items-center space-x-1 bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-md text-[10px]">
                          <Clock className="w-3 h-3 text-amber-600" />
                          <span>Pending NCCT Accreditation</span>
                        </span>
                      )}
                      {isApproved && (
                        <span className="inline-flex items-center space-x-1 bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-md text-[10px]">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Accredited & Active</span>
                        </span>
                      )}
                      {isRejected && (
                        <span className="inline-flex items-center space-x-1 bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded-md text-[10px]">
                          <XCircle className="w-3 h-3 text-rose-600" />
                          <span>Accreditation Declined</span>
                        </span>
                      )}
                    </div>

                    <h4 className="text-base font-bold text-slate-900">{course.title}</h4>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                      <span className="flex items-center space-x-1">
                        <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Faculty: <strong>{course.trainerName}</strong></span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>{course.institute}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{course.totalSessions} Sessions</span>
                      </span>
                      <span className="text-slate-500">
                        Gates: <strong>{course.minAttendancePct}% Attendance</strong> / <strong>{course.minPassPct}% Pass</strong>
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 max-w-3xl">
                      {course.description}
                    </p>
                  </div>

                  {/* Right actions */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0 self-end md:self-center">
                    <button
                      onClick={() => setEditingCourse(course)}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition flex items-center space-x-1.5 cursor-pointer shadow-xs"
                      title="Edit or delete videos, PDFs, lessons, and notes"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>Edit Content</span>
                    </button>

                    <button
                      onClick={() => openClassroom(course.id)}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs transition flex items-center space-x-1.5 cursor-pointer shadow-xs"
                      title="Inspect syllabus videos & PDF reader in platform"
                    >
                      <PlayCircle className="w-3.5 h-3.5" />
                      <span>Preview Classroom</span>
                    </button>

                    <button
                      onClick={() => setExpandedCourseId(isExpanded ? null : course.id)}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition flex items-center space-x-1 cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>{isExpanded ? 'Hide Notes' : 'Syllabus & Notes'}</span>
                      {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>

                    {isPending && (
                      <>
                        <button
                          onClick={() => handleApprove(course.id)}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1 shadow-xs cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Accredit Course</span>
                        </button>

                        <button
                          onClick={() => setRejectingCourseId(course.id)}
                          className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold transition flex items-center space-x-1 cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Decline</span>
                        </button>
                      </>
                    )}

                    {isRejected && (
                      <button
                        onClick={() => handleApprove(course.id)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                      >
                        Reconsider & Accredit
                      </button>
                    )}
                  </div>
                </div>

                {/* Expanded Course Syllabus & Notes Drawer */}
                {isExpanded && (
                  <div className="bg-slate-50 border-t border-slate-200 p-5 space-y-4 text-xs">
                    {/* Faculty Teaching Notes */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                      <h5 className="font-bold text-slate-900 flex items-center space-x-1.5">
                        <FileText className="w-4 h-4 text-indigo-600" />
                        <span>Faculty Instructor Notes & Teaching Directives</span>
                      </h5>
                      {course.notes ? (
                        <p className="text-slate-700 whitespace-pre-line leading-relaxed">
                          {course.notes}
                        </p>
                      ) : (
                        <p className="text-slate-400 italic">No custom faculty teaching notes submitted yet.</p>
                      )}
                    </div>

                    {/* Modules and In-platform video resources */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                      <h5 className="font-bold text-slate-900 flex items-center space-x-1.5">
                        <PlayCircle className="w-4 h-4 text-amber-500" />
                        <span>Curriculum Video Modules ({course.modules?.length || 0} Lessons)</span>
                      </h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {course.modules?.map((m, idx) => (
                          <div key={m.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                            <span className="font-bold text-slate-800">Module {idx + 1}: {m.title}</span>
                            <div className="text-[11px] text-slate-500 mt-1">
                              Duration: {m.durationMinutes} min • YouTube: {m.youtubeVideoId}
                            </div>
                            <div className="text-[11px] text-indigo-600 mt-0.5 truncate">
                              PDF Ref: {m.pdfResource.title}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 text-xs">
            No courses match the selected filter.
          </div>
        )}
      </div>

      {/* Decline reason modal */}
      {rejectingCourseId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center space-x-2 text-rose-600">
              <XCircle className="w-5 h-5" />
              <h3 className="font-bold text-base text-slate-900">Decline Course Accreditation</h3>
            </div>
            <p className="text-xs text-slate-600">
              Please enter the academic feedback or missing prerequisites for the trainer.
            </p>
            <textarea
              rows={3}
              value={rejectReasonInput}
              onChange={e => setRejectReasonInput(e.target.value)}
              placeholder="e.g. Please update minimum attendance requirement to 75% and include safety SOPs."
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
            />
            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => {
                  setRejectingCourseId(null);
                  setRejectReasonInput('');
                }}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-4 py-1.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition cursor-pointer"
              >
                Confirm Decline
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Content Desk: edit/delete any course material (videos, PDFs, lessons, notes) */}
      {editingCourse && (() => {
        const liveCourse = courses.find(c => c.id === editingCourse.id) || editingCourse;
        return (
          <CourseNotesModal
            course={liveCourse}
            canEditContent={true}
            onClose={() => setEditingCourse(null)}
          />
        );
      })()}
    </div>
  );
};
