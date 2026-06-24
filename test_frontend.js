import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://cfyfeewbitawephfqzpg.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_Ok4Q7_UEW5d9vj04wSUF_A_C5yzR90w';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function main() {
  console.log("Simulating Frontend operations...");

  // Select all diagnoses
  let { data: dData, error: dErr } = await supabase.from('diagnoses').select('*').limit(1);
  if (dErr) console.log("Diagnoses error:", dErr);
  else console.log("Diagnoses query OK.");

  // Select all lab_reports
  let { data: lData, error: lErr } = await supabase.from('lab_reports').select('*').limit(1);
  if (lErr) console.log("Lab reports error:", lErr);
  else console.log("Lab reports query OK.");

  // Select all prescriptions
  let { data: pData, error: pErr } = await supabase.from('prescriptions').select('*').limit(1);
  if (pErr) console.log("Prescriptions error:", pErr);
  else console.log("Prescriptions query OK.");

  // Select all medical_docs
  let { data: mData, error: mErr } = await supabase.from('medical_docs').select('*').limit(1);
  if (mErr) console.log("Medical docs error:", mErr);
  else console.log("Medical docs query OK.");

  // Select users
  let { data: uData, error: uErr } = await supabase.from('users').select('*').limit(1);
  if (uErr) console.log("Users error:", uErr);
  else console.log("Users query OK.");
}

main().catch(console.error);
