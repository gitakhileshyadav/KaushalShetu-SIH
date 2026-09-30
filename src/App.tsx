import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { HomePage } from './components/pages/HomePage';
import { CourseCatalogPage } from './components/pages/CourseCatalogPage';
import { QRDisplayPage } from './components/pages/QRDisplayPage';
import { ScannerPage } from './components/pages/ScannerPage';
import { VerificationPage } from './components/pages/VerificationPage';
import { DatabasePage } from './components/pages/DatabasePage';
import { LoginPage } from './components/auth/LoginPage';
import { RegisterPage } from './components/auth/RegisterPage';
import { TrainerDashboard } from './components/trainer/TrainerDashboard';
import { TraineeDashboard } from './components/trainee/TraineeDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { EmployerDashboard } from './components/employer/EmployerDashboard';
import { TraineeJobsPage } from './components/trainee/TraineeJobsPage';
import { CourseClassroomPage } from './components/course/CourseClassroomPage';
import { TraineeAssessments } from './components/trainee/TraineeAssessments';
import { TrainerAssessments } from './components/trainer/TrainerAssessments';
import { EmployerAssessments } from './components/employer/EmployerAssessments';
import { AdminAssessments } from './components/admin/AdminAssessments';
import { RoadmapModal } from './components/common/RoadmapModal';
import { ProfileModal } from './components/profile/ProfileModal';
import { 
  Sparkles, 
  GraduationCap, 
  User, 
  ShieldCheck, 
  Briefcase,
  ExternalLink,
  Database,
  Lock,
  PlayCircle,
  Award
} from 'lucide-react';

const MainContent: React.FC = () => {
  const { 
    currentUser, 
    switchRole, 
    currentPage, 
    navigateTo, 
    isAuthenticated,
    tursoConfig,
    activeClassroomCourseId,
    activeAssessmentId,
    openAssessment,
    openClassroom
  } = useApp();

  const [showRoadmap, setShowRoadmap] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  // Render the current page based on route
  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage />;
      
      case 'courses':
        return <CourseCatalogPage />;

      case 'classroom':
        return (
          <CourseClassroomPage
            courseId={activeClassroomCourseId || 'crs_poultry_101'}
            onBack={() => {
              if (currentUser?.role === 'trainer') navigateTo('trainer');
              else if (currentUser?.role === 'employer') navigateTo('employer');
              else if (currentUser?.role === 'admin') navigateTo('admin');
              else navigateTo('trainee');
            }}
            onOpenAssessment={(asmId) => openAssessment(asmId)}
          />
        );

      case 'assessments':
        if (!isAuthenticated) {
          return (
            <div className="max-w-md mx-auto py-8">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 text-xs text-amber-800 flex items-center space-x-2">
                <Lock className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Assessments Desk requires authenticated sign in.</span>
              </div>
              <LoginPage />
            </div>
          );
        }
        if (currentUser?.role === 'trainer') {
          return <TrainerAssessments />;
        }
        if (currentUser?.role === 'employer') {
          return <EmployerAssessments />;
        }
        if (currentUser?.role === 'admin') {
          return <AdminAssessments />;
        }
        return (
          <TraineeAssessments
            initialAssessmentId={activeAssessmentId || undefined}
            onBackToCourses={() => navigateTo('trainee')}
          />
        );

      case 'qr_display':
        return <QRDisplayPage />;

      case 'scanner':
        return <ScannerPage />;

      case 'verify':
        return <VerificationPage />;

      case 'jobs':
        return <TraineeJobsPage />;

      case 'database':
        return <DatabasePage />;

      case 'login':
        return <LoginPage />;

      case 'register':
        return <RegisterPage />;

      case 'trainer':
        if (!isAuthenticated) {
          return (
            <div className="max-w-md mx-auto py-8">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 text-xs text-amber-800 flex items-center space-x-2">
                <Lock className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Trainer Portal requires authentication. Please sign in with username & password.</span>
              </div>
              <LoginPage />
            </div>
          );
        }
        return <TrainerDashboard />;

      case 'trainee':
        if (!isAuthenticated) {
          return (
            <div className="max-w-md mx-auto py-8">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 text-xs text-amber-800 flex items-center space-x-2">
                <Lock className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Trainee Desk requires authentication. Please sign in with username & password.</span>
              </div>
              <LoginPage />
            </div>
          );
        }
        return <TraineeDashboard />;

      case 'admin':
        if (!isAuthenticated) {
          return (
            <div className="max-w-md mx-auto py-8">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 text-xs text-amber-800 flex items-center space-x-2">
                <Lock className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Admin Governance MIS requires administrative sign in.</span>
              </div>
              <LoginPage />
            </div>
          );
        }
        return <AdminDashboard />;

      case 'employer':
        if (!isAuthenticated) {
          return (
            <div className="max-w-md mx-auto py-8">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 text-xs text-amber-800 flex items-center space-x-2">
                <Lock className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Recruiter Portal requires authenticated credentials.</span>
              </div>
              <LoginPage />
            </div>
          );
        }
        return <EmployerDashboard />;

      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/60 text-slate-900 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Header */}
      <Header
        onOpenInfo={() => setShowRoadmap(true)}
        onOpenProfile={() => setShowProfile(true)}
      />

      {/* Main App Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {renderCurrentPage()}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <p className="font-semibold text-slate-700">
              National Council for Cooperative Training (NCCT)
            </p>
            <p className="text-[11px] text-slate-400">
              Autonomous Society Promoted by Ministry of Cooperation, Government of India • VAMNICOM & RICMs
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px]">
            <button
              onClick={() => navigateTo('database')}
              className="text-indigo-600 hover:underline font-semibold flex items-center space-x-1 cursor-pointer"
            >
              <Database className="w-3 h-3" />
              <span>Turso SQLite Storage ({tursoConfig.status})</span>
            </button>
            <span>•</span>
            <button
              onClick={() => navigateTo('verify')}
              className="hover:text-indigo-600 font-semibold cursor-pointer"
            >
              Public Verification
            </button>
            <span>•</span>
            <button
              onClick={() => setShowRoadmap(true)}
              className="hover:text-indigo-600 font-semibold cursor-pointer"
            >
              System Roadmap (V1.0 - V8.0)
            </button>
            <span>•</span>
            <span className="text-slate-400">GitHub Pages Compatible</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {showRoadmap && (
        <RoadmapModal onClose={() => setShowRoadmap(false)} />
      )}

      {showProfile && (
        <ProfileModal onClose={() => setShowProfile(false)} />
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
