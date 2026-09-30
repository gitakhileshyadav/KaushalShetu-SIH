import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AssessmentSubmission } from '../../types';
import { 
  Briefcase, 
  Award, 
  CheckCircle2, 
  ShieldCheck, 
  Search, 
  Mail, 
  Phone, 
  Building2, 
  Send, 
  Filter, 
  UserCheck, 
  Sparkles,
  Check
} from 'lucide-react';

export const EmployerAssessments: React.FC = () => {
  const { 
    submissions, 
    courses, 
    currentUser,
    allUsers 
  } = useApp();

  const [courseFilter, setCourseFilter] = useState<string>('all');
  const [minScoreFilter, setMinScoreFilter] = useState<number>(70);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState<AssessmentSubmission | null>(null);
  const [interviewNote, setInterviewNote] = useState('');
  const [invitedCandidateIds, setInvitedCandidateIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'talent_roster' | 'pre_employment_screen'>('talent_roster');

  const passedSubmissions = submissions.filter(s => s.passed && s.scorePct >= minScoreFilter);

  const filteredCandidates = passedSubmissions.filter(sub => {
    if (courseFilter !== 'all' && sub.courseId !== courseFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return sub.traineeName.toLowerCase().includes(q) || sub.courseTitle.toLowerCase().includes(q) || sub.institute.toLowerCase().includes(q);
    }
    return true;
  });

  const handleSendInterviewInvite = (sub: AssessmentSubmission) => {
    setInvitedCandidateIds(prev => [...prev, sub.id]);
    alert(`Interview invitation dispatched to ${sub.traineeName} for candidate role in ${currentUser?.institute || 'Cooperative Enterprise'}!`);
    setSelectedCandidate(null);
    setInterviewNote('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-indigo-900/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="bg-emerald-400 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Employer / Recruiter Assessment Desk
            </span>
            <span className="text-xs text-indigo-200">{currentUser?.institute || 'Cooperative Enterprise'}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            Verified Talent Roster & Candidate Skills Assessment
          </h2>
          <p className="text-xs sm:text-sm text-indigo-200 max-w-xl leading-relaxed">
            Screen and recruit certified trainees from National Council for Cooperative Training institutes. Review verified assessment scores, in-platform video curriculum completion, and official certificates.
          </p>
        </div>

        {/* Talent summary pill */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-center w-full sm:w-auto shrink-0">
          <div className="text-2xl font-black text-emerald-400">
            {passedSubmissions.length}
          </div>
          <div className="text-[11px] text-indigo-200 font-semibold uppercase tracking-wider mt-0.5">
            Certified Candidates Available
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 space-x-2">
        <button
          onClick={() => setActiveTab('talent_roster')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'talent_roster'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          Verified Candidate Pool ({filteredCandidates.length})
        </button>
        <button
          onClick={() => setActiveTab('pre_employment_screen')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'pre_employment_screen'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          Pre-Employment Practical Screening Criteria
        </button>
      </div>

      {/* VIEW 1: TALENT ROSTER */}
      {activeTab === 'talent_roster' && (
        <div className="space-y-4">
          {/* Filter Toolbar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search candidate name, institute..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:border-indigo-500 w-48 sm:w-64"
                />
              </div>

              <div className="flex items-center space-x-1.5">
                <span className="text-slate-500 font-semibold">Specialization:</span>
                <select
                  value={courseFilter}
                  onChange={(e) => setCourseFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 cursor-pointer"
                >
                  <option value="all">All Vocational Trades</option>
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-1.5">
                <span className="text-slate-500 font-semibold">Min Exam Score:</span>
                <select
                  value={minScoreFilter}
                  onChange={(e) => setMinScoreFilter(Number(e.target.value))}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 cursor-pointer"
                >
                  <option value={70}>70%+ (Passing Standard)</option>
                  <option value={80}>80%+ (Distinction)</option>
                  <option value={90}>90%+ (Gold Standard)</option>
                </select>
              </div>
            </div>

            <span className="text-slate-400 font-mono text-[11px]">
              Showing {filteredCandidates.length} Certified Candidates
            </span>
          </div>

          {/* Candidates Cards Grid */}
          {filteredCandidates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredCandidates.map(cand => {
                const isInvited = invitedCandidateIds.includes(cand.id);
                const userObj = allUsers.find(u => u.id === cand.traineeId);

                return (
                  <div
                    key={cand.id}
                    className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4 hover:border-indigo-300 transition"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start space-x-3 truncate">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-base shrink-0">
                          {cand.traineeName.charAt(0)}
                        </div>
                        <div className="truncate">
                          <h4 className="font-bold text-slate-900 text-sm truncate">
                            {cand.traineeName}
                          </h4>
                          <p className="text-xs text-indigo-600 font-medium truncate">
                            {cand.institute}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {userObj?.email || `${cand.traineeId}@coop-candidate.in`}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-base font-black text-emerald-600 block">
                          {cand.scorePct}%
                        </span>
                        <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200 block">
                          Certified
                        </span>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-xs space-y-1">
                      <div className="text-slate-500 text-[11px]">Trade Certification:</div>
                      <div className="font-bold text-slate-800">{cand.courseTitle}</div>
                      {cand.certificateNumber && (
                        <div className="font-mono text-[10px] text-indigo-700 font-semibold">
                          ID: {cand.certificateNumber}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                      <span className="text-slate-400 text-[11px]">
                        Exam: {cand.correctAnswersCount}/{cand.totalQuestions} correct
                      </span>

                      {isInvited ? (
                        <span className="bg-emerald-100 text-emerald-800 font-bold px-3 py-1.5 rounded-xl flex items-center space-x-1">
                          <Check className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Interview Invite Sent</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => setSelectedCandidate(cand)}
                          className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition flex items-center space-x-1.5 cursor-pointer shadow-xs"
                        >
                          <Send className="w-3.5 h-3.5 text-amber-300" />
                          <span>Invite to Interview</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center text-slate-400 border border-slate-200">
              <UserCheck className="w-12 h-12 mx-auto mb-2 text-slate-300" />
              <p className="text-sm font-bold text-slate-700">No Candidates Match Filter</p>
              <p className="text-xs text-slate-500 mt-1">
                Lower your minimum score filter or choose another trade to view candidates.
              </p>
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: PRE-EMPLOYMENT PRACTICAL SCREENING STANDARDS */}
      {activeTab === 'pre_employment_screen' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Poultry Farm Screening Protocol */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block">Trade Standard 1</span>
                <h3 className="text-base font-black text-slate-900">Cooperative Poultry Unit Manager Screening</h3>
              </div>
              <span className="bg-amber-100 text-amber-900 text-xs font-bold px-2.5 py-1 rounded-xl">Level 4 NSQF</span>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <p className="text-slate-500 leading-relaxed">
                Cooperative poultry federations (broiler producer societies) test candidates on 4 core practical competencies:
              </p>
              <div className="p-3 bg-slate-50 rounded-2xl space-y-2 border border-slate-100">
                <div className="font-bold text-indigo-900">1. Brooding Temperature Calibration</div>
                <p className="text-slate-600">Candidate must demonstrate week-1 hover temperature maintenance at 95°F and explain chick crowding behavior under thermal stress.</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl space-y-2 border border-slate-100">
                <div className="font-bold text-indigo-900">2. Feed Conversion Ratio (FCR) Audit</div>
                <p className="text-slate-600">Mathematical calculation of batch FCR and margin sensitivity per 0.05 index improvement.</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl space-y-2 border border-slate-100">
                <div className="font-bold text-indigo-900">3. Cold-Chain Vaccine Handling</div>
                <p className="text-slate-600">Proper reconstitution of Lasota eye drops and oral IBD with skim milk powder stabilization.</p>
              </div>
            </div>
          </div>

          {/* Rural Electrician Screening Protocol */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">Trade Standard 2</span>
                <h3 className="text-base font-black text-slate-900">Rural Electrician & Substation Technician Screening</h3>
              </div>
              <span className="bg-indigo-100 text-indigo-900 text-xs font-bold px-2.5 py-1 rounded-xl">CEA Standards</span>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <p className="text-slate-500 leading-relaxed">
                Rural electrification societies and PACS test candidates on statutory safety and motor starter wiring:
              </p>
              <div className="p-3 bg-slate-50 rounded-2xl space-y-2 border border-slate-100">
                <div className="font-bold text-indigo-900">1. Earth Loop Resistance Measurement</div>
                <p className="text-slate-600">Verification of pipe earthing electrode resistance below 5.0 Ohms using 4-pin Earth Megger.</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl space-y-2 border border-slate-100">
                <div className="font-bold text-indigo-900">2. 30mA RCCB Shock Protection Verification</div>
                <p className="text-slate-600">Wiring single-phase consumer distribution boards with mandatory human shock protection.</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl space-y-2 border border-slate-100">
                <div className="font-bold text-indigo-900">3. Direct-On-Line (DOL) Starter Troubleshooting</div>
                <p className="text-slate-600">Tracing Contactor coil, thermal overload relay, and single-phasing prevention in agricultural tubewell pumps.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Interview Invitation Modal */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900">Dispatch Interview Call</h3>
                <p className="text-xs text-indigo-600 font-semibold">{selectedCandidate.traineeName}</p>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                Score: {selectedCandidate.scorePct}%
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-600">
                You are inviting this certified candidate for employment in <strong>{selectedCandidate.courseTitle}</strong> at <strong>{currentUser?.institute || 'Cooperative Enterprise'}</strong>.
              </p>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Interview Details & Venue Notes</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Please attend practical trade test at Anand Chilling Center / Substation on Monday at 10:00 AM..."
                  value={interviewNote}
                  onChange={(e) => setInterviewNote(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end space-x-2">
              <button
                onClick={() => setSelectedCandidate(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSendInterviewInvite(selectedCandidate)}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs flex items-center space-x-1.5 shadow-md cursor-pointer"
              >
                <Send className="w-3.5 h-3.5 text-amber-300" />
                <span>Confirm & Send Invitation</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
