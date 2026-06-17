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
    description: 'View personal health records',
    icon: 'User',
    idFormat: 'UDHRS-PAT-XXXXX',
    idLabel: 'Patient ID',
    color: 'bg-blue-50',
    textColor: 'text-blue-700',
    bgGradient: 'from-blue-500 to-blue-600',
    permissions: ['view_own_records', 'view_appointments'],
    dashboardModules: ['dashboard', 'records', 'documents'],
  },
  doctor: {
    role: 'doctor',
    label: 'Doctor',
    description: 'Manage patient care and diagnoses',
    icon: 'Stethoscope',
    idFormat: 'UDHRS-DOC-XXXXX',
    idLabel: 'Doctor ID',
    color: 'bg-green-50',
    textColor: 'text-green-700',
    bgGradient: 'from-green-500 to-green-600',
    permissions: ['view_all_patients', 'add_diagnosis', 'view_appointments', 'manage_appointments'],
    dashboardModules: ['dashboard', 'patients', 'appointments', 'records', 'activity'],
  },
  laboratory: {
    role: 'laboratory',
    label: 'Laboratory',
    description: 'Manage lab reports and uploads',
    icon: 'FlaskConical',
    idFormat: 'UDHRS-LAB-XXXXX',
    idLabel: 'Lab ID',
    color: 'bg-purple-50',
    textColor: 'text-purple-700',
    bgGradient: 'from-purple-500 to-purple-600',
    permissions: ['upload_lab_report', 'verify_lab_report', 'view_audit_log'],
    dashboardModules: ['dashboard', 'records', 'laboratory', 'activity'],
  },
  pharmacy: {
    role: 'pharmacy',
    label: 'Pharmacy',
    description: 'Manage prescriptions and medications',
    icon: 'Pill',
    idFormat: 'UDHRS-PHM-XXXXX',
    idLabel: 'Pharmacy ID',
    color: 'bg-amber-50',
    textColor: 'text-amber-700',
    bgGradient: 'from-amber-500 to-amber-600',
    permissions: ['write_prescription', 'dispense_prescription', 'view_audit_log'],
    dashboardModules: ['dashboard', 'pharmacy', 'activity'],
  },
  records_staff: {
    role: 'records_staff',
    label: 'Records Staff',
    description: 'Manage patient records',
    icon: 'FileText',
    idFormat: 'UDHRS-REC-XXXXX',
    idLabel: 'Records ID',
    color: 'bg-orange-50',
    textColor: 'text-orange-700',
    bgGradient: 'from-orange-500 to-orange-600',
    permissions: ['update_records', 'archive_records', 'view_audit_log'],
    dashboardModules: ['dashboard', 'patients', 'records', 'appointments', 'activity'],
  },
  admin: {
    role: 'admin',
    label: 'Administrator',
    description: 'Full system access and management',
    icon: 'Shield',
    idFormat: 'UDHRS-ADM-XXXXX',
    idLabel: 'Admin ID',
    color: 'bg-red-50',
    textColor: 'text-red-700',
    bgGradient: 'from-red-500 to-red-600',
    permissions: ['manage_users', 'view_audit_log'],
    dashboardModules: ['dashboard', 'patients', 'appointments', 'records', 'laboratory', 'pharmacy', 'activity'],
  },
};

export const DEMO_ACCOUNTS: Record<string, { password: string; user: User }> = {
  'UDHRS-PAT-10001': {
    password: 'patient123',
    user: { id: 'pat1', username: 'UDHRS-PAT-10001', fullName: 'John Smith', role: 'patient', idType: 'National ID', governmentId: '123456789' },
  },
  'UDHRS-DOC-20001': {
    password: 'doctor123',
    user: { id: 'doc1', username: 'UDHRS-DOC-20001', fullName: 'Dr. Sarah Johnson', role: 'doctor', idType: 'License', department: 'General Medicine' },
  },
  'UDHRS-LAB-30001': {
    password: 'lab123',
    user: { id: 'lab1', username: 'UDHRS-LAB-30001', fullName: 'Lab Technician', role: 'laboratory', idType: 'License', organization: 'Central Lab' },
  },
  'UDHRS-PHM-40001': {
    password: 'pharmacy123',
    user: { id: 'phm1', username: 'UDHRS-PHM-40001', fullName: 'Pharmacist', role: 'pharmacy', idType: 'License', organization: 'Hospital Pharmacy' },
  },
  'UDHRS-ADM-90001': {
    password: 'admin123',
    user: { id: 'admin1', username: 'UDHRS-ADM-90001', fullName: 'Admin User', role: 'admin', idType: 'Employee ID' },
  },
};
