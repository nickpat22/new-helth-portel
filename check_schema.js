import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://cfyfeewbitawephfqzpg.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_Ok4Q7_UEW5d9vj04wSUF_A_C5yzR90w';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function main() {
  console.log("Fetching schema...");
  
  // We can use RPC to query information schema, but since we don't have an RPC function for it,
  // we might not have access to information_schema from the anon key.
  // Wait, let's try querying `users`, `diagnoses`, `lab_reports`, `prescriptions`, `medical_docs`, 
  // `patients`, `appointments`, `prescription_medications`, `medical_records`.
  
  const tables = [
    'users', 'user_roles', 'diagnoses', 'lab_reports', 'prescriptions', 'medical_docs', 
    'patients', 'appointments', 'prescription_medications', 'medical_records', 'id_counters'
  ];

  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('*').limit(1);
    if (error) {
      console.log(`\nTable ${table}: ERROR (${error.code}) - ${error.message}`);
    } else {
      console.log(`\nTable ${table}: EXISTS`);
      if (data && data.length > 0) {
        console.log(`  Columns: ${Object.keys(data[0]).join(', ')}`);
      } else {
        console.log(`  Empty, no column info from select *`);
      }
    }
  }
}

main().catch(console.error);
