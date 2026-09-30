import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { CourseSession, QRAttendanceToken } from '../../types';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  Clock, 
  RefreshCw, 
  Users, 
  Copy, 
  Check, 
  MapPin, 
  Calendar, 
  ShieldCheck, 
  AlertCircle 
} from 'lucide-react';

interface SessionQRModalProps {
  session: CourseSession;
  onClose: () => void;
}

export const SessionQRModal: React.FC<SessionQRModalProps> = ({ session, onClose }) => {
  const { activeTokens, generateQRToken, getSessionAttendees, courses } = useApp();
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isExpired, setIsExpired] = useState<boolean>(false);

  const course = courses.find(c => c.id === session.courseId);
  const existingToken: QRAttendanceToken | undefined = activeTokens[session.id];

  // Auto-generate token if not already generated
  useEffect(() => {
    if (!existingToken) {
      generateQRToken(session.id, 30);
    }
  }, [session.id, existingToken, generateQRToken]);

  const currentToken = activeTokens[session.id];
  const attendees = getSessionAttendees(session.id);

  // Timer countdown
  useEffect(() => {
    if (!currentToken) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const expiry = new Date(currentToken.expiresAt).getTime();
      const distance = expiry - now;

      if (distance <= 0) {
        setIsExpired(true);
        setTimeLeft('00:00 (Expired)');
      } else {
        setIsExpired(false);
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        setTimeLeft(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [currentToken]);

  const handleRefreshToken = () => {
    generateQRToken(session.id, 30);
    setIsExpired(false);
  };

  const copyToken = () => {
    if (currentToken) {
      navigator.clipboard.writeText(currentToken.token);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <span className="bg-amber-400 text-slate-900 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full">
                V2.0 Web QR Generator
              </span>
              <span className="text-xs text-slate-300 font-mono">Live Time-Bound Token</span>
            </div>
            <h2 className="text-lg font-bold text-white mt-1 leading-snug">{session.topic}</h2>
            <p className="text-xs text-slate-300">{course?.title}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* QR Code Presentation Box */}
          <div className="md:col-span-6 flex flex-col items-center justify-center bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center">
            {currentToken ? (
              <>
                <div className={`p-4 bg-white rounded-2xl shadow-md border ${isExpired ? 'border-rose-300 opacity-60' : 'border-indigo-100'} transition`}>
                  <QRCodeSVG
                    value={currentToken.token}
                    size={200}
                    level="H"
                    includeMargin={true}
                    className="rounded-lg"
                  />
                </div>

                {/* Expiry Timer */}
                <div className={`mt-4 flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-semibold ${
                  isExpired 
                    ? 'bg-rose-100 text-rose-700 border border-rose-200' 
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                }`}>
                  <Clock className="w-3.5 h-3.5" />
                  <span>Expires in: {timeLeft || 'Calculating...'}</span>
                </div>

                {isExpired && (
                  <p className="text-xs text-rose-600 mt-1 flex items-center space-x-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Token is inactive. Generate a fresh one.</span>
                  </p>
                )}

                {/* Refresh Token Button */}
                <button
                  onClick={handleRefreshToken}
                  className="mt-3 flex items-center space-x-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-semibold px-3 py-1.5 rounded-lg border border-indigo-200 hover:bg-indigo-50 transition cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh 30-min Token</span>
                </button>

                {/* Token string for testing */}
                <div className="w-full mt-4 pt-3 border-t border-slate-200 text-left">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium mb-1">
                    <span>Token String (for Testing):</span>
                    <button
                      onClick={copyToken}
                      className="text-indigo-600 hover:text-indigo-700 flex items-center space-x-0.5 cursor-pointer font-semibold"
                    >
                      {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <div className="bg-white border border-slate-200 px-2 py-1.5 rounded-lg font-mono text-[11px] text-slate-700 truncate select-all">
                    {currentToken.token}
                  </div>
                </div>
              </>
            ) : (
              <div className="py-12 text-slate-500 text-sm">Generating token...</div>
            )}
          </div>

          {/* Session Details & Live Attendance Roster */}
          <div className="md:col-span-6 flex flex-col justify-between space-y-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Session Logistics</h3>
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 space-y-2 text-xs text-slate-700">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="font-medium">{session.sessionDate}</span>
                  <span className="text-slate-400">•</span>
                  <span>{session.startTime} - {session.endTime}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>{session.venue}</span>
                </div>
                <div className="flex items-center space-x-2 text-emerald-700 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Only approved trainees can mark attendance</span>
                </div>
              </div>
            </div>

            {/* Live Scanned Trainees Roster */}
            <div className="flex-1 flex flex-col min-h-48">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
                  <Users className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Real-time Scanned Roster ({attendees.length})</span>
                </h3>
                <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Live Sync
                </span>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-2 flex-1 overflow-y-auto max-h-52 space-y-1.5">
                {attendees.length > 0 ? (
                  attendees.map(att => (
                    <div
                      key={att.id}
                      className="bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-2xs flex items-center justify-between text-xs animate-in fade-in"
                    >
                      <div>
                        <p className="font-bold text-slate-800">{att.traineeName}</p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          {new Date(att.scannedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })} • IP: {att.ipAddress}
                        </p>
                      </div>
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        Verified
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-4 text-slate-400 text-xs">
                    <p className="font-medium text-slate-500">No attendees have scanned yet</p>
                    <p className="text-[11px] mt-1">
                      Project this QR code or switch role to <strong>Trainee</strong> to scan!
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold transition cursor-pointer"
              >
                Close Projector View
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
