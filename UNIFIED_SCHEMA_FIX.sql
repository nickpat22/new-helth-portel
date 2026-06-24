-- ============================================
-- UDHRS Health Portal — Unified Schema Fix Script
-- Run this in Supabase SQL Editor to make database match code expectations
-- Combines requirements from auth flow, dashboards, and service layer
-- ============================================

-- ── 1. Core Tables for Authentication & Profiles ────────────────────────
-- Users table (profile information for all login accounts)
CREATE TABLE IF NOT EXISTS public.users (
  id text PRIMARY KEY,
  role text NOT NULL,
  auth_user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name text,
  mobile text,
  dob text,
  gender text,
  address text,
  reg_number text,
  hospital text,
  email text,
  lab_name text,
  org text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policies for users table
DROP POLICY IF EXISTS "users view self" ON public.users;
DROP POLICY IF EXISTS "users update self" ON public.users;
DROP POLICY IF EXISTS "insert users profile" ON public.users;

CREATE POLICY "users view self" ON public.users
  FOR SELECT TO authenticated
  USING (auth.uid() = auth_user_id);

CREATE POLICY "users update self" ON public.users
  FOR UPDATE TO authenticated
  USING (auth.uid() = auth_user_id)
  WITH CHECK (auth.uid() = auth_user_id);

-- Allow the trigger (running as postgres/service_role) to insert
-- No explicit INSERT policy needed — SECURITY DEFINER function bypasses RLS

-- ── 2. ID Generation System (for sequential IDs like PAT1001) ───────────
CREATE TABLE IF NOT EXISTS public.id_counters (
  role text PRIMARY KEY,
  next_val integer NOT NULL DEFAULT 1001
);
ALTER TABLE public.id_counters ENABLE ROW LEVEL SECURITY;

INSERT INTO public.id_counters(role, next_val) VALUES
  ('patient', 1001), ('doctor', 1001), ('lab', 1001), ('mrs', 1001)
ON CONFLICT (role) DO NOTHING;

CREATE OR REPLACE FUNCTION public.get_next_id(role_key text)
RETURNS integer AS $$
DECLARE
  current_val integer;
BEGIN
  LOOP
    -- Lock the row for update to prevent race conditions
    UPDATE public.id_counters
    SET next_val = next_val + 1
    WHERE role = role_key
    RETURNING next_val - 1 INTO current_val;

    IF current_val IS NOT NULL THEN
      RETURN current_val;
    END IF;

    -- If role doesn't exist yet, initialize it
    BEGIN
      INSERT INTO public.id_counters(role, next_val)
      VALUES (role_key, 1001)
      ON CONFLICT (role) DO NOTHING;
    END;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.get_next_id(text) TO anon, authenticated;

-- ── 3. Patient Medical Information Table ─────────────────────────────────
-- Separate table for medical patient information (references users.id for patients)
CREATE TABLE IF NOT EXISTS public.patients (
  id text PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  age integer NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'critical')),
  condition text,
  blood_type text,
  last_visit date,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

-- Policies for patients table
DROP POLICY IF EXISTS "patients view self" ON public.patients;
DROP POLICY IF EXISTS "patients insert self" ON public.patients;
DROP POLICY IF EXISTS "patients update self" ON public.patients;

CREATE POLICY "patients view self" ON public.patients
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.users
    WHERE id = public.patients.id AND auth_user_id = auth.uid()
  ));

CREATE POLICY "patients insert self" ON public.patients
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.users
    WHERE id = NEW.id AND auth_user_id = auth.uid() AND
          (SELECT role FROM public.users WHERE id = NEW.id) = 'patient'
  ));

CREATE POLICY "patients update self" ON public.patients
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.users
    WHERE id = public.patients.id AND auth_user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.users
    WHERE id = public.patients.id AND auth_user_id = auth.uid()
  ));

-- ── 4. Appointments Table ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.appointments (
  id text PRIMARY KEY,
  patient_id text NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  patient_name text NOT NULL REFERENCES public.users(id) ON DELETE SET NULL,
  doctor_name text,
  date date NOT NULL,
  time text NOT NULL,
  type text,
  notes text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Policies for appointments table
DROP POLICY IF EXISTS "appointments view own" ON public.appointments;
DROP POLICY IF EXISTS "appointments view all patients" ON public.appointments;
DROP POLICY IF EXISTS "appointments insert own" ON public.appointments;
DROP POLICY IF EXISTS "appointments update own" ON public.appointments;

CREATE POLICY "appointments view own" ON public.appointments
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND
          (SELECT role FROM public.users WHERE id = auth.uid()) = 'patient' AND
          patient_id IN (
            SELECT id FROM public.patients WHERE auth_user_id = auth.uid()
          )
  ));

