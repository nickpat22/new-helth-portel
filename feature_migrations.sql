-- Feature 2: Account Deletion Function
CREATE OR REPLACE FUNCTION delete_own_account() RETURNS void AS $$
BEGIN
  -- This function runs as postgres due to SECURITY DEFINER,
  -- so it can delete from auth.users.
  -- The ON DELETE CASCADE constraints will clean up public.users and all related records.
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Feature 3: Delete RLS Policies
ALTER TABLE public.diagnoses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "diag delete" ON public.diagnoses;
CREATE POLICY "diag delete" ON public.diagnoses FOR DELETE TO authenticated
  USING (doctor_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid() LIMIT 1));

ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "rx delete" ON public.prescriptions;
CREATE POLICY "rx delete" ON public.prescriptions FOR DELETE TO authenticated
  USING (doctor_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid() LIMIT 1));

ALTER TABLE public.lab_reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "lab delete" ON public.lab_reports;
CREATE POLICY "lab delete" ON public.lab_reports FOR DELETE TO authenticated
  USING (lab_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid() LIMIT 1));

ALTER TABLE public.medical_docs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "doc delete" ON public.medical_docs;
CREATE POLICY "doc delete" ON public.medical_docs FOR DELETE TO authenticated
  USING (staff_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid() LIMIT 1));

-- Feature 4: Intelligent Document Scanning
CREATE TABLE IF NOT EXISTS public.document_scans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  uploaded_by text REFERENCES public.users(id) ON DELETE CASCADE,
  patient_id text REFERENCES public.users(id) ON DELETE CASCADE,
  extracted_text text,
  diagnosis text,
  doctor_name text,
  report_date text,
  document_type text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.document_scans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "scan read" ON public.document_scans;
CREATE POLICY "scan read" ON public.document_scans FOR SELECT TO authenticated
  USING (
    patient_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid() LIMIT 1)
    OR EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('doctor', 'lab', 'mrs'))
  );

DROP POLICY IF EXISTS "scan insert" ON public.document_scans;
CREATE POLICY "scan insert" ON public.document_scans FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('doctor', 'lab', 'mrs')));

-- Feature 5: AI Chatbot (Patient Section Only)
CREATE TABLE IF NOT EXISTS public.chat_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id text REFERENCES public.users(id) ON DELETE CASCADE,
  message text,
  response text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.chat_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "chat read self" ON public.chat_history;
CREATE POLICY "chat read self" ON public.chat_history FOR SELECT TO authenticated
  USING (patient_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid() LIMIT 1));

DROP POLICY IF EXISTS "chat insert self" ON public.chat_history;
CREATE POLICY "chat insert self" ON public.chat_history FOR INSERT TO authenticated
  WITH CHECK (patient_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid() LIMIT 1));

DROP POLICY IF EXISTS "chat delete self" ON public.chat_history;
CREATE POLICY "chat delete self" ON public.chat_history FOR DELETE TO authenticated
  USING (patient_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid() LIMIT 1));

-- Grant permissions for new tables
GRANT SELECT, INSERT, DELETE ON public.document_scans TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.chat_history TO authenticated;
-- Feature 1: Get real email by ID for login
CREATE OR REPLACE FUNCTION get_email_from_id(display_id text) RETURNS text AS $$$
DECLARE
  user_email text;
BEGIN
  SELECT email INTO user_email FROM public.users WHERE id = display_id;
  RETURN user_email;
END;
$$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Feature 1: Update existing users to use real email in auth.users
UPDATE auth.users
SET email = public.users.email
FROM public.users
WHERE auth.users.id = public.users.auth_user_id 
  AND public.users.email IS NOT NULL 
  AND public.users.email != '';
