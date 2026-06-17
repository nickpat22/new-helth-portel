import React, { useState } from 'react';
import { Search, Filter, Plus, ChevronRight, Eye, Phone, Mail, X } from 'lucide-react';
import { patients } from '../data';
import { Patient } from '../types';
import { useToast } from '../hooks/useToast';

interface PatientListProps {
  onSelectPatient: (patient: Patient) => void;
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'active':
      return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />Active</span>;
    case 'critical':
      return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700"><span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />Critical</span>;
    case 'inactive':
      return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-500"><span className="w-1.5 h-1.5 rounded-full bg-slate-400" />Inactive</span>;
    default:
      return null;
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

const PatientList: React.FC<PatientListProps> = ({ onSelectPatient }) => {
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPatientName, setNewPatientName] = useState('');
  const [newPatientAge, setNewPatientAge] = useState('');
  const [newPatientGender, setNewPatientGender] = useState('Male');
  const [newPatientPhone, setNewPatientPhone] = useState('');

  const filteredPatients = patients.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAddPatient = () => {
    if (!newPatientName.trim() || !newPatientAge || !newPatientPhone.trim()) {
      showToast('Please fill in all required fields.', 'error');
      return;
    }
    showToast(`Patient "${newPatientName}" registered successfully!`, 'success');
    setShowAddModal(false);
    setNewPatientName('');
    setNewPatientAge('');
    setNewPatientGender('Male');
    setNewPatientPhone('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Patients</h1>
          <p className="text-slate-500 mt-1">Manage and view patient records</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:from-blue-700 hover:to-blue-600 transition-all shadow-md shadow-blue-500/20 flex items-center gap-2 self-start"
        >
          <Plus className="w-4 h-4" />
          Add Patient
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/60 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search patients by name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          {['all', 'active', 'critical'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                statusFilter === status
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Patient Cards */}
      <div className="grid gap-4">
        {filteredPatients.map((patient) => (
          <div
            key={patient.id}
            className="bg-white rounded-2xl p-5 border border-slate-200/60 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300 group cursor-pointer"
            onClick={() => onSelectPatient(patient)}
          >
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              {/* Avatar & Basic Info */}
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${getAvatarColor(patient.name)} flex items-center justify-center text-white font-bold text-lg shadow-lg flex-shrink-0`}>
                  {patient.avatar}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-semibold text-slate-900">{patient.name}</h3>
                    <span className="text-xs text-slate-400 font-mono bg-slate-100 px-2 py-0.5 rounded">{patient.id}</span>
                    <span className="text-xs text-blue-500 bg-blue-50 px-2 py-0.5 rounded font-medium">UDHRS</span>
                    {getStatusBadge(patient.status)}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                    <span>{patient.age} years</span>
                    <span>•</span>
                    <span>{patient.gender}</span>
                    <span>•</span>
                    <span className="text-red-500 font-medium">{patient.bloodType}</span>
                  </div>
                </div>
              </div>

              {/* Conditions */}
              <div className="flex-1 flex flex-wrap gap-1.5">
                {patient.conditions.map((condition, i) => (
                  <span key={i} className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg font-medium">
                    {condition}
                  </span>
                ))}
              </div>

              {/* Contact & Actions */}
              <div className="flex items-center gap-3 lg:flex-shrink-0">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Phone className="w-3.5 h-3.5" />
                  <span className="text-xs">{patient.phone}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Mail className="w-3.5 h-3.5" />
                  <span className="text-xs">{patient.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); onSelectPatient(patient); }}
                    className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredPatients.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200/60">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">No patients found</h3>
          <p className="text-sm text-slate-500 mt-1">Try adjusting your search or filter criteria</p>
        </div>
      )}

      {/* Add Patient Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Register New Patient</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 rounded-lg hover:bg-slate-100">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name *</label>
                <input type="text" value={newPatientName} onChange={(e) => setNewPatientName(e.target.value)} placeholder="Enter patient name" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Age *</label>
                  <input type="number" value={newPatientAge} onChange={(e) => setNewPatientAge(e.target.value)} placeholder="Years" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Gender</label>
                  <select value={newPatientGender} onChange={(e) => setNewPatientGender(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30">
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone Number *</label>
                <input type="tel" value={newPatientPhone} onChange={(e) => setNewPatientPhone(e.target.value)} placeholder="(555) 000-0000" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
              </div>
            </div>
            <div className="flex items-center gap-3 mt-6">
              <button onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
              <button onClick={handleAddPatient} className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white text-sm font-medium hover:from-blue-700 hover:to-blue-600 transition-all shadow-md shadow-blue-500/20">Register Patient</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientList;
