import React, { useState } from 'react';
import { AuthProvider, useAuth } from './auth/AuthContext';
import { ToastProvider } from './hooks/useToast';
import LoginPage from './components/LoginPage';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import PatientList from './components/PatientList';
import PatientDetail from './components/PatientDetail';
import Appointments from './components/Appointments';
import Records from './components/Records';
import ActivityLog from './components/ActivityLog';
import Laboratory from './components/Laboratory';
import Pharmacy from './components/Pharmacy';
import DocumentUpload from './components/DocumentUpload';
import Chatbot from './components/Chatbot';
import { Patient } from './types';

type Tab = 'dashboard' | 'patients' | 'appointments' | 'records' | 'laboratory' | 'pharmacy' | 'activity' | 'documents';

const AppContent: React.FC = () => {
  const { isAuthenticated, user, canAccessModule } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // Determine the first accessible module if current tab is not accessible
  if (!canAccessModule(activeTab)) {
    const modules: Tab[] = ['dashboard', 'patients', 'appointments', 'records', 'laboratory', 'pharmacy', 'activity', 'documents'];
    const firstAccessible = modules.find((m) => canAccessModule(m));
    if (firstAccessible && firstAccessible !== activeTab) {
      setTimeout(() => setActiveTab(firstAccessible), 0);
    }
  }

  const handleSelectPatient = (patient: Patient) => {
    setSelectedPatient(patient);
  };

  const handleBackToPatients = () => {
    setSelectedPatient(null);
  };

  const handleNavigate = (tab: string) => {
    setActiveTab(tab as Tab);
    setSelectedPatient(null);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab as Tab);
    setSelectedPatient(null);
  };

  const renderContent = () => {
    // Patient users see a restricted read-only view
    if (user?.role === 'patient') {
      if (activeTab === 'documents') {
        return <DocumentUpload />;
      }
      if (activeTab === 'records') {
        return <div className="space-y-6"><PatientRestrictedView /></div>;
      }
      return <Dashboard onNavigate={handleNavigate} />;
    }

    if (selectedPatient && activeTab === 'patients') {
      return <PatientDetail patient={selectedPatient} onBack={handleBackToPatients} />;
    }

    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onNavigate={handleNavigate} />;
      case 'patients':
        return canAccessModule('patients') ? <PatientList onSelectPatient={handleSelectPatient} /> : <AccessDenied />;
      case 'appointments':
        return canAccessModule('appointments') ? <Appointments /> : <AccessDenied />;
      case 'records':
        return canAccessModule('records') ? <Records /> : <AccessDenied />;
      case 'laboratory':
        return canAccessModule('laboratory') ? <Laboratory /> : <AccessDenied />;
      case 'pharmacy':
        return canAccessModule('pharmacy') ? <Pharmacy /> : <AccessDenied />;
      case 'activity':
        return canAccessModule('activity') ? <ActivityLog /> : <AccessDenied />;
      case 'documents':
        return canAccessModule('documents') ? <DocumentUpload /> : <AccessDenied />;
      default:
        return <Dashboard onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />
      <main className="flex-1 overflow-auto">
        <div className="p-6 lg:p-8 max-w-[1600px] mx-auto">
          {/* Access Banner */}
          <div className="mb-4 flex items-center justify-between bg-white rounded-xl px-4 py-2.5 border border-slate-200/60">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Logged in as <strong className="text-slate-700 capitalize">{user?.role.replace('_', ' ')}</strong></span>
              {user?.organization && (
                <>
                  <span className="text-slate-300">|</span>
                  <span>{user.organization}</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
              <span className="w-1 h-1 rounded-full bg-emerald-500" />
              Session Secured
            </div>
          </div>
          {renderContent()}
        </div>
      </main>
      {/* Chatbot only for patients */}
      {user?.role === 'patient' && <Chatbot />}
    </div>
  );
};

const AccessDenied: React.FC = () => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <div className="w-20 h-20 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
      <span className="text-4xl">🔒</span>
    </div>
    <h2 className="text-xl font-bold text-slate-900">Access Denied</h2>
    <p className="text-sm text-slate-500 mt-2 max-w-md">
      You don't have permission to access this module. Please contact your system administrator
      if you believe this is an error.
    </p>
  </div>
);

const PatientRestrictedView: React.FC = () => {
  const { user } = useAuth();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Health Records</h1>
        <p className="text-slate-500 mt-1">Your medical history, prescriptions, and lab reports</p>
      </div>
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-200">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white text-2xl font-bold">
            {user?.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{user?.fullName}</h2>
            <p className="text-sm text-slate-600">Patient ID: {user?.id}</p>
            <p className="text-xs text-slate-500 mt-1">Records are read-only. Corrections can be requested through your doctor.</p>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200/60 p-6">
        <h3 className="text-base font-semibold text-slate-900 mb-4">📋 Your Medical Timeline</h3>
        <div className="space-y-3">
          <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-sm font-medium text-slate-900">Latest Diagnosis: Hypertension & Type 2 Diabetes</p>
            <p className="text-xs text-slate-500 mt-1">Diagnosed by Dr. Smith • 2024-01-15</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-sm font-medium text-slate-900">Current Medications: Lisinopril 10mg, Metformin 500mg</p>
            <p className="text-xs text-slate-500 mt-1">Prescribed by Dr. Smith • Ongoing</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-sm font-medium text-slate-900">Last Lab Report: HbA1c 7.2%</p>
            <p className="text-xs text-slate-500 mt-1">City Diagnostic Lab • 2024-12-10</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-sm font-medium text-slate-900">Next Appointment: 2025-01-15</p>
            <p className="text-xs text-slate-500 mt-1">Follow-up with Dr. Smith</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AuthProvider>
  );
};

export default App;
