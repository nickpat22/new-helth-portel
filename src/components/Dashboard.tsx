import React, { useEffect, useState } from 'react';
import { Users, Calendar, FileText, Pill, Activity } from 'lucide-react';
import { AreaChart, Area, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { useAuth } from '../auth/AuthContext';
import { getDashboardStats, getActivities } from '../lib/supabaseService';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ totalPatients: 0, todayAppointments: 0, pendingReports: 0, totalRecords: 0 });
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [statsRes, activitiesRes] = await Promise.all([
        getDashboardStats(),
        getActivities(5, 0),
      ]);
      setStats(statsRes);
      setRecentActivities(activitiesRes.data || []);
      setLoading(false);
    }
    load();
  }, []);

  const patientGrowth = [
    { month: 'Jan', count: Math.max(0, stats.totalPatients - 5) },
    { month: 'Feb', count: Math.max(0, stats.totalPatients - 4) },
    { month: 'Mar', count: Math.max(0, stats.totalPatients - 3) },
    { month: 'Apr', count: Math.max(0, stats.totalPatients - 2) },
    { month: 'May', count: Math.max(0, stats.totalPatients - 1) },
    { month: 'Jun', count: stats.totalPatients },
  ];

  const departmentData = [
    { name: 'General', value: 35 },
    { name: 'Cardiology', value: 20 },
    { name: 'Neurology', value: 18 },
    { name: 'Orthopedics', value: 15 },
    { name: 'Pediatrics', value: 12 },
  ];

  const COLORS = ['#0891b2', '#06b6d4', '#22d3ee', '#67e8f9', '#a5f3fc'];

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome, {user?.fullName}!</h1>
        <p className="text-gray-600 mt-2">Role: <span className="font-semibold">{user?.role.toUpperCase()}</span></p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-cyan-600 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Patients</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalPatients}</p>
              <p className="text-xs text-gray-500 mt-1">From database</p>
            </div>
            <Users className="text-cyan-600" size={40} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-600 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Appointments</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.todayAppointments}</p>
              <p className="text-xs text-gray-500 mt-1">All appointments</p>
            </div>
            <Calendar className="text-green-600" size={40} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-600 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Medical Records</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalRecords}</p>
              <p className="text-xs text-gray-500 mt-1">Total records</p>
            </div>
            <FileText className="text-purple-600" size={40} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-amber-600 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Pending Lab Reports</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.pendingReports}</p>
              <p className="text-xs text-gray-500 mt-1">Require review</p>
            </div>
            <Pill className="text-amber-600" size={40} />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Patient Growth Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={patientGrowth}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0891b2" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#0891b2" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="count" stroke="#0891b2" fillOpacity={1} fill="url(#colorCount)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Department Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={departmentData} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name} ${value}%`} outerRadius={80} fill="#8884d8" dataKey="value">
                {departmentData.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activities & System Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Activity size={24} className="text-cyan-600" />
            Recent Activities
          </h2>
          <div className="space-y-3">
            {recentActivities.length === 0 && <p className="text-sm text-gray-400">No recent activities.</p>}
            {recentActivities.map((activity: any) => (
              <div key={activity.id} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-b-0">
                <div className="w-2 h-2 bg-cyan-600 rounded-full mt-2 flex-shrink-0"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                  <p className="text-xs text-gray-500">{activity.user_name} • {new Date(activity.created_at).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">System Overview</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-cyan-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Total Patients</span>
              <span className="text-lg font-bold text-cyan-600">{stats.totalPatients}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Total Appointments</span>
              <span className="text-lg font-bold text-green-600">{stats.todayAppointments}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Medical Records</span>
              <span className="text-lg font-bold text-purple-600">{stats.totalRecords}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Pending Reports</span>
              <span className="text-lg font-bold text-amber-600">{stats.pendingReports}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Banner */}
      <div className="mt-8 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg shadow-lg p-8 text-white">
        <h2 className="text-2xl font-bold mb-2">Universal Digital Health Records System</h2>
        <p>Secure, efficient healthcare data management for better patient care outcomes.</p>
      </div>
    </div>
  );
};

export default Dashboard;
