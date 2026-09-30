import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Course } from '../../types';
import { 
  BookOpen, 
  Search, 
  Filter, 
  Building2, 
  Clock, 
  Award, 
  CheckCircle2, 
  Plus, 
  ArrowRight,
  ShieldAlert,
  UserCheck,
  AlertCircle,
  PlayCircle
} from 'lucide-react';

export const CourseCatalogPage: React.FC = () => {
  const { courses, enrollments, currentUser, requestAdmission, navigateTo, openClassroom } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedInstitute, setSelectedInstitute] = useState<string>('all');
  const [selectedCourseForApply, setSelectedCourseForApply] = useState<Course | null>(null);
  const [applyNotes, setApplyNotes] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Filter courses that are visible to current user (approved/accredited or authored by current trainer/admin)
  const visibleCourses = courses.filter(c => {
    // All accredited courses (approved or unflagged) are visible to trainees
    if (!c.approvalStatus || c.approvalStatus === 'approved' || (c.approvalStatus !== 'pending_approval' && c.approvalStatus !== 'rejected')) {
      return true;
    }
    // Allow trainers/admins to see their own pending proposal courses
    if (currentUser && (currentUser.id === c.trainerId || currentUser.role === 'admin')) {
      return true;
    }
    return false;
  });

  const categories = ['all', ...Array.from(new Set(visibleCourses.map(c => c.category)))];
  const institutes = ['all', ...Array.from(new Set(visibleCourses.map(c => c.institute)))];

  const filteredCourses = visibleCourses.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.institute.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || c.category === selectedCategory;
    const matchesInstitute = selectedInstitute === 'all' || c.institute === selectedInstitute;
    return matchesSearch && matchesCategory && matchesInstitute;
  });

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseForApply) return;

    if (!currentUser) {
      setFeedback({ type: 'error', message: 'Please sign in to apply for courses.' });
      return;
    }

    const res = requestAdmission(selectedCourseForApply.id, applyNotes);
    if (res.success) {
      setFeedback({ type: 'success', message: res.message });
      setSelectedCourseForApply(null);
      setApplyNotes('');
    } else {
      setFeedback({ type: 'error', message: res.message });
    }
  };

  const getUserEnrollmentStatus = (courseId: string) => {
    if (!currentUser) return null;
    return enrollments.find(e => e.courseId === courseId && e.traineeId === currentUser.id);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200">
        <div>
          <div className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            <h1 className="text-xl font-bold text-slate-900">NCCT Course Catalog & Admissions</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Official curriculum programs across VAMNICOM Pune and Regional Institutes of Cooperative Management
          </p>
        </div>

        {currentUser?.role === 'trainer' && (
          <button
            onClick={() => navigateTo('trainer')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition flex items-center space-x-1.5 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Program</span>
          </button>
        )}
      </div>

      {feedback && (
        <div className={`p-4 rounded-xl text-xs flex items-center justify-between animate-in fade-in ${
          feedback.type === 'success' 
            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
            : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          <div className="flex items-center space-x-2">
            {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-xs font-bold underline ml-4 cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      {/* Filter and Search controls */}
      <div className="space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search by course title, code (e.g. PACS-101), institute or keyword..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>

          <div className="w-full md:w-72">
            <select
              value={selectedInstitute}
              onChange={e => setSelectedInstitute(e.target.value)}
              className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            >
              <option value="all">All Institutes / Apex Centers</option>
              {institutes.filter(inst => inst !== 'all').map(inst => (
                <option key={inst} value={inst}>{inst}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto pb-1">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
          <span className="text-xs font-bold text-slate-500 mr-1">Category:</span>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer capitalize ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              {cat === 'all' ? 'All Categories' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Course Cards Grid */}
      {filteredCourses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-4 shadow-xs">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">No accredited courses found in this category</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              There are currently no active accredited courses matching <span className="font-semibold text-slate-700">"{selectedCategory === 'all' ? searchTerm || selectedInstitute : selectedCategory}"</span> for trainees.
            </p>
          </div>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
              setSelectedInstitute('all');
            }}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition shadow-xs cursor-pointer inline-flex items-center space-x-1.5"
          >
            <span>Show All Courses</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCourses.map(course => {
            const userEnrollment = getUserEnrollmentStatus(course.id);
            const isApproved = userEnrollment?.status === 'approved';
            const isPending = userEnrollment?.status === 'pending_approval';

            return (
              <div
                key={course.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col justify-between hover:shadow-md hover:border-indigo-300 transition"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono font-bold text-xs bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-md border border-indigo-200">
                      {course.code}
                    </span>
                    <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium">
                      {course.category}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 line-clamp-2 leading-snug">
                    {course.title}
                  </h3>

                  <div className="flex items-center space-x-1.5 text-xs text-slate-500 mt-2">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{course.institute}</span>
                  </div>

                  <p className="text-xs text-slate-600 mt-3 line-clamp-3 leading-relaxed">
                    {course.description}
                  </p>

                  {/* Gates & Statutory Parameters */}
                  <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <span className="text-[10px] text-slate-500 block uppercase font-medium">Min. Attendance</span>
                      <strong className="text-indigo-700 font-bold">{course.minAttendancePct}% Gate</strong>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <span className="text-[10px] text-slate-500 block uppercase font-medium">Min. Pass Score</span>
                      <strong className="text-emerald-700 font-bold">{course.minPassPct}%</strong>
                    </div>
                  </div>
                </div>

                {/* Action area */}
                <div className="mt-5 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <button
                    onClick={() => openClassroom(course.id)}
                    className="inline-flex items-center space-x-1 text-xs font-bold text-slate-900 bg-amber-400 hover:bg-amber-300 px-3 py-1.5 rounded-lg shadow-xs cursor-pointer"
                  >
                    <PlayCircle className="w-3.5 h-3.5 text-slate-950" />
                    <span>Video Classroom</span>
                  </button>

                  <div className="flex items-center space-x-2">
                    {isApproved ? (
                      <span className="inline-flex items-center space-x-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Enrolled</span>
                      </span>
                    ) : isPending ? (
                      <span className="inline-flex items-center space-x-1 text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        <span>Pending</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => {
                          if (!currentUser) {
                            navigateTo('login');
                          } else {
                            setSelectedCourseForApply(course);
                          }
                        }}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition shadow-xs flex items-center space-x-1 cursor-pointer"
                      >
                        <span>Apply Admission</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Apply Admission Modal */}
      {selectedCourseForApply && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900">
              Apply for Admission: {selectedCourseForApply.code}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {selectedCourseForApply.title} ({selectedCourseForApply.institute})
            </p>

            <form onSubmit={handleApply} className="mt-4 space-y-4">
              <div className="bg-indigo-50/70 p-3 rounded-xl border border-indigo-100 text-xs text-indigo-900 space-y-1">
                <p><strong>Applicant:</strong> {currentUser?.fullName} ({currentUser?.username})</p>
                <p><strong>Designation/Institute:</strong> {currentUser?.institute}</p>
                <p><strong>Statutory Gate:</strong> Minimum {selectedCourseForApply.minAttendancePct}% verified session attendance required for examination.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Statement of Purpose / PACS Role (Optional)
                </label>
                <textarea
                  rows={3}
                  value={applyNotes}
                  onChange={e => setApplyNotes(e.target.value)}
                  placeholder="Mention your cooperative society, PACS role, or reason for attending this training..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedCourseForApply(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-xs cursor-pointer"
                >
                  Submit Admission Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
