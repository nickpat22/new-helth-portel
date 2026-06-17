import React, { useState, useEffect } from 'react';
import { FileText, Eye, Download, Trash2, Plus } from 'lucide-react';
import { getMedicalRecords, addMedicalRecord, deleteMedicalRecord, updateMedicalRecord, logActivity } from '../lib/supabaseService';
import { useToast } from '../hooks/useToast';
import { useAuth } from '../auth/AuthContext';
import Modal from './Modal';

const emptyForm = { title: '', type: 'Blood Test', date: '', provider: '', file_size: '', patient_id: '' };

const Records: React.FC = () => {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [viewRecord, setViewRecord] = useState<any>(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();
  const { user } = useAuth();

  const fetchRecords = async () => {
    setLoading(true);
    const { data } = await getMedicalRecords();
    if (data) setRecords(data);
    setLoading(false);
  };

  useEffect(() => { fetchRecords(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.date) { showToast('Title and date are required', 'error'); return; }
    setSubmitting(true);
    const { error } = await addMedicalRecord(form);
    if (error) showToast('Failed: ' + error.message, 'error');
    else {
      showToast('Record uploaded successfully', 'success');
      await logActivity('record_update', `Medical record uploaded: ${form.title}`, user?.fullName || 'System');
      setShowAddModal(false); setForm(emptyForm); fetchRecords();
    }
    setSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await deleteMedicalRecord(id);
    if (error) showToast('Failed: ' + error.message, 'error');
    else {
      showToast('Record deleted', 'success');
      await logActivity('document_delete', `Medical record deleted: ${id}`, user?.fullName || 'System');
      setShowDeleteConfirm(null); fetchRecords();
    }
  };

  const handleMarkReviewed = async (id: string) => {
    const { error } = await updateMedicalRecord(id, { status: 'reviewed' });
    if (error) showToast('Failed: ' + error.message, 'error');
    else { showToast('Marked as reviewed', 'success'); fetchRecords(); }
  };

  const getTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      'Lab Report': 'bg-blue-100 text-blue-800', 'X-Ray': 'bg-purple-100 text-purple-800',
      'MRI': 'bg-indigo-100 text-indigo-800', 'CT Scan': 'bg-pink-100 text-pink-800',
      'Blood Test': 'bg-red-100 text-red-800', 'ECG': 'bg-green-100 text-green-800',
      'Other': 'bg-gray-100 text-gray-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'reviewed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return '';
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading records…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Medical Records</h1>
          <p className="text-gray-600 mt-2">Manage and view all patient medical records</p>
        </div>
        <button onClick={() => { setForm(emptyForm); setShowAddModal(true); }} className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors">
          <Plus size={20} /> <span>Upload Record</span>
        </button>
      </div>

      {/* Records Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Title</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Type</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Date</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Provider</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Size</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {records.map(record => (
                <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <FileText className="text-gray-400" size={20} />
                      <p className="text-sm font-medium text-gray-900">{record.title}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(record.type)}`}>{record.type}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{record.date}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{record.provider}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                      {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{record.file_size}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => { setViewRecord(record); setShowViewModal(true); }} className="p-2 text-gray-600 hover:bg-gray-100 rounded transition-colors" title="View"><Eye size={16} /></button>
                      <button onClick={() => showToast('Download started', 'info')} className="p-2 text-gray-600 hover:bg-gray-100 rounded transition-colors" title="Download"><Download size={16} /></button>
                      <button onClick={() => setShowDeleteConfirm(record.id)} className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors" title="Delete"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {records.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <FileText size={48} className="mx-auto mb-4 opacity-20" />
            <p>No medical records found.</p>
          </div>
        )}
      </div>

      {/* Add Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Upload Medical Record" maxWidth="max-w-xl">
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent">
                {['Lab Report', 'X-Ray', 'MRI', 'CT Scan', 'Blood Test', 'ECG', 'Other'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
              <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Provider</label>
              <input value={form.provider} onChange={e => setForm({ ...form, provider: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">File Size</label>
              <input value={form.file_size} onChange={e => setForm({ ...form, file_size: e.target.value })} placeholder="e.g. 2.4 MB" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={submitting} className="px-4 py-2 bg-cyan-600 text-white rounded-lg text-sm hover:bg-cyan-700 disabled:opacity-50">{submitting ? 'Uploading…' : 'Upload Record'}</button>
          </div>
        </form>
      </Modal>

      {/* View Modal */}
      <Modal isOpen={showViewModal} onClose={() => setShowViewModal(false)} title="Record Details">
        {viewRecord && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-gray-50 p-3 rounded-lg"><p className="text-gray-500">Title</p><p className="font-medium">{viewRecord.title}</p></div>
              <div className="bg-gray-50 p-3 rounded-lg"><p className="text-gray-500">Type</p><p className="font-medium">{viewRecord.type}</p></div>
              <div className="bg-gray-50 p-3 rounded-lg"><p className="text-gray-500">Date</p><p className="font-medium">{viewRecord.date}</p></div>
              <div className="bg-gray-50 p-3 rounded-lg"><p className="text-gray-500">Provider</p><p className="font-medium">{viewRecord.provider || 'N/A'}</p></div>
              <div className="bg-gray-50 p-3 rounded-lg"><p className="text-gray-500">Status</p><p className="font-medium capitalize">{viewRecord.status}</p></div>
              <div className="bg-gray-50 p-3 rounded-lg"><p className="text-gray-500">File Size</p><p className="font-medium">{viewRecord.file_size || 'N/A'}</p></div>
            </div>
            {viewRecord.status === 'pending' && (
              <button onClick={() => { handleMarkReviewed(viewRecord.id); setShowViewModal(false); }} className="w-full px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700">Mark as Reviewed</button>
            )}
          </div>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <Modal isOpen={!!showDeleteConfirm} onClose={() => setShowDeleteConfirm(null)} title="Delete Record">
        <div className="text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mx-auto"><Trash2 className="text-red-600" size={28} /></div>
          <p className="text-gray-700 mb-6">Are you sure you want to delete this record?</p>
          <div className="flex justify-center gap-3">
            <button onClick={() => setShowDeleteConfirm(null)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
            <button onClick={() => showDeleteConfirm && handleDelete(showDeleteConfirm)} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700">Delete</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Records;
