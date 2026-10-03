import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { QRToken } from '../../types';
import { Html5Qrcode } from 'html5-qrcode';
import { 
  QrCode, 
  Camera, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  KeyRound, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles,
  RefreshCw,
  Clock,
  ExternalLink
} from 'lucide-react';

export const ScannerPage: React.FC = () => {
  const {
    currentUser,
    verifyAndMarkAttendance,
    activeTokens,
    sessions,
    courses,
    navigateTo,
    isAuthenticated,
    refreshServer
  } = useApp();

  const [scanMode, setScanMode] = useState<'camera' | 'upload' | 'manual'>('camera');
  const [manualToken, setManualToken] = useState('');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [lastResult, setLastResult] = useState<{
    success: boolean;
    message: string;
    sessionTitle?: string;
    courseTitle?: string;
    logId?: string;
  } | null>(null);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = 'interactive-qr-reader-page';

  // Refresh right when the scanner opens so freshly generated trainer
  // tokens/sessions are picked up immediately.
  useEffect(() => {
    refreshServer();
  }, []);

  // Active tokens list for quick test helper
  const availableActiveTokens: QRToken[] = Object.values(activeTokens);

  useEffect(() => {
    if (scanMode !== 'camera') {
      stopCamera();
      return;
    }

    let isMounted = true;
    const startCamera = async () => {
      try {
        setCameraError(null);
        if (!scannerRef.current) {
          scannerRef.current = new Html5Qrcode(scannerContainerId);
        }

        await scannerRef.current.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 }
          },
          (decodedText) => {
            handleScanSuccess(decodedText);
          },
          () => {
            // Ignore scan frame misses
          }
        );

        if (isMounted) setIsScanning(true);
      } catch (err: any) {
        console.warn('Camera start failed:', err);
        if (isMounted) {
          setCameraError(
            err?.name === 'NotAllowedError'
              ? 'Camera access permission denied. Please allow camera permissions or use the Image Upload / Manual Code tab.'
              : 'Could not access device camera. Please use Image Upload or Manual Code below.'
          );
          setIsScanning(false);
        }
      }
    };

    // Small delay to ensure DOM element is mounted
    const timer = setTimeout(startCamera, 200);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      stopCamera();
    };
  }, [scanMode]);

  const stopCamera = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
        setIsScanning(false);
      } catch (err) {
        console.error('Error stopping camera:', err);
      }
    }
  };

  const handleScanSuccess = async (decodedText: string) => {
    const res = await verifyAndMarkAttendance(decodedText);
    setLastResult({
      success: res.success,
      message: res.message,
      sessionTitle: res.session?.topic,
      courseTitle: res.course?.title,
      logId: res.log?.id
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const html5Qr = new Html5Qrcode('qr-temp-file-reader');
      const decodedText = await html5Qr.scanFile(file, true);
      handleScanSuccess(decodedText);
    } catch (err: any) {
      setLastResult({
        success: false,
        message: 'Could not detect a valid QR code in this image. Please ensure the QR code is clearly visible.'
      });
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualToken.trim()) return;
    handleScanSuccess(manualToken);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      {/* Hidden container for file scans */}
      <div id="qr-temp-file-reader" className="hidden"></div>

      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200">
        <div className="flex items-center space-x-2 text-emerald-600">
          <QrCode className="w-6 h-6" />
          <h1 className="text-xl font-bold text-slate-900">Attendance Verification Scanner</h1>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Scan the session QR code projected on screen to mark verified attendance in the Turso SQLite ledger.
        </p>

        {!isAuthenticated && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center justify-between">
            <span>You are currently not signed in. Sign in as a trainee to record your attendance.</span>
            <button
              onClick={() => navigateTo('login')}
              className="font-bold underline ml-2 cursor-pointer"
            >
              Sign In →
            </button>
          </div>
        )}
      </div>

      {/* Result feedback card */}
      {lastResult && (
        <div className={`p-5 rounded-2xl border animate-in zoom-in-95 duration-150 ${
          lastResult.success 
            ? 'bg-emerald-50 border-emerald-300 text-emerald-950' 
            : 'bg-rose-50 border-rose-300 text-rose-950'
        }`}>
          <div className="flex items-start space-x-3">
            {lastResult.success ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <h3 className="text-sm font-bold">
                {lastResult.success ? 'Attendance Successfully Recorded!' : 'Attendance Gate Verification Failed'}
              </h3>
              <p className="text-xs mt-1 leading-relaxed opacity-90">
                {lastResult.message}
              </p>

              {lastResult.success && lastResult.sessionTitle && (
                <div className="mt-3 pt-3 border-t border-emerald-200 text-xs flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="font-semibold block">{lastResult.sessionTitle}</span>
                    <span className="text-[11px] opacity-80">{lastResult.courseTitle}</span>
                  </div>
                  {lastResult.logId && (
                    <button
                      onClick={() => navigateTo('verify', lastResult.logId)}
                      className="bg-emerald-600 text-white font-bold px-3 py-1.5 rounded-lg text-xs hover:bg-emerald-700 transition cursor-pointer flex items-center space-x-1"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>View Verification Seal</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Scanner Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 overflow-hidden">
        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-xl mb-6 text-xs font-bold">
          <button
            onClick={() => setScanMode('camera')}
            className={`py-2 rounded-lg flex items-center justify-center space-x-1.5 transition cursor-pointer ${
              scanMode === 'camera'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Camera Scanner</span>
          </button>

          <button
            onClick={() => setScanMode('upload')}
            className={`py-2 rounded-lg flex items-center justify-center space-x-1.5 transition cursor-pointer ${
              scanMode === 'upload'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Image</span>
          </button>

          <button
            onClick={() => setScanMode('manual')}
            className={`py-2 rounded-lg flex items-center justify-center space-x-1.5 transition cursor-pointer ${
              scanMode === 'manual'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Manual Code</span>
          </button>
        </div>

        {/* Mode 1: Camera Viewfinder */}
        {scanMode === 'camera' && (
          <div className="flex flex-col items-center">
            <div className="w-full max-w-sm rounded-2xl overflow-hidden bg-slate-900 relative aspect-square flex items-center justify-center border-2 border-indigo-600/30">
              <div id={scannerContainerId} className="w-full h-full"></div>

              {cameraError && (
                <div className="absolute inset-0 p-6 bg-slate-900/95 text-white flex flex-col items-center justify-center text-center">
                  <AlertCircle className="w-10 h-10 text-amber-400 mb-2" />
                  <p className="text-xs font-semibold">{cameraError}</p>
                  <button
                    onClick={() => setScanMode('manual')}
                    className="mt-4 bg-indigo-600 text-white text-xs font-bold px-4 py-2 rounded-xl cursor-pointer"
                  >
                    Switch to Manual Token Entry
                  </button>
                </div>
              )}
            </div>

            <p className="text-xs text-slate-500 mt-3 text-center">
              Align the projected classroom QR code inside the viewfinder.
            </p>
          </div>
        )}

        {/* Mode 2: Upload Image */}
        {scanMode === 'upload' && (
          <div className="p-8 border-2 border-dashed border-slate-300 rounded-2xl text-center bg-slate-50/50 hover:bg-slate-50 transition">
            <Upload className="w-10 h-10 text-indigo-600 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-900">Upload QR Screenshot or Photo</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              If your camera is unavailable, upload a photo or screenshot of the classroom QR code.
            </p>

            <label className="mt-4 inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl cursor-pointer shadow-xs transition">
              Select Image File
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        )}

        {/* Mode 3: Manual Code Validator */}
        {scanMode === 'manual' && (
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Session Token Code
              </label>
              <input
                type="text"
                value={manualToken}
                onChange={e => setManualToken(e.target.value)}
                placeholder="e.g. NCCT-QR-PACS-SECURE-88219"
                className="w-full p-3 font-mono bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition shadow-xs flex items-center justify-center space-x-2 cursor-pointer"
            >
              <span>Validate Token & Mark Attendance</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Active Demo Tokens Helper */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Currently Active Session Tokens (Choose to auto-fill)</span>
          </div>

          <select
            value={availableActiveTokens.some(t => t.token === manualToken) ? manualToken : ''}
            onChange={e => {
              setManualToken(e.target.value);
              setScanMode('manual');
            }}
            className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer"
          >
            <option value="">— Choose the session you are present in —</option>
            {availableActiveTokens.map(t => {
              const expired = new Date() > new Date(t.expiresAt);
              const ses = sessions.find(s => s.id === t.sessionId);
              const course = courses.find(c => c.id === t.courseId);
              const label = course && ses ? `${course.title} — ${ses.topic}` : ses?.topic || 'Active Session';
              return (
                <option key={t.id} value={t.token} disabled={expired}>
                  {label}{expired ? ' (expired)' : ''}
                </option>
              );
            })}
          </select>
          <p className="text-[10px] text-slate-400 mt-1.5">
            Selecting a session fills its token below — then press Validate Token & Mark Attendance.
          </p>
        </div>
      </div>
    </div>
  );
};
