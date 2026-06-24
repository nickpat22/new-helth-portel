import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://cfyfeewbitawephfqzpg.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_Ok4Q7_UEW5d9vj04wSUF_A_C5yzR90w';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function main() {
  // Query to get table columns
  const { data, error } = await supabase.rpc('get_schema_info', {});
  if (error) {
    console.log("No get_schema_info RPC. Let's try raw SQL via REST? No, that won't work.");
  }
}

main().catch(console.error);
