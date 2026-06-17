import { supabase } from './supabaseClient';
import { DEMO_ACCOUNTS } from '../auth/types';

// ── Helpers ──────────────────────────────────────────────

function generateId(prefix: string): string {
  const num = Math.floor(Math.random() * 900000) + 100000;
  return `${prefix}${num}`;
}

// ── PATIENTS ─────────────────────────────────────────────

export async function getPatients() {
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .order('created_at', { ascending: false });
  return { data, error };
}

export async function addPatient(patient: {
  name: string; age: number; gender: string; email: string;
  phone: string; status: string; condition: string; blood_type: string;
}) {
  const id = generateId('PAT');
  const { data, error } = await supabase
    .from('patients')
    .insert([{ id, ...patient, last_visit: new Date().toISOString().split('T')[0] }])
    .select()
    .single();
  return { data, error };
}

export async function updatePatient(id: string, updates: Record<string, any>) {
  const { data, error } = await supabase
    .from('patients')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  return { data, error };
}

export async function deletePatient(id: string) {
  const { error } = await supabase.from('patients').delete().eq('id', id);
  return { error };
}

// ── APPOINTMENTS ─────────────────────────────────────────

export async function getAppointments() {
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .order('date', { ascending: false });
  return { data, error };
}

export async function addAppointment(apt: {
  patient_id: string; patient_name: string; doctor_id: string;
  doctor_name: string; date: string; time: string; type: string; notes: string;
}) {
  const id = generateId('APT');
  const { data, error } = await supabase
    .from('appointments')
    .insert([{ id, ...apt, status: 'pending' }])
    .select()
    .single();
  return { data, error };
}

export async function updateAppointment(id: string, updates: Record<string, any>) {
  const { data, error } = await supabase
    .from('appointments')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  return { data, error };
}

export async function cancelAppointment(id: string) {
  return updateAppointment(id, { status: 'cancelled' });
}

// ── LAB REPORTS ──────────────────────────────────────────

export async function getLabReports() {
  const { data, error } = await supabase
    .from('lab_reports')
    .select('*')
    .order('test_date', { ascending: false });
  return { data, error };
}

export async function addLabReport(report: {
  patient_id: string; patient_name: string; test_type: string;
  test_date: string; results: string;
}) {
  const id = generateId('LAB');
  const { data, error } = await supabase
    .from('lab_reports')
    .insert([{ id, ...report, status: 'pending' }])
    .select()
    .single();
  return { data, error };
}

export async function updateLabReportStatus(id: string, status: string) {
  const { data, error } = await supabase
    .from('lab_reports')
    .update({ status })
    .eq('id', id)
    .select()
    .single();
  return { data, error };
}

// ── PRESCRIPTIONS ────────────────────────────────────────

export async function getPrescriptions() {
  const { data, error } = await supabase
    .from('prescriptions')
    .select('*, prescription_medications(*)')
    .order('prescribed_date', { ascending: false });
  // reshape medications for UI
  const shaped = data?.map((rx: any) => ({
    ...rx,
    medications: rx.prescription_medications || [],
  }));
  return { data: shaped, error };
}

export async function addPrescription(rx: {
  patient_id: string; patient_name: string; prescribed_date: string;
  expiry_date: string; medications: { name: string; dosage: string; frequency: string }[];
}) {
  const id = generateId('RX');
  const { medications, ...rest } = rx;
  const { data, error } = await supabase
    .from('prescriptions')
    .insert([{ id, ...rest, status: 'active' }])
    .select()
    .single();
  if (error) return { data: null, error };

  if (medications.length > 0) {
    const meds = medications.map(m => ({ ...m, prescription_id: id }));
    await supabase.from('prescription_medications').insert(meds);
  }
  return { data: { ...data, medications }, error: null };
}

