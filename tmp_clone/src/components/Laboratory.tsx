import React, { useState } from 'react';
import { FlaskConical, Search, Upload, CheckCircle, Clock, Eye, Download, User, Calendar, AlertCircle, X } from 'lucide-react';
import { labReports } from '../data';
import { useToast } from '../hooks/useToast';

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'completed':
      return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700"><CheckCircle className="w-3 h-3" />Completed</span>;
    case 'pending':
      return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700"><Clock className="w-3 h-3" />Pending</span>;
    case 'verified':
      return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700"><CheckCircle className="w-3 h-3" />Verified</span>;
    default:
      return null;
  }
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'Blood Test': return '🩸';
    case 'Pulmonary Function': return '🫁';
    case 'Imaging': return '🔬';
    case 'Biopsy': return '🔎';
    default: return '🧪';
  }
};

const Laboratory: React.FC = () => {
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedReport, setSelectedReport] = useState<typeof labReports[0] | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const filteredReports = labReports.filter(r => {
    const matchesSearch = r.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.testName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.labName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = labReports.filter(r => r.status === 'pending').length;
  const completedCount = labReports.filter(r => r.status === 'completed').length;
  const verifiedCount = labReports.filter(r => r.status === 'verified').length;

  if (selectedReport) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSelectedReport(null)}
            className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            <Eye className="w-5 h-5 text-slate-600 rotate-180" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Lab Report Detail</h1>
            <p className="text-slate-500 text-sm">ID: {selectedReport.id} • Uploaded by {selectedReport.labName}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden">
          <div className="bg-gradient-to-r from-violet-600 to-purple-500 h-20" />
          <div className="px-6 pb-6 -mt-8">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white shadow-lg flex items-center justify-center text-3xl border-4 border-white">
                {getTypeIcon(selectedReport.type)}
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-slate-900">{selectedReport.testName}</h2>
                <p className="text-sm text-slate-500">{selectedReport.type} • {selectedReport.labName}</p>
              </div>
              {getStatusBadge(selectedReport.status)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 border border-slate-200/60">
            <p className="text-xs text-slate-500">Patient</p>
            <p className="text-sm font-semibold text-slate-900 mt-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              {selectedReport.patientName}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200/60">
            <p className="text-xs text-slate-500">Date</p>
            <p className="text-sm font-semibold text-slate-900 mt-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              {selectedReport.date}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200/60">
            <p className="text-xs text-slate-500">Verified By</p>
            <p className="text-sm font-semibold text-slate-900 mt-1">
              {selectedReport.verifiedBy || 'Pending verification'}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/60 p-6">
          <h3 className="text-base font-semibold text-slate-900 mb-4">Test Results</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.entries(selectedReport.results).map(([key, value]) => (
              <div key={key} className="bg-slate-50 rounded-xl px-4 py-3 flex items-center justify-between">
                <span className="text-sm text-slate-600">{key}</span>
                <span className="text-sm font-bold text-slate-900">{value}</span>
              </div>
            ))}
          </div>
          {selectedReport.notes && (
            <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
              <p className="text-xs font-semibold text-amber-900">Notes</p>
              <p className="text-sm text-amber-700 mt-1">{selectedReport.notes}</p>
            </div>
          )}
        </div>

        {selectedReport.status === 'pending' && (
          <div className="flex items-center gap-3">
            <button 
              onClick={() => { showToast(`Report ${selectedReport.id} verified successfully!`, 'success'); setSelectedReport(null); }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
              Verify Report
            </button>
            <button 
              onClick={() => { showToast(`Report ${selectedReport.id} flagged for review.`, 'error'); }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors"
            >
              <AlertCircle className="w-4 h-4" />
              Flag for Review
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
          <h1 className="text-2xl font-bold text-slate-900">Laboratory Module</h1>
          <p className="text-slate-500 mt-1">Upload, verify, and manage lab test reports</p>
        </div>
        <button 
          onClick={() => setShowUploadModal(true)}
          className="bg-gradient-to-r from-violet-600 to-violet-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:from-violet-700 hover:to-violet-600 transition-all shadow-md shadow-violet-500/20 flex items-center gap-2 self-start"
        >
          <Upload className="w-4 h-4" />
          Upload Report
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/60 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-violet-50 flex items-center justify-center">
            <FlaskConical className="w-6 h-6 text-violet-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{labReports.length}</p>
            <p className="text-sm text-slate-500">Total Reports</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-200/60 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
            <Clock className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{pendingCount}</p>
            <p className="text-sm text-slate-500">Pending Verification</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-200/60 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-emerald-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{completedCount + verifiedCount}</p>
            <p className="text-sm text-slate-500">Completed & Verified</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search reports..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          {['all', 'completed', 'pending', 'verified'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                statusFilter === status
                  ? 'bg-violet-600 text-white shadow-md shadow-violet-500/20'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Report Cards */}
      <div className="space-y-3">
        {filteredReports.map((report) => (
          <div
            key={report.id}
            className="bg-white rounded-2xl p-5 border border-slate-200/60 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300 cursor-pointer"
            onClick={() => setSelectedReport(report)}
          >
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center gap-3 flex-1">
                <span className="text-2xl">{getTypeIcon(report.type)}</span>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">{report.testName}</h3>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                    <span>{report.patientName}</span>
                    <span>•</span>
                    <span>{report.labName}</span>
                    <span>•</span>
                    <span>{report.date}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {getStatusBadge(report.status)}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelectedReport(report); }}
                    className="p-2 rounded-lg bg-violet-50 text-violet-600 hover:bg-violet-100 transition-colors"
                    title="View Report"
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

      {filteredReports.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200/60">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <FlaskConical className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">No lab reports found</h3>
          <p className="text-sm text-slate-500 mt-1">Try adjusting your search or filter criteria</p>
        </div>
      )}

      {/* Upload Report Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Upload Lab Report</h3>
              <button onClick={() => setShowUploadModal(false)} className="p-1 rounded-lg hover:bg-slate-100">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl p-6 text-center">
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm text-slate-600">Drop lab report file here</p>
                <p className="text-xs text-slate-400 mt-1">or click to browse (PDF, JPG, PNG)</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Patient ID</label>
                <input type="text" placeholder="UDHRS-PXXXXX" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-violet-500/30" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Test Name</label>
                <input type="text" placeholder="e.g. Complete Blood Count" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30" />
              </div>
            </div>
            <div className="flex items-center gap-3 mt-6">
              <button onClick={() => setShowUploadModal(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
              <button onClick={() => { showToast('Lab report uploaded successfully!', 'success'); setShowUploadModal(false); }} className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 text-white text-sm font-medium hover:from-violet-700 hover:to-violet-600 transition-all shadow-md shadow-violet-500/20">Upload</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Laboratory;
