import React from 'react';
import { Users, Calendar, AlertCircle, FlaskConical, TrendingUp, ArrowUpRight, Shield, Lock, Eye, Database } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { dashboardStats, activities, appointments } from '../data';
import { useAuth } from '../auth/AuthContext';

const patientGrowthData = [
  { month: 'Jul', patients: 1240, records: 3800 },
  { month: 'Aug', patients: 1480, records: 4600 },
  { month: 'Sep', patients: 1820, records: 5400 },
  { month: 'Oct', patients: 2150, records: 6200 },
  { month: 'Nov', patients: 2500, records: 7100 },
  { month: 'Dec', patients: 2847, records: 8350 },
];

const departmentData = [
  { name: 'Doctors', value: 42, color: '#3b82f6' },
  { name: 'Labs', value: 22, color: '#8b5cf6' },
  { name: 'Pharmacies', value: 18, color: '#06b6d4' },
  { name: 'Patients', value: 15, color: '#10b981' },
  { name: 'Admin', value: 3, color: '#f59e0b' },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'bg-emerald-100 text-emerald-700';
    case 'critical': return 'bg-red-100 text-red-700';
    case 'inactive': return 'bg-slate-100 text-slate-600';
    case 'upcoming': return 'bg-blue-100 text-blue-700';
    case 'completed': return 'bg-emerald-100 text-emerald-700';
    case 'cancelled': return 'bg-red-100 text-red-600';
    default: return 'bg-slate-100 text-slate-600';
  }
};

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'record_update': return '📋';
    case 'appointment': return '📅';
    case 'prescription': return '💊';
    case 'lab_result': return '🧪';
    case 'admission': return '🏥';
    default: return '📄';
  }
};

