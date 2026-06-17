import React, { useState, useEffect } from 'react';
import { FlaskConical, CheckCircle, Clock, Plus } from 'lucide-react';
import { getLabReports, addLabReport, updateLabReportStatus, getPatients, logActivity } from '../lib/supabaseService';
import { useToast } from '../hooks/useToast';
import { useAuth } from '../auth/AuthContext';
import Modal from './Modal';

const emptyForm = { patient_id: '', patient_name: '', test_type: '', test_date: '', results: '' };

const Laboratory: React.FC = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed' | 'reviewed'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewReport, setViewReport] = useState<any>(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();
  const { user } = useAuth();

  const fetchData = async () => {
    setLoading(true);
    const [reportsRes, patsRes] = await Promise.all([getLabReports(), getPatients()]);
    if (reportsRes.data) setReports(reportsRes.data);
    if (patsRes.data) setPatients(patsRes.data);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const filteredReports = reports.filter(report =>
    filterStatus === 'all' || report.status === filterStatus
  );

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.patient_name || !form.test_type || !form.test_date) { showToast('Patient, test type & date required', 'error'); return; }
    setSubmitting(true);
    const { error } = await addLabReport(form);
    if (error) showToast('Failed: ' + error.message, 'error');
    else {
      showToast('Lab report created', 'success');
      await logActivity('lab_result', `Lab report created: ${form.test_type} for ${form.patient_name}`, user?.fullName || 'System');
      setShowAddModal(false); setForm(emptyForm); fetchData();
    }
    setSubmitting(false);
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    const { error } = await updateLabReportStatus(id, newStatus);
    if (error) showToast('Failed: ' + error.message, 'error');
    else {
      showToast(`Status updated to ${newStatus}`, 'success');
      await logActivity('lab_result', `Lab report ${id} marked as ${newStatus}`, user?.fullName || 'System');
      fetchData();
    }
  };

  const handlePatientSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const p = patients.find(p => p.id === e.target.value);
    if (p) setForm({ ...form, patient_id: p.id, patient_name: p.name });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="text-green-600" size={20} />;
      case 'pending': return <Clock className="text-yellow-600" size={20} />;
      case 'reviewed': return <CheckCircle className="text-blue-600" size={20} />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'reviewed': return 'bg-blue-100 text-blue-800';
      default: return '';
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading lab reports…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Laboratory</h1>
          <p className="text-gray-600 mt-1">View and manage lab test results</p>
        </div>
        <button onClick={() => { setForm(emptyForm); setShowAddModal(true); }} className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors text-sm font-medium">
          <Plus size={20} /> New Lab Report
        </button>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Filter by Status:</label>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as any)} className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent">
            <option value="all">All Reports</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="reviewed">Reviewed</option>
          </select>
        </div>
        <p className="text-sm text-gray-600 mt-2">Showing {filteredReports.length} of {reports.length} lab reports</p>
      </div>

      {/* Lab Reports Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredReports.map(report => (
          <div key={report.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 p-3 rounded-lg"><FlaskConical className="text-purple-600" size={24} /></div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{report.test_type}</h3>
                  <p className="text-sm text-gray-600">{report.patient_name}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(report.status)}
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                  {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                </span>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Patient ID:</span>
                <span className="font-medium text-gray-900">{report.patient_id}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Test Date:</span>
                <span className="font-medium text-gray-900">{report.test_date}</span>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-xs text-gray-600 mb-1">Results:</p>
                <p className="text-sm text-gray-900">{report.results || 'Awaiting results'}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={() => { setViewReport(report); setShowViewModal(true); }} className="flex-1 px-3 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-700 transition-colors text-sm font-medium">View Details</button>
              {report.status === 'pending' && (
                <button onClick={() => handleStatusUpdate(report.id, 'completed')} className="flex-1 px-3 py-2 border border-green-600 text-green-700 rounded hover:bg-green-50 transition-colors text-sm font-medium">Mark Complete</button>
              )}
              {report.status === 'completed' && (
                <button onClick={() => handleStatusUpdate(report.id, 'reviewed')} className="flex-1 px-3 py-2 border border-blue-600 text-blue-700 rounded hover:bg-blue-50 transition-colors text-sm font-medium">Mark Reviewed</button>
              )}
              {report.status === 'reviewed' && (
                <button onClick={() => showToast('Report downloaded', 'info')} className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors text-sm font-medium">Download</button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredReports.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <FlaskConical size={48} className="mx-auto mb-4 opacity-20" />
          <p>No lab reports found for the selected status.</p>
        </div>
      )}

      {/* Add Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="New Lab Report" maxWidth="max-w-xl">
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Patient *</label>
            <select value={form.patient_id} onChange={handlePatientSelect} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent" required>
              <option value="">Select patient</option>
              {patients.map(p => <option key={p.id} value={p.id}>{p.name} ({p.id})</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Test Type *</label>
              <input value={form.test_type} onChange={e => setForm({ ...form, test_type: e.target.value })} placeholder="e.g. Blood Test" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Test Date *</label>
              <input type="date" value={form.test_date} onChange={e => setForm({ ...form, test_date: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Results</label>
            <textarea value={form.results} onChange={e => setForm({ ...form, results: e.target.value })} rows={3} placeholder="Enter test results..." className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={submitting} className="px-4 py-2 bg-cyan-600 text-white rounded-lg text-sm hover:bg-cyan-700 disabled:opacity-50">{submitting ? 'Saving…' : 'Create Report'}</button>
          </div>
        </form>
      </Modal>

      {/* View Modal */}
      <Modal isOpen={showViewModal} onClose={() => setShowViewModal(false)} title="Lab Report Details">
        {viewReport && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-gray-50 p-3 rounded-lg"><p className="text-gray-500">Test Type</p><p className="font-medium">{viewReport.test_type}</p></div>
              <div className="bg-gray-50 p-3 rounded-lg"><p className="text-gray-500">Patient</p><p className="font-medium">{viewReport.patient_name}</p></div>
              <div className="bg-gray-50 p-3 rounded-lg"><p className="text-gray-500">Test Date</p><p className="font-medium">{viewReport.test_date}</p></div>
              <div className="bg-gray-50 p-3 rounded-lg"><p className="text-gray-500">Status</p><p className="font-medium capitalize">{viewReport.status}</p></div>
              <div className="bg-gray-50 p-3 rounded-lg col-span-2"><p className="text-gray-500">Results</p><p className="font-medium">{viewReport.results || 'Awaiting results'}</p></div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Laboratory;
