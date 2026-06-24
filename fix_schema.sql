-- ============================================================
-- DocuMed Health Portal — Schema Fix Script
-- Run this in Supabase SQL Editor (project: cfyfeewbitawephfqzpg)
-- ============================================================

-- ── 1. Fix the trigger to use pre-allocated display_id when provided ──────────
-- This prevents the double-increment bug:
-- Old flow: frontend calls get_next_id (counter +1), trigger calls get_next_id again (counter +1 again)
-- New flow: frontend calls get_next_id, passes display_id in metadata, trigger reads it directly (counter +1 total)

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  role_key text;
  role_enum public.app_role;
  next_num integer;
  display_id text;
  role_prefix text;
BEGIN
  -- Get role from metadata
  role_key := new.raw_user_meta_data->>'role';

  IF role_key = 'Patient' THEN
    role_prefix := 'PAT';
    role_enum := 'patient';
  ELSIF role_key = 'Doctor' THEN
    role_prefix := 'DOC';
    role_enum := 'doctor';
  ELSIF role_key = 'Laboratory Staff' THEN
    role_prefix := 'LAB';
    role_enum := 'lab';
  ELSIF role_key = 'Medical Records Staff' THEN
    role_prefix := 'MRS';
    role_enum := 'mrs';
  ELSE
    role_prefix := 'PAT';
    role_enum := 'patient';
    role_key := 'Patient';
  END IF;

  -- Check if frontend pre-allocated an ID (stored in display_id metadata key)
  display_id := new.raw_user_meta_data->>'display_id';

  IF display_id IS NULL OR display_id = '' THEN
    -- No pre-allocated ID — mint a new one from the counter
    UPDATE public.id_counters SET next_val = next_val + 1
    WHERE role = role_enum::text
    RETURNING next_val - 1 INTO next_num;

    IF next_num IS NULL THEN
      next_num := 1001;
    END IF;

    display_id := role_prefix || next_num;
  END IF;

  -- Insert profile (ON CONFLICT DO NOTHING as a safety net)
  INSERT INTO public.users (
    id, role, auth_user_id, name, mobile, dob, gender, address,
    reg_number, hospital, email, lab_name, org
  ) VALUES (
    display_id,
    role_key,
    new.id,
    new.raw_user_meta_data->>'name',
    new.raw_user_meta_data->>'mobile',
    new.raw_user_meta_data->>'dob',
    new.raw_user_meta_data->>'gender',
    new.raw_user_meta_data->>'address',
    new.raw_user_meta_data->>'reg_number',
    new.raw_user_meta_data->>'hospital',
    new.raw_user_meta_data->>'email',
    new.raw_user_meta_data->>'lab_name',
    new.raw_user_meta_data->>'org'
  ) ON CONFLICT (id) DO NOTHING;

  -- Insert role mapping
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, role_enum)
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Re-attach trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ── 2. Fix RLS policies on users table ───────────────────────────────────────
-- The old "staff view patients" policy checked role = 'Patient' (capital P)
-- but the users table stores role as the display string 'Patient' — which is correct.
-- Let's recreate all policies cleanly.

DROP POLICY IF EXISTS "users view self" ON public.users;
DROP POLICY IF EXISTS "staff view patients" ON public.users;
DROP POLICY IF EXISTS "users update self" ON public.users;
DROP POLICY IF EXISTS "insert own profile" ON public.users;

-- Users can always see their own row
CREATE POLICY "users view self" ON public.users
  FOR SELECT TO authenticated
  USING (auth.uid() = auth_user_id);

-- Doctors/Lab/MRS can see all Patient rows (needed for patient search)
CREATE POLICY "staff view patients" ON public.users
  FOR SELECT TO authenticated
  USING (
    role = 'Patient' AND (
      EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('doctor', 'lab', 'mrs'))
    )
  );

-- Users can update only their own row
CREATE POLICY "users update self" ON public.users
  FOR UPDATE TO authenticated
  USING (auth.uid() = auth_user_id)
  WITH CHECK (auth.uid() = auth_user_id);

-- Allow the trigger (running as postgres/service_role) to insert
-- No explicit INSERT policy needed — SECURITY DEFINER function bypasses RLS


-- ── 3. Ensure all required tables exist with correct schema ──────────────────

-- id_counters (for sequential ID allocation)
CREATE TABLE IF NOT EXISTS public.id_counters (
  role text PRIMARY KEY,
  next_val integer NOT NULL DEFAULT 1001
);
ALTER TABLE public.id_counters ENABLE ROW LEVEL SECURITY;

