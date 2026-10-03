import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { useApp } from '../../context/AppContext';
import { QRAttendanceToken } from '../../types';
import { 
  X, 
  Camera, 
  CheckCircle2, 
  AlertCircle, 
  RotateCw, 
  QrCode, 
  ShieldCheck,
  Zap,
  Sparkles
} from 'lucide-react';

interface QRScannerModalProps {
  onClose: () => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({ onClose }) => {
  const { verifyAndMarkAttendance, activeTokens, sessions, currentUser, refreshServer } = useApp();
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [manualToken, setManualToken] = useState<string>('');
  const [scanResult, setScanResult] = useState<{
    status: 'idle' | 'success' | 'error';
    message: string;
    sessionTitle?: string;
  }>({ status: 'idle', message: '' });

  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = 'ncct-html5-qr-reader';

  // Cleanup scanner on unmount
  useEffect(() => {
    // Refresh right when the scanner opens so freshly generated trainer
    // tokens/sessions are picked up immediately.
    refreshServer();
    return () => {
      if (html5QrCodeRef.current) {
        if (html5QrCodeRef.current.isScanning) {
          html5QrCodeRef.current.stop().catch(() => {});
        }
        html5QrCodeRef.current.clear();
      }
    };
  }, []);

  const startCamera = async () => {
    setCameraError(null);
    setScanResult({ status: 'idle', message: '' });
    setCameraActive(true); // Make container visible first

    // Wait for state update and DOM render so html5-qrcode can calculate dimensions
    setTimeout(async () => {
      try {
        if (!html5QrCodeRef.current) {
          html5QrCodeRef.current = new Html5Qrcode(scannerContainerId);
        }

        await html5QrCodeRef.current.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 220, height: 220 }
          },
          (decodedText) => {
            handleTokenSubmitted(decodedText);
            stopCamera();
          },
          () => {
            // Frame read callback - ignore frame mismatches
          }
        );
      } catch (err: any) {
        console.warn('Camera error or permission denied:', err);
        setCameraError(
          'Could not access camera (camera permission might be disabled in this browser/frame). You can use the Quick Test Tokens below to test instant validation!'
        );
        setCameraActive(false);
      }
    }, 100);
  };

  const stopCamera = async () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      try {
        await html5QrCodeRef.current.stop();
        setCameraActive(false);
      } catch (err) {
        console.error('Error stopping scanner', err);
      }
    }
  };

  const [isVerifying, setIsVerifying] = useState(false);

  const handleTokenSubmitted = async (tokenString: string) => {
    if (!tokenString.trim() || isVerifying) return;

    setIsVerifying(true);
    const res = await verifyAndMarkAttendance(tokenString.trim());
    setIsVerifying(false);
    if (res.success) {
      setScanResult({
        status: 'success',
        message: res.message,
        sessionTitle: res.session?.topic
      });
    } else {
      setScanResult({
        status: 'error',
        message: res.message
      });
    }
  };

  // Get list of active tokens for easy 1-click test in demo mode
  const tokenList = Object.values(activeTokens) as QRAttendanceToken[];
  const activeTokenList = tokenList.map(t => {
    const ses = sessions.find(s => s.id === t.sessionId);
    return {
      token: t.token,
      sessionTitle: ses?.topic || 'Active Session',
      isExpired: new Date() > new Date(t.expiresAt)
    };
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/30 flex items-center justify-center border border-indigo-400/30">
              <QrCode className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">Mark Attendance (Web-Only)</h2>
              <p className="text-[11px] text-indigo-200">Browser Camera Scanner • No Native App Required</p>
            </div>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Result Alert if scanned */}
          {scanResult.status === 'success' && (
            <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-4 flex items-start space-x-3 text-emerald-900 animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-emerald-800">Attendance Recorded Successfully!</p>
                <p className="text-xs text-emerald-700 mt-0.5">{scanResult.message}</p>
                {scanResult.sessionTitle && (
                  <p className="text-[11px] font-semibold text-emerald-900 mt-1 bg-white/60 px-2 py-0.5 rounded-md inline-block">
                    Topic: {scanResult.sessionTitle}
                  </p>
                )}
                <div className="mt-3 flex items-center space-x-3">
                  <button
                    onClick={() => setScanResult({ status: 'idle', message: '' })}
                    className="text-xs font-bold text-emerald-800 hover:underline flex items-center space-x-1"
                  >
                    <RotateCw className="w-3 h-3" />
                    <span>Scan Another Code</span>
                  </button>
                  <button
                    onClick={onClose}
                    className="text-xs bg-emerald-600 text-white font-semibold px-3 py-1 rounded-lg hover:bg-emerald-700 transition"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          )}

          {scanResult.status === 'error' && (
            <div className="bg-rose-50 border border-rose-300 rounded-xl p-4 flex items-start space-x-3 text-rose-900 animate-in fade-in">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-rose-800">Attendance Validation Failed</p>
                <p className="text-xs text-rose-700 mt-0.5">{scanResult.message}</p>
                <button
                  onClick={() => setScanResult({ status: 'idle', message: '' })}
                  className="mt-2 text-xs font-bold text-rose-800 hover:underline flex items-center space-x-1"
                >
                  <RotateCw className="w-3 h-3" />
                  <span>Try Again</span>
                </button>
              </div>
            </div>
          )}

          {/* Camera Scanner Viewport */}
          <div className="bg-slate-900 rounded-2xl p-4 text-center text-white relative overflow-hidden flex flex-col items-center justify-center min-h-60 border border-slate-800">
            {/* Target element for html5-qrcode */}
            <div 
              id={scannerContainerId} 
              className={`w-full max-w-[280px] mx-auto overflow-hidden rounded-xl ${cameraActive ? 'block' : 'hidden'}`}
            />

            {!cameraActive && (
              <div className="py-6 flex flex-col items-center justify-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-indigo-600/30 text-indigo-400 flex items-center justify-center border border-indigo-500/30 shadow-inner">
                  <Camera className="w-7 h-7" />
                </div>
                <div className="text-center px-4">
                  <p className="text-sm font-semibold text-white">Browser Camera Scanner</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs">
                    Point your device camera at the QR code displayed on the trainer's screen
                  </p>
                </div>
                <button
                  onClick={startCamera}
                  className="mt-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition flex items-center space-x-2 shadow-lg shadow-indigo-600/30 cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                  <span>Open Device Camera</span>
                </button>
              </div>
            )}

            {cameraActive && (
              <div className="mt-3">
                <button
                  onClick={stopCamera}
                  className="text-xs text-rose-400 hover:text-rose-300 font-medium px-3 py-1 rounded-lg bg-rose-950/60 border border-rose-800 transition"
                >
                  Stop Camera
                </button>
              </div>
            )}

            {cameraError && (
              <div className="mt-2 p-2 bg-amber-950/80 border border-amber-800 rounded-lg text-amber-200 text-xs text-left max-w-sm">
                <p className="font-semibold flex items-center space-x-1">
                  <AlertCircle className="w-3 h-3 text-amber-400 shrink-0" />
                  <span>Camera Notice:</span>
                </p>
                <p className="text-[11px] mt-0.5 leading-tight">{cameraError}</p>
              </div>
            )}
          </div>

          {/* Fallback / Instant Token Tester */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>Test Attendance Token (Sandbox Mode)</span>
              </span>
              <span className="text-[10px] text-slate-400">Direct verification</span>
            </div>

            <p className="text-[11px] text-slate-500 mb-2.5">
              Paste or enter the token string from the Trainer's QR projector to simulate a scan:
            </p>

            <div className="flex space-x-2">
              <input
                type="text"
                value={manualToken}
                onChange={e => setManualToken(e.target.value)}
                placeholder="e.g. NCCT-QR-PACS-SECURE-88219"
                className="flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <button
                onClick={() => handleTokenSubmitted(manualToken)}
                disabled={!manualToken.trim()}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition cursor-pointer shrink-0"
              >
                Verify & Mark
              </button>
            </div>

            {/* Quick 1-click active tokens */}
            {activeTokenList.length > 0 && (
              <div className="mt-3 pt-2.5 border-t border-slate-200">
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1.5">
                  Available Active Session Tokens:
                </p>
                <div className="space-y-1">
                  {activeTokenList.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setManualToken(item.token);
                        handleTokenSubmitted(item.token);
                      }}
                      className="w-full text-left p-1.5 bg-white hover:bg-indigo-50 border border-slate-200 rounded-md text-[11px] flex items-center justify-between transition cursor-pointer"
                    >
                      <span className="font-medium text-slate-700 truncate">{item.sessionTitle}</span>
                      <span className="text-[10px] font-mono text-indigo-600 font-semibold shrink-0 ml-2 bg-indigo-50 px-1.5 py-0.5 rounded">
                        1-Click Scan
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="text-[11px] text-slate-400 text-center flex items-center justify-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Scanning for logged trainee: <strong className="text-slate-700">{currentUser.fullName}</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};
