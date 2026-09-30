import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole, AppPage } from '../../types';
import { 
  Building2, 
  GraduationCap, 
  ShieldCheck, 
  Briefcase, 
  User, 
  RotateCcw, 
  CheckCircle2, 
  Info, 
  ChevronDown,
  BookOpen,
  QrCode,
  Scan,
  Database,
  LogIn,
  LogOut,
  Menu,
  X,
  Sparkles,
  PlayCircle,
  Award
} from 'lucide-react';

export const Header: React.FC<{ onOpenInfo: () => void; onOpenProfile: () => void }> = ({ 
  onOpenInfo,
  onOpenProfile
}) => {
  const { 
    currentUser, 
    isAuthenticated,
    allUsers, 
    switchUser, 
    switchRole, 
    resetAllData, 
    currentPage, 
    navigateTo,
    signOut,
    tursoConfig 
  } = useApp();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getNavLinks = () => {
    if (!currentUser) {
      return [
        { page: 'home' as AppPage, label: 'Home', icon: <Building2 className="w-3.5 h-3.5" /> },
        { page: 'courses' as AppPage, label: 'Courses', icon: <BookOpen className="w-3.5 h-3.5" /> },
        { page: 'verify' as AppPage, label: 'Verify Certificate', icon: <ShieldCheck className="w-3.5 h-3.5" /> }
      ];
    }
    if (currentUser.role === 'trainee') {
      return [
        { page: 'home' as AppPage, label: 'Home', icon: <Building2 className="w-3.5 h-3.5" /> },
        { page: 'courses' as AppPage, label: 'Courses', icon: <BookOpen className="w-3.5 h-3.5" /> },
        { page: 'trainee' as AppPage, label: 'My Desk', icon: <User className="w-3.5 h-3.5" /> },
        { page: 'classroom' as AppPage, label: 'Classroom', icon: <PlayCircle className="w-3.5 h-3.5 text-amber-500" /> },
        { page: 'assessments' as AppPage, label: 'Exams', icon: <Award className="w-3.5 h-3.5 text-emerald-500" /> },
        { page: 'jobs' as AppPage, label: 'Job Board', icon: <Briefcase className="w-3.5 h-3.5" /> }
      ];
    }
    if (currentUser.role === 'trainer') {
      return [
        { page: 'home' as AppPage, label: 'Home', icon: <Building2 className="w-3.5 h-3.5" /> },
        { page: 'courses' as AppPage, label: 'Courses', icon: <BookOpen className="w-3.5 h-3.5" /> },
        { page: 'trainer' as AppPage, label: 'Faculty Hub', icon: <GraduationCap className="w-3.5 h-3.5" /> },
        { page: 'scanner' as AppPage, label: 'Attendance Scanner', icon: <Scan className="w-3.5 h-3.5" /> },
        { page: 'classroom' as AppPage, label: 'Classroom', icon: <PlayCircle className="w-3.5 h-3.5 text-amber-500" /> },
        { page: 'assessments' as AppPage, label: 'Grading', icon: <Award className="w-3.5 h-3.5 text-emerald-500" /> }
      ];
    }
    if (currentUser.role === 'employer') {
      return [
        { page: 'home' as AppPage, label: 'Home', icon: <Building2 className="w-3.5 h-3.5" /> },
        { page: 'employer' as AppPage, label: 'Recruiter Hub & Jobs', icon: <Briefcase className="w-3.5 h-3.5" /> },
        { page: 'verify' as AppPage, label: 'Verify Certificate', icon: <ShieldCheck className="w-3.5 h-3.5" /> }
      ];
    }
    // Admin
    return [
      { page: 'home' as AppPage, label: 'Home', icon: <Building2 className="w-3.5 h-3.5" /> },
      { page: 'admin' as AppPage, label: 'Admin MIS', icon: <Briefcase className="w-3.5 h-3.5" /> },
      { page: 'verify' as AppPage, label: 'Verify', icon: <ShieldCheck className="w-3.5 h-3.5" /> },
      { page: 'database' as AppPage, label: 'Turso DB', icon: <Database className="w-3.5 h-3.5" /> }
    ];
  };

  const navLinks = getNavLinks();

  const handleNavClick = (page: AppPage) => {
    navigateTo(page);
    setMobileMenuOpen(false);
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      {/* Top Govt / Apex Bar */}
      <div className="bg-slate-900 text-slate-300 text-xs px-4 py-1.5 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-medium text-slate-200">National Council for Cooperative Training (NCCT)</span>
          <span className="hidden sm:inline text-slate-500">|</span>
          <span className="hidden sm:inline text-slate-400">Ministry of Cooperation • GoI</span>
        </div>

        <div className="flex items-center space-x-3">
          {/* Database indicator button */}
          <button
            onClick={() => handleNavClick('database')}
            className={`flex items-center space-x-1 text-[11px] font-semibold px-2 py-0.5 rounded-full transition cursor-pointer ${
              tursoConfig.status === 'connected'
                ? 'bg-emerald-950 text-emerald-300 hover:bg-emerald-900 border border-emerald-700'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
            }`}
            title="View Turso SQLite Database status and SQL console"
          >
            <Database className="w-3 h-3 text-emerald-400" />
            <span>{tursoConfig.status === 'connected' ? 'Turso SQLite Cloud' : 'Local SQLite'}</span>
          </button>

          <button 
            onClick={onOpenInfo}
            className="hidden md:flex items-center space-x-1 text-amber-400 hover:text-amber-300 font-medium transition cursor-pointer"
          >
            <Info className="w-3.5 h-3.5" />
            <span>Roadmap & Architecture</span>
          </button>

          <button
            onClick={() => {
              if (window.confirm('Reset all demo data (courses, enrollments, sessions, and attendance logs) back to initial seed?')) {
                resetAllData();
              }
            }}
            className="flex items-center space-x-1 text-slate-400 hover:text-rose-400 transition cursor-pointer"
            title="Reset database to initial clean seed"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden md:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Title */}
          <div 
            onClick={() => handleNavClick('home')}
            className="flex items-center space-x-3 cursor-pointer select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-700 to-indigo-900 text-white flex items-center justify-center font-bold text-lg shadow-sm shadow-indigo-200 border border-indigo-600/30">
              <Building2 className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-base sm:text-lg font-bold text-slate-900 leading-none">NCCT Portal</span>
                <span className="bg-indigo-100 text-indigo-800 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-indigo-200">
                  V2.0
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 truncate max-w-[200px] sm:max-w-none">
                {currentUser ? `${currentUser.fullName} (${currentUser.role})` : 'Cooperative Training Ecosystem'}
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center space-x-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/80">
            {navLinks.map(link => {
              const isActive = currentPage === link.page;
              return (
                <button
                  key={link.page}
                  onClick={() => handleNavClick(link.page)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    isActive
                      ? 'bg-white text-indigo-700 shadow-xs border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  {link.icon}
                  <span>{link.label}</span>
                </button>
              );
            })}
          </nav>

          {/* User Profile & Sign-In Controls */}
          <div className="flex items-center space-x-2">
            {isAuthenticated && currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 p-1.5 pl-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition cursor-pointer"
                >
                  <img
                    src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'}
                    alt={currentUser.fullName}
                    className="w-8 h-8 rounded-lg object-cover border border-slate-300"
                  />
                  <div className="text-left hidden sm:block">
                    <div className="text-xs font-bold text-slate-800 leading-tight">
                      {currentUser.fullName.split(' ')[0]}
                    </div>
                    <div className="text-[10px] text-indigo-600 font-semibold uppercase">
                      {currentUser.role}
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* User Dropdown */}
                {showUserMenu && (
                  <div 
                    className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                    onMouseLeave={() => setShowUserMenu(false)}
                  >
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Signed In Account</p>
                      <p className="text-sm font-bold text-slate-900">{currentUser.fullName}</p>
                      <p className="text-xs text-slate-500 font-mono">@{currentUser.username}</p>
                      <p className="text-xs text-indigo-600 font-medium mt-0.5">{currentUser.institute}</p>
                    </div>

                    <div className="px-3 py-1.5 space-y-1">
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          onOpenProfile();
                        }}
                        className="w-full text-left text-xs font-medium text-slate-700 hover:text-indigo-600 p-2 rounded-lg hover:bg-slate-50 flex items-center space-x-2 cursor-pointer"
                      >
                        <User className="w-3.5 h-3.5" />
                        <span>Edit My Profile</span>
                      </button>

                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          signOut();
                        }}
                        className="w-full text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 p-2 rounded-lg flex items-center space-x-2 cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5 text-rose-600" />
                        <span>Sign Out</span>
                      </button>
                    </div>

                    {/* Fast Demo Account Switching */}
                    <div className="border-t border-slate-100 pt-2 px-3">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 px-1">
                        Switch Demo Account
                      </p>
                      <div className="space-y-1 max-h-44 overflow-y-auto">
                        {allUsers.map(user => (
                          <button
                            key={user.id}
                            onClick={() => {
                              switchUser(user.id);
                              setShowUserMenu(false);
                            }}
                            className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition cursor-pointer ${
                              user.id === currentUser.id 
                                ? 'bg-indigo-50 text-indigo-700 font-semibold' 
                                : 'hover:bg-slate-100 text-slate-700'
                            }`}
                          >
                            <div className="truncate">
                              <span className="block truncate font-medium">{user.fullName}</span>
                              <span className="text-[10px] text-slate-400 capitalize">
                                @{user.username} • {user.role}
                              </span>
                            </div>
                            {user.id === currentUser.id && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0 ml-1" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleNavClick('login')}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition shadow-xs flex items-center space-x-1.5 cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>

                <button
                  onClick={() => handleNavClick('register')}
                  className="hidden sm:inline-block bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3 py-2 rounded-xl transition cursor-pointer"
                >
                  Register
                </button>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Secondary Navigation Strip (Visible on Large/Medium) */}
        <div className="hidden md:flex xl:hidden overflow-x-auto py-2 border-t border-slate-100 space-x-1">
          {navLinks.map(link => {
            const isActive = currentPage === link.page;
            return (
              <button
                key={link.page}
                onClick={() => handleNavClick(link.page)}
                className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {link.icon}
                <span>{link.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2 animate-in slide-in-from-top-2 duration-150">
          <div className="grid grid-cols-2 gap-2">
            {navLinks.map(link => {
              const isActive = currentPage === link.page;
              return (
                <button
                  key={link.page}
                  onClick={() => handleNavClick(link.page)}
                  className={`flex items-center space-x-2 p-2.5 rounded-xl text-xs font-semibold transition cursor-pointer text-left ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {link.icon}
                  <span>{link.label}</span>
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>NCCT Autonomous Apex Council</span>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenInfo();
              }}
              className="text-indigo-600 font-semibold underline cursor-pointer"
            >
              Roadmap Info
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
