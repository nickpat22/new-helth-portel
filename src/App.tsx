import React, { useState } from 'react';
import { AuthProvider, useAuth } from './auth/AuthContext';
import { ToastProvider } from './hooks/useToast';
import LoginPage from './components/LoginPage';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import PatientList from './components/PatientList';
import Appointments from './components/Appointments';
import Records from './components/Records';
import Laboratory from './components/Laboratory';
import Pharmacy from './components/Pharmacy';
import ActivityLog from './components/ActivityLog';

type Tab = 'dashboard' | 'patients' | 'appointments' | 'records' | 'laboratory' | 'pharmacy' | 'activity';

const AppContent: React.FC = () => {
  const { isAuthenticated, user, canAccessModule } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const handleTabChange = (tab: Tab) => setActiveTab(tab);

  const renderContent = () => {
    if (user?.role === 'patient') {
      if (activeTab === 'records') {
        return <PatientRestrictedView />;
      }
      if (!canAccessModule(activeTab)) {
        return <AccessDenied />;
      }
      return <Dashboard />;
    }

    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'patients':
        return canAccessModule('patients') ? <PatientList onSelectPatient={(id) => console.log('Selected patient:', id)} /> : <AccessDenied />;
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
      default:
        return <Dashboard />;
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
          <div className="mb-4 flex flex-col gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm border border-slate-200/70 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3 text-sm text-slate-500">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              <span>
                Logged in as <strong className="text-slate-900 capitalize">{user?.role.replace('_', ' ')}</strong>
                {user?.organization ? ` • ${user.organization}` : ''}
              </span>
            </div>
            <div className="text-xs text-emerald-700 bg-emerald-50 rounded-full px-3 py-1">Session secured</div>
          </div>
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

const AccessDenied: React.FC = () => (
  <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
    <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-red-50 text-4xl">🔒</div>
    <h2 className="text-2xl font-semibold text-slate-900">Access denied</h2>
    <p className="mt-2 max-w-md text-sm text-slate-500">
      Your account does not have permission to view this section. Please choose another module or contact your administrator.
    </p>
  </div>
);

const PatientRestrictedView: React.FC = () => {
  const { user } = useAuth();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">My Health Records</h1>
        <p className="mt-2 text-slate-500">Secure, read-only access to your personal health summary.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl bg-gradient-to-r from-emerald-500 to-teal-500 p-6 text-white shadow-xl">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white/15 text-2xl font-bold">
              {user?.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-emerald-100">Patient</p>
              <h2 className="mt-2 text-2xl font-semibold">{user?.fullName}</h2>
              <p className="mt-1 text-sm text-emerald-100/90">{user?.id}</p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl bg-white p-6 border border-slate-200 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-3">Record Summary</h2>
          <div className="space-y-3 text-sm text-slate-600">
            <div className="rounded-2xl bg-slate-50 p-4">Latest diagnosis: Hypertension, Type 2 Diabetes</div>
            <div className="rounded-2xl bg-slate-50 p-4">Current medication: Metformin 500mg, Lisinopril 10mg</div>
            <div className="rounded-2xl bg-slate-50 p-4">Last lab review: HbA1c 7.2% on 2024-12-10</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => (
  <AuthProvider>
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  </AuthProvider>
);

export default App;
