import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CourseAssessment, AssessmentQuestion, AssessmentSubmission } from '../../types';
import { 
  Award, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Sparkles, 
  RotateCcw, 
  FileCheck2, 
  Printer, 
  Building2, 
  ShieldCheck, 
  ChevronRight, 
  Check, 
  X,
  QrCode
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { QRCodeSVG } from 'qrcode.react';

interface TraineeAssessmentsProps {
  initialAssessmentId?: string;
  onBackToCourses?: () => void;
}

export const TraineeAssessments: React.FC<TraineeAssessmentsProps> = ({
  initialAssessmentId,
  onBackToCourses
}) => {
  const { 
    currentUser, 
    assessments, 
    submissions, 
    submitAssessment 
  } = useApp();

  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string>(
    initialAssessmentId || assessments[0]?.id || ''
  );
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [isExamSubmitted, setIsExamSubmitted] = useState(false);
  const [latestSubmission, setLatestSubmission] = useState<AssessmentSubmission | null>(null);
  const [isTakingExam, setIsTakingExam] = useState(false);

  const activeAssessment = assessments.find(a => a.id === selectedAssessmentId) || assessments[0];
  const myExistingSubmissions = submissions.filter(s => s.traineeId === currentUser?.id);
  const mySubForActive = myExistingSubmissions.find(s => s.assessmentId === activeAssessment?.id);

  const handleSelectOption = (questionId: string, optionIdx: number) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: optionIdx
    }));
  };

  const handleStartExam = () => {
    setSelectedAnswers({});
    setActiveQuestionIndex(0);
    setIsExamSubmitted(false);
    setLatestSubmission(null);
    setIsTakingExam(true);
  };

  const handleSubmitExam = () => {
    if (!activeAssessment || !currentUser) return;

    // Calculate score
    let correct = 0;
    activeAssessment.questions.forEach(q => {
      if (selectedAnswers[q.id] === q.correctOptionIndex) {
        correct++;
      }
    });

    const scorePct = Math.round((correct / activeAssessment.questions.length) * 100);
    const passed = scorePct >= activeAssessment.passingScorePct;

    const sub = submitAssessment({
      assessmentId: activeAssessment.id,
      courseId: activeAssessment.courseId,
      courseTitle: activeAssessment.courseTitle,
      scorePct,
      totalQuestions: activeAssessment.questions.length,
      correctAnswersCount: correct,
      passed,
      answers: selectedAnswers
    });

    setLatestSubmission(sub);
    setIsExamSubmitted(true);
    setIsTakingExam(false);

    if (passed) {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.5 }
      });
    }
  };

  const displayedSubmission = latestSubmission || mySubForActive;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-indigo-900/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Trainee Assessment Station
            </span>
            <span className="text-xs text-indigo-200">Statutory NCCT Certification</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            Course Skill Assessments & Certification
          </h2>
          <p className="text-xs sm:text-sm text-indigo-200 max-w-xl leading-relaxed">
            Demonstrate your vocational competence in Poultry Farming, Rural Electrification, or Cooperative Governance to qualify for national certification and cooperative recruitment.
          </p>
        </div>

        {/* Quick Stats Pill */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-center w-full sm:w-auto shrink-0">
          <div className="text-2xl font-black text-amber-400">
            {myExistingSubmissions.filter(s => s.passed).length} / {assessments.length}
          </div>
          <div className="text-[11px] text-indigo-200 font-semibold uppercase tracking-wider mt-0.5">
            Certificates Earned
          </div>
        </div>
      </div>

      {/* Assessment Selector Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {assessments.map(asm => {
          const isSelected = selectedAssessmentId === asm.id;
          const sub = myExistingSubmissions.find(s => s.assessmentId === asm.id);

          return (
            <button
              key={asm.id}
              onClick={() => {
                setSelectedAssessmentId(asm.id);
                setIsTakingExam(false);
                setIsExamSubmitted(false);
              }}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              <Award className={`w-4 h-4 ${isSelected ? 'text-amber-300' : 'text-slate-400'}`} />
              <span>{asm.courseTitle}</span>
              {sub && sub.passed && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 ml-1" />
              )}
            </button>
          );
        })}
      </div>

      {/* ACTIVE VIEW: TAKING EXAM, RESULT/CERTIFICATE, OR OVERVIEW */}
      {isTakingExam && activeAssessment ? (
        /* The Timed Exam Interface */
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md space-y-6">
          {/* Exam Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider block">
                {activeAssessment.courseTitle}
              </span>
              <h3 className="text-xl font-black text-slate-900 mt-0.5">
                {activeAssessment.title}
              </h3>
            </div>

            <div className="flex items-center space-x-3 text-xs">
              <span className="bg-slate-100 px-3 py-1.5 rounded-xl font-mono text-slate-700 font-bold flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>Question {activeQuestionIndex + 1} of {activeAssessment.questions.length}</span>
              </span>
              <span className="bg-amber-100 text-amber-900 px-3 py-1.5 rounded-xl font-bold">
                Pass Mark: {activeAssessment.passingScorePct}%
              </span>
            </div>
          </div>

          {/* Current Question */}
          {(() => {
            const currentQ: AssessmentQuestion = activeAssessment.questions[activeQuestionIndex];
            if (!currentQ) return null;

            return (
              <div className="space-y-6">
                <div className="space-y-2">
                  <span className="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2.5 py-0.5 rounded-md uppercase">
                    {currentQ.category}
                  </span>
                  <h4 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                    {activeQuestionIndex + 1}. {currentQ.questionText}
                  </h4>
                </div>

                {/* Options */}
                <div className="space-y-3">
                  {currentQ.options.map((opt, optIdx) => {
                    const isSelected = selectedAnswers[currentQ.id] === optIdx;

                    return (
                      <div
                        key={optIdx}
                        onClick={() => handleSelectOption(currentQ.id, optIdx)}
                        className={`p-4 rounded-2xl border-2 transition flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-50 border-indigo-600 text-indigo-950 shadow-xs'
                            : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs ${
                            isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {String.fromCharCode(65 + optIdx)}
                          </div>
                          <span className="text-xs sm:text-sm font-medium">{opt}</span>
                        </div>

                        {isSelected && (
                          <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Question Navigation footer */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <button
                    onClick={() => setActiveQuestionIndex(prev => Math.max(0, prev - 1))}
                    disabled={activeQuestionIndex === 0}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer"
                  >
                    &larr; Previous Question
                  </button>

                  <div className="flex items-center space-x-2">
                    {activeQuestionIndex < activeAssessment.questions.length - 1 ? (
                      <button
                        onClick={() => setActiveQuestionIndex(prev => prev + 1)}
                        className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition cursor-pointer"
                      >
                        Next Question &rarr;
                      </button>
                    ) : (
                      <button
                        onClick={handleSubmitExam}
                        className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black rounded-xl text-xs transition shadow-lg shadow-emerald-500/20 cursor-pointer"
                      >
                        Submit & Calculate Grade
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      ) : displayedSubmission ? (
        /* Results & Certificate Presentation */
        <div className="space-y-6">
          {/* Result Summary Card */}
          <div className={`rounded-3xl p-6 sm:p-8 border shadow-lg ${
            displayedSubmission.passed 
              ? 'bg-gradient-to-br from-emerald-950 to-slate-950 text-white border-emerald-800/40' 
              : 'bg-rose-950 text-white border-rose-800/40'
          }`}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  {displayedSubmission.passed ? (
                    <span className="bg-emerald-400 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      PASSED • CERTIFIED
                    </span>
                  ) : (
                    <span className="bg-rose-400 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      RETAKE REQUIRED
                    </span>
                  )}
                  <span className="text-xs text-slate-400">
                    Submitted on {new Date(displayedSubmission.submittedAt).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="text-2xl font-black text-white">
                  Exam Score: {displayedSubmission.scorePct}%
                </h3>
                <p className="text-xs text-slate-300">
                  Answered {displayedSubmission.correctAnswersCount} of {displayedSubmission.totalQuestions} questions correctly (Required: {activeAssessment.passingScorePct}%).
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={handleStartExam}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retake Assessment</span>
                </button>
              </div>
            </div>
          </div>

          {/* OFFICIAL NCCT DIGITAL CERTIFICATE (Only when passed) */}
          {displayedSubmission.passed && (
            <div className="bg-white border-4 border-double border-indigo-900 rounded-3xl p-8 sm:p-12 shadow-2xl space-y-6 text-slate-900 relative overflow-hidden">
              {/* Watermark seal */}
              <div className="absolute right-4 bottom-4 opacity-5 pointer-events-none">
                <Building2 className="w-96 h-96 text-indigo-950" />
              </div>

              {/* Certificate Header */}
              <div className="text-center space-y-2 border-b-2 border-indigo-950 pb-6">
                <div className="flex items-center justify-center space-x-2 text-indigo-900 font-extrabold text-sm tracking-widest uppercase">
                  <Building2 className="w-6 h-6 text-indigo-700" />
                  <span>National Council for Cooperative Training (NCCT)</span>
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  Ministry of Cooperation, Government of India • New Delhi
                </p>
                <div className="pt-2">
                  <span className="text-xs font-mono font-bold uppercase tracking-widest text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                    Certificate of Vocational Competence
                  </span>
                </div>
              </div>

              {/* Certificate Body */}
              <div className="text-center space-y-4 py-4 max-w-2xl mx-auto">
                <p className="text-xs text-slate-500 italic">This is to certify that</p>
                <h2 className="text-2xl sm:text-3xl font-serif font-black text-indigo-950 tracking-tight">
                  {currentUser?.fullName || displayedSubmission.traineeName}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  has successfully undergone curriculum study, completed mandatory in-platform video modules, and passed the statutory evaluation for
                </p>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 bg-indigo-50/80 py-2 px-4 rounded-xl border border-indigo-100 inline-block">
                  {displayedSubmission.courseTitle}
                </h3>
                <p className="text-xs text-slate-600">
                  with an exemplary competency rating of <strong>{displayedSubmission.scorePct}%</strong>.
                </p>
              </div>

              {/* Certificate Footer with QR Code and Trainer Verification */}
              <div className="border-t-2 border-indigo-950 pt-6 flex flex-col sm:flex-row items-center justify-between gap-6">
                {/* QR Code */}
                <div className="flex items-center space-x-4">
                  <div className="bg-white p-2 rounded-xl border border-slate-300 shadow-xs">
                    <QRCodeSVG
                      value={`https://ncct.gov.in/verify?cert=${displayedSubmission.certificateNumber || 'CERT-NCCT'}`}
                      size={70}
                      level="M"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Certificate ID
                    </span>
                    <span className="text-xs font-mono font-bold text-indigo-900 block">
                      {displayedSubmission.certificateNumber || 'NCCT-CERT-2026-VAL-001'}
                    </span>
                    <span className="text-[10px] text-emerald-700 font-semibold flex items-center space-x-1 mt-0.5">
                      <ShieldCheck className="w-3 h-3" />
                      <span>Tamper-Proof Verification</span>
                    </span>
                  </div>
                </div>

                {/* Signatures */}
                <div className="flex items-center space-x-8 text-center text-xs">
                  <div>
                    <div className="w-32 border-b border-slate-400 pb-1 mb-1 font-serif italic text-slate-700">
                      Dr. R. C. Joshi
                    </div>
                    <span className="text-[10px] text-slate-500 font-semibold block">Director of Training</span>
                    <span className="text-[9px] text-slate-400 block">NCCT / VAMNICOM</span>
                  </div>

                  <div>
                    <div className="w-32 border-b border-slate-400 pb-1 mb-1 font-serif italic text-slate-700">
                      K. N. Rao
                    </div>
                    <span className="text-[10px] text-slate-500 font-semibold block">Registrar & Controller</span>
                    <span className="text-[9px] text-slate-400 block">Ministry of Cooperation</span>
                  </div>
                </div>
              </div>

              {/* Print CTA */}
              <div className="text-center pt-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl transition flex items-center space-x-1.5 mx-auto cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Official Certificate</span>
                </button>
              </div>
            </div>
          )}

          {/* Question-by-Question Review with Explanations */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3">
              Assessment Performance Review & Explanations
            </h4>

            <div className="space-y-4">
              {activeAssessment.questions.map((q, qIdx) => {
                const selectedIdx = displayedSubmission.answers ? displayedSubmission.answers[q.id] : undefined;
                const isCorrect = selectedIdx === q.correctOptionIndex;

                return (
                  <div key={q.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-bold text-slate-800">
                        {qIdx + 1}. {q.questionText}
                      </span>
                      {isCorrect ? (
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-0.5 shrink-0">
                          <Check className="w-3 h-3" />
                          <span>Correct</span>
                        </span>
                      ) : (
                        <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-0.5 shrink-0">
                          <X className="w-3 h-3" />
                          <span>Incorrect</span>
                        </span>
                      )}
                    </div>

                    <div className="text-slate-600 pl-2">
                      <div>Your Answer: <strong className={isCorrect ? 'text-emerald-700' : 'text-rose-700'}>
                        {selectedIdx !== undefined ? q.options[selectedIdx] : 'Not answered'}
                      </strong></div>
                      {!isCorrect && (
                        <div>Correct Answer: <strong className="text-emerald-700">{q.options[q.correctOptionIndex]}</strong></div>
                      )}
                    </div>

                    <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-[11px] text-slate-500">
                      <strong className="text-slate-700">Official Rationale: </strong>
                      {q.explanation}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* Assessment Overview & Start Gate */
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider block">
                {activeAssessment.courseTitle}
              </span>
              <h3 className="text-xl font-black text-slate-900 mt-0.5">
                {activeAssessment.title}
              </h3>
            </div>

            <div className="flex items-center space-x-2 text-xs">
              <span className="bg-slate-100 px-3 py-1.5 rounded-xl font-mono text-slate-700 font-bold">
                {activeAssessment.questions.length} Questions
              </span>
              <span className="bg-amber-100 text-amber-900 px-3 py-1.5 rounded-xl font-bold">
                Pass: {activeAssessment.passingScorePct}%
              </span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {activeAssessment.description}
          </p>

          <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-4 space-y-2 text-xs text-indigo-950">
            <span className="font-bold block uppercase tracking-wider text-[11px]">Exam Guidelines:</span>
            <ul className="space-y-1 pl-2">
              <li>• Once started, complete all {activeAssessment.questions.length} multiple choice questions.</li>
              <li>• Minimum score required to issue NCCT certificate is {activeAssessment.passingScorePct}%.</li>
              <li>• Immediate feedback with statutory explanations will be rendered upon submission.</li>
            </ul>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={handleStartExam}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl text-xs sm:text-sm transition flex items-center space-x-2 shadow-lg shadow-indigo-600/20 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Begin Assessment Test</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