export async function updatePrescription(id: string, updates: Record<string, any>) {
  const { medications, ...rest } = updates;
  const { data, error } = await supabase
    .from('prescriptions')
    .update(rest)
    .eq('id', id)
    .select()
    .single();
  if (error) return { data: null, error };

  if (medications) {
    await supabase.from('prescription_medications').delete().eq('prescription_id', id);
    if (medications.length > 0) {
      const meds = medications.map((m: any) => ({ ...m, prescription_id: id }));
      await supabase.from('prescription_medications').insert(meds);
    }
  }
  return { data, error: null };
}

export async function dispensePrescription(id: string) {
  const { data, error } = await supabase
    .from('prescriptions')
    .update({ status: 'dispensed' })
    .eq('id', id)
    .select()
    .single();
  return { data, error };
}

// ── MEDICAL RECORDS ──────────────────────────────────────

export async function getMedicalRecords() {
  const { data, error } = await supabase
    .from('medical_records')
    .select('*')
    .order('date', { ascending: false });
  return { data, error };
}

export async function addMedicalRecord(record: {
  title: string; type: string; date: string; provider: string;
  file_size: string; patient_id?: string;
}) {
  const id = generateId('REC');
  const { data, error } = await supabase
    .from('medical_records')
    .insert([{ id, ...record, status: 'pending' }])
    .select()
    .single();
  return { data, error };
}

export async function updateMedicalRecord(id: string, updates: Record<string, any>) {
  const { data, error } = await supabase
    .from('medical_records')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  return { data, error };
}

export async function deleteMedicalRecord(id: string) {
  const { error } = await supabase.from('medical_records').delete().eq('id', id);
  return { error };
}

// ── ACTIVITY LOG ─────────────────────────────────────────

export async function getActivities(limit = 20, offset = 0) {
  const { data, error, count } = await supabase
    .from('activity_log')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  return { data, error, count };
}

export async function logActivity(type: string, description: string, userName: string) {
  const { error } = await supabase
    .from('activity_log')
    .insert([{ type, description, user_name: userName }]);
  return { error };
}

// ── DASHBOARD STATS ──────────────────────────────────────

export async function getDashboardStats() {
  const [patientsRes, aptsRes, labRes, recordsRes] = await Promise.all([
    supabase.from('patients').select('id', { count: 'exact', head: true }),
    supabase.from('appointments').select('id', { count: 'exact', head: true }),
    supabase.from('lab_reports').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('medical_records').select('id', { count: 'exact', head: true }),
  ]);
  return {
    totalPatients: patientsRes.count || 0,
    todayAppointments: aptsRes.count || 0,
    pendingReports: labRes.count || 0,
    totalRecords: recordsRes.count || 0,
  };
}

function generateRandomUserId(role: string): string {
  const rolePrefixes: Record<string, string> = {
    patient: 'UDHRS-PAT-',
    doctor: 'UDHRS-DOC-',
    laboratory: 'UDHRS-LAB-',
    pharmacy: 'UDHRS-PHM-',
    records_staff: 'UDHRS-MRC-',
    admin: 'UDHRS-ADM-',
  };
  const prefix = rolePrefixes[role] || 'UDHRS-USR-';
  const randNum = Math.floor(Math.random() * 90000) + 10000;
  return `${prefix}${randNum}`;
}

export async function registerUser(user: {
  full_name: string; email: string; password: string; role: string;
}) {
  let userId = '';
  let unique = false;
  let attempts = 0;

  while (!unique && attempts < 5) {
    userId = generateRandomUserId(user.role);
    if (DEMO_ACCOUNTS[userId]) {
      attempts++;
      continue;
    }
    const { data: existing } = await supabase
      .from('registered_users')
      .select('user_id')
      .eq('user_id', userId)
      .maybeSingle();

    if (!existing) {
      unique = true;
    } else {
      attempts++;
    }
  }

  const { data, error } = await supabase
    .from('registered_users')
    .insert([{
      user_id: userId,
      full_name: user.full_name,
      email: user.email,
      password_hash: user.password,
      role: user.role,
      status: 'approved',
    }])
    .select()
    .single();
  return { data, error };
}
