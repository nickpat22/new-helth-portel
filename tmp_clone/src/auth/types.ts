export type UserRole = 'patient' | 'doctor' | 'laboratory' | 'pharmacy' | 'records_staff' | 'admin';

export interface User {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
  idType: string;
  governmentId?: string;
  department?: string;
  organization?: string;
}

export interface RoleConfig {
  role: UserRole;
  label: string;
  description: string;
  icon: string;
  idFormat: string;
  idLabel: string;
  color: string;
  textColor: string;
  bgGradient: string;
  permissions: Permission[];
  dashboardModules: string[];
}

export type Permission =
  | 'view_own_records'
  | 'view_all_patients'
  | 'update_records'
  | 'add_diagnosis'
  | 'write_prescription'
  | 'upload_lab_report'
  | 'verify_lab_report'
  | 'dispense_prescription'
  | 'view_audit_log'
  | 'manage_users'
  | 'archive_records'
  | 'view_appointments'
  | 'manage_appointments';

export const ROLES: Record<UserRole, RoleConfig> = {
  patient: {
    role: 'patient',
    label: 'Patient',
    description: 'Access your health records, reports & prescriptions',
    icon: '👤',
    idFormat: 'UDHRS-PAT-XXXXX',
    idLabel: 'Patient ID',
    color: 'emerald',
    textColor: 'text-emerald-600',
    bgGradient: 'from-emerald-500 to-green-500',
    permissions: ['view_own_records', 'view_appointments'],
    dashboardModules: ['dashboard', 'records', 'documents'],
  },
  doctor: {
    role: 'doctor',
    label: 'Doctor',
    description: 'Manage patient diagnoses, prescriptions & lab requests',
    icon: '👨‍⚕️',
    idFormat: 'UDHRS-DOC-XXXXX',
    idLabel: 'Doctor Registration ID',
    color: 'blue',
    textColor: 'text-blue-600',
    bgGradient: 'from-blue-600 to-indigo-600',
    permissions: [
      'view_all_patients',
      'update_records',
      'add_diagnosis',
      'write_prescription',
      'view_appointments',
      'manage_appointments',
      'view_audit_log',
    ],
    dashboardModules: ['dashboard', 'patients', 'appointments', 'records', 'activity'],
  },
  laboratory: {
    role: 'laboratory',
    label: 'Laboratory Staff',
    description: 'Upload and manage patient laboratory test reports',
    icon: '🔬',
    idFormat: 'UDHRS-LAB-XXXXX',
    idLabel: 'Lab Technician ID',
    color: 'violet',
    textColor: 'text-violet-600',
    bgGradient: 'from-violet-600 to-purple-500',
    permissions: ['view_all_patients', 'upload_lab_report', 'verify_lab_report'],
    dashboardModules: ['dashboard', 'records', 'laboratory', 'activity'],
  },
  pharmacy: {
    role: 'pharmacy',
    label: 'Pharmacy Staff',
    description: 'Access prescriptions & update medicine dispensing status',
    icon: '💊',
    idFormat: 'UDHRS-PHM-XXXXX',
    idLabel: 'Pharmacist License ID',
    color: 'cyan',
    textColor: 'text-cyan-600',
    bgGradient: 'from-cyan-500 to-teal-500',
    permissions: ['view_all_patients', 'dispense_prescription'],
    dashboardModules: ['dashboard', 'pharmacy', 'activity'],
  },
  records_staff: {
    role: 'records_staff',
    label: 'Medical Records Staff',
    description: 'Manage and archive institutional medical documents',
    icon: '📁',
    idFormat: 'UDHRS-MRC-XXXXX',
    idLabel: 'Records Clerk ID',
    color: 'amber',
    textColor: 'text-amber-600',
    bgGradient: 'from-amber-500 to-orange-500',
    permissions: ['view_all_patients', 'archive_records', 'view_appointments', 'view_audit_log'],
    dashboardModules: ['dashboard', 'patients', 'records', 'appointments', 'activity'],
  },
  admin: {
    role: 'admin',
    label: 'Administrator',
    description: 'System administration, user management & audit oversight',
    icon: '🛡️',
    idFormat: 'UDHRS-ADM-XXXXX',
    idLabel: 'Administrator ID',
    color: 'red',
    textColor: 'text-red-600',
    bgGradient: 'from-red-600 to-rose-600',
    permissions: [
      'view_all_patients',
      'update_records',
      'add_diagnosis',
      'write_prescription',
      'upload_lab_report',
      'verify_lab_report',
      'dispense_prescription',
      'view_audit_log',
      'manage_users',
      'archive_records',
      'view_appointments',
      'manage_appointments',
    ],
    dashboardModules: ['dashboard', 'patients', 'appointments', 'records', 'laboratory', 'pharmacy', 'activity'],
  },
};

// Demo accounts for testing
export const DEMO_ACCOUNTS: Record<string, { password: string; user: User }> = {
  'UDHRS-PAT-10001': {
    password: 'patient123',
    user: {
      id: 'UDHRS-PAT-10001',
      username: 'sarah_j',
      fullName: 'Sarah Johnson',
      role: 'patient',
      idType: 'Patient',
      governmentId: 'Aadhar: XXXX-XXXX-1234',
    },
  },
  'UDHRS-DOC-20001': {
    password: 'doctor123',
    user: {
      id: 'UDHRS-DOC-20001',
      username: 'drsmith',
      fullName: 'Dr. Rajesh Smith',
      role: 'doctor',
      idType: 'Medical Council Registration',
      department: 'General Medicine',
      organization: 'AIIMS New Delhi',
    },
  },
  'UDHRS-DOC-20002': {
    password: 'doctor123',
    user: {
      id: 'UDHRS-DOC-20002',
      username: 'drpatel',
      fullName: 'Dr. Priya Patel',
      role: 'doctor',
      idType: 'Medical Council Registration',
      department: 'Cardiology',
      organization: 'AIIMS New Delhi',
    },
  },
  'UDHRS-LAB-30001': {
    password: 'lab123',
    user: {
      id: 'UDHRS-LAB-30001',
      username: 'citylab',
      fullName: 'Dr. Anita Rao',
      role: 'laboratory',
      idType: 'Lab Technician License',
      organization: 'City Diagnostic Lab',
    },
  },
  'UDHRS-PHM-40001': {
    password: 'pharm123',
    user: {
      id: 'UDHRS-PHM-40001',
      username: 'medicare',
      fullName: 'Sunil Kumar, R.Ph.',
      role: 'pharmacy',
      idType: 'Pharmacist License',
      organization: 'MediCare Pharmacy',
    },
  },
  'UDHRS-MRC-50001': {
    password: 'records123',
    user: {
      id: 'UDHRS-MRC-50001',
      username: 'rekha_m',
      fullName: 'Rekha Sharma',
      role: 'records_staff',
      idType: 'Hospital Staff ID',
      department: 'Medical Records',
      organization: 'AIIMS New Delhi',
    },
  },
  'UDHRS-ADM-90001': {
    password: 'admin123',
    user: {
      id: 'UDHRS-ADM-90001',
      username: 'admin',
      fullName: 'System Administrator',
      role: 'admin',
      idType: 'Admin Access Card',
      organization: 'Ministry of Health & Family Welfare',
    },
  },
};
