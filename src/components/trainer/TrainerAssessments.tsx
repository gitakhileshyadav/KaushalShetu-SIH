import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CourseAssessment, AssessmentSubmission, AssessmentQuestion } from '../../types';
import { 
  Award, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  Plus, 
  Building2, 
  ShieldCheck, 
  User, 
  Check, 
  X,
  FileCheck2,
  BookOpen,
  Filter
} from 'lucide-react';

export const TrainerAssessments: React.FC = () => {
  const { 
    assessments, 
    submissions, 
    courses, 
    currentUser,
    approveSubmission,
    addAssessmentQuestion 
  } = useApp();

  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'submissions' | 'question_bank'>('submissions');
  const [remarkInput, setRemarkInput] = useState<{ [subId: string]: string }>({});

  // Question creator state
  const [showAddQModal, setShowAddQModal] = useState(false);
  const [targetAsmId, setTargetAsmId] = useState<string>(assessments[0]?.id || '');
  const [newQText, setNewQText] = useState('');
  const [newQCategory, setNewQCategory] = useState('Practical Competency');
  const [newOptions, setNewOptions] = useState(['', '', '', '']);
  const [correctIdx, setCorrectIdx] = useState(0);
  const [newExplanation, setNewExplanation] = useState('');

  const filteredSubmissions = submissions.filter(sub => {
    if (selectedCourseFilter === 'all') return true;
    return sub.courseId === selectedCourseFilter;
  });

  const handleApprove = (subId: string) => {
    const remark = remarkInput[subId] || 'Practical and theoretical competence approved by trainer.';
    approveSubmission(subId, remark);
  };

  const handleCreateQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQText.trim() || newOptions.some(o => !o.trim())) {
      alert('Please fill out question text and all 4 options.');
      return;
    }

    addAssessmentQuestion(targetAsmId, {
      questionText: newQText.trim(),
      options: newOptions.map(o => o.trim()),
      correctOptionIndex: correctIdx,
      explanation: newExplanation.trim() || 'Verified as per curriculum standards.',
      category: newQCategory.trim()
    });

    setShowAddQModal(false);
    setNewQText('');
    setNewOptions(['', '', '', '']);
    setNewExplanation('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-indigo-900/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Trainer Assessment MIS
            </span>
            <span className="text-xs text-indigo-200">Curriculum & Grading Desk</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            Trainee Assessments & Certification Authority
          </h2>
          <p className="text-xs sm:text-sm text-indigo-200 max-w-xl leading-relaxed">
            Review exam attempts, approve vocational certificates, monitor pass rates for Poultry Farm, Electrician Basic, and PACS, and expand assessment question banks.
          </p>
        </div>

        <button
          onClick={() => setShowAddQModal(true)}
          className="px-5 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-2xl text-xs sm:text-sm transition flex items-center space-x-2 shadow-lg shadow-amber-400/20 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Assessment Question</span>
        </button>
      </div>

      {/* Navigation tabs & Course filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-3">
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('submissions')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'submissions'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            Exam Submissions ({submissions.length})
          </button>
          <button
            onClick={() => setActiveTab('question_bank')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'question_bank'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            Question Bank ({assessments.reduce((acc, a) => acc + a.questions.length, 0)} Items)
          </button>
        </div>

        {/* Filter by course */}
        <div className="flex items-center space-x-2 text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-500 font-semibold">Course:</span>
          <select
            value={selectedCourseFilter}
            onChange={(e) => setSelectedCourseFilter(e.target.value)}
            className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-700 focus:outline-hidden focus:border-indigo-500 cursor-pointer"
          >
            <option value="all">All Cooperative Courses</option>
            {courses.map(c => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* VIEW: SUBMISSIONS LIST */}
      {activeTab === 'submissions' && (
        <div className="space-y-4">
          {filteredSubmissions.length > 0 ? (
            <div className="space-y-3">
              {filteredSubmissions.map(sub => (
                <div
                  key={sub.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-900 text-sm">{sub.traineeName}</span>
                      <span className="text-slate-400 text-xs">•</span>
                      <span className="text-xs text-indigo-600 font-semibold">{sub.institute}</span>
                      <span className="text-slate-400 text-xs">•</span>
                      <span className="text-xs text-slate-400">
                        {new Date(sub.submittedAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600">
                      Course: <strong>{sub.courseTitle}</strong>
                    </div>

                    <div className="flex items-center space-x-3 text-xs">
                      <span className="font-mono font-bold text-slate-700">
                        Score: <strong className={sub.passed ? 'text-emerald-600' : 'text-rose-600'}>{sub.scorePct}%</strong> ({sub.correctAnswersCount}/{sub.totalQuestions})
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        sub.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {sub.passed ? 'Passed Standard' : 'Failed Standard'}
                      </span>
                      {sub.certificateNumber && (
                        <span className="text-indigo-600 font-mono text-[11px]">
                          Cert #{sub.certificateNumber}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Trainer sign-off / Remarks action */}
                  <div className="w-full lg:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    {sub.trainerApproved ? (
                      <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-3 py-2 rounded-xl flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <div>
                          <span className="font-bold block">Certified & Approved</span>
                          <span className="text-[10px] text-emerald-700">{sub.trainerRemarks || 'Approved'}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2 w-full sm:w-auto">
                        <input
                          type="text"
                          placeholder="Optional instructor remarks..."
                          value={remarkInput[sub.id] || ''}
                          onChange={(e) => setRemarkInput({ ...remarkInput, [sub.id]: e.target.value })}
                          className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-700 focus:outline-hidden focus:border-indigo-500 w-full sm:w-56"
                        />
                        <button
                          onClick={() => handleApprove(sub.id)}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1 shrink-0 cursor-pointer shadow-xs"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve Cert</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center text-slate-400 border border-slate-200">
              <FileCheck2 className="w-12 h-12 mx-auto mb-2 text-slate-300" />
              <p className="text-sm font-bold text-slate-700">No Assessment Submissions Found</p>
              <p className="text-xs text-slate-500 mt-1">
                Trainee exam attempts for this course will appear here for grading and certification.
              </p>
            </div>
          )}
        </div>
      )}

      {/* VIEW: QUESTION BANK */}
      {activeTab === 'question_bank' && (
        <div className="space-y-6">
          {assessments.map(asm => (
            <div key={asm.id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">
                    {asm.courseTitle}
                  </span>
                  <h3 className="text-base font-black text-slate-900 mt-0.5">
                    {asm.title} ({asm.questions.length} Items)
                  </h3>
                </div>
                <span className="bg-amber-100 text-amber-900 text-xs font-bold px-3 py-1 rounded-xl">
                  Passing Threshold: {asm.passingScorePct}%
                </span>
              </div>

              <div className="space-y-3">
                {asm.questions.map((q, idx) => (
                  <div key={q.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-bold text-slate-900">
                        {idx + 1}. {q.questionText}
                      </span>
                      <span className="bg-indigo-100 text-indigo-800 text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0">
                        {q.category}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pl-2 text-slate-600">
                      {q.options.map((opt, oIdx) => (
                        <div
                          key={oIdx}
                          className={`p-2 rounded-lg border ${
                            oIdx === q.correctOptionIndex
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold'
                              : 'bg-white border-slate-200'
                          }`}
                        >
                          <span className="font-bold mr-1.5">{String.fromCharCode(65 + oIdx)}.</span>
                          <span>{opt}</span>
                          {oIdx === q.correctOptionIndex && (
                            <span className="text-[10px] text-emerald-600 font-bold ml-1">(Correct)</span>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="text-[11px] text-slate-500 pl-2">
                      <strong className="text-slate-700">Rationale: </strong> {q.explanation}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Add Question */}
      {showAddQModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900">
                Add Exam Question
              </h3>
              <button
                onClick={() => setShowAddQModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateQuestion} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Target Assessment</label>
                <select
                  value={targetAsmId}
                  onChange={(e) => setTargetAsmId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs focus:border-indigo-500"
                >
                  {assessments.map(a => (
                    <option key={a.id} value={a.id}>{a.courseTitle} - {a.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Question Text</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Enter vocational question scenario..."
                  value={newQText}
                  onChange={(e) => setNewQText(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Topic Category</label>
                <input
                  type="text"
                  value={newQCategory}
                  onChange={(e) => setNewQCategory(e.target.value)}
                  placeholder="e.g., Biosecurity, Wiring Codes, Safety"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs focus:border-indigo-500"
                />
              </div>

              <div className="space-y-2">
                <label className="font-bold text-slate-700 block">Multiple Choice Options (Select Correct)</label>
                {newOptions.map((opt, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="correctIdx"
                      checked={correctIdx === idx}
                      onChange={() => setCorrectIdx(idx)}
                      className="text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                    <span className="font-bold w-4">{String.fromCharCode(65 + idx)}.</span>
                    <input
                      type="text"
                      required
                      placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                      value={opt}
                      onChange={(e) => {
                        const updated = [...newOptions];
                        updated[idx] = e.target.value;
                        setNewOptions(updated);
                      }}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs focus:border-indigo-500"
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Technical Rationale & Explanation</label>
                <input
                  type="text"
                  placeholder="Explanation shown to trainee after submitting..."
                  value={newExplanation}
                  onChange={(e) => setNewExplanation(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs focus:border-indigo-500"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddQModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md cursor-pointer"
                >
                  Save to Question Bank
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
