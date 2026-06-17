import React, { useState, useEffect } from 'react';
import { Pill, CheckCircle, AlertCircle, Clock, Plus, Trash2 } from 'lucide-react';
import { getPrescriptions, addPrescription, updatePrescription, dispensePrescription, getPatients, logActivity } from '../lib/supabaseService';
import { useToast } from '../hooks/useToast';
import { useAuth } from '../auth/AuthContext';
import Modal from './Modal';

const emptyForm = {
  patient_id: '', patient_name: '', prescribed_date: '', expiry_date: '',
  medications: [{ name: '', dosage: '', frequency: '' }],
};

const Pharmacy: React.FC = () => {
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'expired' | 'dispensed'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDispenseConfirm, setShowDispenseConfirm] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState('');
  const [editStatus, setEditStatus] = useState('active');
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();
  const { user } = useAuth();

  const fetchData = async () => {
    setLoading(true);
    const [rxRes, patsRes] = await Promise.all([getPrescriptions(), getPatients()]);
    if (rxRes.data) setPrescriptions(rxRes.data);
    if (patsRes.data) setPatients(patsRes.data);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const filteredPrescriptions = prescriptions.filter(rx =>
    filterStatus === 'all' || rx.status === filterStatus
  );

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.patient_name || !form.prescribed_date) { showToast('Patient & prescribed date required', 'error'); return; }
    const validMeds = form.medications.filter(m => m.name.trim());
    if (validMeds.length === 0) { showToast('At least one medication required', 'error'); return; }
    setSubmitting(true);
    const { error } = await addPrescription({ ...form, medications: validMeds });
    if (error) showToast('Failed: ' + error.message, 'error');
    else {
      showToast('Prescription created', 'success');
      await logActivity('prescription', `New prescription for ${form.patient_name}`, user?.fullName || 'System');
      setShowAddModal(false); setForm(emptyForm); fetchData();
    }
    setSubmitting(false);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const validMeds = form.medications.filter(m => m.name.trim());
    const { error } = await updatePrescription(editId, {
      patient_id: form.patient_id, patient_name: form.patient_name,
      prescribed_date: form.prescribed_date, expiry_date: form.expiry_date,
      status: editStatus, medications: validMeds,
    });
    if (error) showToast('Failed: ' + error.message, 'error');
    else {
      showToast('Prescription updated', 'success');
      await logActivity('prescription', `Prescription ${editId} updated`, user?.fullName || 'System');
      setShowEditModal(false); setForm(emptyForm); fetchData();
    }
    setSubmitting(false);
  };

  const handleDispense = async (id: string) => {
    const { error } = await dispensePrescription(id);
    if (error) showToast('Failed: ' + error.message, 'error');
    else {
      showToast('Prescription dispensed', 'success');
      await logActivity('prescription', `Prescription ${id} dispensed`, user?.fullName || 'System');
      setShowDispenseConfirm(null); fetchData();
    }
  };

  const openEdit = (rx: any) => {
    setEditId(rx.id);
    setEditStatus(rx.status);
    setForm({
      patient_id: rx.patient_id || '', patient_name: rx.patient_name,
      prescribed_date: rx.prescribed_date, expiry_date: rx.expiry_date || '',
      medications: rx.medications?.length > 0 ? rx.medications.map((m: any) => ({ name: m.name, dosage: m.dosage, frequency: m.frequency })) : [{ name: '', dosage: '', frequency: '' }],
    });
    setShowEditModal(true);
  };

  const handlePatientSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const p = patients.find(p => p.id === e.target.value);
    if (p) setForm({ ...form, patient_id: p.id, patient_name: p.name });
  };

  const addMedRow = () => setForm({ ...form, medications: [...form.medications, { name: '', dosage: '', frequency: '' }] });
  const removeMedRow = (idx: number) => setForm({ ...form, medications: form.medications.filter((_, i) => i !== idx) });
  const updateMed = (idx: number, field: string, value: string) => {
    const meds = [...form.medications];
    (meds[idx] as any)[field] = value;
    setForm({ ...form, medications: meds });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="text-green-600" size={20} />;
      case 'expired': return <AlertCircle className="text-red-600" size={20} />;
      case 'dispensed': return <Clock className="text-blue-600" size={20} />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'dispensed': return 'bg-blue-100 text-blue-800';
      default: return '';
    }
  };

  const renderMedFields = () => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">Medications *</label>
        <button type="button" onClick={addMedRow} className="text-xs text-cyan-600 hover:text-cyan-700 font-medium">+ Add Medication</button>
      </div>
      {form.medications.map((med, idx) => (
        <div key={idx} className="flex gap-2 items-start">
          <input value={med.name} onChange={e => updateMed(idx, 'name', e.target.value)} placeholder="Name" className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent" />
          <input value={med.dosage} onChange={e => updateMed(idx, 'dosage', e.target.value)} placeholder="Dosage" className="w-24 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent" />
          <input value={med.frequency} onChange={e => updateMed(idx, 'frequency', e.target.value)} placeholder="Frequency" className="w-32 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent" />
          {form.medications.length > 1 && (
            <button type="button" onClick={() => removeMedRow(idx)} className="p-2 text-red-500 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
          )}
        </div>
      ))}
    </div>
  );

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
          <label className="block text-sm font-medium text-gray-700 mb-1">Prescribed Date *</label>
          <input type="date" value={form.prescribed_date} onChange={e => setForm({ ...form, prescribed_date: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
          <input type="date" value={form.expiry_date} onChange={e => setForm({ ...form, expiry_date: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent" />
        </div>
      </div>
      {isEdit && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select value={editStatus} onChange={e => setEditStatus(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent">
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="dispensed">Dispensed</option>
          </select>
        </div>
      )}
      {renderMedFields()}
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
          <p className="text-gray-500">Loading prescriptions…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pharmacy</h1>
          <p className="text-gray-600 mt-1">Manage prescriptions and medications</p>
        </div>
        <button onClick={() => { setForm(emptyForm); setShowAddModal(true); }} className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors text-sm font-medium">
          <Plus size={20} /> New Prescription
        </button>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Filter by Status:</label>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as any)} className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent">
            <option value="all">All Prescriptions</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="dispensed">Dispensed</option>
          </select>
        </div>
        <p className="text-sm text-gray-600 mt-2">Showing {filteredPrescriptions.length} of {prescriptions.length} prescriptions</p>
      </div>

      {/* Prescriptions Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredPrescriptions.map(rx => (
          <div key={rx.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-amber-100 p-3 rounded-lg"><Pill className="text-amber-600" size={24} /></div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{rx.patient_name}</h3>
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
                  {(rx.medications || []).map((med: any, idx: number) => (
                    <div key={idx} className="text-sm">
                      <p className="font-medium text-gray-900">{med.name}</p>
                      <p className="text-gray-600">{med.dosage} • {med.frequency}</p>
                    </div>
                  ))}
                  {(!rx.medications || rx.medications.length === 0) && <p className="text-sm text-gray-400">No medications listed</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-gray-600">Prescribed Date:</p>
                  <p className="font-medium text-gray-900">{rx.prescribed_date}</p>
                </div>
                <div>
                  <p className="text-gray-600">Expiry Date:</p>
                  <p className="font-medium text-gray-900">{rx.expiry_date || 'N/A'}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={() => openEdit(rx)} className="flex-1 px-3 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-700 transition-colors text-sm font-medium">Edit</button>
              {rx.status === 'active' && (
                <button onClick={() => setShowDispenseConfirm(rx.id)} className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors text-sm font-medium">Dispense</button>
              )}
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

      {/* Add Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="New Prescription" maxWidth="max-w-2xl">
        {renderForm(handleAdd, 'Create Prescription')}
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Prescription" maxWidth="max-w-2xl">
        {renderForm(handleEdit, 'Save Changes', true)}
      </Modal>

      {/* Dispense Confirmation */}
      <Modal isOpen={!!showDispenseConfirm} onClose={() => setShowDispenseConfirm(null)} title="Dispense Prescription">
        <div className="text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mx-auto"><Pill className="text-green-600" size={28} /></div>
          <p className="text-gray-700 mb-6">Are you sure you want to mark this prescription as dispensed?</p>
          <div className="flex justify-center gap-3">
            <button onClick={() => setShowDispenseConfirm(null)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
            <button onClick={() => showDispenseConfirm && handleDispense(showDispenseConfirm)} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700">Dispense</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Pharmacy;
