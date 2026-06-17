import React, { useState, useEffect } from 'react';
import { Calendar, User, Clock, Plus } from 'lucide-react';
import { getAppointments, addAppointment, updateAppointment, cancelAppointment, getPatients, logActivity } from '../lib/supabaseService';
import { useToast } from '../hooks/useToast';
import { useAuth } from '../auth/AuthContext';
import Modal from './Modal';

const emptyForm = { patient_id: '', patient_name: '', doctor_id: '', doctor_name: '', date: '', time: '', type: '', notes: '' };

const Appointments: React.FC = () => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState('');
  const [editStatus, setEditStatus] = useState('pending');
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();
  const { user } = useAuth();

  const fetchData = async () => {
    setLoading(true);
    const [aptsRes, patsRes] = await Promise.all([getAppointments(), getPatients()]);
    if (aptsRes.data) setAppointments(aptsRes.data);
    if (patsRes.data) setPatients(patsRes.data);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const filteredAppointments = appointments.filter(apt =>
    filterStatus === 'all' || apt.status === filterStatus
  );

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.patient_name || !form.date || !form.time) { showToast('Patient, date & time required', 'error'); return; }
    setSubmitting(true);
    const { error } = await addAppointment(form);
    if (error) showToast('Failed: ' + error.message, 'error');
    else {
      showToast('Appointment created', 'success');
      await logActivity('record_update', `New appointment for ${form.patient_name}`, user?.fullName || 'System');
      setShowAddModal(false); setForm(emptyForm); fetchData();
    }
    setSubmitting(false);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await updateAppointment(editId, { ...form, status: editStatus });
    if (error) showToast('Failed: ' + error.message, 'error');
    else {
      showToast('Appointment updated', 'success');
      await logActivity('record_update', `Appointment updated: ${editId}`, user?.fullName || 'System');
      setShowEditModal(false); setForm(emptyForm); fetchData();
    }
    setSubmitting(false);
  };

  const handleCancel = async (id: string) => {
    const { error } = await cancelAppointment(id);
    if (error) showToast('Failed: ' + error.message, 'error');
    else {
      showToast('Appointment cancelled', 'success');
      await logActivity('record_update', `Appointment cancelled: ${id}`, user?.fullName || 'System');
      fetchData();
    }
  };

  const openEdit = (apt: any) => {
    setEditId(apt.id);
    setEditStatus(apt.status);
    setForm({ patient_id: apt.patient_id || '', patient_name: apt.patient_name, doctor_id: apt.doctor_id || '', doctor_name: apt.doctor_name || '', date: apt.date, time: apt.time, type: apt.type || '', notes: apt.notes || '' });
    setShowEditModal(true);
  };

  const handlePatientSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const p = patients.find(p => p.id === e.target.value);
    if (p) setForm({ ...form, patient_id: p.id, patient_name: p.name });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return '';
    }
  };

  const renderForm = (onSubmit: (e: React.FormEvent) => void, submitLabel: string, isEdit = false) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Patient *</label>
        <select value={form.patient_id} onChange={handlePatientSelect} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent" required>
          <option value="">Select patient</option>
          {patients.map(p => <option key={p.id} value={p.id}>{p.name} ({p.id})</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Doctor Name</label>
          <input value={form.doctor_name} onChange={e => setForm({ ...form, doctor_name: e.target.value })} placeholder="Dr. ..." className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
          <input value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} placeholder="e.g. General Checkup" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
          <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Time *</label>
          <input value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} placeholder="e.g. 10:00 AM" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent" required />
        </div>
      </div>
      {isEdit && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select value={editStatus} onChange={e => setEditStatus(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent">
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
        <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent" />
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
          <p className="text-gray-500">Loading appointments…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
        <button onClick={() => { setForm(emptyForm); setShowAddModal(true); }} className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors text-sm font-medium">
          <Plus size={20} /> New Appointment
        </button>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Filter by Status:</label>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as any)} className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent">
            <option value="all">All Appointments</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <p className="text-sm text-gray-600 mt-2">Showing {filteredAppointments.length} of {appointments.length} appointments</p>
      </div>

      {/* Appointments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAppointments.map(appointment => (
          <div key={appointment.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{appointment.patient_name}</h3>
                <p className="text-sm text-gray-600">{appointment.type}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
              </span>
            </div>

            <div className="space-y-3 text-sm text-gray-600 mb-4">
              <div className="flex items-center gap-2">
                <User size={16} className="text-cyan-600" />
                <span>{appointment.doctor_name || 'Unassigned'}</span>
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
              <button onClick={() => openEdit(appointment)} className="flex-1 px-3 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-700 transition-colors text-sm font-medium">Edit</button>
              {appointment.status !== 'cancelled' && appointment.status !== 'completed' && (
                <button onClick={() => handleCancel(appointment.id)} className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors text-sm font-medium">Cancel</button>
              )}
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

      {/* Add Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="New Appointment" maxWidth="max-w-xl">
        {renderForm(handleAdd, 'Create Appointment')}
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Appointment" maxWidth="max-w-xl">
        {renderForm(handleEdit, 'Save Changes', true)}
      </Modal>
    </div>
  );
};

export default Appointments;
