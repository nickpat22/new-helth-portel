import React, { useState } from 'react';
import { Calendar, Clock, User, Plus, CheckCircle, XCircle, X } from 'lucide-react';
import { appointments } from '../data';
import { useToast } from '../hooks/useToast';

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'upcoming': return 'bg-blue-100 text-blue-700';
    case 'completed': return 'bg-emerald-100 text-emerald-700';
    case 'cancelled': return 'bg-red-100 text-red-600';
    default: return 'bg-slate-100 text-slate-600';
  }
};

const getAvatarColor = (name: string) => {
  const colors = [
    'from-blue-500 to-blue-600',
    'from-cyan-500 to-teal-500',
    'from-violet-500 to-purple-500',
    'from-rose-500 to-pink-500',
    'from-amber-500 to-orange-500',
    'from-emerald-500 to-green-500',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

const Appointments: React.FC = () => {
  const { showToast } = useToast();
  const [filter, setFilter] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [apptPatient, setApptPatient] = useState('');
  const [apptDate, setApptDate] = useState('');
  const [apptTime, setApptTime] = useState('');
  const [apptType, setApptType] = useState('');

  const filteredAppointments = appointments.filter(a =>
    filter === 'all' || a.status === filter
  );

  const upcomingCount = appointments.filter(a => a.status === 'upcoming').length;
  const completedCount = appointments.filter(a => a.status === 'completed').length;
  const cancelledCount = appointments.filter(a => a.status === 'cancelled').length;

  const handleCreateAppointment = () => {
    if (!apptPatient.trim() || !apptDate || !apptTime || !apptType.trim()) {
      showToast('Please fill in all fields.', 'error');
      return;
    }
    showToast(`Appointment scheduled for ${apptPatient} on ${apptDate} at ${apptTime}.`, 'success');
    setShowModal(false);
    setApptPatient('');
    setApptDate('');
    setApptTime('');
    setApptType('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Appointments</h1>
          <p className="text-slate-500 mt-1">Manage patient appointments</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:from-blue-700 hover:to-blue-600 transition-all shadow-md shadow-blue-500/20 flex items-center gap-2 self-start"
        >
          <Plus className="w-4 h-4" />
          New Appointment
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/60 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
            <Clock className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{upcomingCount}</p>
            <p className="text-sm text-slate-500">Upcoming</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-200/60 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-emerald-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{completedCount}</p>
            <p className="text-sm text-slate-500">Completed</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-200/60 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center">
            <XCircle className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{cancelledCount}</p>
            <p className="text-sm text-slate-500">Cancelled</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/60 flex items-center gap-3">
        <Calendar className="w-4 h-4 text-slate-400" />
        {['all', 'upcoming', 'completed', 'cancelled'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filter === status
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Appointments List */}
      <div className="space-y-3">
        {filteredAppointments.map((appt) => (
          <div
            key={appt.id}
            className="bg-white rounded-2xl p-5 border border-slate-200/60 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300"
          >
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              {/* Patient Avatar */}
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getAvatarColor(appt.patientName)} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                {appt.patientName.split(' ').map(n => n[0]).join('')}
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold text-slate-900">{appt.patientName}</h3>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${getStatusBadge(appt.status)}`}>
                    {appt.status}
                  </span>
                </div>
                <p className="text-sm text-slate-500 mt-1">{appt.type}</p>
              </div>

              {/* Details */}
              <div className="flex items-center gap-6 text-sm text-slate-500">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  <span>{appt.date}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  <span>{appt.time}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <User className="w-4 h-4" />
                  <span>{appt.doctor}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredAppointments.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200/60">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">No appointments found</h3>
          <p className="text-sm text-slate-500 mt-1">Try adjusting your filter criteria</p>
        </div>
      )}

      {/* New Appointment Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Schedule New Appointment</h3>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-slate-100">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Patient Name *</label>
                <input type="text" value={apptPatient} onChange={(e) => setApptPatient(e.target.value)} placeholder="Enter patient name" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Date *</label>
                  <input type="date" value={apptDate} onChange={(e) => setApptDate(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Time *</label>
                  <input type="time" value={apptTime} onChange={(e) => setApptTime(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Appointment Type *</label>
                <input type="text" value={apptType} onChange={(e) => setApptType(e.target.value)} placeholder="e.g. Follow-up, Check-up" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
              </div>
            </div>
            <div className="flex items-center gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
              <button onClick={handleCreateAppointment} className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white text-sm font-medium hover:from-blue-700 hover:to-blue-600 transition-all shadow-md shadow-blue-500/20">Schedule</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Appointments;
