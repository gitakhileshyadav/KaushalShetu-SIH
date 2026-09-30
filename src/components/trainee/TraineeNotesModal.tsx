import React, { useState } from 'react';
import { Course } from '../../types';
import { 
  downloadCourseNotesFile, 
  downloadCourseNotesMarkdown 
} from '../../utils/notesDownloader';
import { 
  X, 
  Download, 
  FileText, 
  BookOpen, 
  GraduationCap, 
  CheckCircle2, 
  FileCode, 
  ExternalLink,
  Layers,
  Sparkles
} from 'lucide-react';

interface TraineeNotesModalProps {
  course: Course;
  onClose: () => void;
  onOpenClassroom?: (courseId: string) => void;
}

export const TraineeNotesModal: React.FC<TraineeNotesModalProps> = ({ 
  course, 
  onClose,
  onOpenClassroom 
}) => {
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const handleDownloadTxt = () => {
    downloadCourseNotesFile(course);
    setDownloadSuccess('Study notes downloaded as formatted text file!');
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  const handleDownloadMd = () => {
    downloadCourseNotesMarkdown(course);
    setDownloadSuccess('Study notes downloaded as Markdown document!');
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 my-auto max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-5 sm:p-6 text-white flex items-start justify-between shrink-0">
          <div>
            <div className="flex items-center space-x-2">
              <span className="bg-amber-400 text-slate-950 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Official Study Notes
              </span>
              <span className="text-xs text-indigo-200">{course.code}</span>
            </div>
            <h3 className="text-lg sm:text-xl font-black mt-1 text-white">
              {course.title}
            </h3>
            <p className="text-xs text-indigo-300 mt-0.5">
              Faculty Instructor: {course.trainerName} • {course.institute}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Bar for Mobile & Desktop Download */}
        <div className="bg-indigo-50/80 border-b border-indigo-100 px-5 py-3 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center space-x-2 text-xs font-semibold text-indigo-900">
            <Download className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>Save Course Notes to Device:</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownloadTxt}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Download (.TXT)</span>
            </button>

            <button
              onClick={handleDownloadMd}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold shadow-xs transition cursor-pointer"
            >
              <FileCode className="w-3.5 h-3.5 text-amber-400" />
              <span>Markdown (.MD)</span>
            </button>
          </div>
        </div>

        {downloadSuccess && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-5 py-2.5 text-xs text-emerald-800 font-semibold flex items-center space-x-2 animate-in fade-in shrink-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{downloadSuccess}</span>
          </div>
        )}

        {/* Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-slate-800 text-xs sm:text-sm">
          {/* Faculty Directives */}
          <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4 sm:p-5 space-y-2">
            <div className="flex items-center space-x-2 text-xs font-bold text-amber-950 uppercase tracking-wider">
              <GraduationCap className="w-4 h-4 text-amber-700" />
              <span>Faculty Instructor Teaching Notes</span>
            </div>
            {course.notes ? (
              <p className="text-xs sm:text-sm text-amber-900 whitespace-pre-line leading-relaxed font-normal">
                {course.notes}
              </p>
            ) : (
              <p className="text-xs text-amber-700 italic">
                Instructor notes will be updated during the live lecture modules.
              </p>
            )}
          </div>

          {/* Curriculum Breakdown */}
          {course.modules && course.modules.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                <span>Curriculum Modules & Study Guides ({course.modules.length})</span>
              </h4>

              <div className="space-y-3">
                {course.modules.map((mod, idx) => (
                  <div 
                    key={mod.id}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold text-indigo-600 uppercase">Module {idx + 1}</span>
                        <h5 className="text-sm font-bold text-slate-900 mt-0.5">{mod.title}</h5>
                      </div>
                      <span className="text-[11px] text-slate-500 font-mono bg-white px-2 py-0.5 rounded border border-slate-200 shrink-0">
                        {mod.durationMinutes} mins
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {mod.description}
                    </p>

                    {mod.learningObjectives && mod.learningObjectives.length > 0 && (
                      <div className="pt-2 border-t border-slate-200/60">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                          Key Competencies:
                        </span>
                        <ul className="space-y-1">
                          {mod.learningObjectives.map((obj, i) => (
                            <li key={i} className="text-xs text-slate-700 flex items-center space-x-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                              <span>{obj}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {mod.pdfResources && mod.pdfResources.length > 0 && (
                      <div className="pt-2 border-t border-slate-200/60 space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          PDF Handouts:
                        </span>
                        {mod.pdfResources.map(pdf => (
                          <div
                            key={pdf.id}
                            className="text-xs font-medium text-indigo-700 flex items-center space-x-1.5 bg-white p-2 rounded-xl border border-slate-200"
                          >
                            <FileText className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                            <span className="truncate">{pdf.title} ({pdf.pageCount} Pages)</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reference SOP Resources */}
          {course.resources && course.resources.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
                <Layers className="w-4 h-4 text-emerald-600" />
                <span>Reference Documents & Manuals ({course.resources.length})</span>
              </h4>

              <div className="space-y-1.5">
                {course.resources.map((res, i) => (
                  <a
                    key={i}
                    href={res.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 rounded-xl border border-slate-200 hover:border-indigo-300 bg-white flex items-center justify-between text-xs text-slate-700 hover:text-indigo-700 transition"
                  >
                    <div className="flex items-center space-x-2 truncate mr-2">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-600 shrink-0">
                        {res.type}
                      </span>
                      <span className="truncate font-semibold">{res.title}</span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 px-6 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-400">
            Certified by Ministry of Cooperation, GoI
          </span>
          <div className="flex items-center space-x-2">
            {onOpenClassroom && (
              <button
                onClick={() => {
                  onClose();
                  onOpenClassroom(course.id);
                }}
                className="px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Go to Video Classroom
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
