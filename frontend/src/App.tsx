import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { Login } from './components/auth/Login';
import { Register } from './components/auth/Register';
import { DoctorDashboard } from './components/dashboard/DoctorDashboard';
import { PatientDashboard } from './components/dashboard/PatientDashboard';
import { CasePosts } from './components/cases/CasePosts';
import { FileUpload } from './components/upload/FileUpload';
import { DonationBoard } from './components/donations/DonationBoard';
import { AIDiagnosis } from './components/ai/AIDiagnosis';
import { DoctorRequestBoard } from './components/upload/DoctorReq';

function AppContent() {
  const { user, authLoading } = useAuth();
  const [currentView, setCurrentView] = useState<string>('login');

  useEffect(() => {
    if (!authLoading) {
      if (user) {
        setCurrentView('dashboard');
      } else {
        setCurrentView('login');
      }
    }
  }, [user, authLoading]);

  if (authLoading) {
    return (
      <div style={{ textAlign: 'center', marginTop: '3rem' }}>
        <p>Validating session...</p>
      </div>
    );
  }

  const renderView = () => {
    if (!user) {
      switch (currentView) {
        case 'register':
          return <Register onViewChange={setCurrentView} />;
        default:
          return <Login onViewChange={setCurrentView} />;
      }
    }

    switch (currentView) {
      case 'dashboard':
        return user.role === 'DOCTOR' ? <DoctorDashboard /> : <PatientDashboard />;
      case 'cases':
        return <CasePosts />;
      case 'upload':
        return <FileUpload />;
      case 'donations':
        return <DonationBoard />;
      case 'ai-diagnosis':
        return <AIDiagnosis />;
      case 'requests':
        return user.role === 'DOCTOR' ? <DoctorRequestBoard /> : <DoctorDashboard />;
      default:
        return user.role === 'DOCTOR' ? <DoctorDashboard /> : <PatientDashboard />;
    }
  };

  return (
    <div className="app">
      {user && <Header currentView={currentView} onViewChange={setCurrentView} />}
      {renderView()}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
