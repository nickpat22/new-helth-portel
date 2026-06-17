import React, { useState, useEffect } from 'react';
import { Search, AlertCircle, CheckCircle, Clock, Plus, Trash2, Edit } from 'lucide-react';
import { getPatients, addPatient, updatePatient, deletePatient, logActivity } from '../lib/supabaseService';
import { useToast } from '../hooks/useToast';
import { useAuth } from '../auth/AuthContext';
import Modal from './Modal';

interface PatientListProps {
  onSelectPatient: (patientId: string) => void;
}

const emptyForm = { name: '', age: '', gender: 'M', email: '', phone: '', status: 'active', condition: '', blood_type: '' };

const PatientList: React.FC<PatientListProps> = ({ onSelectPatient }) => {
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'critical'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState('');
  const [viewPatient, setViewPatient] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();
  const { user } = useAuth();

  const fetchPatients = async () => {
    setLoading(true);
    const { data, error } = await getPatients();
    if (!error && data) setPatients(data);
    setLoading(false);
  };

  useEffect(() => { fetchPatients(); }, []);

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || patient.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.age) { showToast('Name and age are required', 'error'); return; }
    setSubmitting(true);
    const { error } = await addPatient({ ...form, age: Number(form.age) });
    if (error) { showToast('Failed to add patient: ' + error.message, 'error'); }
    else {
      showToast('Patient added successfully', 'success');
      await logActivity('record_update', `New patient added: ${form.name}`, user?.fullName || 'System');
      setShowAddModal(false);
      setForm(emptyForm);
      fetchPatients();
    }
    setSubmitting(false);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await updatePatient(editId, { ...form, age: Number(form.age) });
    if (error) { showToast('Failed to update patient: ' + error.message, 'error'); }
    else {
      showToast('Patient updated successfully', 'success');
      await logActivity('record_update', `Patient updated: ${form.name}`, user?.fullName || 'System');
      setShowEditModal(false);
      setForm(emptyForm);
      fetchPatients();
    }
    setSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await deletePatient(id);
    if (error) { showToast('Failed to delete patient: ' + error.message, 'error'); }
    else {
      showToast('Patient deleted', 'success');
      await logActivity('document_delete', `Patient deleted: ${id}`, user?.fullName || 'System');
      setShowDeleteConfirm(null);
      fetchPatients();
    }
  };

  const openEdit = (p: any) => {
    setEditId(p.id);
    setForm({ name: p.name, age: String(p.age), gender: p.gender, email: p.email || '', phone: p.phone || '', status: p.status, condition: p.condition || '', blood_type: p.blood_type || '' });
    setShowEditModal(true);
  };

  const openView = (p: any) => { setViewPatient(p); setShowViewModal(true); };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="text-green-600" size={20} />;
      case 'critical': return <AlertCircle className="text-red-600" size={20} />;
      case 'inactive': return <Clock className="text-gray-600" size={20} />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'critical': return 'bg-red-100 text-red-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return '';
    }
  };

  const renderForm = (onSubmit: (e: React.FormEvent) => void, submitLabel: string) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
          <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Age *</label>
          <input type="number" value={form.age} onChange={e => setForm({ ...form, age: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent" required min={0} max={150} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
          <select value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent">
            <option value="M">Male</option>
            <option value="F">Female</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Blood Type</label>
          <input value={form.blood_type} onChange={e => setForm({ ...form, blood_type: e.target.value })} placeholder="e.g., O+" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
          <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
          <input value={form.condition} onChange={e => setForm({ ...form, condition: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent">
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="critical">Critical</option>
          </select>
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={() => { setShowAddModal(false); setShowEditModal(false); }} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
        <button type="submit" disabled={submitting} className="px-4 py-2 bg-cyan-600 text-white rounded-lg text-sm hover:bg-cyan-700 disabled:opacity-50">{submitting ? 'Saving…' : submitLabel}</button>
      </div>
    </form>
  );

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading patients…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Patient Management</h1>
        <button onClick={() => { setForm(emptyForm); setShowAddModal(true); }} className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors text-sm font-medium">
          <Plus size={20} /> Add Patient
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input type="text" placeholder="Search by name or ID..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent" />
          </div>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as any)} className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent">
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="critical">Critical</option>
          </select>
        </div>
        <p className="text-sm text-gray-600">Showing {filteredPatients.length} of {patients.length} patients</p>
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
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
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
                  <td className="px-6 py-4 text-sm text-gray-600">{patient.last_visit}</td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openView(patient)} className="px-3 py-1.5 bg-cyan-600 text-white rounded hover:bg-cyan-700 transition-colors text-xs font-medium">View</button>
                      <button onClick={() => openEdit(patient)} className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition-colors"><Edit size={16} /></button>
                      <button onClick={() => setShowDeleteConfirm(patient.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredPatients.length === 0 && (
          <div className="text-center py-8 text-gray-500"><p>No patients found matching your search criteria.</p></div>
        )}
      </div>

      {/* Add Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Patient" maxWidth="max-w-2xl">
        {renderForm(handleAdd, 'Add Patient')}
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Patient" maxWidth="max-w-2xl">
        {renderForm(handleEdit, 'Save Changes')}
      </Modal>

      {/* View Modal */}
      <Modal isOpen={showViewModal} onClose={() => setShowViewModal(false)} title="Patient Details">
        {viewPatient && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white text-xl font-bold">
                {viewPatient.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">{viewPatient.name}</h3>
                <p className="text-sm text-gray-500">{viewPatient.id} • {viewPatient.gender === 'M' ? 'Male' : 'Female'}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-gray-50 p-3 rounded-lg"><p className="text-gray-500">Age</p><p className="font-medium">{viewPatient.age} years</p></div>
              <div className="bg-gray-50 p-3 rounded-lg"><p className="text-gray-500">Blood Type</p><p className="font-medium">{viewPatient.blood_type || 'N/A'}</p></div>
              <div className="bg-gray-50 p-3 rounded-lg"><p className="text-gray-500">Email</p><p className="font-medium">{viewPatient.email || 'N/A'}</p></div>
              <div className="bg-gray-50 p-3 rounded-lg"><p className="text-gray-500">Phone</p><p className="font-medium">{viewPatient.phone || 'N/A'}</p></div>
              <div className="bg-gray-50 p-3 rounded-lg"><p className="text-gray-500">Condition</p><p className="font-medium">{viewPatient.condition || 'N/A'}</p></div>
              <div className="bg-gray-50 p-3 rounded-lg"><p className="text-gray-500">Status</p><p className="font-medium capitalize">{viewPatient.status}</p></div>
              <div className="bg-gray-50 p-3 rounded-lg col-span-2"><p className="text-gray-500">Last Visit</p><p className="font-medium">{viewPatient.last_visit || 'N/A'}</p></div>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <Modal isOpen={!!showDeleteConfirm} onClose={() => setShowDeleteConfirm(null)} title="Delete Patient">
        <div className="text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mx-auto"><Trash2 className="text-red-600" size={28} /></div>
          <p className="text-gray-700 mb-6">Are you sure you want to delete this patient? This action cannot be undone.</p>
          <div className="flex justify-center gap-3">
            <button onClick={() => setShowDeleteConfirm(null)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
            <button onClick={() => showDeleteConfirm && handleDelete(showDeleteConfirm)} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700">Delete</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PatientList;
