-- Add missing tables
CREATE TABLE IF NOT EXISTS public.patients (
  id text PRIMARY KEY,
  name text,
  age integer,
  gender text,
  email text,
  phone text,
  status text,
  condition text,
  blood_type text,
  last_visit date,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.appointments (
  id text PRIMARY KEY,
  patient_id text,
  patient_name text,
  doctor_id text,
  doctor_name text,
  date date,
  time text,
  type text,
  notes text,
  status text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.prescription_medications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prescription_id text,
  name text,
  dosage text,
  frequency text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.prescription_medications ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.medical_records (
  id text PRIMARY KEY,
  patient_id text,
  patient_name text,
  condition text,
  last_visit date,
  next_appointment date,
  details text,
  status text,
  title text,
  type text,
  date date,
  provider text,
  file_size text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text,
  description text,
  user_name text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

-- Add missing columns to existing tables safely
ALTER TABLE public.lab_reports ADD COLUMN IF NOT EXISTS patient_name text;
ALTER TABLE public.lab_reports ADD COLUMN IF NOT EXISTS test_type text;
ALTER TABLE public.lab_reports ADD COLUMN IF NOT EXISTS results text;

ALTER TABLE public.prescriptions ADD COLUMN IF NOT EXISTS patient_name text;
ALTER TABLE public.prescriptions ADD COLUMN IF NOT EXISTS prescribed_date date;
ALTER TABLE public.prescriptions ADD COLUMN IF NOT EXISTS expiry_date date;
ALTER TABLE public.prescriptions ADD COLUMN IF NOT EXISTS status text;
