import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Course } from '../../types';
import { X, CalendarPlus, Clock, MapPin } from 'lucide-react';

interface CreateSessionModalProps {
  course?: Course;
  onClose: () => void;
}

export const CreateSessionModal: React.FC<CreateSessionModalProps> = ({ course, onClose }) => {
  const { createSession, courses, currentUser } = useApp();

  const trainerCourses = courses.filter(c => c.trainerId === currentUser.id || currentUser.role === 'admin');
  const [courseId, setCourseId] = useState<string>(course?.id || trainerCourses[0]?.id || '');
  const [topic, setTopic] = useState('');
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('10:00 AM');
  const [endTime, setEndTime] = useState('11:30 AM');
  const [venue, setVenue] = useState('Computer Lab 1, VAMNICOM');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || !courseId) return;

    createSession({
      courseId,
      topic: topic.trim(),
      sessionDate,
      startTime,
      endTime,
      venue
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center border border-indigo-400/30">
              <CalendarPlus className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Schedule Training Session</h2>
              <p className="text-[11px] text-slate-300">V2.0 QR Attendance Session</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Select Course *
            </label>
            <select
              value={courseId}
              onChange={e => setCourseId(e.target.value)}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500"
            >
              {trainerCourses.map(c => (
                <option key={c.id} value={c.id}>
                  {c.title} ({c.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Session Topic / Module *
            </label>
            <input
              type="text"
              required
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder="e.g. Module 4: Cooperative Audit & Balance Sheet Analysis"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Date
              </label>
              <input
                type="date"
                required
                value={sessionDate}
                onChange={e => setSessionDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Start Time
              </label>
              <input
                type="text"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                placeholder="10:00 AM"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                End Time
              </label>
              <input
                type="text"
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
                placeholder="11:30 AM"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Venue / Classroom
            </label>
            <div className="relative">
              <input
                type="text"
                value={venue}
                onChange={e => setVenue(e.target.value)}
                placeholder="e.g. Auditorium Hall B, RICM Gandhinagar"
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
              />
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
            >
              Schedule & Open for QR
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
