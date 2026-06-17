import React, { useState, useEffect, useRef } from 'react';
import {
  LayoutDashboard, Users, Calendar, FileText, FlaskConical, Pill,
  Activity, Settings, Bell, LogOut, Search, ChevronDown, X,
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { getActivities } from '../lib/supabaseService';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, collapsed, setCollapsed }) => {
  const { user, logout, canAccessModule } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAlerts, setShowAlerts] = useState(false);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const alertsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadAlerts() {
      const { data } = await getActivities(5, 0);
      if (data) setAlerts(data);
    }
    loadAlerts();
  }, [activeTab]);

  // Close alerts on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (alertsRef.current && !alertsRef.current.contains(e.target as Node)) {
        setShowAlerts(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setActiveTab('patients');
      // The PatientList component will read the search from URL or a shared context
      // For now, we navigate to patients tab
    }
  };

  const allMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, section: 'main' },
    { id: 'patients', label: 'Patients', icon: Users, section: 'main' },
    { id: 'appointments', label: 'Appointments', icon: Calendar, section: 'main' },
    { id: 'records', label: 'Records', icon: FileText, section: 'main' },
    { id: 'laboratory', label: 'Laboratory', icon: FlaskConical, section: 'integrations' },
    { id: 'pharmacy', label: 'Pharmacy', icon: Pill, section: 'integrations' },
    { id: 'activity', label: 'Audit Log', icon: Activity, section: 'security' },
  ];

  const visibleMenuItems = allMenuItems.filter((item) => canAccessModule(item.id));

  const handleLogout = () => { logout(); };

  return (
    <div
      className={`fixed left-0 top-0 z-50 flex h-screen flex-col bg-gradient-to-b from-indigo-950 via-slate-900 to-indigo-950 text-white transition-all duration-300 ease-in-out ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className="flex items-center gap-3 border-b border-slate-700/50 px-5 py-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 via-white to-green-500 shadow-lg">
          <span className="text-sm font-bold text-slate-900">🇮🇳</span>
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="text-base font-bold text-white">UDHRS</h1>
            <p className="text-[9px] uppercase tracking-[0.24em] text-slate-400 leading-tight">Govt. of India</p>
          </div>
        )}
      </div>

      {!collapsed && user && (
        <div className="border-b border-slate-700/50 px-4 py-3">
          <div className="rounded-2xl bg-slate-800/60 p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white font-bold">
                {user.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-white">{user.fullName}</p>
                <p className="truncate text-[10px] text-slate-400">{user.id}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 text-[10px] text-slate-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span className="truncate capitalize">{user.role.replace('_', ' ')}</span>
            </div>
          </div>
        </div>
      )}

      {!collapsed && visibleMenuItems.some((item) => item.section === 'main') && (
        <div className="px-4 py-3">
          <form onSubmit={handleSearch} className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search patients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-slate-600/80 bg-slate-700/50 py-2.5 pl-10 pr-4 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </form>
        </div>
      )}

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-3">
        {visibleMenuItems.filter((item) => item.section === 'main').map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 rounded-2xl px-4 py-2.5 text-xs font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/25'
                  : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
              }`}
            >
              <Icon className={`h-4 w-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              {!collapsed && <span>{item.label}</span>}
              {isActive && !collapsed && <div className="ml-auto h-1.5 w-1.5 rounded-full bg-white" />}
            </button>
          );
        })}

        {visibleMenuItems.filter((item) => item.section === 'integrations').length > 0 && !collapsed && (
          <div className="px-3 pt-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">Integrations</div>
        )}
        {visibleMenuItems.filter((item) => item.section === 'integrations').map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 rounded-2xl px-4 py-2.5 text-xs font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-violet-600 to-violet-500 text-white shadow-lg shadow-violet-500/25'
                  : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
              }`}
            >
              <Icon className={`h-4 w-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              {!collapsed && <span>{item.label}</span>}
              {isActive && !collapsed && <div className="ml-auto h-1.5 w-1.5 rounded-full bg-white" />}
            </button>
          );
        })}

        {visibleMenuItems.filter((item) => item.section === 'security').length > 0 && !collapsed && (
          <div className="px-3 pt-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">Security</div>
        )}
        {visibleMenuItems.filter((item) => item.section === 'security').map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 rounded-2xl px-4 py-2.5 text-xs font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                  : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
              }`}
            >
              <Icon className={`h-4 w-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              {!collapsed && <span>{item.label}</span>}
              {isActive && !collapsed && <div className="ml-auto h-1.5 w-1.5 rounded-full bg-white" />}
            </button>
          );
        })}
      </nav>

      {!collapsed && (
        <div className="px-3 pb-3">
          <div className="mx-2 mb-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-[10px] text-emerald-300">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>AES-256 Encrypted</span>
            </div>
            <p className="mt-1 text-slate-400">RSA transmission active</p>
          </div>
        </div>
      )}

      <div className="mt-auto px-3 pb-4 pt-2">
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="w-full flex items-center gap-3 rounded-2xl px-4 py-2.5 text-xs font-medium text-slate-300 hover:bg-slate-700/50 hover:text-white transition-all"
        >
          <Settings className="h-4 w-4 text-slate-400" />
          {!collapsed && <span>Settings</span>}
        </button>

        {/* Settings panel (simple) */}
        {showSettings && !collapsed && (
          <div className="mx-2 my-2 rounded-2xl bg-slate-800/80 border border-slate-600/50 p-4 text-xs text-slate-300 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white">Settings</span>
              <button onClick={() => setShowSettings(false)} className="text-slate-400 hover:text-white"><X size={14} /></button>
            </div>
            <div className="flex items-center justify-between">
              <span>User</span>
              <span className="text-slate-400">{user?.fullName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Role</span>
              <span className="text-slate-400 capitalize">{user?.role.replace('_', ' ')}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Version</span>
              <span className="text-slate-400">1.0.0</span>
            </div>
          </div>
        )}

        {/* Alerts button with popover */}
        <div className="relative" ref={alertsRef}>
          <button
            onClick={() => setShowAlerts(!showAlerts)}
            className="mt-2 w-full flex items-center gap-3 rounded-2xl px-4 py-2.5 text-xs font-medium text-slate-300 hover:bg-slate-700/50 hover:text-white transition-all"
          >
            <Bell className="h-4 w-4 text-slate-400" />
            {!collapsed && (
              <div className="flex items-center gap-2">
                <span>Alerts</span>
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] text-white">{alerts.length}</span>
              </div>
            )}
          </button>

          {/* Alerts Popover */}
          {showAlerts && !collapsed && (
            <div className="absolute bottom-full left-0 mb-2 w-72 rounded-2xl bg-white shadow-2xl border border-gray-200 overflow-hidden z-50">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-900">Recent Alerts</span>
                <button onClick={() => setShowAlerts(false)} className="text-gray-400 hover:text-gray-600"><X size={14} /></button>
              </div>
              <div className="max-h-60 overflow-y-auto">
                {alerts.length === 0 && <p className="p-4 text-sm text-gray-400 text-center">No recent alerts</p>}
                {alerts.map(alert => (
                  <div key={alert.id} className="px-4 py-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50">
                    <p className="text-xs font-medium text-gray-900">{alert.description}</p>
                    <p className="text-[10px] text-gray-500 mt-1">{alert.user_name} • {new Date(alert.created_at).toLocaleString()}</p>
                  </div>
                ))}
              </div>
              <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
                <button onClick={() => { setActiveTab('activity'); setShowAlerts(false); }} className="text-xs text-cyan-600 hover:text-cyan-700 font-medium">View all activity →</button>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={handleLogout}
          className="mt-2 w-full flex items-center gap-3 rounded-2xl px-4 py-2.5 text-xs font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all"
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="mx-4 mb-4 flex items-center justify-center gap-2 rounded-2xl bg-slate-700/50 px-3 py-2 text-xs text-slate-400 transition-all hover:bg-slate-700 hover:text-white"
      >
        <ChevronDown className={`h-4 w-4 transition-transform ${collapsed ? '-rotate-90' : 'rotate-90'}`} />
        {!collapsed && <span>Collapse</span>}
      </button>
    </div>
  );
};

export default Sidebar;
