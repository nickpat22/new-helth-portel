import React, { useState } from 'react';
import { Pill, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { prescriptions } from '../data';

const Pharmacy: React.FC = () => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'expired' | 'dispensed'>('all');

  const filteredPrescriptions = prescriptions.filter(rx =>
    filterStatus === 'all' || rx.status === filterStatus
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="text-green-600" size={20} />;
      case 'expired':
        return <AlertCircle className="text-red-600" size={20} />;
      case 'dispensed':
        return <Clock className="text-blue-600" size={20} />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      case 'dispensed':
        return 'bg-blue-100 text-blue-800';
      default:
        return '';
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Pharmacy</h1>
        <p className="text-gray-600">Manage prescriptions and medications</p>
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
            <option value="all">All Prescriptions</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="dispensed">Dispensed</option>
          </select>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Showing {filteredPrescriptions.length} of {prescriptions.length} prescriptions
        </p>
      </div>

      {/* Prescriptions Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredPrescriptions.map(rx => (
          <div key={rx.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-amber-100 p-3 rounded-lg">
                  <Pill className="text-amber-600" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{rx.patientName}</h3>
                  <p className="text-sm text-gray-600">Rx: {rx.id}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(rx.status)}
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(rx.status)}`}>
                  {rx.status.charAt(0).toUpperCase() + rx.status.slice(1)}
                </span>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-xs text-gray-600 font-semibold mb-2">Medications:</p>
                <div className="space-y-2">
                  {rx.medications.map((med, idx) => (
                    <div key={idx} className="text-sm">
                      <p className="font-medium text-gray-900">{med.name}</p>
                      <p className="text-gray-600">{med.dosage} • {med.frequency}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-gray-600">Prescribed Date:</p>
                  <p className="font-medium text-gray-900">{rx.prescribedDate}</p>
                </div>
                <div>
                  <p className="text-gray-600">Expiry Date:</p>
                  <p className="font-medium text-gray-900">{rx.expiryDate}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button className="flex-1 px-3 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-700 transition-colors text-sm font-medium">
                Edit
              </button>
              <button className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors text-sm font-medium">
                Dispense
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredPrescriptions.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Pill size={48} className="mx-auto mb-4 opacity-20" />
          <p>No prescriptions found for the selected status.</p>
        </div>
      )}
    </div>
  );
};

export default Pharmacy;
