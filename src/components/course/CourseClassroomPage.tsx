import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Course, CourseLesson, CoursePDF } from '../../types';
import { InPlatformVideoPlayer } from './InPlatformVideoPlayer';
import { InPlatformPDFViewer } from './InPlatformPDFViewer';
import { 
  BookOpen, 
  Play, 
  CheckCircle2, 
  FileText, 
  Sparkles, 
  Award, 
  Lock, 
  ChevronRight, 
  ArrowLeft, 
  ExternalLink,
  ShieldCheck, 
  Check, 
  Building2, 
  Clock,
  AlertTriangle,
  GraduationCap
} from 'lucide-react';

interface CourseClassroomPageProps {
  courseId: string;
  onBack: () => void;
  onOpenAssessment: (assessmentId: string) => void;
}

export const CourseClassroomPage: React.FC<CourseClassroomPageProps> = ({
  courseId,
  onBack,
  onOpenAssessment
}) => {
  const { 
    courses, 
    currentUser, 
    enrollments,
    lessonProgress, 
    markLessonComplete, 
    assessments, 
    submissions,
    requestAdmission,
    navigateTo 
  } = useApp();

  const course = courses.find(c => c.id === courseId) || courses[0];
  const modules = course?.modules || [];
  const [activeModuleIndex, setActiveModuleIndex] = useState(0);
  const [activePdf, setActivePdf] = useState<CoursePDF | null>(null);
  const [showApplyNotes, setShowApplyNotes] = useState(false);
  const [admissionNote, setAdmissionNote] = useState('');
  const [applyFeedback, setApplyFeedback] = useState<string | null>(null);

  // Strict Jurisdiction Access Control
  const isEnrolledAndApproved = enrollments.some(
    e => e.courseId === course?.id && e.traineeId === currentUser?.id && e.status === 'approved'
  );
  const isPendingAdmission = enrollments.some(
    e => e.courseId === course?.id && e.traineeId === currentUser?.id && e.status === 'pending_approval'
  );
  const isOwnerTrainer = currentUser?.role === 'trainer' && (course?.trainerId === currentUser?.id || currentUser.role === 'admin');
  const isApexAdmin = currentUser?.role === 'admin';
  const isEmployer = currentUser?.role === 'employer';
  const hasAccess = isEnrolledAndApproved || isOwnerTrainer || isApexAdmin || isEmployer;

  const currentModule: CourseLesson | undefined = modules[activeModuleIndex] || modules[0];

  // Completion calculation
  const completedCount = modules.filter(m => {
    const prog = lessonProgress.find(p => p.courseId === course.id && p.lessonId === m.id && p.traineeId === currentUser?.id);
    return prog?.completed;
  }).length;

  const totalModules = modules.length || 1;
  const courseCompletionPct = Math.floor((completedCount / totalModules) * 100);

  // Check if current module is completed
  const isCurrentModuleCompleted = !!lessonProgress.find(
    p => p.courseId === course.id && p.lessonId === currentModule?.id && p.traineeId === currentUser?.id && p.completed
  );

  // Check assessment submission
  const courseAssessment = assessments.find(a => a.courseId === course.id);
  const mySubmission = submissions.find(s => s.courseId === course.id && s.traineeId === currentUser?.id);

  const handleLessonFinish = () => {
    if (currentModule && currentUser) {
      markLessonComplete(course.id, currentModule.id);
    }
  };

  const handleSendAdmission = (e: React.FormEvent) => {
    e.preventDefault();
    const res = requestAdmission(course.id, admissionNote || 'Requesting course admission from classroom portal');
    setApplyFeedback(res.message);
    setShowApplyNotes(false);
  };

  // If trainee does not have jurisdiction access to this course
  if (!hasAccess) {
    return (
      <div className="max-w-3xl mx-auto py-10 px-4 space-y-6">
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xl text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8" />
          </div>

          <div className="inline-flex items-center space-x-2 bg-amber-50 text-amber-800 text-xs font-bold px-3 py-1 rounded-full border border-amber-200">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Strict NCCT Jurisdiction Protection</span>
          </div>

          <h2 className="text-2xl font-black text-slate-900">
            Course Classroom Restricted
          </h2>

          <p className="text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
            Under National Council for Cooperative Training governance rules, interactive video lectures, in-platform PDF study materials, and certification testing for <strong>{course.title}</strong> ({course.code}) are strictly isolated to admitted trainees and authorized faculty.
          </p>

          {isPendingAdmission ? (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 max-w-md mx-auto text-left space-y-1">
              <p className="font-bold flex items-center space-x-1.5 text-amber-900">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>Admission Decision Pending</span>
              </p>
              <p className="text-amber-700">
                Your admission application has been submitted and is currently awaiting review by Faculty Instructor <strong>{course.trainerName}</strong>. Once approved, the classroom modules will unlock automatically.
              </p>
            </div>
          ) : (
            <div className="pt-2 max-w-md mx-auto space-y-3">
              {showApplyNotes ? (
                <form onSubmit={handleSendAdmission} className="text-left space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <label className="block text-xs font-bold text-slate-700">
                    Application Note / Affiliation Context
                  </label>
                  <textarea
                    rows={3}
                    value={admissionNote}
                    onChange={e => setAdmissionNote(e.target.value)}
                    placeholder="Provide your background, PACS association, or training objective..."
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
                  />
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowApplyNotes(false)}
                      className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700"
                    >
                      Submit Application
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  onClick={() => setShowApplyNotes(true)}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl text-xs sm:text-sm transition shadow-lg shadow-indigo-200 cursor-pointer"
                >
                  Apply for Admission to this Course
                </button>
              )}

              {applyFeedback && (
                <p className="text-xs text-emerald-600 font-bold bg-emerald-50 p-2 rounded-xl border border-emerald-200">
                  {applyFeedback}
                </p>
              )}
            </div>
          )}

          <div className="pt-4 border-t border-slate-100 flex items-center justify-center space-x-4 text-xs">
            <button
              onClick={onBack}
              className="text-slate-600 hover:text-slate-900 font-semibold cursor-pointer"
            >
              &larr; Return to My Dashboard
            </button>
            <span className="text-slate-300">•</span>
            <button
              onClick={() => navigateTo('courses')}
              className="text-indigo-600 hover:text-indigo-700 font-semibold cursor-pointer"
            >
              Browse Accredited Course Catalog
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Navigation & Breadcrumb */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-xs sm:text-sm font-bold text-slate-600 hover:text-indigo-600 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My Courses</span>
        </button>

        <div className="flex items-center space-x-2">
          <span className="bg-indigo-50 text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full border border-indigo-200">
            {course.code}
          </span>
          <span className="text-xs text-slate-500 hidden sm:inline">•</span>
          <span className="text-xs text-slate-600 font-medium hidden sm:inline">{course.institute}</span>
          <span className="text-xs text-slate-500 hidden sm:inline">•</span>
          <span className="text-xs text-slate-600 font-medium hidden sm:inline">Faculty: {course.trainerName}</span>
        </div>
      </div>

      {/* Course Hero Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-indigo-900/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center space-x-2">
            <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              {course.category}
            </span>
            <span className="text-xs text-indigo-300 font-mono">Module {activeModuleIndex + 1} of {totalModules}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            {course.title}
          </h1>
          <p className="text-xs sm:text-sm text-indigo-200 line-clamp-2 leading-relaxed">
            {course.description}
          </p>
        </div>

        {/* Course Progress Card */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 w-full md:w-64 shrink-0 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-indigo-200 font-medium">Curriculum Progress</span>
            <span className="text-amber-300 font-extrabold">{courseCompletionPct}%</span>
          </div>
          <div className="w-full bg-black/40 rounded-full h-3 overflow-hidden p-0.5 border border-white/10">
            <div
              className="bg-gradient-to-r from-amber-400 to-emerald-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${courseCompletionPct}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-300">
            <span>{completedCount} of {totalModules} Lectures</span>
            {courseCompletionPct === 100 && (
              <span className="text-emerald-300 font-bold flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>Ready for Exam</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: Video Player on Left, Playlist & PDFs on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Embedded YouTube Player & Lesson Overview */}
        <div className="lg:col-span-8 space-y-6">
          {currentModule ? (
            <InPlatformVideoPlayer
              key={currentModule.id}
              videoId={currentModule.youtubeVideoId}
              lessonTitle={currentModule.title}
              courseTitle={course.title}
              durationMinutes={currentModule.durationMinutes}
              isCompleted={isCurrentModuleCompleted}
              onVideoComplete={handleLessonFinish}
            />
          ) : (
            <div className="bg-white p-12 rounded-3xl text-center text-slate-400 border border-slate-200">
              <Play className="w-12 h-12 mx-auto mb-2 text-slate-300" />
              <p>Select a lecture from the curriculum roster to start learning.</p>
            </div>
          )}

          {/* Current Lesson Details & Objectives */}
          {currentModule && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider block">
                    Lesson {activeModuleIndex + 1} Overview
                  </span>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5">
                    {currentModule.title}
                  </h2>
                </div>

                <div className="flex items-center space-x-2 text-xs text-slate-500 font-mono bg-slate-100 px-3 py-1 rounded-xl">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{currentModule.durationMinutes} Minutes</span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {currentModule.description}
              </p>

              {/* Learning Objectives */}
              {currentModule.learningObjectives && currentModule.learningObjectives.length > 0 && (
                <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-4 space-y-2">
                  <span className="text-xs font-bold text-indigo-950 uppercase tracking-wider block">
                    Key Vocational Competencies
                  </span>
                  <ul className="space-y-1.5">
                    {currentModule.learningObjectives.map((obj, i) => (
                      <li key={i} className="text-xs text-indigo-900 flex items-start space-x-2">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{obj}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Faculty Instructor Teaching Notes */}
              {course.notes && (
                <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-4 space-y-1.5">
                  <div className="flex items-center space-x-2 text-xs font-bold text-amber-900">
                    <GraduationCap className="w-4 h-4 text-amber-700" />
                    <span>Faculty Teaching Notes & Directives ({course.trainerName})</span>
                  </div>
                  <p className="text-xs text-amber-800 whitespace-pre-line leading-relaxed">
                    {course.notes}
                  </p>
                </div>
              )}

              {/* In-Platform PDF Attachments */}
              {currentModule.pdfResources && currentModule.pdfResources.length > 0 && (
                <div className="pt-3 border-t border-slate-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
                      <FileText className="w-4 h-4 text-rose-500" />
                      <span>In-Platform Official PDF Study Materials</span>
                    </h3>
                    <span className="text-[10px] text-slate-400">Opens securely inside this page</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {currentModule.pdfResources.map(pdf => (
                      <div
                        key={pdf.id}
                        onClick={() => setActivePdf(pdf)}
                        className="p-3.5 rounded-2xl border border-slate-200 hover:border-indigo-400 bg-slate-50/70 hover:bg-indigo-50/40 transition cursor-pointer group flex items-start justify-between gap-2"
                      >
                        <div className="flex items-start space-x-3 truncate">
                          <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div className="truncate">
                            <p className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 truncate">
                              {pdf.title}
                            </p>
                            <p className="text-[11px] text-slate-500 truncate mt-0.5">
                              {pdf.pageCount} Pages • {pdf.department}
                            </p>
                          </div>
                        </div>

                        <span className="text-[11px] font-bold text-indigo-600 group-hover:underline shrink-0">
                          Read PDF &rarr;
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Module Roster & Assessment Action Box */}
        <div className="lg:col-span-4 space-y-6">
          {/* Assessment Certification Callout */}
          <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 rounded-3xl p-6 shadow-xl space-y-3">
            <div className="flex items-center space-x-2">
              <Award className="w-6 h-6 text-slate-950" />
              <span className="font-black text-sm uppercase tracking-wider">
                Official Certification Gate
              </span>
            </div>

            {mySubmission ? (
              <div className="bg-white/90 rounded-2xl p-4 space-y-2 border border-slate-950/10">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Your Exam Score:</span>
                  <span className="text-sm font-black text-emerald-700">{mySubmission.scorePct}%</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  {mySubmission.passed ? (
                    <span className="text-emerald-700 font-semibold">
                      Passed! Certificate #{mySubmission.certificateNumber || 'NCCT-CERT'} generated.
                    </span>
                  ) : (
                    <span>Score below required passing standard ({course.minPassPct}%). Retake available.</span>
                  )}
                </p>
                <button
                  onClick={() => courseAssessment && onOpenAssessment(courseAssessment.id)}
                  className="w-full py-2 bg-slate-950 text-white rounded-xl text-xs font-bold hover:bg-slate-900 transition cursor-pointer"
                >
                  View Assessment & Certificate
                </button>
              </div>
            ) : (
              <div>
                <p className="text-xs font-medium text-slate-900/90 leading-relaxed">
                  Complete all in-platform video lectures to unlock the <strong>{course.title}</strong> examination (Passing: {course.minPassPct}%).
                </p>
                <button
                  onClick={() => courseAssessment && onOpenAssessment(courseAssessment.id)}
                  className="mt-3 w-full py-2.5 bg-slate-950 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 cursor-pointer shadow-md"
                >
                  <span>Open Assessment Desk</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Interactive Lesson Navigation Playlist */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center space-x-1.5">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                <span>Curriculum Modules</span>
              </h3>
              <span className="text-xs text-slate-500 font-medium">
                {completedCount}/{totalModules} Finished
              </span>
            </div>

            <div className="space-y-2">
              {modules.map((mod, idx) => {
                const isDone = !!lessonProgress.find(
                  p => p.courseId === course.id && p.lessonId === mod.id && p.traineeId === currentUser?.id && p.completed
                );
                const isSelected = idx === activeModuleIndex;

                return (
                  <button
                    key={mod.id}
                    onClick={() => setActiveModuleIndex(idx)}
                    className={`w-full text-left p-3 rounded-2xl border transition flex items-center justify-between gap-3 cursor-pointer ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/50 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                    }`}
                  >
                    <div className="flex items-center space-x-3 truncate">
                      <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                        isDone 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : isSelected 
                          ? 'bg-indigo-600 text-white' 
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {isDone ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                      </div>

                      <div className="truncate">
                        <p className={`text-xs font-bold truncate ${isSelected ? 'text-indigo-950' : 'text-slate-800'}`}>
                          {mod.title}
                        </p>
                        <div className="flex items-center space-x-2 text-[10px] text-slate-400 mt-0.5">
                          <span>{mod.durationMinutes} mins</span>
                          {mod.pdfResources && mod.pdfResources.length > 0 && (
                            <>
                              <span>•</span>
                              <span className="text-rose-600 font-semibold">{mod.pdfResources.length} PDF Manual</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {isDone ? (
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
                        Completed
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[10px] shrink-0 font-medium">
                        Pending
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* In-Platform PDF Modal Reader */}
      {activePdf && (
        <InPlatformPDFViewer
          pdf={activePdf}
          onClose={() => setActivePdf(null)}
        />
      )}
    </div>
  );
};
