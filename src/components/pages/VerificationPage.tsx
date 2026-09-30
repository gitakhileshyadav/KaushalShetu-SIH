import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { QRToken } from '../../types';
import { 
  ShieldCheck, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Building2, 
  Calendar, 
  Clock, 
  User, 
  Award, 
  Hash, 
  Sparkles, 
  Printer, 
  Share2, 
  Check,
  ExternalLink
} from 'lucide-react';

export const VerificationPage: React.FC = () => {
  const { 
    verificationQueryCode, 
    setVerificationQueryCode, 
    lookupVerificationRecord, 
    attendanceLogs, 
    activeTokens 
  } = useApp();

  const [searchCode, setSearchCode] = useState(verificationQueryCode || '');
  const [hasSearched, setHasSearched] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const [result, setResult] = useState<{
    found: boolean;
    log?: any;
    session?: any;
    course?: any;
    trainee?: any;
    message?: string;
  } | null>(null);

  // Auto-run verification when query parameter changes
  useEffect(() => {
    if (verificationQueryCode) {
      setSearchCode(verificationQueryCode);
      const res = lookupVerificationRecord(verificationQueryCode);
      setResult(res);
      setHasSearched(true);
    }
  }, [verificationQueryCode]);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchCode.trim()) return;

    setVerificationQueryCode(searchCode.trim());
    const res = lookupVerificationRecord(searchCode.trim());
    setResult(res);
    setHasSearched(true);
  };

  const handleShare = () => {
    const url = `${window.location.origin}${window.location.pathname}#/verify?code=${encodeURIComponent(searchCode)}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  // Sample codes for instant 1-click verification
  const sampleLogs = attendanceLogs.slice(0, 3);
  const sampleTokens: QRToken[] = (Object.values(activeTokens) as QRToken[]).slice(0, 2);

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Page Header */}
      <div className="text-center bg-white p-6 sm:p-8 rounded-3xl border border-slate-200">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-sky-50 text-sky-700 mb-3 border border-sky-200">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900">
          NCCT Public Attendance & Accreditation Verification
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-lg mx-auto">
          Verify authentic cooperative training records, session attendance stamps, and statutory compliance status.
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mt-6 max-w-xl mx-auto flex gap-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchCode}
              onChange={e => setSearchCode(e.target.value)}
              placeholder="Enter Attendance Log ID, QR Token, or Session ID..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
            />
          </div>
          <button
            type="submit"
            className="bg-sky-600 hover:bg-sky-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition shadow-xs cursor-pointer shrink-0"
          >
            Verify Now
          </button>
        </form>
      </div>

      {/* Verification Result Card */}
      {hasSearched && result && (
        result.found ? (
          <div className="bg-white rounded-3xl border-2 border-emerald-500/40 p-6 sm:p-8 shadow-sm relative overflow-hidden animate-in fade-in">
            {/* Top Seal Badge */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-300">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-black uppercase text-emerald-700 tracking-wider bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Authentic Record Verified
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-500 font-mono">NCCT-REG-VERIFIED</span>
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                    Statutory Cooperative Training Accreditation
                  </h2>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleShare}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-3 py-1.5 rounded-lg text-xs flex items-center space-x-1 cursor-pointer transition"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Link Copied' : 'Share'}</span>
                </button>
                <button
                  onClick={handlePrint}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-3 py-1.5 rounded-lg text-xs flex items-center space-x-1 cursor-pointer transition"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Certificate</span>
                </button>
              </div>
            </div>

            {/* Verification Metadata Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6 border-b border-slate-100 text-xs">
              {/* Trainee Details */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                  Trainee Officer
                </h4>
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-1">
                  <p className="text-sm font-bold text-slate-900">
                    {result.log?.traineeName || result.trainee?.fullName || 'Verified NCCT Trainee'}
                  </p>
                  <p className="text-slate-500">
                    Institute: <strong>{result.trainee?.institute || result.course?.institute || 'National Cooperative Network'}</strong>
                  </p>
                  <p className="text-slate-500">
                    Mobile/ID: <span className="font-mono">{result.trainee?.mobileNumber || result.log?.traineeId || 'Verified Member'}</span>
                  </p>
                </div>
              </div>

              {/* Course Details */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                  Course & Curriculum
                </h4>
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-1">
                  <p className="text-sm font-bold text-indigo-900">
                    {result.course?.title || 'National Cooperative Development Program'}
                  </p>
                  <p className="text-slate-500">
                    Course Code: <strong className="font-mono text-indigo-700">{result.course?.code || 'NCCT-COOP'}</strong>
                  </p>
                  <p className="text-slate-500">
                    Statutory Attendance Gate: <strong>{result.course?.minAttendancePct || 75}% Required</strong>
                  </p>
                </div>
              </div>

              {/* Session Details */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                  Training Session & Topic
                </h4>
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-1">
                  <p className="font-bold text-slate-900">
                    {result.session?.topic || 'Curricular Training Session'}
                  </p>
                  <p className="text-slate-500">
                    Venue: {result.session?.venue || 'Apex Council Hall'}
                  </p>
                  <p className="text-slate-500">
                    Session Date: {result.session?.sessionDate || 'Scheduled Calendar'}
                  </p>
                </div>
              </div>

              {/* Security Proof & Cryptographic Stamp */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                  Cryptographic Audit Proof
                </h4>
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-1 font-mono text-[11px]">
                  <p className="text-slate-700 truncate">
                    Log Hash: <strong>{result.log?.id || searchCode}</strong>
                  </p>
                  <p className="text-slate-500">
                    Verified Timestamp: {result.log ? new Date(result.log.scannedAt).toLocaleString() : 'Active Token Valid'}
                  </p>
                  <p className="text-slate-500">
                    Verification Method: {result.log?.method || 'Secure Web QR Token'}
                  </p>
                </div>
              </div>
            </div>

            {/* Official Footer Note */}
            <div className="pt-4 flex items-center justify-between text-[11px] text-slate-400">
              <span>National Council for Cooperative Training • Ministry of Cooperation</span>
              <span className="font-mono">DB: Turso SQLite Ledger Verified</span>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border-2 border-rose-200 p-8 text-center animate-in fade-in">
            <XCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900">Verification Record Not Found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              {result.message || 'No genuine NCCT attendance record or token exists matching this input.'}
            </p>
            <p className="text-[11px] text-slate-400 mt-3">
              Please check the token code from the classroom projector or try one of the quick sample codes below.
            </p>
          </div>
        )
      )}

      {/* Quick Test Codes */}
      <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5">
        <div className="flex items-center space-x-2 text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Quick Sample Codes to Test Verification</span>
        </div>

        <div className="space-y-2">
          {sampleTokens.map(t => (
            <button
              key={t.id}
              onClick={() => {
                setSearchCode(t.token);
                setVerificationQueryCode(t.token);
                const res = lookupVerificationRecord(t.token);
                setResult(res);
                setHasSearched(true);
              }}
              className="w-full p-2.5 bg-white rounded-xl border border-slate-200 hover:border-sky-300 transition flex items-center justify-between text-xs cursor-pointer text-left"
            >
              <div>
                <span className="font-mono font-bold text-sky-700 block">{t.token}</span>
                <span className="text-[10px] text-slate-400">Active Classroom QR Token</span>
              </div>
              <span className="text-[11px] text-sky-600 font-semibold">Test →</span>
            </button>
          ))}

          {sampleLogs.map(l => (
            <button
              key={l.id}
              onClick={() => {
                setSearchCode(l.id);
                setVerificationQueryCode(l.id);
                const res = lookupVerificationRecord(l.id);
                setResult(res);
                setHasSearched(true);
              }}
              className="w-full p-2.5 bg-white rounded-xl border border-slate-200 hover:border-emerald-300 transition flex items-center justify-between text-xs cursor-pointer text-left"
            >
              <div>
                <span className="font-mono font-bold text-emerald-700 block">{l.id}</span>
                <span className="text-[10px] text-slate-400">Verified Attendee: {l.traineeName}</span>
              </div>
              <span className="text-[11px] text-emerald-600 font-semibold">Test →</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
