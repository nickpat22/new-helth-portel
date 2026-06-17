-- ============================================
-- UDHRS Health Portal — Supabase Schema
-- ============================================

-- 1. PATIENTS
CREATE TABLE IF NOT EXISTS public.patients (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  age INTEGER NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('M', 'F')),
  email TEXT,
  phone TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'critical')),
  last_visit DATE,
  condition TEXT,
  blood_type TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anon full access on patients" ON public.patients FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated full access on patients" ON public.patients FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 2. APPOINTMENTS
CREATE TABLE IF NOT EXISTS public.appointments (
  id TEXT PRIMARY KEY,
  patient_id TEXT REFERENCES public.patients(id) ON DELETE CASCADE,
  patient_name TEXT NOT NULL,
  doctor_id TEXT,
  doctor_name TEXT,
  date DATE NOT NULL,
  time TEXT NOT NULL,
  type TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anon full access on appointments" ON public.appointments FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated full access on appointments" ON public.appointments FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 3. LAB REPORTS
CREATE TABLE IF NOT EXISTS public.lab_reports (
  id TEXT PRIMARY KEY,
  patient_id TEXT REFERENCES public.patients(id) ON DELETE CASCADE,
  patient_name TEXT NOT NULL,
  test_type TEXT NOT NULL,
  test_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'reviewed')),
  results TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.lab_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anon full access on lab_reports" ON public.lab_reports FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated full access on lab_reports" ON public.lab_reports FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 4. PRESCRIPTIONS
CREATE TABLE IF NOT EXISTS public.prescriptions (
  id TEXT PRIMARY KEY,
  patient_id TEXT REFERENCES public.patients(id) ON DELETE CASCADE,
  patient_name TEXT NOT NULL,
  prescribed_date DATE NOT NULL,
  expiry_date DATE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'dispensed')),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anon full access on prescriptions" ON public.prescriptions FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated full access on prescriptions" ON public.prescriptions FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 5. PRESCRIPTION MEDICATIONS (child of prescriptions)
CREATE TABLE IF NOT EXISTS public.prescription_medications (
  id SERIAL PRIMARY KEY,
  prescription_id TEXT REFERENCES public.prescriptions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  frequency TEXT NOT NULL
);

ALTER TABLE public.prescription_medications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anon full access on prescription_medications" ON public.prescription_medications FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated full access on prescription_medications" ON public.prescription_medications FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 6. MEDICAL RECORDS
CREATE TABLE IF NOT EXISTS public.medical_records (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Lab Report', 'X-Ray', 'MRI', 'CT Scan', 'Blood Test', 'ECG', 'Other')),
  date DATE NOT NULL,
  provider TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('reviewed', 'pending', 'archived')),
  file_size TEXT,
  patient_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anon full access on medical_records" ON public.medical_records FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated full access on medical_records" ON public.medical_records FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 7. ACTIVITY LOG
