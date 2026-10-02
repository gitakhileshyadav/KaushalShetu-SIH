import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { QRCodeSVG } from 'qrcode.react';
import { 
  QrCode, 
  Clock, 
  RotateCw, 
  Copy, 
  CheckCircle2, 
  Users, 
  Maximize2, 
  Building2, 
  Sparkles,
  ExternalLink,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';

export const QRDisplayPage: React.FC = () => {
  const { 
    sessions, 
    courses, 
    activeTokens, 
    generateQRToken, 
    getSessionAttendees, 
    navigateTo,
    currentUser,
    verifyAndMarkAttendance,
    allUsers
  } = useApp();

  // Active session selection
  const [selectedSessionId, setSelectedSessionId] = useState<string>(() => {
    const active = sessions.find(s => s.status === 'active');
    return active ? active.id : (sessions[0]?.id || '');
  });

  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(1800); // 30 minutes in seconds

  const currentSession = sessions.find(s => s.id === selectedSessionId) || sessions[0];
  const currentCourse = courses.find(c => c.id === currentSession?.courseId);
  const currentToken = currentSession ? activeTokens[currentSession.id] : undefined;

  // Active token timer countdown
  useEffect(() => {
    if (!currentToken) return;
    const calculateTime = () => {
      const now = Date.now();
      const expiry = new Date(currentToken.expiresAt).getTime();
      const diffSec = Math.max(0, Math.floor((expiry - now) / 1000));
      setTimeLeft(diffSec);
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [currentToken]);

  const handleRefresh = () => {
    if (currentSession) {
      generateQRToken(currentSession.id, 30);
    }
  };

  const handleCopy = () => {
    if (!currentToken) return;
    navigator.clipboard.writeText(currentToken.token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Real-time attendees who have scanned this session
  const attendees = currentSession ? getSessionAttendees(currentSession.id) : [];

  // Quick simulation helper for testing
  const simulateScan = async () => {
    if (!currentToken) return;
    const eligibleTrainees = allUsers.filter(u => u.role === 'trainee');
    const unscanned = eligibleTrainees.find(t => !attendees.some(a => a.traineeId === t.id));
    if (unscanned) {
      await verifyAndMarkAttendance(currentToken.token, unscanned.id);
    }
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner with Session Switcher */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-700">
            <QrCode className="w-5 h-5" />
            <h1 className="text-xl font-bold text-slate-900">Live Classroom QR Projector Board</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Display on screen or classroom projector. Trainees scan via web camera or upload screenshot.
          </p>
        </div>

        {/* Session Selector */}
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <label className="text-xs font-semibold text-slate-600 shrink-0">Training Session:</label>
          <select
            value={selectedSessionId}
            onChange={e => setSelectedSessionId(e.target.value)}
            className="w-full md:w-64 p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500"
          >
            {sessions.map(s => (
              <option key={s.id} value={s.id}>
                {s.courseTitle}: {s.topic}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Projector Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Big Projector QR View */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm flex flex-col items-center text-center relative overflow-hidden">
          {/* Official Apex Watermark / Header */}
          <div className="w-full pb-4 mb-4 border-b border-slate-100 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-bold text-slate-800">NCCT STATUTORY ATTENDANCE GATE (V2.0)</span>
            </div>
            <span className="text-slate-400 font-mono text-[11px]">{currentSession?.id}</span>
          </div>

          <div className="max-w-md w-full">
            <h2 className="text-xl font-black text-slate-900 leading-snug">
              {currentSession?.topic || 'Select a training session'}
            </h2>
            <p className="text-xs text-indigo-700 font-semibold mt-1">
              {currentCourse?.title} ({currentCourse?.code})
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              Venue: {currentSession?.venue} • Date: {currentSession?.sessionDate}
            </p>
          </div>

          {/* QR Code Container */}
          <div className="my-6 p-6 bg-white rounded-3xl shadow-xl border-4 border-indigo-600/20 relative group">
            {currentToken ? (
              <QRCodeSVG
                value={currentToken.token}
                size={280}
                level="H"
                includeMargin={true}
                className="w-56 h-56 sm:w-64 sm:h-64 rounded-xl"
              />
            ) : (
              <div className="w-64 h-64 flex flex-col items-center justify-center text-slate-400">
                <QrCode className="w-16 h-16 mb-2 stroke-1" />
                <p className="text-xs">No active token for this session</p>
                <button
                  onClick={handleRefresh}
                  className="mt-3 bg-indigo-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg cursor-pointer"
                >
                  Generate QR Code
                </button>
              </div>
            )}

            {/* Expired Overlay */}
            {timeLeft <= 0 && currentToken && (
              <div className="absolute inset-0 bg-slate-900/85 backdrop-blur-xs rounded-3xl flex flex-col items-center justify-center text-white p-4">
                <Clock className="w-10 h-10 text-rose-400 mb-2" />
                <p className="text-sm font-bold">QR Token Expired</p>
                <p className="text-xs text-slate-300 mb-3 text-center">30-minute anti-fraud window elapsed</p>
                <button
                  onClick={handleRefresh}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-xl cursor-pointer"
                >
                  Regenerate QR Token
                </button>
              </div>
            )}
          </div>

          {/* Countdown & Security Controls */}
          {currentToken && (
            <div className="w-full max-w-md space-y-3">
              <div className="flex items-center justify-center space-x-3 text-xs">
                <div className={`flex items-center space-x-1.5 font-mono font-bold px-3 py-1 rounded-full border ${
                  timeLeft < 300 
                    ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse' 
                    : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                }`}>
                  <Clock className="w-3.5 h-3.5" />
                  <span>Valid for: {formatTime(timeLeft)}</span>
                </div>

                <button
                  onClick={handleRefresh}
                  className="flex items-center space-x-1 text-slate-600 hover:text-indigo-600 bg-slate-100 hover:bg-slate-200 px-3 py-1 rounded-full font-semibold transition cursor-pointer"
                  title="Force refresh token"
                >
                  <RotateCw className="w-3 h-3" />
                  <span>Refresh</span>
                </button>
              </div>

              {/* Copy Token Bar */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex items-center justify-between text-xs">
                <div className="truncate font-mono text-slate-700 font-semibold px-2">
                  {currentToken.token}
                </div>
                <button
                  onClick={handleCopy}
                  className="bg-white hover:bg-slate-100 text-indigo-700 border border-slate-300 font-bold px-3 py-1 rounded-lg transition flex items-center space-x-1 cursor-pointer shrink-0"
                >
                  {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy Token'}</span>
                </button>
              </div>

              <div className="flex items-center justify-center space-x-3 pt-2 text-xs">
                <button
                  onClick={() => navigateTo('scanner')}
                  className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center space-x-1 cursor-pointer"
                >
                  <span>Open Trainee Scanner</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <span className="text-slate-300">•</span>

                <button
                  onClick={simulateScan}
                  className="text-emerald-600 hover:text-emerald-800 font-semibold flex items-center space-x-1 cursor-pointer"
                  title="Simulates an admitted trainee scanning this token"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Simulate Attendee Scan</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Live Attendees Roster */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">Live Attendee Roster</h3>
              </div>
              <span className="bg-emerald-100 text-emerald-800 font-bold text-xs px-2.5 py-0.5 rounded-full border border-emerald-200">
                {attendees.length} Present
              </span>
            </div>

            <p className="text-xs text-slate-500 mb-3">
              Officers verified for this session via web scan or token verification.
            </p>

            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {attendees.length === 0 ? (
                <div className="p-6 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-xs">
                  Waiting for trainees to scan QR code...
                </div>
              ) : (
                attendees.map(log => (
                  <div
                    key={log.id}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-900 block">{log.traineeName}</span>
                      <span className="text-[10px] text-slate-500">
                        {new Date(log.scannedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })} • IP: {log.ipAddress}
                      </span>
                    </div>

                    <button
                      onClick={() => navigateTo('verify', log.id)}
                      className="text-sky-600 hover:text-sky-800 font-semibold text-[11px] cursor-pointer flex items-center space-x-0.5"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Verify</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Guidelines Box */}
          <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-5 text-xs text-indigo-900 space-y-2">
            <h4 className="font-bold flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>Multi-Gate Security Rules</span>
            </h4>
            <ul className="list-disc pl-4 space-y-1 text-slate-600 text-[11px]">
              <li><strong>Time-Bound:</strong> Tokens expire automatically after 30 minutes.</li>
              <li><strong>Enrolled Only:</strong> Only trainees approved by the faculty can record attendance.</li>
              <li><strong>Anti-Replay:</strong> Duplicate scans within the same session are blocked.</li>
              <li><strong>Tamper-Proof:</strong> All verified scans write directly to the Turso SQLite ledger.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
