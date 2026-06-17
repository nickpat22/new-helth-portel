import React, { useState } from 'react';
import { Pill, Search, CheckCircle, Clock, XCircle, Eye, User, Calendar, Shield, Download } from 'lucide-react';
import { prescriptions } from '../data';
import { useToast } from '../hooks/useToast';

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'dispensed':
      return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700"><CheckCircle className="w-3 h-3" />Dispensed</span>;
    case 'pending':
      return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700"><Clock className="w-3 h-3" />Pending</span>;
    case 'cancelled':
      return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-600"><XCircle className="w-3 h-3" />Cancelled</span>;
    default:
      return null;
  }
};

const Pharmacy: React.FC = () => {
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRx, setSelectedRx] = useState<typeof prescriptions[0] | null>(null);

  const filteredPrescriptions = prescriptions.filter(rx => {
    const matchesSearch = rx.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rx.medications.some(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || rx.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = prescriptions.filter(r => r.status === 'pending').length;
  const totalMeds = prescriptions.reduce((acc, rx) => acc + rx.medications.length, 0);

  if (selectedRx) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSelectedRx(null)}
            className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            <Eye className="w-5 h-5 text-slate-600 rotate-180" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-900">Prescription Detail</h1>
            <p className="text-slate-500 text-sm">ID: {selectedRx.id} • Issued by {selectedRx.doctor}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg text-xs font-medium border border-emerald-200">
              <Shield className="w-3.5 h-3.5" />
              <span>Verified via RSA</span>
            </div>
          </div>
        </div>

        {/* Prescription Header */}
        <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-500 h-20" />
          <div className="px-6 pb-6 -mt-8">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white shadow-lg flex items-center justify-center text-3xl border-4 border-white">
                💊
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-slate-900">Prescription for {selectedRx.patientName}</h2>
                <p className="text-sm text-slate-500">{selectedRx.medications.length} medication(s) • {selectedRx.date}</p>
              </div>
              {getStatusBadge(selectedRx.status)}
            </div>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 border border-slate-200/60">
            <p className="text-xs text-slate-500">Prescribed By</p>
            <p className="text-sm font-semibold text-slate-900 mt-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              {selectedRx.doctor}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200/60">
            <p className="text-xs text-slate-500">Pharmacy</p>
            <p className="text-sm font-semibold text-slate-900 mt-1">
              {selectedRx.pharmacy || 'Not yet assigned'}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200/60">
            <p className="text-xs text-slate-500">Dispensed On</p>
            <p className="text-sm font-semibold text-slate-900 mt-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              {selectedRx.dispensedDate || 'Pending'}
            </p>
          </div>
        </div>

        {/* Medications */}
        <div className="bg-white rounded-2xl border border-slate-200/60 p-6">
          <h3 className="text-base font-semibold text-slate-900 mb-4">Prescribed Medications</h3>
          <div className="space-y-3">
            {selectedRx.medications.map((med, i) => (
              <div key={i} className="bg-slate-50 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center flex-shrink-0">
                  <Pill className="w-5 h-5 text-violet-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-900">{med.name}</p>
                  <p className="text-xs text-slate-500">{med.dosage} • {med.frequency}</p>
                </div>
                <div className="text-right text-xs text-slate-500">
                  <p>Qty: {med.quantity}</p>
                  <p>Duration: {med.duration}</p>
                </div>
              </div>
            ))}
          </div>
          {selectedRx.notes && (
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
              <p className="text-xs font-semibold text-blue-900">Doctor's Notes</p>
              <p className="text-sm text-blue-700 mt-1">{selectedRx.notes}</p>
            </div>
          )}
        </div>

        {selectedRx.status === 'pending' && (
          <div className="flex items-center gap-3">
            <button 
              onClick={() => { showToast(`Prescription ${selectedRx.id} marked as dispensed.`, 'success'); setSelectedRx(null); }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
              Mark as Dispensed
            </button>
            <button 
              onClick={() => { showToast(`Prescription ${selectedRx.id} rejected.`, 'error'); setSelectedRx(null); }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors"
            >
              <XCircle className="w-4 h-4" />
              Reject Prescription
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Pharmacy Module</h1>
          <p className="text-slate-500 mt-1">Access prescriptions, verify, and update dispensing status</p>
        </div>
        <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg text-xs font-medium border border-emerald-200">
          <Shield className="w-3.5 h-3.5" />
          <span>All prescriptions verified by RSA</span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/60 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
            <Pill className="w-6 h-6 text-emerald-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{prescriptions.length}</p>
            <p className="text-sm text-slate-500">Total Prescriptions</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-200/60 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
            <Clock className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{pendingCount}</p>
            <p className="text-sm text-slate-500">Pending Dispensing</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-200/60 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{totalMeds}</p>
            <p className="text-sm text-slate-500">Total Medications</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search prescriptions by patient or medication..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          {['all', 'pending', 'dispensed', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                statusFilter === status
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Prescription Cards */}
      <div className="space-y-3">
        {filteredPrescriptions.map((rx) => (
          <div
            key={rx.id}
            className="bg-white rounded-2xl p-5 border border-slate-200/60 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300 cursor-pointer"
            onClick={() => setSelectedRx(rx)}
          >
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <Pill className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">{rx.patientName}</h3>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {rx.medications.map((med, i) => (
                      <span key={i} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                        {med.name} ({med.dosage})
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                    <span>By: {rx.doctor}</span>
                    <span>•</span>
                    <span>{rx.date}</span>
                    {rx.pharmacy && (
                      <>
                        <span>•</span>
                        <span>{rx.pharmacy}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {getStatusBadge(rx.status)}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelectedRx(rx); }}
                    className="p-2 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    className="p-2 rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors"
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredPrescriptions.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200/60">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <Pill className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">No prescriptions found</h3>
          <p className="text-sm text-slate-500 mt-1">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  );
};

export default Pharmacy;
