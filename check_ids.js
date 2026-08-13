import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://cfyfeewbitawephfqzpg.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_Ok4Q7_UEW5d9vj04wSUF_A_C5yzR90w';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function main() {
  for (const role of ['patient', 'doctor', 'lab', 'mrs']) {
    const { data, error } = await supabase.rpc('get_next_id', { role_key: role });
    console.log(`Role ${role}: next_id = ${data}`, error ? `(Error: ${error.message})` : '');
  }
}

main().catch(console.error);
