import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Database,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  GitBranch,
  Cloud,
  Server,
  Copy,
  Check,
  Table,
  Clock,
  ShieldCheck,
  Wifi,
  WifiOff
} from 'lucide-react';

export const DatabasePage: React.FC = () => {
  const {
    tursoConfig,
    syncNow,
    allUsers,
    courses,
    enrollments,
    sessions,
    attendanceLogs,
    activeTokens,
    assessments,
    submissions,
    jobPostings,
    jobApplications
  } = useApp();

  const [activeTab, setActiveTab] = useState<'sync' | 'deployment'>('sync');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncMessage(null);
    const res = await syncNow();
    setIsSyncing(false);
    if (res.success) {
      setSyncMessage({ type: 'success', text: res.message });
    } else {
      setSyncMessage({ type: 'error', text: res.message });
    }
  };

  const copyDeployCommands = () => {
    const cmds = `# Deployment is automated via Vercel + GitHub
# Every push to main builds and deploys automatically.
# Turso credentials are stored as server-side secrets:
#   TURSO_DATABASE_URL, TURSO_AUTH_TOKEN, SESSION_SECRET
# Configure them in: Vercel Dashboard -> Project -> Settings -> Environment Variables`;
    navigator.clipboard.writeText(cmds);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const statusLabel =
    tursoConfig.status === 'connected'
      ? 'NCCT Cloud SQLite: Connected'
      : tursoConfig.status === 'connecting'
      ? 'Connecting to NCCT server...'
      : tursoConfig.status === 'syncing'
      ? 'Syncing...'
      : tursoConfig.status === 'error'
      ? 'Connection Error'
      : 'Offline: Using Cached Data';

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-700">
            <Database className="w-6 h-6" />
            <h1 className="text-xl font-bold text-slate-900">Turso SQLite & Deployment Hub</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Server-side secure database connection, live sync status, and deployment configuration
          </p>
        </div>

        {/* Live Status Pill */}
        <div className={`px-3 py-1.5 rounded-full text-xs font-bold border flex items-center space-x-1.5 shrink-0 ${
          tursoConfig.status === 'connected'
            ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
            : tursoConfig.status === 'connecting' || tursoConfig.status === 'syncing'
            ? 'bg-amber-50 text-amber-700 border-amber-300'
            : tursoConfig.status === 'error'
            ? 'bg-rose-50 text-rose-700 border-rose-300'
            : 'bg-slate-100 text-slate-700 border-slate-300'
        }`}>
          <span className={`w-2 h-2 rounded-full ${
            tursoConfig.status === 'connected' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
          }`}></span>
          <span>{statusLabel}</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('sync')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center space-x-1.5 ${
            activeTab === 'sync'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Server className="w-3.5 h-3.5" />
          <span>Connection & Sync</span>
        </button>

        <button
          onClick={() => setActiveTab('deployment')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center space-x-1.5 ${
            activeTab === 'deployment'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <GitBranch className="w-3.5 h-3.5" />
          <span>Deployment</span>
        </button>
      </div>

      {/* Tab 1: Connection & Sync */}
      {activeTab === 'sync' && (
        <div className="space-y-6">
          {syncMessage && (
            <div className={`p-4 rounded-xl text-xs flex items-center space-x-2 animate-in fade-in ${
              syncMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}>
              {syncMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{syncMessage.text}</span>
            </div>
          )}

          {tursoConfig.errorMsg && (
            <div className="p-4 rounded-xl text-xs bg-amber-50 text-amber-800 border border-amber-200 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{tursoConfig.errorMsg}</span>
            </div>
          )}

          {/* Sync Controls */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center space-x-2">
              <Cloud className="w-4 h-4 text-indigo-600" />
              <span>Cloud Sync (Turso SQLite)</span>
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              All data is stored in the NCCT Turso cloud database through secure server-side APIs.
              Database credentials are never exposed to the browser — they live only in the deployment
              environment's encrypted secrets.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center space-x-3">
                <Clock className="w-4 h-4 text-indigo-600 shrink-0" />
                <div>
                  <span className="text-[11px] text-slate-500 block font-semibold uppercase tracking-wider">Last Synced</span>
                  <span className="text-sm font-bold text-slate-900">{tursoConfig.lastSyncedAt || 'Not yet synced'}</span>
                </div>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center space-x-3">
                <RefreshCw className="w-4 h-4 text-indigo-600 shrink-0" />
                <div>
                  <span className="text-[11px] text-slate-500 block font-semibold uppercase tracking-wider">Pending Offline Writes</span>
                  <span className="text-sm font-bold text-slate-900">{tursoConfig.pendingWrites ?? 0}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleSync}
                disabled={isSyncing}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition shadow-xs flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
              </button>

              <div className="flex items-center space-x-1.5 text-[11px] text-slate-500">
                {tursoConfig.status === 'connected' ? (
                  <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <WifiOff className="w-3.5 h-3.5 text-slate-400" />
                )}
                <span>
                  {tursoConfig.status === 'connected'
                    ? 'Connected — every change is written to the cloud database from any device.'
                    : 'Offline — your changes are saved on this device and sync automatically when you reconnect.'}
                </span>
              </div>
            </div>
          </div>

          {/* Table Counts Overview */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center space-x-2">
              <Table className="w-4 h-4 text-indigo-600" />
              <span>Database Table Records</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
              {[
                { label: 'users', count: allUsers.length },
                { label: 'courses', count: courses.length },
                { label: 'enrollments', count: enrollments.length },
                { label: 'sessions', count: sessions.length },
                { label: 'qr_tokens', count: Object.keys(activeTokens).length },
                { label: 'attendance_logs', count: attendanceLogs.length, highlight: true },
                { label: 'assessments', count: assessments.length },
                { label: 'submissions', count: submissions.length },
                { label: 'job_postings', count: jobPostings.length },
                { label: 'job_applications', count: jobApplications.length }
              ].map(t => (
                <div key={t.label} className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[11px] text-slate-500 font-mono block">{t.label}</span>
                  <span className={`text-lg font-bold ${t.highlight ? 'text-indigo-700' : 'text-slate-900'}`}>{t.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Security Note */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start space-x-2.5 text-xs text-emerald-900">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              <strong>Secure by design:</strong> the Turso database URL, auth token, and session secret are
              server-side environment secrets. They are never included in the frontend bundle, and all
              database queries execute on the server with parameterized SQL.
            </span>
          </div>
        </div>
      )}

      {/* Tab 2: Deployment Guide */}
      {activeTab === 'deployment' && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <GitBranch className="w-4 h-4 text-indigo-600" />
              <span>Vercel + GitHub Deployment</span>
            </h3>
            <button
              onClick={copyDeployCommands}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center space-x-1 cursor-pointer transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Notes'}</span>
            </button>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            This application deploys to <strong>Vercel</strong> with automatic GitHub integration. The React
            frontend is served as a static PWA, while all database operations run inside Vercel serverless
            functions (<code className="bg-slate-100 px-1 py-0.5 rounded font-mono">/api/*</code>) that hold the
            Turso credentials as encrypted secrets.
          </p>

          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="font-bold text-slate-900 block">Step 1: Automatic Deployment via GitHub (Active)</span>
              <p className="text-slate-600">
                The repository is connected to Vercel. Every push to the <code className="bg-white px-1.5 py-0.5 rounded border font-mono">main</code> branch
                automatically builds and deploys to production.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="font-bold text-slate-900 block">Step 2: Server-Side Turso Secrets</span>
              <p className="text-slate-600">
                The Turso database credentials are configured as Vercel environment variables of type
                <strong> Secret</strong> (server-side only, never exposed to the browser):
              </p>
              <ul className="list-disc pl-5 space-y-1 font-mono text-[11px] text-indigo-700">
                <li>TURSO_DATABASE_URL = libsql://your-db-name.turso.io</li>
                <li>TURSO_AUTH_TOKEN = your-secret-turso-token</li>
                <li>SESSION_SECRET = random-64-char-string</li>
              </ul>
              <p className="text-[11px] text-slate-500">
                Manage them in: Vercel Dashboard → Project → Settings → Environment Variables.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="font-bold text-slate-900 block">Step 3: Manual Deploy via CLI (Optional)</span>
              <pre className="bg-slate-900 text-emerald-400 p-3 rounded-xl font-mono text-[11px] overflow-x-auto">
{`npm install
vercel dev --listen 3001   # local full-stack dev
vercel --prod              # manual production deploy`}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