CREATE POLICY "appointments view all patients" ON public.appointments
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND
          (SELECT role FROM public.users WHERE id = auth.uid()) IN ('doctor', 'lab', 'mrs')
  ));

CREATE POLICY "appointments insert own" ON public.appointments
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND
          (SELECT role FROM public.users WHERE id = auth.uid()) = 'doctor'
  ));

CREATE POLICY "appointments update own" ON public.appointments
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND
          (SELECT role FROM public.users WHERE id = auth.uid()) = 'doctor'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND
          (SELECT role FROM public.users WHERE id = auth.uid()) = 'doctor'
  ));

-- ── 5. Lab Reports Table (Unified Structure) ────────────────────────────
-- Combines expectations from service layer and auth flow/dashboards
CREATE TABLE IF NOT EXISTS public.lab_reports (
  id text PRIMARY KEY,
  patient_id text NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  patient_name text,  -- for service layer
  lab_id text REFERENCES public.users(id) ON DELETE SET NULL,  -- for auth flow (references lab staff user)
  test_type text,     -- for service layer
  test_name text,     -- for auth flow
  test_date date NOT NULL,
  results text,       -- for service layer
  summary text,       -- for auth flow
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'reviewed')),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.lab_reports ENABLE ROW LEVEL SECURITY;

-- Policies for lab_reports table
DROP POLICY IF EXISTS "lab_reports view own" ON public.lab_reports;
DROP POLICY IF EXISTS "lab_reports view staff" ON public.lab_reports;
DROP POLICY IF EXISTS "lab_reports insert staff" ON public.lab_reports;

CREATE POLICY "lab_reports view own" ON public.lab_reports
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND
          (SELECT role FROM public.users WHERE id = auth.uid()) = 'patient' AND
          patient_id IN (
            SELECT id FROM public.patients WHERE auth_user_id = auth.uid()
          )
  ));

CREATE POLICY "lab_reports view staff" ON public.lab_reports
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND
          (SELECT role FROM public.users WHERE id = auth.uid()) IN ('lab', 'doctor')
  ));

CREATE POLICY "lab_reports insert staff" ON public.lab_reports
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND
          (SELECT role FROM public.users WHERE id = auth.uid()) IN ('lab', 'doctor')
  ));

-- ── 6. Prescriptions Table (Unified Structure) ──────────────────────────
-- Combines expectations from service layer and auth flow/dashboards
CREATE TABLE IF NOT EXISTS public.prescriptions (
  id text PRIMARY KEY,
  patient_id text NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  patient_name text,  -- for service layer
  doctor_id text REFERENCES public.users(id) ON DELETE SET NULL,  -- for auth flow (references doctor user)
  diagnosis text,     -- for auth flow
  drugs text,         -- for auth flow
  prescribed_date date,  -- for service layer
  expiry_date date,   -- for service layer
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'dispensed')),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;

-- Policies for prescriptions table
DROP POLICY IF EXISTS "prescriptions view own" ON public.prescriptions;
DROP POLICY IF EXISTS "prescriptions view doctor" ON public.prescriptions;
DROP POLICY IF EXISTS "prescriptions insert doctor" ON public.prescriptions;
DROP POLICY IF EXISTS "prescriptions update doctor" ON public.prescriptions;
DROP POLICY IF EXISTS "prescriptions dispense" ON public.prescriptions;

CREATE POLICY "prescriptions view own" ON public.prescriptions
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND
          (SELECT role FROM public.users WHERE id = auth.uid()) = 'patient' AND
          patient_id IN (
            SELECT id FROM public.patients WHERE auth_user_id = auth.uid()
          )
  ));

CREATE POLICY "prescriptions view doctor" ON public.prescriptions
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND
          (SELECT role FROM public.users WHERE id = auth.uid()) = 'doctor'
  ));

CREATE POLICY "prescriptions insert doctor" ON public.prescriptions
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND
          (SELECT role FROM public.users WHERE id = auth.uid()) = 'doctor'
  ));

CREATE POLICY "prescriptions update doctor" ON public.prescriptions
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND
          (SELECT role FROM public.users WHERE id = auth.uid()) = 'doctor'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND
          (SELECT role FROM public.users WHERE id = auth.uid()) = 'doctor'
  ));

