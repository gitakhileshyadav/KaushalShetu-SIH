import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Course } from '../../types';
import { 
  X, 
  FileText, 
  Save, 
  Plus, 
  PlayCircle, 
  ExternalLink, 
  CheckCircle2, 
  BookOpen, 
  ShieldCheck, 
  Sparkles,
  Link,
  Layers,
  Clock
} from 'lucide-react';

interface CourseNotesModalProps {
  course: Course;
  onClose: () => void;
}

export const CourseNotesModal: React.FC<CourseNotesModalProps> = ({ course, onClose }) => {
  const { updateCourseNotes, addCourseResource, addCourseLesson, openClassroom } = useApp();

  const [activeTab, setActiveTab] = useState<'notes' | 'resources' | 'lessons'>('notes');
  const [notesText, setNotesText] = useState(course.notes || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // New Resource Form state
  const [showAddResource, setShowAddResource] = useState(false);
  const [resourceTitle, setResourceTitle] = useState('');
  const [resourceUrl, setResourceUrl] = useState('');
  const [resourceType, setResourceType] = useState<'pdf' | 'sop' | 'manual' | 'reference'>('pdf');

  // New Lesson Form state
  const [showAddLesson, setShowAddLesson] = useState(false);
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonDescription, setLessonDescription] = useState('');
  const [lessonYoutubeId, setLessonYoutubeId] = useState('');
  const [lessonDuration, setLessonDuration] = useState('15');
  const [lessonPdfTitle, setLessonPdfTitle] = useState('');
  const [lessonPdfUrl, setLessonPdfUrl] = useState('');

  const handleSaveNotes = (e: React.FormEvent) => {
    e.preventDefault();
    updateCourseNotes(course.id, notesText);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleAddResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resourceTitle.trim()) return;

    addCourseResource(course.id, {
      title: resourceTitle.trim(),
      url: resourceUrl.trim() || 'https://ncct.ac.in/downloads/sop-guidelines.pdf',
      type: resourceType,
      uploadedAt: new Date().toISOString()
    });

    setResourceTitle('');
    setResourceUrl('');
    setShowAddResource(false);
  };

  const handleAddLesson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonTitle.trim()) return;

    addCourseLesson(course.id, {
      title: lessonTitle.trim(),
      description: lessonDescription.trim() || 'Core module lecture notes and practical demonstrations.',
      youtubeVideoId: lessonYoutubeId.trim() || 'dQw4w9WgXcQ',
      durationMinutes: parseInt(lessonDuration, 10) || 15,
      pdfResource: {
        title: lessonPdfTitle.trim() || `${lessonTitle.trim()} Study Note`,
        url: lessonPdfUrl.trim() || 'https://ncct.ac.in/materials/sample-guide.pdf',
        totalPages: 12
      }
    });

    setLessonTitle('');
    setLessonDescription('');
    setLessonYoutubeId('');
    setShowAddLesson(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 my-8">
        {/* Header */}
        <div className="bg-slate-900 p-6 text-white flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <span className="bg-amber-400 text-slate-950 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Trainer Content & Notes Desk
              </span>
              <span className="text-xs text-indigo-300 font-mono font-bold">{course.code}</span>
            </div>
            <h3 className="text-xl font-bold text-white mt-1.5">{course.title}</h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Faculty Jurisdiction: <strong className="text-white">{course.trainerName}</strong> • {course.institute}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Approval status reminder */}
        {course.approvalStatus === 'pending_approval' && (
          <div className="bg-amber-50 border-b border-amber-200 px-6 py-2.5 text-xs text-amber-800 flex items-center space-x-2">
            <Clock className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Course Awaiting Admin Accreditation:</strong> Trainees cannot enroll until Director K. N. Rao approves this curriculum. However, you can freely draft teaching notes and add learning materials now.
            </span>
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-slate-200 px-6 bg-slate-50 space-x-4">
          <button
            onClick={() => setActiveTab('notes')}
            className={`py-3 text-xs sm:text-sm font-bold border-b-2 flex items-center space-x-1.5 transition cursor-pointer ${
              activeTab === 'notes'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Faculty Teaching Notes</span>
          </button>

          <button
            onClick={() => setActiveTab('resources')}
            className={`py-3 text-xs sm:text-sm font-bold border-b-2 flex items-center space-x-1.5 transition cursor-pointer ${
              activeTab === 'resources'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Reading SOPs & PDFs ({course.resources?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('lessons')}
            className={`py-3 text-xs sm:text-sm font-bold border-b-2 flex items-center space-x-1.5 transition cursor-pointer ${
              activeTab === 'lessons'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <PlayCircle className="w-4 h-4 text-amber-500" />
            <span>Video Modules & Lessons ({course.modules?.length || 0})</span>
          </button>
        </div>

        <div className="p-6">
          {/* Tab 1: Faculty Teaching Notes */}
          {activeTab === 'notes' && (
            <form onSubmit={handleSaveNotes} className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Instructional Syllabus & Teaching Notes
                  </label>
                  <p className="text-xs text-slate-500 mt-0.5">
                    These notes and learning outcomes are accessible in the classroom and during assessment evaluations.
                  </p>
                </div>
                {savedSuccess && (
                  <span className="text-xs font-bold text-emerald-600 flex items-center space-x-1 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 animate-in fade-in">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Saved!</span>
                  </span>
                )}
              </div>

              <textarea
                rows={10}
                value={notesText}
                onChange={e => setNotesText(e.target.value)}
                placeholder="Enter detailed lecture outlines, key cooperative concepts, standard operating guidelines, laboratory steps, or exam hints..."
                className="w-full p-4 bg-slate-50 border border-slate-300 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white font-mono leading-relaxed"
              />

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => openClassroom(course.id)}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer"
                >
                  <PlayCircle className="w-4 h-4 text-amber-500" />
                  <span>Preview in Classroom</span>
                </button>

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center space-x-2 shadow-xs cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Teaching Notes</span>
                </button>
              </div>
            </form>
          )}

          {/* Tab 2: Reading SOPs & PDFs */}
          {activeTab === 'resources' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Attached PDF & SOP Learning Materials
                  </h4>
                  <p className="text-xs text-slate-500">
                    Accessible directly in the embedded in-platform PDF reader.
                  </p>
                </div>
                <button
                  onClick={() => setShowAddResource(!showAddResource)}
                  className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition flex items-center space-x-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Resource Link</span>
                </button>
              </div>

              {showAddResource && (
                <form onSubmit={handleAddResource} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                  <h5 className="text-xs font-bold text-slate-800">Add Learning Document</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Title *</label>
                      <input
                        type="text"
                        required
                        value={resourceTitle}
                        onChange={e => setResourceTitle(e.target.value)}
                        placeholder="e.g. Layer Poultry Vaccination SOP"
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Document Type</label>
                      <select
                        value={resourceType}
                        onChange={e => setResourceType(e.target.value as any)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="pdf">Standard PDF Document</option>
                        <option value="sop">Official SOP Manual</option>
                        <option value="manual">Training Manual</option>
                        <option value="reference">Statutory Reference</option>
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">PDF URL / Link</label>
                      <input
                        type="url"
                        value={resourceUrl}
                        onChange={e => setResourceUrl(e.target.value)}
                        placeholder="https://example.com/handbook.pdf (or leave blank for standard template)"
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAddResource(false)}
                      className="px-3 py-1 text-xs text-slate-600 hover:bg-slate-200 rounded-lg cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-indigo-600 text-white font-bold rounded-xl text-xs hover:bg-indigo-700 cursor-pointer"
                    >
                      Attach Resource
                    </button>
                  </div>
                </form>
              )}

              <div className="space-y-2">
                {course.resources && course.resources.length > 0 ? (
                  course.resources.map(res => (
                    <div key={res.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                          PDF
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{res.title}</p>
                          <p className="text-slate-400 font-mono text-[11px]">Type: {res.type.toUpperCase()}</p>
                        </div>
                      </div>
                      <span className="text-emerald-600 font-semibold text-[11px] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        In-Platform Embedded
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-2xl">
                    No supplementary PDF resources uploaded yet. Click "Add Resource Link" to attach one.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 3: Lessons & Video Modules */}
          {activeTab === 'lessons' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    In-Platform YouTube Video Modules
                  </h4>
                  <p className="text-xs text-slate-500">
                    Runs strictly within the web app with progress bar gated to video completion.
                  </p>
                </div>
                <button
                  onClick={() => setShowAddLesson(!showAddLesson)}
                  className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition flex items-center space-x-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Video Lesson</span>
                </button>
              </div>

              {showAddLesson && (
                <form onSubmit={handleAddLesson} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                  <h5 className="text-xs font-bold text-slate-800">Add New Lesson Module</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Lesson Title *</label>
                      <input
                        type="text"
                        required
                        value={lessonTitle}
                        onChange={e => setLessonTitle(e.target.value)}
                        placeholder="e.g. Biosecurity & Feed Sanitation"
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">YouTube Video ID</label>
                      <input
                        type="text"
                        value={lessonYoutubeId}
                        onChange={e => setLessonYoutubeId(e.target.value)}
                        placeholder="e.g. 9bZkp7q19f0 (11 chars)"
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Duration (Minutes)</label>
                      <input
                        type="number"
                        min="1"
                        value={lessonDuration}
                        onChange={e => setLessonDuration(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Attached PDF Chapter Title</label>
                      <input
                        type="text"
                        value={lessonPdfTitle}
                        onChange={e => setLessonPdfTitle(e.target.value)}
                        placeholder="e.g. Module Study Guide"
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Description / Key Points</label>
                      <textarea
                        rows={2}
                        value={lessonDescription}
                        onChange={e => setLessonDescription(e.target.value)}
                        placeholder="Core focus areas covered in this module..."
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAddLesson(false)}
                      className="px-3 py-1 text-xs text-slate-600 hover:bg-slate-200 rounded-lg cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-indigo-600 text-white font-bold rounded-xl text-xs hover:bg-indigo-700 cursor-pointer"
                    >
                      Save Lesson
                    </button>
                  </div>
                </form>
              )}

              <div className="space-y-2">
                {course.modules?.map((m, idx) => (
                  <div key={m.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                        {idx + 1}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{m.title}</p>
                        <p className="text-slate-400 font-mono text-[11px]">
                          YouTube ID: {m.youtubeVideoId} • {m.durationMinutes} mins
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => openClassroom(course.id)}
                      className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs transition flex items-center space-x-1 cursor-pointer"
                    >
                      <PlayCircle className="w-3.5 h-3.5" />
                      <span>Preview</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
