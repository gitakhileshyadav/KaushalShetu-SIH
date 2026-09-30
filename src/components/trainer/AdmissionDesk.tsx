import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Check, 
  X, 
  Search, 
  UserCheck, 
  Clock, 
  AlertCircle, 
  UserPlus, 
  Building2,
  Mail,
  Phone
} from 'lucide-react';

export const AdmissionDesk: React.FC = () => {
  const { enrollments, courses, allUsers, decideAdmission, requestAdmission, currentUser } = useApp();
  const [selectedCourseId, setSelectedCourseId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);

  // Invite state
  const [inviteTraineeId, setInviteTraineeId] = useState<string>('');
  const [inviteCourseId, setInviteCourseId] = useState<string>('');
  const [inviteFeedback, setInviteFeedback] = useState<string | null>(null);

  const trainerCourses = courses.filter(c => c.trainerId === currentUser.id || currentUser.role === 'admin');
  const trainerCourseIds = trainerCourses.map(c => c.id);

  // Enrollments for this trainer's courses
  const relevantEnrollments = enrollments.filter(e => {
    const matchesCourse = selectedCourseId === 'all' 
      ? trainerCourseIds.includes(e.courseId) 
      : e.courseId === selectedCourseId;
    
    if (!matchesCourse) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        e.traineeName.toLowerCase().includes(q) ||
        e.traineeEmail.toLowerCase().includes(q) ||
        e.traineeMobile.includes(q)
      );
    }
    return true;
  });

  const pendingList = relevantEnrollments.filter(e => e.status === 'pending_approval');
  const approvedList = relevantEnrollments.filter(e => e.status === 'approved');
  const rejectedList = relevantEnrollments.filter(e => e.status === 'rejected');

  const traineesOnly = allUsers.filter(u => u.role === 'trainee');

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteTraineeId || !inviteCourseId) return;

    const res = requestAdmission(inviteCourseId, 'Trainer direct admission recommendation', inviteTraineeId);
    setInviteFeedback(res.message);
    if (res.success) {
      setTimeout(() => {
        setShowInviteModal(false);
        setInviteFeedback(null);
      }, 1500);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top action & filter bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by trainee name, mobile, email..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <select
            value={selectedCourseId}
            onChange={e => setSelectedCourseId(e.target.value)}
            className="px-3 py-1.5 border border-slate-300 rounded-xl text-xs bg-white text-slate-700 font-medium focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All My Courses</option>
            {trainerCourses.map(c => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
        </div>

        <button
          onClick={() => {
            setInviteCourseId(trainerCourses[0]?.id || '');
            setInviteTraineeId(traineesOnly[0]?.id || '');
            setShowInviteModal(true);
          }}
          className="w-full sm:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 shadow-sm cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Admit New Trainee</span>
        </button>
      </div>

      {/* Summary KPI Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-amber-800">Pending Approval</p>
            <p className="text-2xl font-black text-amber-900 mt-1">{pendingList.length}</p>
          </div>
          <Clock className="w-8 h-8 text-amber-500/60" />
        </div>
        <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-emerald-800">Approved Trainees</p>
            <p className="text-2xl font-black text-emerald-900 mt-1">{approvedList.length}</p>
          </div>
          <UserCheck className="w-8 h-8 text-emerald-500/60" />
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-600">Total Enrolled Registry</p>
            <p className="text-2xl font-black text-slate-800 mt-1">{relevantEnrollments.length}</p>
          </div>
          <Building2 className="w-8 h-8 text-slate-400" />
        </div>
      </div>

      {/* Pending Requests Section (Primary Focus) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-bold text-slate-900">Admission Requests Awaiting Action</h3>
            <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-0.5 rounded-full border border-amber-200">
              {pendingList.length} Pending
            </span>
          </div>
          <span className="text-xs text-slate-400">V1.0 Admission Workflow</span>
        </div>

        {pendingList.length > 0 ? (
          <div className="divide-y divide-slate-200">
            {pendingList.map(enr => {
              const c = courses.find(item => item.id === enr.courseId);
              return (
                <div key={enr.id} className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-900 text-sm">{enr.traineeName}</span>
                      <span className="bg-amber-100 text-amber-800 text-[10px] font-semibold px-2 py-0.5 rounded-md">
                        Awaiting Trainer Review
                      </span>
                    </div>
                    <p className="text-xs text-indigo-700 font-medium">
                      Course: <strong>{c?.title || 'Cooperative Course'}</strong> ({c?.code})
                    </p>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
                      <span className="flex items-center space-x-1">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span>{enr.traineeEmail}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{enr.traineeMobile}</span>
                      </span>
                      <span className="text-slate-400">
                        Requested: {new Date(enr.requestedAt).toLocaleDateString()}
                      </span>
                    </div>
                    {enr.notes && (
                      <p className="text-[11px] text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md mt-1 italic">
                        Note: "{enr.notes}"
                      </p>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 w-full sm:w-auto shrink-0">
                    <button
                      onClick={() => decideAdmission(enr.id, 'rejected')}
                      className="flex-1 sm:flex-none px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                    <button
                      onClick={() => decideAdmission(enr.id, 'approved')}
                      className="flex-1 sm:flex-none px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1 shadow-xs cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve Admission</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center text-slate-400 text-xs">
            <Check className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            <p className="font-semibold text-slate-600">All pending admission requests have been addressed!</p>
            <p className="mt-0.5">Use "Admit New Trainee" above or have trainees request admission from their catalog.</p>
          </div>
        )}
      </div>

      {/* Approved Trainee Registry */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Approved Trainees Roster ({approvedList.length})</h3>
          <span className="text-xs text-emerald-600 font-semibold">Eligible to scan QR attendance</span>
        </div>

        {approvedList.length > 0 ? (
          <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
            {approvedList.map(enr => {
              const c = courses.find(item => item.id === enr.courseId);
              return (
                <div key={enr.id} className="p-3.5 sm:px-6 flex items-center justify-between text-xs hover:bg-slate-50 transition">
                  <div>
                    <span className="font-bold text-slate-800 text-sm">{enr.traineeName}</span>
                    <p className="text-slate-500 text-[11px]">
                      {enr.traineeEmail} • {enr.traineeMobile}
                    </p>
                    <p className="text-indigo-600 font-medium mt-0.5 text-[11px]">
                      {c?.title}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full text-[10px]">
                      Approved
                    </span>
                    <p className="text-slate-400 text-[10px] mt-1">
                      Admitted: {enr.decidedAt ? new Date(enr.decidedAt).toLocaleDateString() : 'Active'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-6 text-center text-slate-400 text-xs">No approved trainees yet for selected filter.</div>
        )}
      </div>

      {/* Direct Admission Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">Admit Trainee to Course</h3>
              <button onClick={() => setShowInviteModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendInvite} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Select Trainee</label>
                <select
                  value={inviteTraineeId}
                  onChange={e => setInviteTraineeId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-indigo-500"
                >
                  {traineesOnly.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.fullName} ({t.mobileNumber}) - {t.institute}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Target Course</label>
                <select
                  value={inviteCourseId}
                  onChange={e => setInviteCourseId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-indigo-500"
                >
                  {trainerCourses.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.title} ({c.code})
                    </option>
                  ))}
                </select>
              </div>

              {inviteFeedback && (
                <div className="p-2.5 rounded-lg bg-indigo-50 text-indigo-800 text-xs font-medium">
                  {inviteFeedback}
                </div>
              )}

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                >
                  Submit Admission
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
