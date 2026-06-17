import React, { useState } from 'react';
import { Search, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { patients } from '../data';

interface PatientListProps {
  onSelectPatient: (patientId: string) => void;
}

const PatientList: React.FC<PatientListProps> = ({ onSelectPatient }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'critical'>('all');

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || patient.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="text-green-600" size={20} />;
      case 'critical':
        return <AlertCircle className="text-red-600" size={20} />;
      case 'inactive':
        return <Clock className="text-gray-600" size={20} />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return '';
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Patient Management</h1>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="critical">Critical</option>
          </select>
        </div>
        <p className="text-sm text-gray-600">
          Showing {filteredPatients.length} of {patients.length} patients
        </p>
      </div>

      {/* Patients Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Patient ID</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Age</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Contact</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Condition</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Last Visit</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredPatients.map(patient => (
                <tr key={patient.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-900 font-medium">{patient.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{patient.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{patient.age}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <div>{patient.email}</div>
                    <div className="text-gray-500">{patient.phone}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{patient.condition}</td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(patient.status)}
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(patient.status)}`}>
                        {patient.status.charAt(0).toUpperCase() + patient.status.slice(1)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{patient.lastVisit}</td>
                  <td className="px-6 py-4 text-sm">
                    <button
                      onClick={() => onSelectPatient(patient.id)}
                      className="px-4 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-700 transition-colors text-xs font-medium"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPatients.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No patients found matching your search criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientList;
