import React from 'react';
import { 
  Building2, 
  BookOpen, 
  Users, 
  ShieldCheck, 
  Award, 
  QrCode, 
  Database, 
  Sparkles, 
  CheckCircle2 
} from 'lucide-react';

export const HomePage: React.FC = () => {
  return (
    <div className="space-y-8 pb-12">
      {/* Official NCCT Introduction Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white p-8 sm:p-12 border border-indigo-800/40 shadow-xl">
        <div className="relative z-10 max-w-4xl space-y-4">
          <div className="inline-flex items-center space-x-2 bg-indigo-500/20 border border-indigo-400/30 rounded-full px-3.5 py-1 text-xs font-medium text-amber-300 backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ministry of Cooperation • National Council for Cooperative Training (NCCT)</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Cooperative Training & Certification Ecosystem
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-3xl">
            A unified national platform dedicated to empowering 850,000+ Primary Agricultural Credit Societies (PACS), multi-state cooperative societies, and rural agricultural workers across India through accredited vocational training, tamper-proof QR attendance tracking, and verified credential management.
          </p>
        </div>
      </div>

      {/* Project Aim & Core Objectives */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold border border-indigo-200">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Project Aim & Vision</h2>
            <p className="text-xs text-slate-500">Transforming cooperative education through digital governance</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-2">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Standardized Curriculum</span>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Delivering standardized certification programs formulated by VAMNICOM Pune and Regional Institutes of Cooperative Management (RICM) covering PACS computerization, dairy processing, microfinance, poultry husbandry, and solar microgrids.
            </p>
          </div>

          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-2">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Transparent Attendance & Examinations</span>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Enforcing rigorous 75% minimum attendance thresholds using dynamic daily session QR code scans, coupled with secure online multi-choice assessments to guarantee vocational competency.
            </p>
          </div>

          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-2">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Verifiable Digital Certificates</span>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Issuing tamper-proof certificates embedded with unique QR verification codes, enabling employers and financial institutions to instantly validate trainee qualifications.
            </p>
          </div>

          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-2">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Direct Placement Integration</span>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Connecting certified cooperative trainees directly with verified agricultural employers and cooperative federations (such as IFFCO and KRIBHCO) through dedicated job placement portals.
            </p>
          </div>
        </div>
      </div>

      {/* Key Platform Features */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold border border-amber-200">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Platform Features & Architecture</h2>
            <p className="text-xs text-slate-500">Comprehensive modules designed for seamless stakeholder coordination</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-slate-900">Course Catalog & Admissions</h3>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Centralized repository of approved curriculum programs with structured study materials, PDF chapters, and admission request workflows.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <QrCode className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-slate-900">QR Attendance & Verification</h3>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Secure QR scanning system for trainers and trainees to log daily class attendance and verify certificate authenticity in real time.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-3">
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-slate-900">Secure Turso SQLite Cloud</h3>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Robust persistence architecture supporting both local storage fallback and enterprise Turso SQLite cloud database synchronization.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