CREATE POLICY "prescriptions dispense" ON public.prescriptions
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND
          (SELECT role FROM public.users WHERE id = auth.uid()) = 'pharmacy'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND
          (SELECT role FROM public.users WHERE id = auth.uid()) = 'pharmacy'
  ));

-- ── 7. Prescription Medications Table ───────────────────────────────────
CREATE TABLE IF NOT EXISTS public.prescription_medications (
  id text PRIMARY KEY DEFAULT gen_random_uuid(),
  prescription_id text NOT NULL REFERENCES public.prescriptions(id) ON DELETE CASCADE,
  name text NOT NULL,
  dosage text NOT NULL,
  frequency text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.prescription_medications ENABLE ROW LEVEL SECURITY;

-- ── 8. Medical Records Table ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.medical_records (
  id text PRIMARY KEY,
  title text NOT NULL,
  type text NOT NULL CHECK (type IN ('Lab Report', 'X-Ray', 'MRI', 'CT Scan', 'Blood Test', 'ECG', 'Other')),
  date date NOT NULL,
  provider text,
  file_size text,
  patient_id text NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('reviewed', 'pending', 'archived')),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;

-- Policies for medical_records table
DROP POLICY IF EXISTS "medical_records view own" ON public.medical_records;
DROP POLICY IF EXISTS "medical_records view staff" ON public.medical_records;
DROP POLICY IF EXISTS "medical_records insert staff" ON public.medical_records;
DROP POLICY IF EXISTS "medical_records update self" ON public.medical_records;
DROP POLICY IF EXISTS "medical_records delete self" ON public.medical_records;

CREATE POLICY "medical_records view own" ON public.medical_records
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND
          (SELECT role FROM public.users WHERE id = auth.uid()) = 'patient' AND
          patient_id IN (
            SELECT id FROM public.patients WHERE auth_user_id = auth.uid()
          )
  ));

CREATE POLICY "medical_records view staff" ON public.medical_records
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND
          (SELECT role FROM public.users WHERE id = auth.uid()) IN ('mrs', 'doctor', 'lab')
  ));

CREATE POLICY "medical_records insert staff" ON public.medical_records
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND
          (SELECT role FROM public.users WHERE id = auth.uid()) IN ('mrs', 'doctor', 'lab')
  ));

CREATE POLICY "medical_records update self" ON public.medical_records
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND
          (SELECT role FROM public.users WHERE id = auth.uid()) = 'patient' AND
          patient_id IN (
            SELECT id FROM public.patients WHERE auth_user_id = auth.uid()
          )
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND
          (SELECT role FROM public.users WHERE id = auth.uid()) = 'patient' AND
          patient_id IN (
            SELECT id FROM public.patients WHERE auth_user_id = auth.uid()
          )
  ));

CREATE POLICY "medical_records delete self" ON public.medical_records
  FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND
          (SELECT role FROM public.users WHERE id = auth.uid()) = 'patient' AND
          patient_id IN (
            SELECT id FROM public.patients WHERE auth_user_id = auth.uid()
          )
  ));

-- ── 9. Activity Log Table ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  description text NOT NULL,
  user_name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

-- Policies for activity_log table
DROP POLICY IF EXISTS "activity_log view self" ON public.activity_log;
DROP POLICY IF EXISTS "activity_log insert self" ON public.activity_log;

CREATE POLICY "activity_log view self" ON public.activity_log
  FOR SELECT TO authenticated
  USING (user_name = (SELECT name FROM public.users WHERE auth_user_id = auth.uid() LIMIT 1));

CREATE POLICY "activity_log insert self" ON public.activity_log
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- ── 10. Registered Users Table (for email/password auth fallback) ────────
CREATE TABLE IF NOT EXISTS public.registered_users (
  id serial PRIMARY KEY,
  user_id text UNIQUE NOT NULL,
  full_name text NOT NULL,
  email text NOT NULL,
  password_hash text NOT NULL,
  role text NOT NULL CHECK (role IN ('patient', 'doctor', 'laboratory', 'pharmacy', 'records_staff', 'admin')),
  status text NOT NULL DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.registered_users ENABLE ROW LEVEL SECURITY;

-- Policies for registered_users table
DROP POLICY IF EXISTS "registered_users view self" ON public.registered_users;
DROP POLICY IF EXISTS "registered_users insert anon" ON public.registered_users;
DROP POLICY IF EXISTS "registered_users select anon" ON public.registered_users;

CREATE POLICY "registered_users view self" ON public.registered_users
  FOR SELECT TO authenticated
  USING (user_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid() LIMIT 1));

