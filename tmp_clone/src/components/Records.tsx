import React, { useState } from 'react';
import { FileText, Search, Download, Eye, Calendar, User } from 'lucide-react';

const Records: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const recordTypes = [
    { id: 'all', label: 'All Records', count: 92 },
    { id: 'lab_report', label: 'Lab Reports', count: 24 },
    { id: 'prescription', label: 'Prescriptions', count: 18 },
    { id: 'imaging', label: 'Imaging', count: 12 },
    { id: 'consultation', label: 'Consultations', count: 30 },
  ];

  // Map UDHRS record types to display

  const mockRecords = [
    { id: 'UDHRS-REC001', patient: 'Sarah Johnson', type: 'lab_report', title: 'Complete Blood Count & Metabolic Panel', date: '2024-12-10', doctor: 'Dr. Smith', size: '2.4 MB', status: 'verified' },
    { id: 'UDHRS-REC002', patient: 'Michael Chen', type: 'imaging', title: 'Echocardiogram Report', date: '2024-12-09', doctor: 'Dr. Patel', size: '15.8 MB', status: 'verified' },
    { id: 'UDHRS-REC003', patient: 'Emily Rodriguez', type: 'consultation', title: 'Pulmonary Function Assessment', date: '2024-12-08', doctor: 'Dr. Williams', size: '1.2 MB', status: 'verified' },
    { id: 'UDHRS-REC004', patient: 'James Wilson', type: 'lab_report', title: 'Spirometry Results', date: '2024-12-07', doctor: 'Dr. Smith', size: '3.1 MB', status: 'verified' },
    { id: 'UDHRS-REC005', patient: 'Olivia Martinez', type: 'consultation', title: 'Prenatal Ultrasound Report', date: '2024-12-06', doctor: 'Dr. Williams', size: '8.5 MB', status: 'verified' },
    { id: 'UDHRS-REC006', patient: 'Robert Thompson', type: 'prescription', title: 'Updated Medication List', date: '2024-12-05', doctor: 'Dr. Patel', size: '0.5 MB', status: 'verified' },
    { id: 'UDHRS-REC007', patient: 'Sarah Johnson', type: 'prescription', title: 'Prescription Renewal - Metformin', date: '2024-12-04', doctor: 'Dr. Smith', size: '0.3 MB', status: 'verified' },
    { id: 'UDHRS-REC008', patient: 'Michael Chen', type: 'lab_report', title: 'Lipid Panel - LDL 145 mg/dL', date: '2024-12-03', doctor: 'Dr. Patel', size: '1.8 MB', status: 'verified' },
  ];

  const filteredRecords = mockRecords.filter(r => {
    const matchesSearch = r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.patient.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || r.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'lab_report': return 'bg-blue-100 text-blue-700';
      case 'imaging': return 'bg-violet-100 text-violet-700';
      case 'consultation': return 'bg-emerald-100 text-emerald-700';
      case 'prescription': return 'bg-amber-100 text-amber-700';
      case 'discharge': return 'bg-rose-100 text-rose-700';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  const getRecordIcon = (type: string) => {
    switch (type) {
      case 'lab_report': return '🧪';
      case 'imaging': return '🔬';
      case 'consultation': return '💬';
      case 'prescription': return '💊';
      case 'discharge': return '🏥';
      default: return '📄';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Medical Records</h1>
          <p className="text-slate-500 mt-1">Browse and manage patient documents</p>
        </div>
        <button className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:from-blue-700 hover:to-blue-600 transition-all shadow-md shadow-blue-500/20 flex items-center gap-2 self-start">
          <FileText className="w-4 h-4" />
          Upload Document
        </button>
      </div>

      {/* Record Type Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {recordTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => setTypeFilter(type.id)}
            className={`p-4 rounded-xl border text-center transition-all ${
              typeFilter === type.id
                ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20'
                : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-md'
            }`}
          >
            <p className={`text-2xl font-bold ${typeFilter === type.id ? 'text-white' : 'text-slate-900'}`}>{type.count}</p>
            <p className={`text-xs mt-1 ${typeFilter === type.id ? 'text-blue-100' : 'text-slate-500'}`}>{type.label}</p>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search records by title or patient name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
        />
      </div>

      {/* Records List */}
      <div className="space-y-3">
        {filteredRecords.map((record) => (
          <div
            key={record.id}
            className="bg-white rounded-2xl p-5 border border-slate-200/60 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300"
          >
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center gap-3 flex-1">
                <span className="text-2xl">{getRecordIcon(record.type)}</span>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">{record.title}</h3>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {record.patient}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {record.date}
                    </span>
                    <span>{record.size}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${getTypeColor(record.type)}`}>
                  {record.type.replace('_', ' ')}
                </span>
                <div className="flex items-center gap-1.5">
                  <button className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors" title="View">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="p-2 rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors" title="Download">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredRecords.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200/60">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">No records found</h3>
          <p className="text-sm text-slate-500 mt-1">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  );
};

export default Records;