const Dashboard: React.FC<{ onNavigate: (tab: string) => void }> = ({ onNavigate }) => {
  const { user } = useAuth();

  const getWelcomeMessage = () => {
    if (!user) return 'Welcome to UDHRS';
    switch (user.role) {
      case 'doctor': return `Welcome back, ${user.fullName} • ${user.department || 'Doctor'}`;
      case 'patient': return `Welcome, ${user.fullName} • View your health records`;
      case 'laboratory': return `Welcome, ${user.fullName} • ${user.organization || 'Lab Staff'}`;
      case 'pharmacy': return `Welcome, ${user.fullName} • ${user.organization || 'Pharmacy'}`;
      case 'records_staff': return `Welcome, ${user.fullName} • Medical Records`;
      case 'admin': return `Welcome, ${user.fullName} • Administrator`;
      default: return `Welcome, ${user.fullName}`;
    }
  };

  const getStatsByRole = () => {
    const baseStats = [
      {
        label: 'Total Patients',
        value: dashboardStats.totalPatients.toLocaleString(),
        change: '+12.5%',
        isPositive: true,
        icon: Users,
        gradient: 'from-blue-500 to-blue-600',
      },
      {
        label: "Today's Appointments",
        value: dashboardStats.appointmentsToday.toString(),
        change: '+4',
        isPositive: true,
        icon: Calendar,
        gradient: 'from-cyan-500 to-teal-500',
      },
      {
        label: 'Critical Cases',
        value: dashboardStats.criticalCases.toString(),
        change: '-2',
        isPositive: false,
        icon: AlertCircle,
        gradient: 'from-red-500 to-rose-500',
      },
      {
        label: 'Pending Lab Reports',
        value: dashboardStats.pendingLabs.toString(),
        change: '-3',
        isPositive: true,
        icon: FlaskConical,
        gradient: 'from-violet-500 to-purple-500',
      },
    ];

    switch (user?.role) {
      case 'laboratory':
        return [
          { ...baseStats[3], label: 'Pending Verifications' },
          { label: 'Reports Today', value: '12', change: '+5', isPositive: true, icon: FlaskConical, gradient: 'from-violet-500 to-purple-500' },
          { label: 'This Month', value: '187', change: '+34', isPositive: true, icon: FlaskConical, gradient: 'from-blue-500 to-blue-600' },
          { label: 'Completed Today', value: '8', change: '+3', isPositive: true, icon: FlaskConical, gradient: 'from-emerald-500 to-green-500' },
        ];
      case 'pharmacy':
        return [
          { label: 'Pending Prescriptions', value: '6', change: '-2', isPositive: true, icon: FlaskConical, gradient: 'from-cyan-500 to-teal-500' },
          { label: 'Dispensed Today', value: '18', change: '+6', isPositive: true, icon: Calendar, gradient: 'from-emerald-500 to-green-500' },
          { label: 'This Week', value: '94', change: '+22', isPositive: true, icon: Calendar, gradient: 'from-blue-500 to-blue-600' },
          { label: 'Critical Alerts', value: '2', change: '-1', isPositive: false, icon: AlertCircle, gradient: 'from-red-500 to-rose-500' },
        ];
      case 'records_staff':
        return [
          { label: 'Records This Month', value: '2,340', change: '+180', isPositive: true, icon: Users, gradient: 'from-blue-500 to-blue-600' },
          { label: 'Pending Archives', value: '34', change: '+12', isPositive: true, icon: Calendar, gradient: 'from-violet-500 to-purple-500' },
          { label: 'Audit Entries', value: '1,240', change: '+340', isPositive: true, icon: AlertCircle, gradient: 'from-cyan-500 to-teal-500' },
          { label: 'Storage Used', value: '72%', change: '+5%', isPositive: false, icon: FlaskConical, gradient: 'from-amber-500 to-orange-500' },
        ];
      case 'patient':
        return [
          { label: 'Your Records', value: '28', change: '+3', isPositive: true, icon: Users, gradient: 'from-emerald-500 to-green-500' },
          { label: 'Active Prescriptions', value: '2', change: '0', isPositive: true, icon: Calendar, gradient: 'from-cyan-500 to-teal-500' },
          { label: 'Upcoming Appointments', value: '1', change: '0', isPositive: true, icon: AlertCircle, gradient: 'from-blue-500 to-blue-600' },
          { label: 'Last Visit', value: 'Dec 1', change: '15 days ago', isPositive: true, icon: FlaskConical, gradient: 'from-violet-500 to-purple-500' },
        ];
      default:
        return baseStats;
    }
  };

  const stats = getStatsByRole();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Unified Digital Health Record System</h1>
          <p className="text-slate-500 mt-1">{getWelcomeMessage()}</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg text-xs font-medium border border-emerald-200">
            <Shield className="w-3.5 h-3.5" />
            <span>AES-256 Encrypted</span>
          </div>
          <div className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-xs font-medium border border-blue-200">
            <Lock className="w-3.5 h-3.5" />
            <span>RSA Transmission</span>
          </div>
          {(user?.role === 'doctor' || user?.role === 'admin') && (
            <button className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-blue-700 hover:to-blue-600 transition-all shadow-md shadow-blue-500/20 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Generate Report
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-2xl p-5 border border-slate-200/60 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300 group">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
                  <p className="text-3xl font-bold text-slate-900 mt-1">{stat.value}</p>
                  <div className="flex items-center gap-1 mt-2">
                    {stat.isPositive ? (
                      <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <ArrowUpRight className="w-3.5 h-3.5 text-red-500" />
                    )}
                    <span className={`text-xs font-semibold ${stat.isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                      {stat.change}
                    </span>
                    <span className="text-xs text-slate-400">vs last month</span>
                  </div>
                </div>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient Growth Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/60">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Patient & Record Growth</h3>
              <p className="text-sm text-slate-500">Monthly registrations and total records stored</p>
            </div>
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <span className="text-sm font-semibold text-emerald-600">+129.6%</span>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={patientGrowthData}>
                <defs>
                  <linearGradient id="patientGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="recordGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '13px',
                  }}
                />
                <Area type="monotone" dataKey="patients" stroke="#3b82f6" strokeWidth={2.5} fill="url(#patientGradient)" name="Patients" />
                <Area type="monotone" dataKey="records" stroke="#8b5cf6" strokeWidth={2.5} fill="url(#recordGradient)" name="Records" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stakeholder Distribution */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/60">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-slate-900">Stakeholders</h3>
            <p className="text-sm text-slate-500">Active users by role</p>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={departmentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {departmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-2">
            {departmentData.map((dept, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: dept.color }} />
                  <span className="text-sm text-slate-600">{dept.name}</span>
                </div>
                <span className="text-sm font-semibold text-slate-900">{dept.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Security Features Banner */}
      <div className="bg-gradient-to-r from-indigo-50 via-blue-50 to-violet-50 rounded-2xl p-6 border border-blue-200/60">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-6 h-6 text-blue-600" />
          <h3 className="text-base font-semibold text-slate-900">Security & Compliance</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Shield, label: 'AES-256 Encryption', desc: 'Database encryption active', color: 'text-emerald-600' },
            { icon: Lock, label: 'RSA-2048', desc: 'Secure transmission', color: 'text-blue-600' },
            { icon: Eye, label: 'Audit Logging', desc: `${activities.length} actions logged today`, color: 'text-violet-600' },
            { icon: Database, label: 'Immutable Records', desc: 'Records cannot be deleted', color: 'text-amber-600' },
          ].map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div key={i} className="bg-white/70 rounded-xl p-4 border border-white/60">
                <Icon className={`w-5 h-5 ${feature.color} mb-2`} />
                <p className="text-sm font-semibold text-slate-900">{feature.label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{feature.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Appointments */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/60">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Today's Appointments</h3>
              <p className="text-sm text-slate-500">Schedule for today</p>
            </div>
            <button
              onClick={() => onNavigate('appointments')}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View All →
            </button>
          </div>
          <div className="space-y-3">
            {appointments.filter(a => a.status === 'upcoming').slice(0, 4).map((appt) => (
              <div key={appt.id} className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 hover:bg-blue-50/50 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">
                  {appt.patientName.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{appt.patientName}</p>
                  <p className="text-xs text-slate-500">{appt.type} • {appt.doctor}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-900">{appt.time}</p>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getStatusColor(appt.status)}`}>
                    {appt.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/60">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Audit Trail</h3>
              <p className="text-sm text-slate-500">Latest system activities</p>
            </div>
            <button
              onClick={() => onNavigate('activity')}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View All →
            </button>
          </div>
          <div className="space-y-3">
            {activities.slice(0, 5).map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                <span className="text-lg">{getActivityIcon(activity.type)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-700 truncate">{activity.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-slate-400">{activity.patientName}</span>
                    <span className="text-xs text-slate-300">•</span>
                    <span className="text-xs text-slate-400">{activity.timestamp}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
