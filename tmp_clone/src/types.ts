export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  avatar: string;
  email: string;
  phone: string;
  bloodType: string;
  allergies: string[];
  conditions: string[];
  medications: Medication[];
  lastVisit: string;
  nextAppointment: string;
  status: 'active' | 'inactive' | 'critical';
  vitals: VitalRecord[];
}

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  prescribedBy: string;
}

export interface VitalRecord {
  date: string;
  heartRate: number;
  bloodPressure: string;
  temperature: number;
  oxygenLevel: number;
  weight: number;
  height: number;
  glucose: number;
}

export interface Appointment {
  id: string;
  patientName: string;
  patientId: string;
  date: string;
  time: string;
  type: string;
  doctor: string;
  status: 'upcoming' | 'completed' | 'cancelled';
}

export interface Activity {
  id: string;
  type: 'record_update' | 'appointment' | 'prescription' | 'lab_result' | 'admission';
  description: string;
  timestamp: string;
  patientName: string;
  actor: string;
  action: string;
}

export interface LabReport {
  id: string;
  patientId: string;
  patientName: string;
  type: string;
  testName: string;
  date: string;
  labName: string;
  status: 'completed' | 'pending' | 'verified';
  verifiedBy: string | null;
  results: Record<string, string>;
  notes: string;
}

export interface Prescription {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  doctor: string;
  medications: PrescribedMedication[];
  status: 'pending' | 'dispensed' | 'cancelled';
  pharmacy: string | null;
  dispensedDate: string | null;
  notes: string;
}

export interface PrescribedMedication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  quantity: number;
}

export interface DashboardStats {
  totalPatients: number;
  appointmentsToday: number;
  criticalCases: number;
  pendingLabs: number;
}
