import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { JobPosting, JobApplication } from '../../types';
import { 
  Briefcase, 
  Plus, 
  Users, 
  ShieldCheck, 
  CheckCircle2, 
  MapPin, 
  ExternalLink, 
  Calendar, 
  DollarSign, 
  FileText, 
  Award, 
  Search,
  Check,
  X,
  Clock,
  AlertCircle
} from 'lucide-react';

export const EmployerDashboard: React.FC = () => {
  const { 
    currentUser, 
    jobPostings, 
    jobApplications, 
    createJobPosting, 
    updateJobApplicationStatus, 
    verifyCertificate, 
    allUsers, 
    submissions 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'jobs' | 'applications' | 'verify'>('jobs');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New job form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState('');
  const [location, setLocation] = useState('');
  const [salary, setSalary] = useState('');
  const [deadline, setDeadline] = useState('2026-10-30');
  const [requiredCategory, setRequiredCategory] = useState('Cooperative Management');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Certificate verification state
  const [certCodeInput, setCertCodeInput] = useState('');
  const [verificationResult, setVerificationResult] = useState<any | null>(null);

  // Filter jobs posted by this employer (or all if admin)
  const myJobs = jobPostings.filter(j => j.employerId === currentUser?.id || currentUser?.role === 'admin');
  const myJobIds = myJobs.map(j => j.id);
  const myApplications = jobApplications.filter(a => myJobIds.includes(a.jobId));

  const handleCreateJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !location) {
      alert('Please fill in title, description, and location.');
      return;
    }
    createJobPosting({
      title,
      description,
      requirements: requirements || 'NCCT Vocational Certification & Attendance Compliance',
      location,
      salary: salary || 'As per cooperative standards',
      deadline,
      requiredCategory
    });
    setSuccessMsg('Employment notification / Job posting successfully published to NCCT Trainee Portal!');
    setShowCreateModal(false);
    setTitle('');
    setDescription('');
    setRequirements('');
    setLocation('');
    setSalary('');
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const handleVerifyCert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!certCodeInput.trim()) return;
    const res = verifyCertificate(certCodeInput.trim());
    setVerificationResult(res);
  };

  return (
    <div className="space-y-6">
      {/* Employer Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl text-white p-6 sm:p-8 shadow-xl border border-indigo-900/40">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="bg-amber-400 text-slate-950 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Recruiter Portal • Cooperative Employment Exchange
              </span>
              <span className="text-xs text-indigo-200">{currentUser?.fullName}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Recruitment & Candidate Analysis Hub
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Post employment notifications, review applications submitted by certified NCCT trainees, verify attendance records, and authenticate cooperative training certificates.
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-5 py-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold rounded-2xl text-xs sm:text-sm transition flex items-center space-x-2 shadow-lg shadow-amber-400/20 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Post New Job Vacancy</span>
          </button>
        </div>

        {successMsg && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-xs font-semibold flex items-center space-x-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-800 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">Active Job Postings</span>
            <span className="text-xl font-black text-white">{myJobs.length} Positions</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Trainee Applications</span>
            <span className="text-xl font-black text-amber-300">{myApplications.length} Candidates</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Certificate Verification</span>
            <span className="text-emerald-400 font-bold flex items-center space-x-1 mt-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Instant QR / Code Check</span>
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 space-x-4">
        <button
          onClick={() => setActiveTab('jobs')}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 flex items-center space-x-2 transition cursor-pointer ${
            activeTab === 'jobs' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Briefcase className="w-4 h-4 text-indigo-600" />
          <span>My Job Postings ({myJobs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('applications')}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 flex items-center space-x-2 transition cursor-pointer ${
            activeTab === 'applications' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Users className="w-4 h-4 text-amber-600" />
          <span>Candidate Applications ({myApplications.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('verify')}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 flex items-center space-x-2 transition cursor-pointer ${
            activeTab === 'verify' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Verify Certificate</span>
        </button>
      </div>

      {/* Tab 1: Job Postings */}
      {activeTab === 'jobs' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myJobs.map(job => (
              <div key={job.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
                        {job.location}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 mt-2">{job.title}</h3>
                    </div>
                    <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
                      {job.salary}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    {job.description}
                  </p>
                  <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-700">
                    <strong className="text-slate-900 block mb-0.5">Requirements:</strong>
                    {job.requirements}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Deadline: {job.deadline}</span>
                  <button
                    onClick={() => setActiveTab('applications')}
                    className="text-indigo-600 font-bold hover:underline cursor-pointer"
                  >
                    View Applicants ({myApplications.filter(a => a.jobId === job.id).length})
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Candidate Applications & Analysis */}
      {activeTab === 'applications' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Trainee Applications Analysis</h3>
              <p className="text-xs text-slate-500">Review candidate compliance, certificates, and update status</p>
            </div>
            <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
              {myApplications.length} Total Applicants
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {myApplications.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No applications received yet. Trainees will apply when they view your job notifications.
              </div>
            ) : (
              myApplications.map(app => {
                const job = jobPostings.find(j => j.id === app.jobId);
                const traineeUser = allUsers.find(u => u.id === app.traineeId);
                const traineeSub = submissions.find(s => s.traineeId === app.traineeId && s.passed);

                return (
                  <div key={app.id} className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-bold text-slate-900">{app.traineeName}</h4>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          app.status === 'hired' ? 'bg-emerald-100 text-emerald-800' :
                          app.status === 'shortlisted' ? 'bg-indigo-100 text-indigo-800' :
                          app.status === 'rejected' ? 'bg-rose-100 text-rose-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {app.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        Position: <strong className="text-slate-700">{job?.title || 'Job Opening'}</strong> • Institute: {app.institute}
                      </p>
                      <p className="text-xs text-slate-500 font-mono">
                        Contact: {app.traineeEmail} • {app.traineeMobile}
                      </p>
                      {app.coverNote && (
                        <p className="text-xs text-slate-700 bg-slate-100/80 p-2.5 rounded-xl mt-1 italic">
                          "{app.coverNote}"
                        </p>
                      )}
                      <div className="flex items-center space-x-2 pt-1 text-[11px]">
                        <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {traineeSub ? `Certified Score: ${traineeSub.scorePct}%` : 'Assessment In Progress'}
                        </span>
                        <span className="text-indigo-700 font-semibold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                          Attendance Verified (&gt;75%)
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <select
                        value={app.status}
                        onChange={(e) => updateJobApplicationStatus(app.id, e.target.value as any)}
                        className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                      >
                        <option value="pending">Pending Review</option>
                        <option value="shortlisted">Shortlisted</option>
                        <option value="hired">Hired (Offer)</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Verify Certificate */}
      {activeTab === 'verify' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6 max-w-xl mx-auto">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900">NCCT Cooperative Certificate Authentication</h3>
            <p className="text-xs text-slate-500">
              Enter the trainee certificate code or ID to cryptographically verify cooperative vocational qualification.
            </p>
          </div>

          <form onSubmit={handleVerifyCert} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Certificate Code / Trainee Reference</label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={certCodeInput}
                  onChange={(e) => setCertCodeInput(e.target.value)}
                  placeholder="e.g. NCCT-CERT-8819 or Rahul Kumar"
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Verify
                </button>
              </div>
            </div>
          </form>

          {verificationResult && (
            <div className={`p-5 rounded-2xl border ${verificationResult.valid ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'} space-y-2`}>
              <div className="flex items-center space-x-2">
                {verificationResult.valid ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <AlertCircle className="w-5 h-5 text-rose-600" />}
                <span className="font-bold text-sm">{verificationResult.valid ? 'Certificate Authenticated Successfully' : 'Verification Failed'}</span>
              </div>
              <p className="text-xs leading-relaxed">{verificationResult.message}</p>
              {verificationResult.trainee && (
                <div className="mt-3 pt-3 border-t border-emerald-200/60 text-xs space-y-1 bg-white p-3 rounded-xl">
                  <p><strong>Candidate Name:</strong> {verificationResult.trainee.fullName}</p>
                  <p><strong>Institute:</strong> {verificationResult.trainee.institute}</p>
                  <p><strong>Mobile:</strong> {verificationResult.trainee.mobileNumber}</p>
                  {verificationResult.submission && (
                    <p><strong>Score:</strong> {verificationResult.submission.scorePct}% (Passed)</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Create Job Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Post Employment Notification</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateJob} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Job Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Cooperative PACS Manager / Supervisor"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Job Location</label>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Anand, Gujarat / Delhi"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Salary Package</label>
                  <input
                    type="text"
                    value={salary}
                    onChange={(e) => setSalary(e.target.value)}
                    placeholder="e.g. ₹4.5 LPA - ₹6.0 LPA"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Job Description & Responsibilities</label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detail the cooperative vocational role..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Candidate Requirements & Qualifications</label>
                <input
                  type="text"
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  placeholder="e.g. NCCT Diploma with >75% attendance"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Required Certificate / Category Filter</label>
                <select
                  value={requiredCategory}
                  onChange={(e) => setRequiredCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="All Categories">All Certified Trainees (Open)</option>
                  <option value="Cooperative Management">Cooperative Management</option>
                  <option value="Dairy Farming">Dairy Farming & Processing</option>
                  <option value="Microfinance">Cooperative Banking & Microfinance</option>
                  <option value="Poultry & Animal Husbandry">Poultry & Animal Husbandry</option>
                  <option value="Rural Electrification">Rural Electrification & Solar</option>
                </select>
                <p className="text-[10px] text-slate-500 mt-1">Only trainees holding verified certificates in this category can apply.</p>
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition shadow-md"
                >
                  Publish Job Notification
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
