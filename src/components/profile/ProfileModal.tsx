import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, User, Phone, Building2, Mail, Check } from 'lucide-react';

interface ProfileModalProps {
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ onClose }) => {
  const { currentUser, updateProfile } = useApp();

  const [fullName, setFullName] = useState(currentUser.fullName);
  const [mobileNumber, setMobileNumber] = useState(currentUser.mobileNumber);
  const [institute, setInstitute] = useState(currentUser.institute);
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      fullName: fullName.trim(),
      mobileNumber: mobileNumber.trim(),
      institute: institute.trim()
    });

    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-in fade-in">
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4 text-amber-300" />
            <h3 className="font-bold text-sm">Edit User Profile (V1.0)</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Full Name</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Mobile Number</label>
            <div className="relative">
              <input
                type="text"
                required
                value={mobileNumber}
                onChange={e => setMobileNumber(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
              />
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email Address</label>
            <div className="relative">
              <input
                type="email"
                disabled
                value={currentUser.email}
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-100 text-slate-500 cursor-not-allowed"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">Linked to Supabase Auth UID</span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Cooperative Institute</label>
            <div className="relative">
              <input
                type="text"
                value={institute}
                onChange={e => setInstitute(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
              />
              <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>
          </div>

          {saved && (
            <div className="p-2.5 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-lg flex items-center space-x-1.5 border border-emerald-200">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Profile updated successfully!</span>
            </div>
          )}

          <div className="pt-2 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold cursor-pointer"
            >
              Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
