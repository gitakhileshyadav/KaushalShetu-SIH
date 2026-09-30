import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AdminUserApprovals } from './AdminUserApprovals';
import { AdminCourseApprovals } from './AdminCourseApprovals';
import { 
  Building2, 
  Users, 
  BookOpen, 
  CheckCircle2, 
  ShieldAlert, 
  BarChart3, 
  Layers, 
  Clock,
  UserCheck,
  Award,
  ShieldCheck,
  FileCheck
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { courses, enrollments, sessions, attendanceLogs, allUsers, navigateTo } = useApp();
  const [activeTab, setActiveTab] = useState<'approvals' | 'courses_accreditation' | 'institutes' | 'audit_log'>('approvals');

  const trainers = allUsers.filter(u => u.role === 'trainer');
  const trainees = allUsers.filter(u => u.role === 'trainee');
  const pendingUsers = allUsers.filter(u => u.status === 'pending_approval');
  const pendingCourses = courses.filter(c => c.approvalStatus === 'pending_approval');

  // Institutes representation
  const institutes = [
    { name: 'VAMNICOM, Pune (National Apex)', city: 'Pune, Maharashtra', activeCourses: 2, trainers: 1 },
    { name: 'RICM Gandhinagar', city: 'Gandhinagar, Gujarat', activeCourses: 1, trainers: 1 },
    { name: 'RICM Bengaluru', city: 'Bengaluru, Karnataka', activeCourses: 1, trainers: 1 },
    { name: 'RICM Chandigarh', city: 'Chandigarh, Punjab', activeCourses: 1, trainers: 1 },
    { name: 'RICM Kalyani', city: 'Kolkata, West Bengal', activeCourses: 1, trainers: 1 },
    { name: 'ICM Dehradun', city: 'Dehradun, Uttarakhand', activeCourses: 1, trainers: 0 }
  ];

  return (
    <div className="space-y-6">
      {/* Admin Hero Header */}
      <div className="bg-slate-900 rounded-3xl text-white p-6 sm:p-8 shadow-xl border border-slate-800">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="bg-rose-500 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Headquarters Governance • NCCT Apex
              </span>
              <span className="text-xs text-slate-400">Directorate of Cooperative Training</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-2">
              National Apex Administrative MIS
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1 leading-relaxed">
              Verify trainee and faculty applicant registrations, accredit curriculum proposals, audit attendance integrity, and manage jurisdiction-isolated data across all 15 RICM institutes.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setActiveTab('approvals')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-md cursor-pointer ${
                pendingUsers.length > 0 ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 animate-pulse' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>{pendingUsers.length} Registration Approvals</span>
            </button>

            <button
              onClick={() => setActiveTab('courses_accreditation')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-md cursor-pointer ${
                pendingCourses.length > 0 ? 'bg-indigo-600 hover:bg-indigo-500 text-white animate-pulse' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
              }`}
            >
              <FileCheck className="w-4 h-4" />
              <span>{pendingCourses.length} Course Approvals</span>
            </button>
          </div>
        </div>

        {/* Global MIS counter metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">Apex & RICM Institutes</span>
            <span className="text-xl font-black text-white">15 Units</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Registered Trainers</span>
            <span className="text-xl font-black text-indigo-400">{trainers.length} Faculty</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Enrolled Trainees</span>
            <span className="text-xl font-black text-emerald-400">{trainees.length} Trainees</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Verified QR Scans</span>
            <span className="text-xl font-black text-amber-400">{attendanceLogs.length} Scans</span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 space-x-2 sm:space-x-4 overflow-x-auto">
        <button
          onClick={() => setActiveTab('approvals')}
          className={`pb-3 px-3 sm:px-4 text-xs sm:text-sm font-bold border-b-2 flex items-center space-x-2 transition cursor-pointer shrink-0 ${
            activeTab === 'approvals'
              ? 'border-indigo-600 text-indigo-700'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <UserCheck className="w-4 h-4 text-amber-600" />
          <span>Registration Approvals</span>
          {pendingUsers.length > 0 && (
            <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-1.5 py-0.5 rounded-full">
              {pendingUsers.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('courses_accreditation')}
          className={`pb-3 px-3 sm:px-4 text-xs sm:text-sm font-bold border-b-2 flex items-center space-x-2 transition cursor-pointer shrink-0 ${
            activeTab === 'courses_accreditation'
              ? 'border-indigo-600 text-indigo-700'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <BookOpen className="w-4 h-4 text-indigo-600" />
          <span>Course Accreditation Desk</span>
          {pendingCourses.length > 0 && (
            <span className="bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {pendingCourses.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('institutes')}
          className={`pb-3 px-3 sm:px-4 text-xs sm:text-sm font-bold border-b-2 flex items-center space-x-2 transition cursor-pointer shrink-0 ${
            activeTab === 'institutes'
              ? 'border-indigo-600 text-indigo-700'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Institute Network</span>
        </button>

        <button
          onClick={() => setActiveTab('audit_log')}
          className={`pb-3 px-3 sm:px-4 text-xs sm:text-sm font-bold border-b-2 flex items-center space-x-2 transition cursor-pointer shrink-0 ${
            activeTab === 'audit_log'
              ? 'border-indigo-600 text-indigo-700'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>National QR Attendance Audit ({attendanceLogs.length})</span>
        </button>
      </div>

      {/* Tab 1: User Profile Approvals */}
      {activeTab === 'approvals' && (
        <AdminUserApprovals />
      )}

      {/* Tab 2: Course Accreditation */}
      {activeTab === 'courses_accreditation' && (
        <AdminCourseApprovals />
      )}

      {/* Tab 3: Institutes Network */}
      {activeTab === 'institutes' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Cooperative Training Institute Network</h3>
            <span className="text-xs text-slate-500">Master Data Management</span>
          </div>
          <div className="divide-y divide-slate-100">
            {institutes.map((inst, idx) => (
              <div key={idx} className="p-4 sm:px-6 flex items-center justify-between text-xs hover:bg-slate-50">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{inst.name}</p>
                    <p className="text-slate-400">{inst.city}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="bg-indigo-50 text-indigo-700 font-semibold px-2 py-0.5 rounded text-[11px]">
                    {inst.activeCourses} Active Programs
                  </span>
                  <span className="text-slate-500 font-medium">
                    {inst.trainers} Faculty
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Global Attendance Audit Log */}
      {activeTab === 'audit_log' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">National QR Attendance Audit Feed</h3>
            <span className="text-xs text-emerald-600 font-semibold">Immutable Real-Time Logs</span>
          </div>
          <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
            {attendanceLogs.map(log => (
              <div key={log.id} className="p-3.5 sm:px-6 flex items-center justify-between text-xs hover:bg-slate-50">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-800">{log.traineeName}</span>
                    <span className="text-[10px] font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                      ID: {log.traineeId}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                    Course: {log.courseId} • Scanned: {new Date(log.scannedAt).toLocaleTimeString()} • IP: {log.ipAddress} • {log.method}
                  </p>
                </div>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Cryptographically Valid
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
