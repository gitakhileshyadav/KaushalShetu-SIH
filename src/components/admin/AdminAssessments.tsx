import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Building2, 
  Award, 
  CheckCircle2, 
  AlertCircle, 
  BarChart3, 
  TrendingUp, 
  Users, 
  ShieldCheck, 
  ExternalLink, 
  Copy, 
  Check, 
  Cloud, 
  Terminal, 
  Globe, 
  Sparkles,
  Server
} from 'lucide-react';

export const AdminAssessments: React.FC = () => {
  const { 
    assessments, 
    submissions, 
    courses, 
    allUsers, 
    attendanceLogs 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'analytics' | 'vercel_deploy'>('analytics');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const totalExamsTaken = submissions.length;
  const passedExams = submissions.filter(s => s.passed).length;
  const nationalPassRate = totalExamsTaken > 0 ? Math.round((passedExams / totalExamsTaken) * 100) : 0;
  const averageScore = totalExamsTaken > 0 
    ? Math.round(submissions.reduce((acc, s) => acc + s.scorePct, 0) / totalExamsTaken) 
    : 0;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2500);
  };

  const vercelJsonSnippet = `{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "SAMEORIGIN" }
      ]
    }
  ]
}`;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-indigo-900/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Apex Governance MIS
            </span>
            <span className="text-xs text-indigo-200">National Council for Cooperative Training</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            National Assessment MIS & Vercel Cloud Hub
          </h2>
          <p className="text-xs sm:text-sm text-indigo-200 max-w-xl leading-relaxed">
            Centralized monitoring of vocational assessment scores, Poultry & Electrician competency rates, and automated deployment pipelines for Vercel and GitHub.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={() => setActiveTab('vercel_deploy')}
            className="px-5 py-3 bg-white text-slate-950 hover:bg-slate-100 font-bold rounded-2xl text-xs transition flex items-center space-x-2 shadow-lg cursor-pointer"
          >
            <Cloud className="w-4 h-4 text-indigo-600" />
            <span>Vercel Auto-Deploy Hub</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 space-x-2">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'analytics'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          National Assessment Metrics
        </button>
        <button
          onClick={() => setActiveTab('vercel_deploy')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'vercel_deploy'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          Vercel Auto-Deployment & CI/CD Hub
        </button>
      </div>

      {/* VIEW 1: ASSESSMENT ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Key Metric Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Exam Attempts</span>
              <div className="text-3xl font-black text-slate-900">{totalExamsTaken}</div>
              <span className="text-[11px] text-indigo-600 font-semibold">Across all NCCT Institutes</span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">National Pass Rate</span>
              <div className="text-3xl font-black text-emerald-600">{nationalPassRate}%</div>
              <span className="text-[11px] text-emerald-700 font-semibold">{passedExams} Certified Trainees</span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Average Test Score</span>
              <div className="text-3xl font-black text-indigo-600">{averageScore}%</div>
              <span className="text-[11px] text-slate-500 font-medium">Out of 100% maximum</span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Question Bank Size</span>
              <div className="text-3xl font-black text-amber-500">
                {assessments.reduce((acc, a) => acc + a.questions.length, 0)}
              </div>
              <span className="text-[11px] text-amber-700 font-semibold">Peer-reviewed items</span>
            </div>
          </div>

          {/* Trade-by-Trade Performance Breakdown */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3">
              Trade-by-Trade Assessment Performance & Pass Rates
            </h3>

            <div className="space-y-3">
              {courses.map(course => {
                const asm = assessments.find(a => a.courseId === course.id);
                const courseSubs = submissions.filter(s => s.courseId === course.id);
                const coursePassed = courseSubs.filter(s => s.passed).length;
                const passRate = courseSubs.length > 0 ? Math.round((coursePassed / courseSubs.length) * 100) : 0;
                const avgScore = courseSubs.length > 0 
                  ? Math.round(courseSubs.reduce((acc, s) => acc + s.scorePct, 0) / courseSubs.length)
                  : 0;

                return (
                  <div key={course.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="bg-indigo-100 text-indigo-800 text-[10px] font-bold px-2 py-0.5 rounded-md">
                            {course.code}
                          </span>
                          <h4 className="text-sm font-bold text-slate-900">{course.title}</h4>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{course.institute}</p>
                      </div>

                      <div className="flex items-center space-x-4 text-xs">
                        <div className="text-right">
                          <span className="font-bold text-slate-700 block">{courseSubs.length} Candidates</span>
                          <span className="text-[10px] text-slate-400">Attempts</span>
                        </div>
                        <div className="text-right">
                          <span className="font-black text-emerald-600 text-sm block">{passRate}%</span>
                          <span className="text-[10px] text-slate-400">Pass Rate</span>
                        </div>
                      </div>
                    </div>

                    {/* Progress visualizer */}
                    <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full rounded-full transition-all"
                        style={{ width: `${passRate}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: VERCEL AUTO-DEPLOYMENT HUB */}
      {activeTab === 'vercel_deploy' && (
        <div className="space-y-6">
          {/* Vercel Overview Callout */}
          <div className="bg-slate-950 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-white text-black flex items-center justify-center font-black text-xl shadow-lg">
                  ▲
                </div>
                <div>
                  <h3 className="text-xl font-black text-white">Vercel Auto-Deployment Configured</h3>
                  <p className="text-xs text-slate-400">
                    Single-Page Application rewrites, cache headers, and Vite production bundle are pre-configured.
                  </p>
                </div>
              </div>

              <a
                href="https://vercel.com/new"
                target="_blank"
                rel="noreferrer"
                className="px-5 py-2.5 bg-white hover:bg-slate-100 text-black font-extrabold rounded-xl text-xs transition flex items-center space-x-2 shrink-0 shadow-lg cursor-pointer"
              >
                <span>Deploy to Vercel Now</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="bg-slate-900 p-3.5 rounded-2xl border border-slate-800 text-xs space-y-1">
                <div className="text-emerald-400 font-bold flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>vercel.json Rewrites</span>
                </div>
                <p className="text-slate-400 text-[11px]">Routes all requests to index.html to prevent 404 on reload.</p>
              </div>

              <div className="bg-slate-900 p-3.5 rounded-2xl border border-slate-800 text-xs space-y-1">
                <div className="text-emerald-400 font-bold flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Zero-Config Vite Build</span>
                </div>
                <p className="text-slate-400 text-[11px]">Builds static bundle to dist/ with hash-based asset caching.</p>
              </div>

              <div className="bg-slate-900 p-3.5 rounded-2xl border border-slate-800 text-xs space-y-1">
                <div className="text-emerald-400 font-bold flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Continuous Deployment</span>
                </div>
                <p className="text-slate-400 text-[11px]">Auto-deploys on every git commit pushed to main/master branch.</p>
              </div>
            </div>
          </div>

          {/* Configuration Code Inspector */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Terminal className="w-4 h-4 text-indigo-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Root vercel.json Deployment File
                </h4>
              </div>

              <button
                onClick={() => copyToClipboard(vercelJsonSnippet, 'snippet')}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center space-x-1.5 cursor-pointer"
              >
                {copiedText === 'snippet' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedText === 'snippet' ? 'Copied!' : 'Copy Snippet'}</span>
              </button>
            </div>

            <pre className="bg-slate-950 text-slate-200 p-4 rounded-2xl text-xs font-mono overflow-x-auto">
              {vercelJsonSnippet}
            </pre>
          </div>

          {/* Command Line Deployment Instructions */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              CLI Deployment Instructions
            </h4>
            <div className="space-y-2 text-xs text-slate-700">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 font-mono text-[11px] flex items-center justify-between">
                <span>npm i -g vercel && vercel --prod</span>
                <button
                  onClick={() => copyToClipboard('npm i -g vercel && vercel --prod', 'cli')}
                  className="text-indigo-600 hover:underline font-sans font-bold cursor-pointer"
                >
                  {copiedText === 'cli' ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <p className="text-slate-500">
                Run the command above in your terminal, or import your repository directly on the Vercel dashboard.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
