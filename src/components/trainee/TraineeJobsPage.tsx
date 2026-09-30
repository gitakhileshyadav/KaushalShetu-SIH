import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { JobPosting } from '../../types';
import { 
  Briefcase, 
  Building2, 
  MapPin, 
  DollarSign, 
  Calendar, 
  CheckCircle2, 
  Send, 
  AlertCircle, 
  Check,
  Search
} from 'lucide-react';

export const TraineeJobsPage: React.FC = () => {
  const { currentUser, jobPostings, jobApplications, applyForJob, submissions, courses } = useApp();
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);
  const [coverNote, setCoverNote] = useState('');
  const [applyMsg, setApplyMsg] = useState<{ success: boolean; text: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const myApplications = jobApplications.filter(a => a.traineeId === currentUser?.id);
  const appliedJobIds = myApplications.map(a => a.jobId);

  const passedSubs = submissions.filter(s => s.traineeId === currentUser?.id && s.passed);
  const passedCourseIds = passedSubs.map(s => s.courseId);
  const passedCategories = courses.filter(c => passedCourseIds.includes(c.id)).map(c => c.category);

  const checkEligibility = (job: JobPosting) => {
    if (!job.requiredCategory || job.requiredCategory === 'All Categories') return { eligible: true, text: 'Open to All Certified Trainees' };
    const matches = passedCategories.some(cat => 
      cat.toLowerCase().includes(job.requiredCategory!.toLowerCase()) || 
      job.requiredCategory!.toLowerCase().includes(cat.toLowerCase())
    );
    return {
      eligible: matches,
      text: matches ? `✓ Certified in ${job.requiredCategory}` : `⚠️ Requires ${job.requiredCategory} Certificate`
    };
  };

  const filteredJobs = jobPostings.filter(job => 
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.employerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;
    const res = applyForJob(selectedJob.id, coverNote);
    setApplyMsg({ success: res.success, text: res.message });
    if (res.success) {
      setTimeout(() => {
        setSelectedJob(null);
        setCoverNote('');
        setApplyMsg(null);
      }, 2500);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-900 rounded-3xl text-white p-6 sm:p-8 shadow-xl border border-indigo-800/40">
        <div className="flex items-center space-x-2">
          <span className="bg-amber-400 text-slate-950 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            Employment Exchange • Cooperative Placement Cell
          </span>
          <span className="text-xs text-indigo-300">IFFCO, AMUL, KRIBHCO, PACS</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black mt-2 text-white">
          Trainee Job Board & Placement Notifications
        </h2>
        <p className="text-xs sm:text-sm text-indigo-200 max-w-2xl mt-1 leading-relaxed">
          Explore employment opportunities across cooperative societies and agricultural marketing federations. Apply directly using your verified NCCT attendance and certification record.
        </p>

        {/* Search */}
        <div className="mt-6 max-w-md relative">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by job title, employer, or location..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-xs text-white placeholder-slate-400 focus:outline-hidden focus:bg-white/20"
          />
        </div>
      </div>

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredJobs.map(job => {
          const hasApplied = appliedJobIds.includes(job.id);
          const myApp = myApplications.find(a => a.jobId === job.id);
          const elig = checkEligibility(job);

          return (
            <div key={job.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4 flex flex-col justify-between hover:border-indigo-300 transition">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
                      {job.employerName}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-2">{job.title}</h3>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200 shrink-0">
                    {job.salary}
                  </span>
                </div>

                <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">
                  {job.description}
                </p>

                <div className="mt-3 space-y-1.5 text-[11px] text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                  <div className="flex items-center space-x-1.5 text-slate-600">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span>Location: <strong>{job.location}</strong></span>
                  </div>
                  <div>
                    <strong>Requirements:</strong> {job.requirements}
                  </div>
                  <div className="pt-1">
                    <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      elig.eligible ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {elig.text}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">Deadline: {job.deadline}</span>
                {hasApplied ? (
                  <span className={`text-xs font-bold px-3 py-1.5 rounded-xl flex items-center space-x-1 ${
                    myApp?.status === 'hired' ? 'bg-emerald-100 text-emerald-800' :
                    myApp?.status === 'shortlisted' ? 'bg-indigo-100 text-indigo-800' :
                    'bg-amber-100 text-amber-800'
                  }`}>
                    <Check className="w-3.5 h-3.5" />
                    <span>Application Status: {myApp?.status.toUpperCase()}</span>
                  </span>
                ) : (
                  <button
                    onClick={() => setSelectedJob(job)}
                    className="px-4 py-1.5 bg-slate-900 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-xs"
                  >
                    Apply Now
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Apply Modal */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold text-indigo-600 uppercase">{selectedJob.employerName}</span>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">Apply for {selectedJob.title}</h3>
              </div>
              <button onClick={() => setSelectedJob(null)} className="text-slate-400 hover:text-slate-600 p-1">
                ✕
              </button>
            </div>

            {applyMsg && (
              <div className={`p-3 rounded-xl text-xs font-semibold flex items-center space-x-2 ${
                applyMsg.success ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}>
                {applyMsg.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
                <span>{applyMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleApplySubmit} className="space-y-4 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-1">
                <p><strong>Applicant:</strong> {currentUser?.fullName}</p>
                <p><strong>Institute:</strong> {currentUser?.institute}</p>
                <p><strong>Contact:</strong> {currentUser?.email} • {currentUser?.mobileNumber}</p>
                <p className="text-emerald-700 font-semibold pt-1">✓ NCCT Verified Attendance & Assessment Records Attached</p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Cover Note / Statement of Interest</label>
                <textarea
                  rows={3}
                  value={coverNote}
                  onChange={(e) => setCoverNote(e.target.value)}
                  placeholder="Summarize your cooperative training experience and readiness..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setSelectedJob(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition shadow-md flex items-center space-x-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Application</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