CREATE POLICY "registered_users insert anon" ON public.registered_users
  FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "registered_users select anon" ON public.registered_users
  FOR SELECT TO anon
  USING (true);

-- ── 11. Diagnoses Table ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.diagnoses (
  id text PRIMARY KEY,
  patient_id text NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  doctor_id text REFERENCES public.users(id) ON DELETE SET NULL,
  title text,
  symptoms text,
  findings text,
  treatment text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.diagnoses ENABLE ROW LEVEL SECURITY;

-- Policies for diagnoses table
DROP POLICY IF EXISTS "diagnoses view patient" ON public.diagnoses;
DROP POLICY IF EXISTS "diagnoses view doctor" ON public.diagnoses;
DROP POLICY IF EXISTS "diagnoses insert doctor" ON public.diagnoses;

CREATE POLICY "diagnoses view patient" ON public.diagnoses
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND
          (SELECT role FROM public.users WHERE id = auth.uid()) = 'patient' AND
          patient_id IN (
            SELECT id FROM public.patients WHERE auth_user_id = auth.uid()
          )
  ));

CREATE POLICY "diagnoses view doctor" ON public.diagnoses
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND
          (SELECT role FROM public.users WHERE id = auth.uid()) = 'doctor'
  ));

CREATE POLICY "diagnoses insert doctor" ON public.diagnoses
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND
          (SELECT role FROM public.users WHERE id = auth.uid()) = 'doctor'
  ));

-- ── 12. Medical Documents Table ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.medical_docs (
  id text PRIMARY KEY,
  patient_id text NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  staff_id text REFERENCES public.users(id) ON DELETE SET NULL,
  doc_type text,
  doc_date date,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.medical_docs ENABLE ROW LEVEL SECURITY;

-- Policies for medical_docs table
DROP POLICY IF EXISTS "medical_docs view patient" ON public.medical_docs;
DROP POLICY IF EXISTS "medical_docs view staff" ON public.medical_docs;
DROP POLICY IF EXISTS "medical_docs insert staff" ON public.medical_docs;

CREATE POLICY "medical_docs view patient" ON public.medical_docs
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND
          (SELECT role FROM public.users WHERE id = auth.uid()) = 'patient' AND
          patient_id IN (
            SELECT id FROM public.patients WHERE auth_user_id = auth.uid()
          )
  ));

CREATE POLICY "medical_docs view staff" ON public.medical_docs
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND
          (SELECT role FROM public.users WHERE id = auth.uid()) IN ('mrs', 'doctor')
  ));

CREATE POLICY "medical_docs insert staff" ON public.medical_docs
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND
          (SELECT role FROM public.users WHERE id = auth.uid()) IN ('mrs', 'doctor')
  ));

-- ── 13. User Roles Table (optional, from fix_schema) ─────────────────────
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users view own roles" ON public.user_roles;
CREATE POLICY "users view own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- ── 14. Grant Permissions ───────────────────────────────────────────────
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT SELECT, INSERT, UPDATE ON public.users TO authenticated;
GRANT SELECT ON public.user_roles TO authenticated;
GRANT SELECT, INSERT ON public.diagnoses TO authenticated;
GRANT SELECT, INSERT ON public.lab_reports TO authenticated;
GRANT SELECT, INSERT ON public.prescriptions TO authenticated;
GRANT SELECT, INSERT ON public.medical_docs TO authenticated;
GRANT SELECT, INSERT ON public.medical_records TO authenticated;
GRANT SELECT, INSERT ON public.activity_log TO authenticated;
GRANT SELECT, INSERT ON public.registered_users TO authenticated;
GRANT SELECT, INSERT ON public.prescription_medications TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- ── 15. Verify Schema ───────────────────────────────────────────────────
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- ── 16. Test Functions ──────────────────────────────────────────────────
-- Test get_next_id function
DO $$
DECLARE
  pid integer;
  did integer;
  lid integer;
  mrid integer;
BEGIN
  pid := public.get_next_id('patient');
  did := public.get_next_id('doctor');
  lid := public.get_next_id('lab');
  mrid := public.get_next_id('mrs');
  RAISE NOTICE 'Test IDs - Patient: %, Doctor: %, Lab: %, MRS: %', pid, did, lid, mrid;
END $$;