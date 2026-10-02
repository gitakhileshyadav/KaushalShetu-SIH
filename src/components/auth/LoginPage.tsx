import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Lock, 
  User, 
  ArrowRight, 
  KeyRound, 
  ShieldCheck, 
  Sparkles, 
  GraduationCap, 
  Briefcase, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle,
  Database
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { signIn, navigateTo, tursoConfig } = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigateAfterAuth = (role?: string) => {
    if (role === 'trainer') navigateTo('trainer');
    else if (role === 'trainee') navigateTo('trainee');
    else if (role === 'admin') navigateTo('admin');
    else if (role === 'employer') navigateTo('employer');
    else navigateTo('home');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!username.trim() || !password) {
      setErrorMsg('Please enter both your username and password.');
      return;
    }

    setIsLoading(true);
    const res = await signIn(username, password);
    setIsLoading(false);
    if (res.success) {
      setSuccessMsg(res.message);
      setTimeout(() => navigateAfterAuth(res.user?.role), 600);
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleQuickLogin = async (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setErrorMsg('');
    setIsLoading(true);
    const res = await signIn(u, p);
    setIsLoading(false);
    if (res.success) {
      setSuccessMsg(res.message);
      setTimeout(() => navigateAfterAuth(res.user?.role), 500);
    } else {
      setErrorMsg(res.message);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-8 px-4">
      {/* Brand Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-700 to-indigo-900 text-white shadow-md shadow-indigo-200 mb-3 border border-indigo-500/30">
          <KeyRound className="w-7 h-7 text-amber-300" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Sign In to NCCT Ecosystem</h2>
        <p className="text-sm text-slate-600 mt-1">
          Cooperative Training & Attendance Verification Portal
        </p>
        <div className="inline-flex items-center space-x-1.5 mt-2 bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-medium border border-slate-200">
          <Database className="w-3.5 h-3.5 text-indigo-600" />
          <span>Storage: {tursoConfig.status === 'connected' ? 'Turso Cloud SQLite' : 'Local SQLite DB'}</span>
        </div>
      </div>

      {/* Main Login Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
        {errorMsg && (
          <div className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start space-x-2.5 text-xs text-rose-700 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start space-x-2.5 text-xs text-emerald-700 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                id="login-username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="e.g. trainer1 or trainee1"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              id="login-submit-btn"
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-4 rounded-xl text-sm transition shadow-sm shadow-indigo-200 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              <span>{isLoading ? 'Verifying...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-600">
            Don't have an account?{' '}
            <button
              onClick={() => navigateTo('register')}
              className="text-indigo-600 font-semibold hover:underline cursor-pointer"
            >
              Create Account
            </button>
          </p>
        </div>
      </div>

      {/* Quick Test Accounts Card */}
      <div className="mt-6 bg-slate-50/80 rounded-2xl border border-slate-200 p-5">
        <div className="flex items-center space-x-2 text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Quick 1-Click Demo Accounts (Password: password123)</span>
        </div>

        <div className="grid grid-cols-2 gap-2.5 text-left">
          <button
            type="button"
            onClick={() => handleQuickLogin('trainer1', 'password123')}
            className="p-3 bg-white rounded-xl border border-slate-200 hover:border-indigo-400 hover:shadow-xs transition cursor-pointer text-left group"
          >
            <div className="flex items-center space-x-2 mb-1">
              <GraduationCap className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-bold text-slate-800 group-hover:text-indigo-600">Trainer</span>
            </div>
            <div className="text-[11px] text-slate-500 font-mono">user: trainer1</div>
            <div className="text-[10px] text-slate-400 truncate">Dr. Ramesh Joshi</div>
          </button>

          <button
            type="button"
            onClick={() => handleQuickLogin('trainee1', 'password123')}
            className="p-3 bg-white rounded-xl border border-slate-200 hover:border-emerald-400 hover:shadow-xs transition cursor-pointer text-left group"
          >
            <div className="flex items-center space-x-2 mb-1">
              <User className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-bold text-slate-800 group-hover:text-emerald-600">Trainee</span>
            </div>
            <div className="text-[11px] text-slate-500 font-mono">user: trainee1</div>
            <div className="text-[10px] text-slate-400 truncate">Aarav Sharma</div>
          </button>

          <button
            type="button"
            onClick={() => handleQuickLogin('admin1', 'password123')}
            className="p-3 bg-white rounded-xl border border-slate-200 hover:border-rose-400 hover:shadow-xs transition cursor-pointer text-left group"
          >
            <div className="flex items-center space-x-2 mb-1">
              <ShieldCheck className="w-4 h-4 text-rose-600" />
              <span className="text-xs font-bold text-slate-800 group-hover:text-rose-600">Admin</span>
            </div>
            <div className="text-[11px] text-slate-500 font-mono">user: admin1</div>
            <div className="text-[10px] text-slate-400 truncate">Director K. N. Rao</div>
          </button>

          <button
            type="button"
            onClick={() => handleQuickLogin('recruiter1', 'password123')}
            className="p-3 bg-white rounded-xl border border-slate-200 hover:border-sky-400 hover:shadow-xs transition cursor-pointer text-left group"
          >
            <div className="flex items-center space-x-2 mb-1">
              <Briefcase className="w-4 h-4 text-sky-600" />
              <span className="text-xs font-bold text-slate-800 group-hover:text-sky-600">Recruiter</span>
            </div>
            <div className="text-[11px] text-slate-500 font-mono">user: recruiter1</div>
            <div className="text-[10px] text-slate-400 truncate">IFFCO Talent Lead</div>
          </button>
        </div>
      </div>
    </div>
  );
};
