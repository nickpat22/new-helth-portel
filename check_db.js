// Final verify: register a fresh Doctor and confirm sign-in works
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://cfyfeewbitawephfqzpg.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_Ok4Q7_UEW5d9vj04wSUF_A_C5yzR90w';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function main() {
  console.log('=== Final Verification ===\n');

  // Get next doctor ID
  const { data: nextNum } = await supabase.rpc('get_next_id', { role_key: 'doctor' });
  const docId = `DOC${nextNum}`;
  const email = `${docId.toLowerCase()}@documed.com`;
  const pw = 'DocTest@12345';

  console.log(`Registering: ${docId} → ${email}`);
  
  const { data: su, error: se } = await supabase.auth.signUp({
    email, password: pw,
    options: { data: { display_id: docId, role: 'Doctor', name: 'Dr. Final Test', reg_number: 'MED999', hospital: 'Test Hospital', mobile: '9998887776', email: 'doc@test.com' } }
  });
  
  if (se) { console.error('❌ signUp failed:', se.message); return; }
  console.log(`✅ Auth user created. Confirmed: ${su.user.email_confirmed_at ? 'YES' : 'NO'}`);
  
  await new Promise(r => setTimeout(r, 2000));
  
  const { data: prof } = await supabase.from('users').select('id,role,name').eq('auth_user_id', su.user.id).maybeSingle();
  if (!prof) { console.error('❌ Trigger failed — no profile created'); return; }
  console.log(`✅ Profile created: ${prof.id} | ${prof.role} | ${prof.name}`);
  
  // Sign in
  const { error: siE } = await supabase.auth.signInWithPassword({ email, password: pw });
  if (siE) { console.error('❌ Sign-in failed:', siE.message); return; }
  console.log(`✅ Sign-in works!`);
  
  await supabase.auth.signOut();
  
  console.log(`\n✅ ALL GOOD! Use ${prof.id} with password: ${pw} to sign in at:`);
  console.log('   https://medical-health-record.vercel.app');
  console.log('\n(Hard refresh the browser first: Ctrl+Shift+R)');
}

main().catch(console.error);
