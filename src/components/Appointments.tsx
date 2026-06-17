import React, { useState } from 'react';
import { Calendar, MapPin, User, Clock } from 'lucide-react';
import { appointments } from '../data';

const Appointments: React.FC = () => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'>('all');

  const filteredAppointments = appointments.filter(apt =>
    filterStatus === 'all' || apt.status === filterStatus
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return '';
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Appointments</h1>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Filter by Status:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          >
            <option value="all">All Appointments</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Showing {filteredAppointments.length} of {appointments.length} appointments
        </p>
      </div>

      {/* Appointments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAppointments.map(appointment => (
          <div key={appointment.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{appointment.patientName}</h3>
                <p className="text-sm text-gray-600">{appointment.type}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
              </span>
            </div>

            <div className="space-y-3 text-sm text-gray-600 mb-4">
              <div className="flex items-center gap-2">
                <User size={16} className="text-cyan-600" />
                <span>Dr. {appointment.doctorName.split(' ').slice(1).join(' ')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-cyan-600" />
                <span>{appointment.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-cyan-600" />
                <span>{appointment.time}</span>
              </div>
            </div>

            {appointment.notes && (
              <div className="bg-gray-50 p-3 rounded text-sm text-gray-700 mb-4">
                <p className="font-medium text-gray-900 mb-1">Notes:</p>
                <p>{appointment.notes}</p>
              </div>
            )}

            <div className="flex gap-2">
              <button className="flex-1 px-3 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-700 transition-colors text-sm font-medium">
                Edit
              </button>
              <button className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors text-sm font-medium">
                Cancel
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredAppointments.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Calendar size={48} className="mx-auto mb-4 opacity-20" />
          <p>No appointments found for the selected status.</p>
        </div>
      )}
    </div>
  );
};

export default Appointments;
