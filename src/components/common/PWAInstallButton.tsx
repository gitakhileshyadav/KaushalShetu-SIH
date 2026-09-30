import React, { useState } from 'react';
import { usePWAInstall } from './usePWAInstall';
import { Smartphone, Download, Share, PlusSquare, Check, X } from 'lucide-react';

interface PWAInstallButtonProps {
  compact?: boolean;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ compact = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [installing, setInstalling] = useState(false);

  // If already installed in standalone mode, hide
  if (isInstalled) {
    return (
      <div className="hidden sm:flex items-center space-x-1 text-[11px] text-emerald-400 font-medium bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800">
        <Check className="w-3 h-3 text-emerald-400" />
        <span>Installed PWA</span>
      </div>
    );
  }

  const handleInstallClick = async () => {
    setInstalling(true);
    await install();
    setInstalling(false);
  };

  // Android / Chrome / Desktop flow
  if (isInstallable) {
    if (compact) {
      return (
        <button
          onClick={handleInstallClick}
          disabled={installing}
          className="flex items-center space-x-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-xs transition cursor-pointer"
          title="Install NCCT Mobile App on your device"
        >
          <Smartphone className="w-3 h-3" />
          <span>Install App</span>
        </button>
      );
    }

    return (
      <button
        onClick={handleInstallClick}
        disabled={installing}
        className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-400/20 transition cursor-pointer"
      >
        <Download className="w-3.5 h-3.5" />
        <span>{installing ? 'Opening Install...' : 'Install App'}</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className={`flex items-center space-x-1 font-bold rounded-full transition cursor-pointer ${
            compact 
              ? 'text-[11px] px-2.5 py-1 bg-indigo-900/60 text-indigo-200 border border-indigo-700 hover:bg-indigo-800' 
              : 'text-xs px-3 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100'
          }`}
        >
          <Smartphone className="w-3 h-3 text-amber-400" />
          <span>Install on iPhone</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
            <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Install NCCT Portal</h3>
                    <p className="text-[11px] text-slate-500">Run as full-screen app on iPhone / iPad</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-4 space-y-3 text-xs text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="flex items-start space-x-2.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">1</span>
                  <span>Tap the <strong className="text-slate-900">Share</strong> icon (<Share className="w-3 h-3 inline text-indigo-600 mx-0.5" />) in Safari's bottom toolbar.</span>
                </div>
                <div className="flex items-start space-x-2.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">2</span>
                  <span>Scroll down and select <strong className="text-slate-900">Add to Home Screen</strong> (<PlusSquare className="w-3 h-3 inline text-slate-700 mx-0.5" />).</span>
                </div>
                <div className="flex items-start space-x-2.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">3</span>
                  <span>Tap <strong className="text-slate-900">Add</strong> in top right. Launch from your home screen anytime offline!</span>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-4 w-full rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Fallback for browsers that don't emit prompt or in preview iframe
  return (
    <button
      onClick={() => {
        alert("To install NCCT Portal on your phone or desktop:\n• Android/Chrome: Tap Chrome menu (⋮) -> 'Install App' or 'Add to Home Screen'\n• iPhone/Safari: Tap Share icon -> 'Add to Home Screen'\n• Desktop: Click the install icon in the address bar");
      }}
      className={`flex items-center space-x-1 font-medium rounded-full transition cursor-pointer ${
        compact 
          ? 'text-[11px] px-2.5 py-0.5 bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700' 
          : 'text-xs px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
      }`}
      title="How to install NCCT App on your mobile device"
    >
      <Smartphone className="w-3 h-3 text-amber-400" />
      <span>Mobile App</span>
    </button>
  );
};
