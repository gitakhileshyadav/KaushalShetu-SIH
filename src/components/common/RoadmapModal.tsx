import React from 'react';
import { 
  X, 
  CheckCircle2, 
  Layers, 
  Server, 
  Database, 
  Smartphone, 
  ShieldCheck, 
  Cpu, 
  FileText, 
  Bot, 
  Briefcase, 
  BarChart4 
} from 'lucide-react';

interface RoadmapModalProps {
  onClose: () => void;
}

export const RoadmapModal: React.FC<RoadmapModalProps> = ({ onClose }) => {
  const versions = [
    {
      version: 'V1.0',
      title: 'Foundation, Identity & Trainer Onboarding',
      status: 'Live in this MVP',
      color: 'emerald',
      features: [
        'Role-based Identity: Trainer, Trainee, Admin, Employer',
        'Trainer Course Management with Min. Pass % & Min. Attendance % gates',
        'Trainee Admission: Search, submit request, Trainer Approve/Reject workflow',
        'Trainee Course Dashboard: Read-only overview of admitted programs'
      ]
    },
    {
      version: 'V2.0',
      title: 'Web-Only QR Attendance System',
      status: 'Live in this MVP',
      color: 'emerald',
      features: [
        'Trainer creates Session (Topic, Date, Start/End time, Venue)',
        '30-min time-bound QR Token Generator with live countdown',
        'Trainee mobile/browser camera scanner powered by html5-qrcode',
        'Backend gate validation: token expiry, enrolled & approved check, duplicate check',
        'Attendance percentage calculation per course against min required threshold'
      ]
    },
    {
      version: 'V3.0',
      title: 'Assessment Engine & Cryptographic Certificates',
      status: 'Next Phase',
      color: 'indigo',
      features: [
        'Online MCQs & subjective exams with weighted final score',
        'Auto-eligibility check: Final Score >= Pass% AND Attendance% >= Min Attendance%',
        'Lazy SHA256 generation on first download click (trainee_id + course_id + salt)',
        'Direct ReportLab PDF streaming (no certificate stored in Supabase buckets)',
        'Public verification route /verify/[hash] with QR code scanning'
      ]
    },
    {
      version: 'V4.0',
      title: 'Enhanced LMS & Multimedia Content',
      status: 'Planned',
      color: 'slate',
      features: [
        'Supabase Storage course-assets bucket for video lectures & PDF handouts',
        'Structured chapter & module progress tracker',
        'English / Hindi bilingual UI toggle'
      ]
    },
    {
      version: 'V5.0',
      title: 'Smart Communication (SMTP + AI Chatbot)',
      status: 'Planned',
      color: 'slate',
      features: [
        'Transactional email notifications on admission approval and certificate generation',
        'RAG AI career guidance chatbot for cooperative job and scheme assistance'
      ]
    },
    {
      version: 'V6.0',
      title: 'Employment Exchange (Recruiter Portal)',
      status: 'Planned',
      color: 'slate',
      features: [
        'Employer job posting requiring verified NCCT certificate',
        'Talent search filtered by certificate, score, and state',
        '1-click verified candidate application'
      ]
    },
    {
      version: 'V7.0',
      title: 'Administration, Governance & National Analytics',
      status: 'Planned',
      color: 'slate',
      features: [
        'Apex NCCT Headquarters MIS dashboard for all 14 RICMs and VAMNICOM',
        'District-wise training penetration & placement success metrics',
        'Immutable certificate generation and verification audit logs'
      ]
    },
    {
      version: 'V8.0 (Add-on)',
      title: 'Hardware Location-Based Attendance (GPS Terminal)',
      status: 'Hardware Add-On',
      color: 'amber',
      features: [
        'Raspberry Pi + GPS module + Mini Display terminal at training centers',
        'HTTP REST communication only (POST /api/hardware/attendance with lat/lng)',
        'Geofence verification ensures student was physically in classroom',
        'Same browser camera scanner on mobile reused with zero student app install'
      ]
    }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-white px-6 py-5 flex items-center justify-between border-b border-indigo-900/50">
          <div>
            <span className="bg-emerald-400 text-slate-950 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Architecture Blueprint
            </span>
            <h2 className="text-lg font-black text-white mt-1">NCCT Cooperative Ecosystem Roadmap</h2>
            <p className="text-xs text-indigo-200">
              Full-Stack Architecture: React (Vercel) + FastAPI (Render) + Supabase PostgreSQL
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700">
          {/* Architecture Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center space-x-2 text-indigo-700 font-bold text-xs mb-1">
                <Smartphone className="w-4 h-4" />
                <span>Frontend (Vercel)</span>
              </div>
              <p className="text-[11px] text-slate-500">
                React 19 + Vite + Tailwind CSS. Custom hooks (<code>useAuth</code>, <code>useCourses</code>, <code>useAttendance</code>).
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center space-x-2 text-emerald-700 font-bold text-xs mb-1">
                <Server className="w-4 h-4" />
                <span>Backend (Render)</span>
              </div>
              <p className="text-[11px] text-slate-500">
                FastAPI with OOP architecture: Routers &rarr; Services &rarr; Repositories. ReportLab PDF streaming.
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center space-x-2 text-amber-700 font-bold text-xs mb-1">
                <Database className="w-4 h-4" />
                <span>Database (Supabase)</span>
              </div>
              <p className="text-[11px] text-slate-500">
                PostgreSQL + Row-Level Security. Storage strictly for <code>course-assets</code> (no certificates).
              </p>
            </div>
          </div>

          {/* Version Breakdown */}
          <div className="space-y-3">
            <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              <span>Version by Version Deployment Status</span>
            </h3>

            <div className="space-y-3">
              {versions.map((ver, idx) => (
                <div 
                  key={idx} 
                  className={`p-4 rounded-xl border ${
                    ver.status.includes('Live') 
                      ? 'bg-emerald-50/40 border-emerald-300' 
                      : 'bg-slate-50/70 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${
                        ver.status.includes('Live') 
                          ? 'bg-emerald-600 text-white' 
                          : 'bg-slate-200 text-slate-700'
                      }`}>
                        {ver.version}
                      </span>
                      <strong className="text-slate-900 text-xs">{ver.title}</strong>
                    </div>

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      ver.status.includes('Live')
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : 'bg-slate-200 text-slate-600'
                    }`}>
                      {ver.status}
                    </span>
                  </div>

                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] text-slate-600">
                    {ver.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-start space-x-1.5">
                        <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${ver.status.includes('Live') ? 'text-emerald-600' : 'text-slate-400'}`} />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Critical Architecture Rules Reminder */}
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 space-y-1.5">
            <h4 className="font-bold text-indigo-950 text-xs uppercase tracking-wider flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>Critical Architectural Mandates (Enforced in Code)</span>
            </h4>
            <ul className="list-disc list-inside text-[11px] text-indigo-900 space-y-1">
              <li><strong>Zero Certificate Storage:</strong> PDF certificates are generated on-the-fly via ReportLab and streamed to the client — never saved in Supabase buckets.</li>
              <li><strong>Lazy Hashing:</strong> SHA256 cryptographic verification hashes are computed lazily on user download to preserve database compute.</li>
              <li><strong>HTTP-Only Hardware Terminal:</strong> Future Raspberry Pi GPS attendance devices connect solely via HTTP REST APIs (no complex WebSockets/MQTT).</li>
              <li><strong>Separation of Free Tiers:</strong> Vercel (Frontend) + Render (FastAPI) + Supabase (PostgreSQL) maximize independent free quotas.</li>
            </ul>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
          >
            Close Blueprint
          </button>
        </div>
      </div>
    </div>
  );
};
