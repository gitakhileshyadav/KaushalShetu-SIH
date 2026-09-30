import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserProfile, UserRole } from '../../types';
import { 
  Users, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search, 
  Filter, 
  ShieldCheck, 
  GraduationCap, 
  Briefcase, 
  User, 
  Phone, 
  Mail, 
  Building2, 
  FileText, 
  Sparkles,
  AlertCircle,
  ExternalLink
} from 'lucide-react';

export const AdminUserApprovals: React.FC = () => {
  const { allUsers, approveUserProfile, rejectUserProfile, updateUserRole, switchUser, navigateTo } = useApp();

  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserForDetail, setSelectedUserForDetail] = useState<UserProfile | null>(null);
  const [rejectReasonInput, setRejectReasonInput] = useState('');
  const [rejectingUserId, setRejectingUserId] = useState<string | null>(null);

  const pendingUsers = allUsers.filter(u => u.status === 'pending_approval');
  const approvedUsers = allUsers.filter(u => u.status === 'approved');
  const rejectedUsers = allUsers.filter(u => u.status === 'rejected');

  const filteredUsers = allUsers.filter(u => {
    // Status filter
    if (statusFilter === 'pending' && u.status !== 'pending_approval') return false;
    if (statusFilter === 'approved' && u.status !== 'approved') return false;
    if (statusFilter === 'rejected' && u.status !== 'rejected') return false;

    // Role filter
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = u.fullName.toLowerCase().includes(q);
      const matchUsername = u.username.toLowerCase().includes(q);
      const matchInstitute = u.institute.toLowerCase().includes(q);
      const matchEmail = u.email.toLowerCase().includes(q);
      return matchName || matchUsername || matchInstitute || matchEmail;
    }

    return true;
  });

  const handleApprove = (userId: string) => {
    approveUserProfile(userId, 'Approved by NCCT National Directorate');
  };

  const handleConfirmReject = () => {
    if (!rejectingUserId) return;
    rejectUserProfile(rejectingUserId, rejectReasonInput || 'Application documents did not satisfy NCCT affiliation criteria.');
    setRejectingUserId(null);
    setRejectReasonInput('');
  };

  return (
    <div className="space-y-6">
      {/* Top summary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div 
          onClick={() => setStatusFilter('pending')}
          className={`p-4 rounded-2xl border transition cursor-pointer ${
            statusFilter === 'pending' 
              ? 'bg-amber-500/10 border-amber-500 ring-2 ring-amber-400/20' 
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">Pending Review</span>
            <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <span className="text-2xl font-black text-amber-600 mt-2 block">{pendingUsers.length}</span>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Awaiting admin verification</span>
        </div>

        <div 
          onClick={() => setStatusFilter('approved')}
          className={`p-4 rounded-2xl border transition cursor-pointer ${
            statusFilter === 'approved' 
              ? 'bg-emerald-500/10 border-emerald-500 ring-2 ring-emerald-400/20' 
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">Approved Profiles</span>
            <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <span className="text-2xl font-black text-emerald-600 mt-2 block">{approvedUsers.length}</span>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Active across 15 RICM institutes</span>
        </div>

        <div 
          onClick={() => setStatusFilter('rejected')}
          className={`p-4 rounded-2xl border transition cursor-pointer ${
            statusFilter === 'rejected' 
              ? 'bg-rose-500/10 border-rose-500 ring-2 ring-rose-400/20' 
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-900 uppercase tracking-wider">Declined Requests</span>
            <div className="w-6 h-6 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xs">
              <XCircle className="w-3.5 h-3.5" />
            </div>
          </div>
          <span className="text-2xl font-black text-rose-600 mt-2 block">{rejectedUsers.length}</span>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Incomplete / non-affiliated</span>
        </div>

        <div 
          onClick={() => setStatusFilter('all')}
          className={`p-4 rounded-2xl border transition cursor-pointer ${
            statusFilter === 'all' 
              ? 'bg-indigo-500/10 border-indigo-500 ring-2 ring-indigo-400/20' 
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-900 uppercase tracking-wider">Total Registered</span>
            <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <span className="text-2xl font-black text-slate-900 mt-2 block">{allUsers.length}</span>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Complete national ledger</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by legal name, username, mobile, institute..."
            className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs font-bold text-slate-500 shrink-0">Role Filter:</span>
          {(['all', 'trainee', 'trainer', 'employer', 'admin'] as const).map(r => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition capitalize shrink-0 cursor-pointer ${
                roleFilter === r
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* User cards list */}
      <div className="space-y-3">
        {filteredUsers.length > 0 ? (
          filteredUsers.map(user => {
            const isPending = user.status === 'pending_approval';
            const isApproved = user.status === 'approved';
            const isRejected = user.status === 'rejected';

            return (
              <div 
                key={user.id}
                className={`bg-white rounded-2xl border transition p-4 sm:p-5 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 ${
                  isPending ? 'border-amber-300 bg-amber-50/20' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start space-x-3.5">
                  <div className="relative shrink-0">
                    <img 
                      src={user.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80'} 
                      alt={user.fullName}
                      className="w-11 h-11 rounded-2xl object-cover border border-slate-200"
                    />
                    <div className="absolute -bottom-1 -right-1">
                      {user.role === 'trainer' && <span className="bg-indigo-600 text-white p-0.5 rounded-full block"><GraduationCap className="w-2.5 h-2.5" /></span>}
                      {user.role === 'trainee' && <span className="bg-emerald-600 text-white p-0.5 rounded-full block"><User className="w-2.5 h-2.5" /></span>}
                      {user.role === 'employer' && <span className="bg-blue-600 text-white p-0.5 rounded-full block"><Briefcase className="w-2.5 h-2.5" /></span>}
                      {user.role === 'admin' && <span className="bg-slate-900 text-white p-0.5 rounded-full block"><ShieldCheck className="w-2.5 h-2.5" /></span>}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900">{user.fullName}</h4>
                      <span className="font-mono text-xs text-slate-500">@{user.username}</span>

                      {/* Status badge */}
                      {isPending && (
                        <span className="inline-flex items-center space-x-1 bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-md text-[10px]">
                          <Clock className="w-3 h-3 text-amber-600" />
                          <span>Pending Admin Approval</span>
                        </span>
                      )}
                      {isApproved && (
                        <span className="inline-flex items-center space-x-1 bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-md text-[10px]">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Approved & Verified</span>
                        </span>
                      )}
                      {isRejected && (
                        <span className="inline-flex items-center space-x-1 bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded-md text-[10px]">
                          <XCircle className="w-3 h-3 text-rose-600" />
                          <span>Declined</span>
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                      <span className="flex items-center space-x-1">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>{user.institute}</span>
                      </span>
                      <span className="flex items-center space-x-1 font-mono">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{user.mobileNumber}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span>{user.email}</span>
                      </span>
                      {user.qualification && (
                        <span className="text-slate-500">
                          Edu: <strong>{user.qualification}</strong>
                        </span>
                      )}
                    </div>

                    {/* Additional application details */}
                    {(user.applicationReason || user.idProofType) && (
                      <div className="mt-1.5 pt-1.5 border-t border-slate-100 text-[11px] text-slate-600 space-y-0.5">
                        {user.idProofType && (
                          <p>
                            <span className="font-semibold text-slate-700">Identity Reference:</span> {user.idProofType} {user.idProofNumber ? `(${user.idProofNumber})` : ''}
                          </p>
                        )}
                        {user.applicationReason && (
                          <p className="italic text-slate-500">
                            "{user.applicationReason}"
                          </p>
                        )}
                        {user.rejectionReason && (
                          <p className="text-rose-600 font-semibold">
                            Declined reason: {user.rejectionReason}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right actions */}
                <div className="flex flex-wrap items-center gap-2 self-end lg:self-center shrink-0">
                  {/* Change role selector if admin wants to correct role before approving */}
                  <div className="flex items-center space-x-1 text-xs">
                    <span className="text-slate-400 text-[11px]">Role:</span>
                    <select
                      value={user.role}
                      onChange={e => updateUserRole(user.id, e.target.value as UserRole)}
                      className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="trainee">Trainee</option>
                      <option value="trainer">Trainer</option>
                      <option value="employer">Employer</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                  {isPending && (
                    <>
                      <button
                        onClick={() => handleApprove(user.id)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1 shadow-xs cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approve Profile</span>
                      </button>

                      <button
                        onClick={() => setRejectingUserId(user.id)}
                        className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold transition flex items-center space-x-1 cursor-pointer"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Decline</span>
                      </button>
                    </>
                  )}

                  {isApproved && (
                    <button
                      onClick={() => {
                        switchUser(user.id);
                        if (user.role === 'trainer') navigateTo('trainer');
                        else if (user.role === 'trainee') navigateTo('trainee');
                        else if (user.role === 'employer') navigateTo('employer');
                      }}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center space-x-1 cursor-pointer"
                      title="Test-drive this approved user perspective"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Switch to User</span>
                    </button>
                  )}

                  {isRejected && (
                    <button
                      onClick={() => handleApprove(user.id)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                    >
                      <span>Reconsider & Approve</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 text-xs">
            No applicant profiles found matching the selected filters.
          </div>
        )}
      </div>

      {/* Reject reason modal */}
      {rejectingUserId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center space-x-2 text-rose-600">
              <XCircle className="w-5 h-5" />
              <h3 className="font-bold text-base text-slate-900">Decline Application Registration</h3>
            </div>
            <p className="text-xs text-slate-600">
              Please enter the official NCCT reason for declining this profile. The applicant will see this explanation upon login.
            </p>
            <textarea
              rows={3}
              value={rejectReasonInput}
              onChange={e => setRejectReasonInput(e.target.value)}
              placeholder="e.g. Identity documentation mismatch or non-affiliated institution."
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
            />
            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => {
                  setRejectingUserId(null);
                  setRejectReasonInput('');
                }}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-4 py-1.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition cursor-pointer"
              >
                Confirm Decline
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