CREATE TABLE IF NOT EXISTS public.activity_log (
  id SERIAL PRIMARY KEY,
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  user_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anon full access on activity_log" ON public.activity_log FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated full access on activity_log" ON public.activity_log FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 8. REGISTERED USERS (for the registration form)
CREATE TABLE IF NOT EXISTS public.registered_users (
  id SERIAL PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('patient', 'doctor', 'laboratory', 'pharmacy', 'records_staff', 'admin')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.registered_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anon insert on registered_users" ON public.registered_users FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anon select on registered_users" ON public.registered_users FOR SELECT TO anon USING (true);

-- ============================================
-- SEED DATA
-- ============================================

-- Patients
INSERT INTO public.patients (id, name, age, gender, email, phone, status, last_visit, condition, blood_type) VALUES
  ('PAT001', 'John Smith', 45, 'M', 'john.smith@email.com', '+1 (555) 123-4567', 'active', '2024-01-15', 'Hypertension', 'O+'),
  ('PAT002', 'Sarah Johnson', 32, 'F', 'sarah.j@email.com', '+1 (555) 234-5678', 'active', '2024-01-18', 'Diabetes Type 2', 'AB-'),
  ('PAT003', 'Michael Brown', 58, 'M', 'mbrown@email.com', '+1 (555) 345-6789', 'critical', '2024-01-20', 'Heart Disease', 'B+'),
  ('PAT004', 'Emily Davis', 28, 'F', 'emily.d@email.com', '+1 (555) 456-7890', 'active', '2024-01-17', 'Asthma', 'A+'),
  ('PAT005', 'Robert Wilson', 67, 'M', 'rwilson@email.com', '+1 (555) 567-8901', 'inactive', '2023-12-01', 'COPD', 'O-')
ON CONFLICT (id) DO NOTHING;

-- Appointments
INSERT INTO public.appointments (id, patient_id, patient_name, doctor_id, doctor_name, date, time, type, status, notes) VALUES
  ('APT001', 'PAT001', 'John Smith', 'DOC001', 'Dr. Sarah Johnson', '2024-01-25', '10:00 AM', 'General Checkup', 'confirmed', 'Follow up for hypertension'),
  ('APT002', 'PAT002', 'Sarah Johnson', 'DOC002', 'Dr. James Wilson', '2024-01-26', '02:00 PM', 'Diabetes Management', 'pending', 'Quarterly review'),
  ('APT003', 'PAT003', 'Michael Brown', 'DOC003', 'Dr. Maria Garcia', '2024-01-22', '03:30 PM', 'Cardiology Consultation', 'completed', 'ECG and stress test results discussed')
ON CONFLICT (id) DO NOTHING;

-- Lab Reports
INSERT INTO public.lab_reports (id, patient_id, patient_name, test_type, test_date, status, results) VALUES
  ('LAB001', 'PAT001', 'John Smith', 'Blood Test', '2024-01-10', 'completed', 'Cholesterol: 195 mg/dL, Triglycerides: 120 mg/dL'),
  ('LAB002', 'PAT002', 'Sarah Johnson', 'HbA1c Test', '2024-01-15', 'completed', 'HbA1c: 7.2%'),
  ('LAB003', 'PAT003', 'Michael Brown', 'ECG', '2024-01-18', 'pending', 'Awaiting cardiologist review')
ON CONFLICT (id) DO NOTHING;

-- Prescriptions
INSERT INTO public.prescriptions (id, patient_id, patient_name, prescribed_date, expiry_date, status) VALUES
  ('RX001', 'PAT001', 'John Smith', '2024-01-10', '2025-01-10', 'active'),
  ('RX002', 'PAT002', 'Sarah Johnson', '2024-01-08', '2025-01-08', 'active')
ON CONFLICT (id) DO NOTHING;

-- Prescription Medications
INSERT INTO public.prescription_medications (prescription_id, name, dosage, frequency) VALUES
  ('RX001', 'Lisinopril', '10mg', 'Once daily'),
  ('RX001', 'Atorvastatin', '20mg', 'Once daily'),
  ('RX002', 'Metformin', '500mg', 'Twice daily'),
  ('RX002', 'Insulin Glargine', '20 units', 'Once at bedtime');

-- Medical Records
INSERT INTO public.medical_records (id, title, type, date, provider, status, file_size, patient_id) VALUES
  ('REC001', 'Comprehensive Blood Work', 'Blood Test', '2024-01-18', 'Central Lab', 'reviewed', '2.4 MB', 'PAT001'),
  ('REC002', 'Chest X-Ray', 'X-Ray', '2024-01-15', 'Radiology Department', 'reviewed', '5.1 MB', 'PAT002'),
  ('REC003', 'Cardiac Stress Test', 'ECG', '2024-01-10', 'Cardiology Clinic', 'pending', '1.8 MB', 'PAT003'),
  ('REC004', 'Brain MRI', 'MRI', '2023-12-20', 'Imaging Center', 'reviewed', '45.2 MB', 'PAT004')
ON CONFLICT (id) DO NOTHING;

-- Activity Log
INSERT INTO public.activity_log (type, description, user_name) VALUES
  ('login', 'User logged in', 'Dr. Sarah Johnson'),
  ('record_update', 'Patient record updated', 'Dr. James Wilson'),
  ('lab_result', 'Lab report uploaded', 'Lab Technician - Alex Turner'),
  ('prescription', 'Prescription dispensed', 'Pharmacist - Emily White');

-- Grant usage on sequences
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
