import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Database, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Key, 
  Link, 
  Play, 
  Terminal, 
  GitBranch, 
  Cloud, 
  Server, 
  Copy, 
  Check,
  Table,
  Layers,
  ArrowRight
} from 'lucide-react';

export const DatabasePage: React.FC = () => {
  const { 
    tursoConfig, 
    connectTurso, 
    disconnectTurso, 
    syncLocalWithTurso, 
    runCustomQuery, 
    allUsers, 
    courses, 
    enrollments, 
    sessions, 
    attendanceLogs,
    activeTokens 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'connection' | 'sql' | 'github'>('connection');

  // Connection inputs
  const [dbUrl, setDbUrl] = useState(tursoConfig.url);
  const [dbToken, setDbToken] = useState(tursoConfig.authToken);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [connectionMessage, setConnectionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // SQL Console
  const [sqlQuery, setSqlQuery] = useState('SELECT id, username, full_name, role, institute FROM users LIMIT 10;');
  const [queryResult, setQueryResult] = useState<{ columns: string[]; rows: any[]; affectedRows?: number; error?: string } | null>(null);
  const [isRunningQuery, setIsRunningQuery] = useState(false);

  // Copy helper
  const [copiedGit, setCopiedGit] = useState(false);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dbUrl.trim()) {
      setConnectionMessage({ type: 'error', text: 'Please provide a Turso database URL (e.g. libsql://your-db.turso.io or https://...)' });
      return;
    }

    setIsConnecting(true);
    setConnectionMessage(null);
    const res = await connectTurso(dbUrl.trim(), dbToken.trim());
    setIsConnecting(false);

    if (res.success) {
      setConnectionMessage({ 
        type: 'success', 
        text: `${res.message} (Latency: ${res.latencyMs || 0}ms)` 
      });
    } else {
      setConnectionMessage({ type: 'error', text: res.message });
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    setConnectionMessage(null);
    const res = await syncLocalWithTurso();
    setIsSyncing(false);
    if (res.success) {
      setConnectionMessage({ type: 'success', text: res.message });
    } else {
      setConnectionMessage({ type: 'error', text: res.message });
    }
  };

  const handleRunSQL = async () => {
    if (!sqlQuery.trim()) return;
    setIsRunningQuery(true);
    const res = await runCustomQuery(sqlQuery.trim());
    setIsRunningQuery(false);
    setQueryResult(res);
  };

  const copyGitCommands = () => {
    const cmds = `# 1. Install dependencies\nnpm install\n\n# 2. Build for production\nnpm run build\n\n# 3. Deploy to GitHub Pages\nnpm run deploy`;
    navigator.clipboard.writeText(cmds);
    setCopiedGit(true);
    setTimeout(() => setCopiedGit(false), 2000);
  };

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
            Serverless libSQL SQLite database connection, table explorer, and GitHub Pages deployment configuration
          </p>
        </div>

        {/* Live Status Pill */}
        <div className={`px-3 py-1.5 rounded-full text-xs font-bold border flex items-center space-x-1.5 shrink-0 ${
          tursoConfig.status === 'connected'
            ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
            : tursoConfig.status === 'connecting'
            ? 'bg-amber-50 text-amber-700 border-amber-300'
            : 'bg-slate-100 text-slate-700 border-slate-300'
        }`}>
          <span className={`w-2 h-2 rounded-full ${
            tursoConfig.status === 'connected' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
          }`}></span>
          <span>
            {tursoConfig.status === 'connected'
              ? 'Turso Cloud SQLite: Connected'
              : tursoConfig.status === 'connecting'
              ? 'Connecting to Turso...'
              : 'Local SQLite Fallback: Active'}
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('connection')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center space-x-1.5 ${
            activeTab === 'connection'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Server className="w-3.5 h-3.5" />
          <span>Turso Database Settings</span>
        </button>

        <button
          onClick={() => setActiveTab('sql')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center space-x-1.5 ${
            activeTab === 'sql'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>Interactive SQL Console</span>
        </button>

        <button
          onClick={() => setActiveTab('github')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center space-x-1.5 ${
            activeTab === 'github'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <GitBranch className="w-3.5 h-3.5" />
          <span>GitHub Pages Deployment</span>
        </button>
      </div>

      {/* Tab 1: Connection & Table Statistics */}
      {activeTab === 'connection' && (
        <div className="space-y-6">
          {connectionMessage && (
            <div className={`p-4 rounded-xl text-xs flex items-center space-x-2 animate-in fade-in ${
              connectionMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}>
              {connectionMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{connectionMessage.text}</span>
            </div>
          )}

          {/* Table Counts Overview */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center space-x-2">
              <Table className="w-4 h-4 text-indigo-600" />
              <span>Database Table Records</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-center">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-[11px] text-slate-500 font-mono block">users</span>
                <span className="text-lg font-bold text-slate-900">{allUsers.length}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-[11px] text-slate-500 font-mono block">courses</span>
                <span className="text-lg font-bold text-slate-900">{courses.length}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-[11px] text-slate-500 font-mono block">enrollments</span>
                <span className="text-lg font-bold text-slate-900">{enrollments.length}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-[11px] text-slate-500 font-mono block">sessions</span>
                <span className="text-lg font-bold text-slate-900">{sessions.length}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-[11px] text-slate-500 font-mono block">qr_tokens</span>
                <span className="text-lg font-bold text-slate-900">{Object.keys(activeTokens).length}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-[11px] text-slate-500 font-mono block">attendance_logs</span>
                <span className="text-lg font-bold text-indigo-700">{attendanceLogs.length}</span>
              </div>
            </div>
          </div>

          {/* Configuration Form */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center space-x-2">
              <Cloud className="w-4 h-4 text-indigo-600" />
              <span>Connect Turso SQLite Database (libSQL)</span>
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Enter your Turso database credentials. You can create a free database using the Turso CLI (<code className="bg-slate-100 px-1 py-0.5 rounded font-mono">turso db create ncct-db</code>).
            </p>

            <form onSubmit={handleConnect} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Turso Database URL (libsql:// or https://)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Link className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={dbUrl}
                    onChange={e => setDbUrl(e.target.value)}
                    placeholder="e.g. libsql://ncct-coop-youruser.turso.io or https://..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Turso Auth Token (JWT)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Key className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    value={dbToken}
                    onChange={e => setDbToken(e.target.value)}
                    placeholder="Enter your Turso auth token from: turso db tokens create ncct-db"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  disabled={isConnecting}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition shadow-xs flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isConnecting ? 'animate-spin' : ''}`} />
                  <span>{isConnecting ? 'Testing Connection...' : 'Connect to Turso SQLite'}</span>
                </button>

                {tursoConfig.status === 'connected' && (
                  <>
                    <button
                      type="button"
                      onClick={handleSync}
                      disabled={isSyncing}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition shadow-xs flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <Layers className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                      <span>{isSyncing ? 'Syncing...' : 'Sync Local State to Turso'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={disconnectTurso}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-3 py-2 rounded-xl text-xs transition cursor-pointer"
                    >
                      Disconnect
                    </button>
                  </>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tab 2: SQL Console */}
      {activeTab === 'sql' && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <Terminal className="w-4 h-4 text-indigo-600" />
              <span>Interactive SQLite Query Console</span>
            </h3>
            <span className="text-xs text-slate-400">Target: {tursoConfig.status === 'connected' ? 'Turso Cloud' : 'Local SQLite'}</span>
          </div>

          {/* Quick Query Templates */}
          <div className="flex flex-wrap gap-2 text-[11px]">
            <span className="text-slate-400 self-center">Templates:</span>
            {[
              { label: 'Users', q: 'SELECT id, username, full_name, role, institute FROM users LIMIT 10;' },
              { label: 'Courses', q: 'SELECT id, code, title, category, min_attendance_pct FROM courses LIMIT 10;' },
              { label: 'Attendance Logs', q: 'SELECT id, trainee_name, course_id, scanned_at, verified FROM attendance_logs ORDER BY scanned_at DESC LIMIT 10;' },
              { label: 'Sessions', q: 'SELECT id, course_title, topic, session_date, venue FROM sessions LIMIT 10;' }
            ].map(tpl => (
              <button
                key={tpl.label}
                type="button"
                onClick={() => setSqlQuery(tpl.q)}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-mono transition cursor-pointer"
              >
                {tpl.label}
              </button>
            ))}
          </div>

          {/* Query editor */}
          <div>
            <textarea
              rows={4}
              value={sqlQuery}
              onChange={e => setSqlQuery(e.target.value)}
              className="w-full p-3 font-mono text-xs bg-slate-950 text-emerald-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 selection:bg-indigo-600"
            />
          </div>

          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={handleRunSQL}
              disabled={isRunningQuery}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition shadow-xs flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
            >
              <Play className={`w-3.5 h-3.5 ${isRunningQuery ? 'animate-spin' : ''}`} />
              <span>{isRunningQuery ? 'Executing SQL...' : 'Run Query'}</span>
            </button>
          </div>

          {/* Query Results Table */}
          {queryResult && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              {queryResult.error ? (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-mono">
                  {queryResult.error}
                </div>
              ) : (
                <div>
                  <div className="text-xs text-slate-500 mb-2 flex items-center justify-between">
                    <span>Rows returned: <strong>{queryResult.rows.length}</strong></span>
                    {queryResult.affectedRows !== undefined && (
                      <span>Rows affected: {queryResult.affectedRows}</span>
                    )}
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="w-full text-left text-xs border-collapse font-mono">
                      <thead className="bg-slate-100 text-slate-700 border-b border-slate-200">
                        <tr>
                          {queryResult.columns.map(col => (
                            <th key={col} className="p-2.5 font-bold uppercase text-[10px] tracking-wider">
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {queryResult.rows.map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            {queryResult.columns.map(col => (
                              <td key={col} className="p-2.5 truncate max-w-xs text-slate-800">
                                {typeof row[col] === 'object' ? JSON.stringify(row[col]) : String(row[col] ?? '')}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: GitHub Pages Deployment Guide */}
      {activeTab === 'github' && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <GitBranch className="w-4 h-4 text-indigo-600" />
              <span>GitHub Pages Deployment Guide</span>
            </h3>
            <button
              onClick={copyGitCommands}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center space-x-1 cursor-pointer transition"
            >
              {copiedGit ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedGit ? 'Copied' : 'Copy Commands'}</span>
            </button>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            This repository is configured to deploy directly to <strong>GitHub Pages</strong> with zero server cost. It features relative asset resolving (<code className="bg-slate-100 px-1 py-0.5 rounded font-mono">base: './'</code>), client-side hash routing, and an automated GitHub Actions deployment workflow.
          </p>

          <div className="space-y-4 text-xs">
            {/* Step 1 */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="font-bold text-slate-900 block">Step 1: Automated Deployment via GitHub Actions (Recommended)</span>
              <p className="text-slate-600">
                A workflow file has been created at <code className="bg-white px-1.5 py-0.5 rounded border font-mono">.github/workflows/deploy.yml</code>. Whenever you push to your repository's <code className="bg-white px-1.5 py-0.5 rounded border font-mono">main</code> branch, GitHub Actions will automatically compile Vite and publish to GitHub Pages!
              </p>
              <div className="text-[11px] text-slate-500">
                Enable it in: <em>GitHub Repo → Settings → Pages → Source: "GitHub Actions"</em>.
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="font-bold text-slate-900 block">Step 2: Manual Deploy via CLI (Optional)</span>
              <p className="text-slate-600">
                You can also run the deployment command from your local terminal:
              </p>
              <pre className="bg-slate-900 text-emerald-400 p-3 rounded-xl font-mono text-[11px] overflow-x-auto">
{`npm run build
npm run deploy`}
              </pre>
            </div>

            {/* Step 3 */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="font-bold text-slate-900 block">Step 3: Turso Environment Secrets (Optional)</span>
              <p className="text-slate-600">
                To connect your production deployment to your Turso SQLite cloud database, add two repository secrets in GitHub:
              </p>
              <ul className="list-disc pl-5 space-y-1 font-mono text-[11px] text-indigo-700">
                <li>VITE_TURSO_DATABASE_URL = libsql://your-db-name.turso.io</li>
                <li>VITE_TURSO_AUTH_TOKEN = your-secret-turso-token</li>
              </ul>
              <p className="text-[11px] text-slate-500">
                Alternatively, users can enter credentials directly inside the Database Settings tab above at runtime.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
