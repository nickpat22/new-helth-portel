import React from 'react';
import {
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  Activity,
  Settings,
  Bell,
  LogOut,
  Search,
  ChevronDown,
  Pill,
  FlaskConical,
  Upload,
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, collapsed, setCollapsed }) => {
  const { user, logout, canAccessModule } = useAuth();

  const allMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, section: 'main' },
    { id: 'patients', label: 'Patients', icon: Users, section: 'main' },
    { id: 'appointments', label: 'Appointments', icon: Calendar, section: 'main' },
    { id: 'records', label: 'Health Records', icon: FileText, section: 'main' },
    { id: 'documents', label: 'My Documents', icon: Upload, section: 'main' },
    { id: 'laboratory', label: 'Laboratory', icon: FlaskConical, section: 'integrations' },
    { id: 'pharmacy', label: 'Pharmacy', icon: Pill, section: 'integrations' },
    { id: 'activity', label: 'Audit Log', icon: Activity, section: 'security' },
  ];

  const visibleMenuItems = allMenuItems.filter((item) => canAccessModule(item.id));

  const handleLogout = () => {
    logout();
  };

  return (
    <div
      className={`bg-gradient-to-b from-indigo-950 via-slate-900 to-indigo-950 text-white flex flex-col transition-all duration-300 ease-in-out ${
        collapsed ? 'w-20' : 'w-64'
      } min-h-screen shadow-2xl`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-700/50">
        <div className="w-10 h-10 bg-gradient-to-br from-orange-400 via-white to-green-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
          <span className="text-sm font-bold text-slate-900">🇮🇳</span>
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="text-base font-bold text-white">UDHRS</h1>
            <p className="text-[9px] text-slate-400 uppercase tracking-wider leading-tight">Govt. of India</p>
          </div>
        )}
      </div>

      {/* User Info */}
      {!collapsed && user && (
        <div className="px-4 py-3 border-b border-slate-700/50">
          <div className="bg-slate-800/50 rounded-xl p-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {user.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">{user.fullName}</p>
                <p className="text-[10px] text-slate-400 truncate">{user.id}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-slate-700/50">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-[10px] text-slate-400 capitalize">{user.role.replace('_', ' ')}</span>
              {user.department && (
                <>
                  <span className="text-slate-600">•</span>
                  <span className="text-[10px] text-slate-400 truncate">{user.department}</span>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      {!collapsed && canAccessModule('patients') && user?.role !== 'patient' && (
        <div className="px-4 py-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search patients..."
              className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg pl-10 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
            />
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
        {visibleMenuItems
          .filter((item) => item.section === 'main')
          .map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/25'
                    : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                {!collapsed && <span>{item.label}</span>}
                {isActive && !collapsed && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white" />}
              </button>
            );
          })}

        {visibleMenuItems.filter((item) => item.section === 'integrations').length > 0 && (
          <>
            <div className={`px-3 py-2 mt-3 ${collapsed ? 'hidden' : 'block'}`}>
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Integrations</p>
            </div>
            {visibleMenuItems
              .filter((item) => item.section === 'integrations')
              .map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-violet-600 to-violet-500 text-white shadow-lg shadow-violet-500/25'
                        : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                    }`}
                  >
                    <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    {!collapsed && <span>{item.label}</span>}
                    {isActive && !collapsed && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white" />}
                  </button>
                );
              })}
          </>
        )}

        {visibleMenuItems.filter((item) => item.section === 'security').length > 0 && (
          <>
            <div className={`px-3 py-2 mt-3 ${collapsed ? 'hidden' : 'block'}`}>
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Security</p>
            </div>
            {visibleMenuItems
              .filter((item) => item.section === 'security')
              .map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                        : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                    }`}
                  >
                    <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    {!collapsed && <span>{item.label}</span>}
                    {isActive && !collapsed && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white" />}
                  </button>
                );
              })}
          </>
        )}
      </nav>

      {/* Security Status */}
      {!collapsed && (
        <div className="px-3">
          <div className="mx-2 mb-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <p className="text-[10px] text-emerald-300 font-medium">AES-256 Encrypted</p>
            </div>
            <p className="text-[9px] text-slate-400 mt-1">RSA transmission active</p>
          </div>
        </div>
      )}

      {/* Bottom Section */}
      <div className="px-3 py-2 space-y-1 border-t border-slate-700/50">
        <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-700/50 hover:text-white transition-all">
          <Settings className="w-4 h-4 text-slate-400" />
          {!collapsed && <span>Settings</span>}
        </button>
        <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-700/50 hover:text-white transition-all">
          <Bell className="w-4 h-4 text-slate-400" />
          {!collapsed && (
            <div className="flex items-center gap-2">
              <span>Alerts</span>
              <span className="bg-red-500 text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center">5</span>
            </div>
          )}
        </button>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all"
        >
          <LogOut className="w-4 h-4" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="mx-4 mb-3 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-700 transition-all text-xs"
      >
        <ChevronDown className={`w-4 h-4 transition-transform ${collapsed ? '-rotate-90' : 'rotate-90'}`} />
      </button>
    </div>
  );
};

export default Sidebar;
