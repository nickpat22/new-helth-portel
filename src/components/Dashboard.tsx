import React from 'react';
import { Users, Calendar, FileText, Pill, Activity } from 'lucide-react';
import { AreaChart, Area, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useAuth } from '../auth/AuthContext';
import { dashboardStats, activities, patients, appointments, labReports } from '../data';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  // Data for charts
  const patientGrowth = [
    { month: 'Jan', count: 850 },
    { month: 'Feb', count: 920 },
    { month: 'Mar', count: 1050 },
    { month: 'Apr', count: 1150 },
    { month: 'May', count: 1180 },
    { month: 'Jun', count: 1234 },
  ];

  const departmentData = [
    { name: 'General', value: 35 },
    { name: 'Cardiology', value: 20 },
    { name: 'Neurology', value: 18 },
    { name: 'Orthopedics', value: 15 },
    { name: 'Pediatrics', value: 12 },
  ];

  const COLORS = ['#0891b2', '#06b6d4', '#22d3ee', '#67e8f9', '#a5f3fc'];

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
              <p className="text-3xl font-bold text-gray-900 mt-2">{dashboardStats.totalPatients}</p>
              <p className="text-xs text-gray-500 mt-1">↑ 12 from last month</p>
            </div>
            <Users className="text-cyan-600" size={40} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-600 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Today's Appointments</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{dashboardStats.todayAppointments}</p>
              <p className="text-xs text-gray-500 mt-1">↑ 3 pending</p>
            </div>
            <Calendar className="text-green-600" size={40} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-600 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Medical Records</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{patients.length * 25}</p>
              <p className="text-xs text-gray-500 mt-1">↑ {Math.floor(dashboardStats.pendingReports * 5)} updated</p>
            </div>
            <FileText className="text-purple-600" size={40} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-amber-600 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Pending Lab Reports</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{dashboardStats.pendingReports}</p>
              <p className="text-xs text-gray-500 mt-1">Require review</p>
            </div>
            <Pill className="text-amber-600" size={40} />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Patient Growth Chart */}
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

        {/* Department Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Department Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={departmentData} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name} ${value}%`} outerRadius={80} fill="#8884d8" dataKey="value">
                {departmentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Activity size={24} className="text-cyan-600" />
            Recent Activities
          </h2>
          <div className="space-y-3">
            {activities.slice(0, 5).map(activity => (
              <div key={activity.id} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-b-0">
                <div className="w-2 h-2 bg-cyan-600 rounded-full mt-2 flex-shrink-0"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                  <p className="text-xs text-gray-500">{activity.user} • {activity.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">System Overview</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-cyan-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Active Users Online</span>
              <span className="text-lg font-bold text-cyan-600">{dashboardStats.activeUsers}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Completed Appointments</span>
              <span className="text-lg font-bold text-green-600">{appointments.filter(a => a.status === 'completed').length}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Lab Reports (Reviewed)</span>
              <span className="text-lg font-bold text-purple-600">{labReports.filter(l => l.status === 'reviewed').length}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">System Uptime</span>
              <span className="text-lg font-bold text-amber-600">99.9%</span>
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
