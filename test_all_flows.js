import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://cfyfeewbitawephfqzpg.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_Ok4Q7_UEW5d9vj04wSUF_A_C5yzR90w';

function createAnonClient() {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

function idToEmail(displayId) {
  return `${displayId.trim().toLowerCase()}@documed.com`;
}

async function testRoleAuth(role, roleKey, prefix, formData) {
  const client = createAnonClient();
  console.log(`\n================ Testing Full Flow: ${role} ================`);
  
  // 1. Get next ID (Frontend Step 1)
  const { data: nextNum, error: rpcErr } = await client.rpc('get_next_id', { role_key: roleKey });
  if (rpcErr) throw new Error(`get_next_id failed: ${rpcErr.message}`);
  
  const displayId = `${prefix}${nextNum}`;
  console.log(`1. Pre-allocated ID: ${displayId}`);

  // 2. Register (Frontend Step 2)
  const pw = 'SecurePass@2026';
  const emailToUse = formData.email || idToEmail(displayId);
  console.log(`2. Registering with auth email: ${emailToUse}`);

  const { data: authData, error: authErr } = await client.auth.signUp({
    email: emailToUse,
    password: pw,
    options: {
      data: {
        display_id: displayId,
        role: role,
        name: formData.name || `Dr./Mr./Ms. Test ${role}`,
        ...formData
      }
    }
  });

  if (authErr) {
    console.error(`❌ Register error: ${authErr.message}`);
    return false;
  }
  console.log(`✅ Registered user in auth.users: ${authData.user.id}`);

  // Wait 1.5s for handle_new_user trigger
  await new Promise(r => setTimeout(r, 1500));

  // 3. Login using display ID (Frontend Step 3)
  console.log(`3. Signing in with Display ID: ${displayId}`);
  let loginEmail = idToEmail(displayId);
  const { data: realEmail } = await client.rpc('get_email_from_id', { display_id: displayId });
  if (realEmail) {
    loginEmail = realEmail;
  }

  const { data: loginData, error: loginErr } = await client.auth.signInWithPassword({
    email: loginEmail,
    password: pw
  });

  if (loginErr) {
    console.error(`❌ Login error: ${loginErr.message}`);
    return false;
  }
  console.log(`✅ Signed in successfully! Session user: ${loginData.user.id}`);

  // 4. Fetch Profile (App.tsx / fetchMyProfile Step 4)
  const { data: profile, error: profErr } = await client
    .from('users')
    .select('*')
    .eq('auth_user_id', loginData.user.id)
    .maybeSingle();

  if (profErr || !profile) {
    console.error(`❌ Profile fetch error: ${profErr?.message || 'Profile missing'}`);
    return false;
  }
  console.log(`✅ Fetched Profile: ID=${profile.id}, Role=${profile.role}, Name=${profile.name}`);

  // 5. Verify Role match
  if (profile.role !== role) {
    console.error(`❌ Role mismatch: expected ${role}, got ${profile.role}`);
    return false;
  }

  // 6. Sign out
  await client.auth.signOut();
  console.log(`✅ Signed out cleanly.`);
  return true;
}

async function run() {
  const p1 = await testRoleAuth('Patient', 'patient', 'PAT', {
    name: 'Alice Patient',
    mobile: '9876543210',
    dob: '1995-05-15',
    gender: 'Female',
    address: '77 Hospital Rd'
  });

  const p2 = await testRoleAuth('Doctor', 'doctor', 'DOC', {
    name: 'Dr. Gregory House',
    reg_number: 'MED98765',
    hospital: 'Princeton-Plainsboro',
    mobile: '9876543211',
    email: `dr.house_${Date.now()}@hospital.org`
  });

  const p3 = await testRoleAuth('Laboratory Staff', 'lab', 'LAB', {
    name: 'Walter White',
    lab_name: 'Albuquerque Diagnostics',
    mobile: '9876543212'
  });

  const p4 = await testRoleAuth('Medical Records Staff', 'mrs', 'MRS', {
    name: 'Pam Beesly',
    org: 'Dunder Mifflin Health',
    mobile: '9876543213'
  });

  console.log('\n================ SUMMARY ================');
  console.log(`Patient Auth: ${p1 ? 'PASSED ✅' : 'FAILED ❌'}`);
  console.log(`Doctor Auth: ${p2 ? 'PASSED ✅' : 'FAILED ❌'}`);
  console.log(`Lab Staff Auth: ${p3 ? 'PASSED ✅' : 'FAILED ❌'}`);
  console.log(`MRS Staff Auth: ${p4 ? 'PASSED ✅' : 'FAILED ❌'}`);
}

run().catch(console.error);