INSERT INTO public.id_counters(role, next_val) VALUES
  ('patient', 1001), ('doctor', 1001), ('lab', 1001), ('mrs', 1001)
ON CONFLICT (role) DO NOTHING;

-- user_roles
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

-- users (profile)
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

-- diagnoses
CREATE TABLE IF NOT EXISTS public.diagnoses (
  id text PRIMARY KEY,
  patient_id text REFERENCES public.users(id) ON DELETE CASCADE,
  doctor_id text REFERENCES public.users(id) ON DELETE SET NULL,
  title text,
  symptoms text,
  findings text,
  treatment text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.diagnoses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "diag patient read" ON public.diagnoses;
DROP POLICY IF EXISTS "diag doctor read" ON public.diagnoses;
DROP POLICY IF EXISTS "diag doctor insert" ON public.diagnoses;
CREATE POLICY "diag patient read" ON public.diagnoses FOR SELECT TO authenticated
  USING (patient_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid() LIMIT 1));
CREATE POLICY "diag doctor read" ON public.diagnoses FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'doctor'));
CREATE POLICY "diag doctor insert" ON public.diagnoses FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'doctor'));

-- lab_reports
CREATE TABLE IF NOT EXISTS public.lab_reports (
  id text PRIMARY KEY,
  patient_id text REFERENCES public.users(id) ON DELETE CASCADE,
  lab_id text REFERENCES public.users(id) ON DELETE SET NULL,
  test_name text,
  test_date date,
  summary text,
  status text DEFAULT 'Completed',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.lab_reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "lab patient read" ON public.lab_reports;
DROP POLICY IF EXISTS "lab staff read" ON public.lab_reports;
DROP POLICY IF EXISTS "lab staff insert" ON public.lab_reports;
CREATE POLICY "lab patient read" ON public.lab_reports FOR SELECT TO authenticated
  USING (patient_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid() LIMIT 1));
CREATE POLICY "lab staff read" ON public.lab_reports FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('lab', 'doctor')));
CREATE POLICY "lab staff insert" ON public.lab_reports FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'lab'));

-- prescriptions
CREATE TABLE IF NOT EXISTS public.prescriptions (
  id text PRIMARY KEY,
  patient_id text REFERENCES public.users(id) ON DELETE CASCADE,
  doctor_id text REFERENCES public.users(id) ON DELETE SET NULL,
  diagnosis text,
  drugs text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "rx patient read" ON public.prescriptions;
DROP POLICY IF EXISTS "rx doctor read" ON public.prescriptions;
DROP POLICY IF EXISTS "rx doctor insert" ON public.prescriptions;
CREATE POLICY "rx patient read" ON public.prescriptions FOR SELECT TO authenticated
  USING (patient_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid() LIMIT 1));
CREATE POLICY "rx doctor read" ON public.prescriptions FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'doctor'));
CREATE POLICY "rx doctor insert" ON public.prescriptions FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'doctor'));

-- medical_docs
CREATE TABLE IF NOT EXISTS public.medical_docs (
  id text PRIMARY KEY,
  patient_id text REFERENCES public.users(id) ON DELETE CASCADE,
  staff_id text REFERENCES public.users(id) ON DELETE SET NULL,
  doc_type text,
  doc_date date,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.medical_docs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "doc patient read" ON public.medical_docs;
DROP POLICY IF EXISTS "doc mrs read" ON public.medical_docs;
DROP POLICY IF EXISTS "doc mrs insert" ON public.medical_docs;
CREATE POLICY "doc patient read" ON public.medical_docs FOR SELECT TO authenticated
  USING (patient_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid() LIMIT 1));
CREATE POLICY "doc mrs read" ON public.medical_docs FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'mrs'));
CREATE POLICY "doc mrs insert" ON public.medical_docs FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'mrs'));

-- audit_logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text,
  action text,
  detail text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "audit self insert" ON public.audit_logs;
CREATE POLICY "audit self insert" ON public.audit_logs FOR INSERT TO authenticated
  WITH CHECK (true);


-- ── 4. Grant permissions ──────────────────────────────────────────────────────
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT SELECT, INSERT, UPDATE ON public.users TO authenticated;
GRANT SELECT ON public.user_roles TO authenticated;
GRANT SELECT, INSERT ON public.diagnoses TO authenticated;
GRANT SELECT, INSERT ON public.lab_reports TO authenticated;
GRANT SELECT, INSERT ON public.prescriptions TO authenticated;
GRANT SELECT, INSERT ON public.medical_docs TO authenticated;
GRANT INSERT ON public.audit_logs TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_next_id(text) TO anon, authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;


-- ── 5. Verify ─────────────────────────────────────────────────────────────────
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;
