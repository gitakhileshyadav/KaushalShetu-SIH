import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Home, 
  BookOpen, 
  PlayCircle, 
  Camera, 
  Award, 
  User,
  GraduationCap,
  Briefcase
} from 'lucide-react';
import { AppPage } from '../../types';

export const MobileBottomNav: React.FC = () => {
  const { currentPage, navigateTo, currentUser, isAuthenticated } = useApp();

  const getRoleDefaultPage = (): AppPage => {
    if (!isAuthenticated || !currentUser) return 'home';
    if (currentUser.role === 'trainer') return 'trainer';
    if (currentUser.role === 'admin') return 'admin';
    if (currentUser.role === 'employer') return 'employer';
    return 'trainee';
  };

  const rolePage = getRoleDefaultPage();

  const navItems: { page: AppPage; label: string; icon: React.ReactNode }[] = [
    {
      page: 'home',
      label: 'Home',
      icon: <Home className="w-5 h-5" />
    },
    {
      page: rolePage,
      label: currentUser?.role === 'trainer' ? 'Faculty' : currentUser?.role === 'admin' ? 'Admin' : 'My Courses',
      icon: currentUser?.role === 'trainer' ? <GraduationCap className="w-5 h-5" /> : currentUser?.role === 'admin' ? <Briefcase className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />
    },
    {
      page: 'scanner',
      label: 'Scan QR',
      icon: (
        <div className="w-10 h-10 -mt-4 rounded-full bg-gradient-to-tr from-amber-400 to-amber-500 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-400/40 border-2 border-white">
          <Camera className="w-5 h-5" />
        </div>
      )
    },
    {
      page: 'classroom',
      label: 'Classroom',
      icon: <PlayCircle className="w-5 h-5" />
    },
    {
      page: 'assessments',
      label: 'Exams',
      icon: <Award className="w-5 h-5" />
    }
  ];

  return (
    <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1 safe-area-pb shadow-lg">
      <div className="flex items-center justify-around">
        {navItems.map(item => {
          const isActive = currentPage === item.page;
          return (
            <button
              key={item.page}
              onClick={() => navigateTo(item.page)}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition min-w-[56px] min-h-[44px] cursor-pointer ${
                isActive ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-900 font-medium'
              }`}
            >
              {item.icon}
              <span className={`text-[10px] mt-0.5 leading-none ${isActive ? 'font-bold' : ''}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
