import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { 
  UserPlus, 
  User, 
  Lock, 
  Building2, 
  Phone, 
  Mail, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  GraduationCap,
  ShieldCheck,
  Briefcase,
  FileText,
  Clock,
  Sparkles
} from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { signUp, navigateTo } = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>('trainee');
  const [institute, setInstitute] = useState('RICM Gandhinagar');
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [qualification, setQualification] = useState('Diploma in Electrical / B.Sc Agri');
  const [designation, setDesignation] = useState('');
  const [idProofType, setIdProofType] = useState('Aadhaar Card');
  const [idProofNumber, setIdProofNumber] = useState('');
  const [applicationReason, setApplicationReason] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const institutes = [
    'VAMNICOM, Pune (National Apex)',
    'RICM Gandhinagar',
    'RICM Bengaluru',
    'RICM Chandigarh',
    'RICM Kalyani (Kolkata)',
    'RICM Patna',
    'ICM Dehradun',
    'ICM Bhopal',
    'ICM Hyderabad',
    'ICM Jaipur',
    'ICM Lucknow',
    'ICM Madurai',
    'IFFCO Cooperative Enterprise',
    'KRIBHCO Cooperative Society',
    'AMUL (GCMMF)'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!username.trim()) {
      setErrorMsg('Please choose a valid username.');
      return;
    }

    if (password.length < 4) {
      setErrorMsg('Password must be at least 4 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    if (!fullName.trim()) {
      setErrorMsg('Please provide your legal full name.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const res = signUp({
        username,
        password,
        fullName,
        role,
        institute,
        mobileNumber: mobileNumber || '+91 98765 00000',
        email: email || `${username.trim().toLowerCase()}@ncct.ac.in`,
        qualification,
        designation: designation || (role === 'trainer' ? 'Senior Faculty' : role === 'employer' ? 'HR Recruiter' : 'PACS Trainee Candidate'),
        idProofType,
        idProofNumber: idProofNumber || 'IND-REF-2026-X',
        applicationReason: applicationReason || 'Applying for NCCT affiliated cooperative training and vocational certification.'
      });

      setIsLoading(false);
      if (res.success) {
        setSuccessMsg(res.message);
        setTimeout(() => {
          if (role === 'admin') {
            navigateTo('admin');
          } else {
            // Trainee, Trainer, Employer go to pending or their desk
            navigateTo(role);
          }
        }, 1200);
      } else {
        setErrorMsg(res.message);
      }
    }, 300);
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-700 to-indigo-900 text-white shadow-md shadow-indigo-200 mb-3 border border-indigo-500/30">
          <UserPlus className="w-7 h-7 text-amber-300" />
        </div>
        <h2 className="text-2xl font-black text-slate-900">NCCT Profile Registration</h2>
        <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-lg mx-auto leading-relaxed">
          Create an accredited profile across Trainee, Trainer, or Employer categories with Directorate approval workflow.
        </p>
      </div>

      {/* Admin Review Notice Box */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex items-start space-x-3 text-xs text-amber-900">
        <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block text-amber-950">Directorate Accreditation Governance Protocol</span>
          <p className="text-amber-800 mt-0.5 leading-relaxed">
            Non-admin accounts undergo identity and jurisdiction verification by the NCCT Apex Administration before portal access is activated.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-8">
        {errorMsg && (
          <div className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start space-x-2.5 text-xs text-rose-700">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start space-x-2.5 text-xs text-emerald-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Select Your Category / Portal Role *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { r: 'trainee' as UserRole, label: 'Trainee', desc: 'Students & PACS Staff', icon: <User className="w-4 h-4" /> },
                { r: 'trainer' as UserRole, label: 'Trainer', desc: 'RICM Faculty & Experts', icon: <GraduationCap className="w-4 h-4" /> },
                { r: 'employer' as UserRole, label: 'Employer', desc: 'Coops & Hiring Units', icon: <Briefcase className="w-4 h-4" /> },
                { r: 'admin' as UserRole, label: 'Admin', desc: 'NCCT Directorate', icon: <ShieldCheck className="w-4 h-4" /> }
              ].map(item => (
                <button
                  key={item.r}
                  type="button"
                  onClick={() => setRole(item.r)}
                  className={`p-3 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                    role === item.r 
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-xs ring-1 ring-indigo-500' 
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center space-x-1.5 font-bold text-xs">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block leading-tight">{item.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Account credentials */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Username *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="e.g. rahul_pacs"
                  className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Legal Full Name *
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="e.g. Rahul Patil"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Password *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Create password"
                  className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Confirm Password *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Repeat password"
                  className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Affiliated Institute */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Affiliated Cooperative Institute / Jurisdiction *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Building2 className="w-4 h-4" />
              </div>
              <select
                value={institute}
                onChange={e => setInstitute(e.target.value)}
                className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              >
                {institutes.map(inst => (
                  <option key={inst} value={inst}>{inst}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Contact Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Mobile Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  value={mobileNumber}
                  onChange={e => setMobileNumber(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="rahul@example.com"
                  className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Professional Credentials for Admin Vetting */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Educational Qualification *
              </label>
              <input
                type="text"
                value={qualification}
                onChange={e => setQualification(e.target.value)}
                placeholder="e.g. B.Sc Agriculture / ITI Electrician"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Current Role / Designation
              </label>
              <input
                type="text"
                value={designation}
                onChange={e => setDesignation(e.target.value)}
                placeholder="e.g. PACS Secretary / Assistant Trainer"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
            </div>
          </div>

          {/* Identity proof & reason */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Identification Proof Type
              </label>
              <select
                value={idProofType}
                onChange={e => setIdProofType(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Aadhaar Card">Aadhaar Card</option>
                <option value="Institute Student ID">Institute Student ID</option>
                <option value="PACS Employee Badge">PACS Employee Badge</option>
                <option value="Voter ID">Voter ID</option>
                <option value="PAN Card">PAN Card</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                ID Reference Number
              </label>
              <input
                type="text"
                value={idProofNumber}
                onChange={e => setIdProofNumber(e.target.value)}
                placeholder="e.g. XXXX-XXXX-4592"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Statement of Purpose / Justification for Empanelment
            </label>
            <textarea
              rows={2}
              value={applicationReason}
              onChange={e => setApplicationReason(e.target.value)}
              placeholder="Briefly state your training objective, cooperative society affiliation, or teaching experience..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            />
          </div>

          <div className="pt-3">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl text-xs sm:text-sm transition shadow-md shadow-indigo-200 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              <span>{isLoading ? 'Submitting Application...' : 'Submit Registration for Admin Approval'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-600">
            Already have an approved account?{' '}
            <button
              onClick={() => navigateTo('login')}
              className="text-indigo-600 font-bold hover:underline cursor-pointer"
            >
              Sign In with Credentials
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
