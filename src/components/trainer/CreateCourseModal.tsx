import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, BookPlus, Percent, CheckCircle2 } from 'lucide-react';

interface CreateCourseModalProps {
  onClose: () => void;
}

export const CreateCourseModal: React.FC<CreateCourseModalProps> = ({ onClose }) => {
  const { createCourse, currentUser } = useApp();

  const [title, setTitle] = useState('');
  const [code, setCode] = useState('NCCT-COOP-' + Math.floor(100 + Math.random() * 900));
  const [category, setCategory] = useState('Cooperative Governance & Law');
  const [description, setDescription] = useState('');
  const [minPassPct, setMinPassPct] = useState(60);
  const [minAttendancePct, setMinAttendancePct] = useState(75);
  const [totalSessionsExpected, setTotalSessionsExpected] = useState(8);
  const [institute, setInstitute] = useState(currentUser.institute);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    createCourse({
      title: title.trim(),
      code: code.trim(),
      category,
      description: description.trim(),
      minPassPct: Number(minPassPct),
      minAttendancePct: Number(minAttendancePct),
      institute,
      totalSessionsExpected: Number(totalSessionsExpected)
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center border border-indigo-400/30">
              <BookPlus className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Create New Cooperative Course</h2>
              <p className="text-[11px] text-slate-300">V1.0 Trainer Course Management</p>
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
          <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-3 flex items-start space-x-2 text-xs text-amber-900">
            <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">NCCT Governance Publishing Rule:</p>
              <p className="text-amber-800 text-[11px] mt-0.5">
                Submitted courses are sent for NCCT Admin Accreditation. Once approved by Director K. N. Rao / Admin, the course will automatically be published and visible to all Trainees nationwide for online enrollment.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Course Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. PACS Statutory Audit & Risk Compliance"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Course Code
              </label>
              <input
                type="text"
                value={code}
                onChange={e => setCode(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Subject Category
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="Cooperative Governance & Law">Cooperative Governance & Law</option>
                <option value="Cooperative Banking & PACS">Cooperative Banking & PACS</option>
                <option value="Dairy & Agro-Processing">Dairy & Agro-Processing</option>
                <option value="Handloom & Rural Crafts">Handloom & Rural Crafts</option>
                <option value="Fisheries & Marine Cooperatives">Fisheries & Marine Cooperatives</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Course Description & Syllabus Highlights
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Outline the cooperative learning objectives, target participants, and key modules..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* V1.0 Critical Gating Rule Parameters */}
          <div className="bg-indigo-50/70 border border-indigo-200 rounded-xl p-4">
            <h3 className="text-xs font-bold text-indigo-900 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
              <Percent className="w-3.5 h-3.5 text-indigo-700" />
              <span>Mandatory Eligibility Gates (V1.0 Roadmap Standards)</span>
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Min. Attendance Percentage (%) *
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min={40}
                    max={100}
                    required
                    value={minAttendancePct}
                    onChange={e => setMinAttendancePct(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-indigo-900 focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="text-xs text-slate-500 font-medium">%</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Default: 75% required for certificate eligibility</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Min. Exam Pass Percentage (%) *
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min={35}
                    max={100}
                    required
                    value={minPassPct}
                    onChange={e => setMinPassPct(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-indigo-900 focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="text-xs text-slate-500 font-medium">%</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Default: 60% required on final assessment</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Total Planned Sessions
              </label>
              <input
                type="number"
                min={1}
                max={50}
                value={totalSessionsExpected}
                onChange={e => setTotalSessionsExpected(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Conducting Institute
              </label>
              <input
                type="text"
                value={institute}
                onChange={e => setInstitute(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
              />
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
              Create Course
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
