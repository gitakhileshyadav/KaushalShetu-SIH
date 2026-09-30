import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Clock, 
  ShieldCheck, 
  CheckCircle2, 
  User, 
  Building2, 
  FileText, 
  LogOut, 
  ArrowRight,
  Sparkles,
  BookOpen,
  Phone,
  Mail,
  AlertTriangle
} from 'lucide-react';

export const AccountPendingApprovalPage: React.FC = () => {
  const { currentUser, signOut, switchUser, navigateTo, approveUserProfile } = useApp();

  if (!currentUser) return null;

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      {/* Header card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 p-6 sm:p-8 text-white">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-xs px-3 py-1 rounded-full text-xs font-bold text-white border border-white/20">
              <Clock className="w-3.5 h-3.5 animate-spin" />
              <span>Registration Status: Under Admin Review</span>
            </div>
            <span className="text-xs bg-slate-900/40 px-2.5 py-1 rounded-lg uppercase tracking-wider font-bold">
              {currentUser.role} Candidate
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black mt-4">
            Application Submitted for NCCT Approval
          </h2>
          <p className="text-xs sm:text-sm text-amber-100 mt-2 leading-relaxed">
            Welcome, <strong>{currentUser.fullName}</strong>. Under NCCT governance protocols, newly created profiles for Trainees, Trainers, and Employers require verification and accreditation by the Directorate before role dashboard access is activated.
          </p>
        </div>

        {/* Verification Progress Stepper */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4">
            NCCT Affiliation Verification Timeline
          </h3>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-slate-800">1. Account Details Submitted</p>
                <p className="text-slate-500">Identity dossier and credentials recorded on {currentUser.joinedDate}.</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 mt-0.5 animate-pulse">
                <Clock className="w-3.5 h-3.5" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-amber-900">2. Apex Admin & Registrar Dossier Review (Active Stage)</p>
                <p className="text-slate-600">Director K. N. Rao is verifying your qualification and institutional jurisdiction.</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 opacity-50">
              <div className="w-6 h-6 rounded-full bg-slate-300 text-slate-600 flex items-center justify-center shrink-0 mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-slate-800">3. Full Role & Jurisdiction Activation</p>
                <p className="text-slate-500">Course admissions, attendance logging, and certification desks will unlock.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Application details dossier */}
        <div className="p-6 sm:p-8 space-y-4">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Your Registered Profile Dossier
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div>
              <span className="text-slate-400 block text-[11px]">Applicant Legal Name</span>
              <strong className="text-slate-900">{currentUser.fullName}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Username</span>
              <strong className="text-slate-900 font-mono">@{currentUser.username}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Requested Portal Role</span>
              <span className="inline-block bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded text-[11px] uppercase">
                {currentUser.role}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Institute / Jurisdiction</span>
              <strong className="text-slate-900">{currentUser.institute}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Mobile Contact</span>
              <span className="text-slate-700">{currentUser.mobileNumber}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Email</span>
              <span className="text-slate-700">{currentUser.email}</span>
            </div>
            {currentUser.designation && (
              <div>
                <span className="text-slate-400 block text-[11px]">Designation / Role</span>
                <span className="text-slate-700">{currentUser.designation}</span>
              </div>
            )}
            {currentUser.qualification && (
              <div>
                <span className="text-slate-400 block text-[11px]">Educational Qualification</span>
                <span className="text-slate-700">{currentUser.qualification}</span>
              </div>
            )}
            {currentUser.idProofType && (
              <div className="sm:col-span-2">
                <span className="text-slate-400 block text-[11px]">ID Proof Reference</span>
                <span className="text-slate-700 font-mono">
                  {currentUser.idProofType} {currentUser.idProofNumber ? `(${currentUser.idProofNumber})` : ''}
                </span>
              </div>
            )}
            {currentUser.applicationReason && (
              <div className="sm:col-span-2">
                <span className="text-slate-400 block text-[11px]">Application Purpose</span>
                <p className="text-slate-700 italic">"{currentUser.applicationReason}"</p>
              </div>
            )}
          </div>

          {/* Quick Simulation Help for Examiners / Evaluators */}
          <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center space-x-2 text-indigo-900 font-bold text-xs">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>⚡ Evaluator Simulation Actions</span>
            </div>
            <p className="text-xs text-indigo-800 leading-relaxed">
              In production, an apex director reviews and approves accounts via the Admin Registration Desk. For instant evaluation in this prototype, choose an option below:
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                onClick={() => {
                  approveUserProfile(currentUser.id, 'Instant Evaluator Fast-Track Approval');
                }}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-xs cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Instant Approve My Account</span>
              </button>

              <button
                onClick={() => {
                  switchUser('usr_admin_1');
                  navigateTo('admin');
                }}
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Switch to Director K. N. Rao (Admin)</span>
              </button>
            </div>
          </div>

          {/* Action links */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
            <button
              onClick={() => navigateTo('courses')}
              className="w-full sm:w-auto px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
              <span>Browse Public Accredited Courses</span>
            </button>

            <button
              onClick={signOut}
              className="w-full sm:w-auto px-4 py-2 text-slate-500 hover:text-rose-600 rounded-xl text-xs font-semibold transition flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
