export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'M' | 'F';
  email: string;
  phone: string;
  status: 'active' | 'inactive' | 'critical';
  lastVisit: string;
  condition: string;
  bloodType: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: string;
  time: string;
  type: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes: string;
}

export interface LabReport {
  id: string;
  patientId: string;
  patientName: string;
  testType: string;
  testDate: string;
  status: 'pending' | 'completed' | 'reviewed';
  results: string;
}

export interface Prescription {
  id: string;
  patientId: string;
  patientName: string;
  medications: { name: string; dosage: string; frequency: string }[];
  prescribedDate: string;
  expiryDate: string;
  status: 'active' | 'expired' | 'dispensed';
}

export interface Activity {
  id: string;
  type: string;
  description: string;
  user: string;
  timestamp: string;
}

export const patients: Patient[] = [
  {
    id: 'PAT001',
    name: 'John Smith',
    age: 45,
    gender: 'M',
    email: 'john.smith@email.com',
    phone: '+1 (555) 123-4567',
    status: 'active',
    lastVisit: '2024-01-15',
    condition: 'Hypertension',
    bloodType: 'O+',
  },
  {
    id: 'PAT002',
    name: 'Sarah Johnson',
    age: 32,
    gender: 'F',
    email: 'sarah.j@email.com',
    phone: '+1 (555) 234-5678',
    status: 'active',
    lastVisit: '2024-01-18',
    condition: 'Diabetes Type 2',
    bloodType: 'AB-',
  },
  {
    id: 'PAT003',
    name: 'Michael Brown',
    age: 58,
    gender: 'M',
    email: 'mbrown@email.com',
    phone: '+1 (555) 345-6789',
    status: 'critical',
    lastVisit: '2024-01-20',
    condition: 'Heart Disease',
    bloodType: 'B+',
  },
  {
    id: 'PAT004',
    name: 'Emily Davis',
    age: 28,
    gender: 'F',
    email: 'emily.d@email.com',
    phone: '+1 (555) 456-7890',
    status: 'active',
    lastVisit: '2024-01-17',
    condition: 'Asthma',
    bloodType: 'A+',
  },
  {
    id: 'PAT005',
    name: 'Robert Wilson',
    age: 67,
    gender: 'M',
    email: 'rwilson@email.com',
    phone: '+1 (555) 567-8901',
    status: 'inactive',
    lastVisit: '2023-12-01',
    condition: 'COPD',
    bloodType: 'O-',
  },
];

export const appointments: Appointment[] = [
  {
    id: 'APT001',
    patientId: 'PAT001',
    patientName: 'John Smith',
    doctorId: 'DOC001',
    doctorName: 'Dr. Sarah Johnson',
    date: '2024-01-25',
    time: '10:00 AM',
    type: 'General Checkup',
    status: 'confirmed',
    notes: 'Follow up for hypertension',
  },
  {
    id: 'APT002',
    patientId: 'PAT002',
    patientName: 'Sarah Johnson',
    doctorId: 'DOC002',
    doctorName: 'Dr. James Wilson',
    date: '2024-01-26',
    time: '02:00 PM',
    type: 'Diabetes Management',
    status: 'pending',
    notes: 'Quarterly review',
  },
  {
    id: 'APT003',
    patientId: 'PAT003',
    patientName: 'Michael Brown',
    doctorId: 'DOC003',
    doctorName: 'Dr. Maria Garcia',
    date: '2024-01-22',
    time: '03:30 PM',
    type: 'Cardiology Consultation',
    status: 'completed',
    notes: 'ECG and stress test results discussed',
  },
];

export const labReports: LabReport[] = [
  {
    id: 'LAB001',
    patientId: 'PAT001',
    patientName: 'John Smith',
    testType: 'Blood Test',
    testDate: '2024-01-10',
    status: 'completed',
    results: 'Cholesterol: 195 mg/dL, Triglycerides: 120 mg/dL',
  },
  {
    id: 'LAB002',
    patientId: 'PAT002',
    patientName: 'Sarah Johnson',
    testType: 'HbA1c Test',
    testDate: '2024-01-15',
    status: 'completed',
    results: 'HbA1c: 7.2%',
  },
  {
    id: 'LAB003',
    patientId: 'PAT003',
    patientName: 'Michael Brown',
    testType: 'ECG',
    testDate: '2024-01-18',
    status: 'pending',
    results: 'Awaiting cardiologist review',
  },
];

export const prescriptions: Prescription[] = [
  {
    id: 'RX001',
    patientId: 'PAT001',
    patientName: 'John Smith',
    medications: [
      { name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily' },
      { name: 'Atorvastatin', dosage: '20mg', frequency: 'Once daily' },
    ],
    prescribedDate: '2024-01-10',
    expiryDate: '2025-01-10',
    status: 'active',
  },
  {
    id: 'RX002',
    patientId: 'PAT002',
    patientName: 'Sarah Johnson',
    medications: [
      { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily' },
      { name: 'Insulin Glargine', dosage: '20 units', frequency: 'Once at bedtime' },
    ],
    prescribedDate: '2024-01-08',
    expiryDate: '2025-01-08',
    status: 'active',
  },
];

export const activities: Activity[] = [
  {
    id: 'ACT001',
    type: 'login',
    description: 'User logged in',
    user: 'Dr. Sarah Johnson',
    timestamp: '2024-01-20 08:15 AM',
  },
  {
    id: 'ACT002',
    type: 'record_update',
    description: 'Patient record updated',
    user: 'Dr. James Wilson',
    timestamp: '2024-01-20 09:30 AM',
  },
  {
    id: 'ACT003',
    type: 'lab_result',
    description: 'Lab report uploaded',
    user: 'Lab Technician - Alex Turner',
    timestamp: '2024-01-20 10:45 AM',
  },
  {
    id: 'ACT004',
    type: 'prescription',
    description: 'Prescription dispensed',
    user: 'Pharmacist - Emily White',
    timestamp: '2024-01-20 11:20 AM',
  },
];

export const dashboardStats = {
  totalPatients: 1234,
  todayAppointments: 12,
  pendingReports: 5,
  activeUsers: 45,
};
