import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://cfyfeewbitawephfqzpg.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_Ok4Q7_UEW5d9vj04wSUF_A_C5yzR90w';

function createAnonClient() {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

function idToEmail(displayId) {
  return `${displayId.trim().toLowerCase()}@documed.com`;
}

async function testRole(role, roleKey, prefix, extraFields) {
  const client = createAnonClient();
  console.log(`\n================ Testing ${role} ================`);
  
  // 1. Get next ID
  const { data: nextNum, error: rpcErr } = await client.rpc('get_next_id', { role_key: roleKey });
  if (rpcErr) {
    console.error(`❌ get_next_id failed:`, rpcErr.message);
    return;
  }
  const displayId = `${prefix}${nextNum}`;
  console.log(`Generated ID: ${displayId}`);
  
  // 2. Register
  const pw = 'TestPass@12345';
  const email = extraFields.email ? `test_${Date.now()}_${extraFields.email}` : idToEmail(displayId);
  console.log(`Registering with email: ${email}`);

  const { data: authData, error: authErr } = await client.auth.signUp({
    email,
    password: pw,
    options: {
      data: {
        display_id: displayId,
        role: role,
        name: `Test ${role}`,
        ...extraFields
      }
    }
  });

  if (authErr) {
    console.error(`❌ Registration failed:`, authErr.message);
    return;
  }
  console.log(`✅ User registered in Supabase Auth (User ID: ${authData.user?.id})`);

  // 3. Test Sign In using display ID
  const { data: resolvedEmail } = await client.rpc('get_email_from_id', { display_id: displayId });
  let loginEmail = idToEmail(displayId);
  if (resolvedEmail) {
    loginEmail = resolvedEmail;
  }
  
  const { data: loginData, error: loginErr } = await client.auth.signInWithPassword({
    email: loginEmail,
    password: pw
  });

  if (loginErr) {
    console.error(`❌ Sign-in failed:`, loginErr.message);
    return;
  }
  console.log(`✅ Sign-in successful for ${displayId}! Authenticated session active.`);

  // 4. Fetch own profile as authenticated user
  const { data: profile, error: profErr } = await client
    .from('users')
    .select('*')
    .eq('auth_user_id', loginData.user.id)
    .maybeSingle();

  if (profErr || !profile) {
    console.error(`❌ Profile lookup failed:`, profErr?.message || 'Profile not found in users table');
    return;
  }
  console.log(`✅ Profile retrieved successfully:`, { id: profile.id, role: profile.role, name: profile.name });

  // 5. Sign out
  await client.auth.signOut();
  console.log(`✅ Signed out cleanly.`);
}

async function runAll() {
  await testRole('Patient', 'patient', 'PAT', { mobile: '1112223333', dob: '1990-01-01', gender: 'Female', address: '123 Main St' });
  await testRole('Doctor', 'doctor', 'DOC', { reg_number: 'DOC999', hospital: 'General Hospital', mobile: '2223334444', email: 'doc@test.com' });
  await testRole('Laboratory Staff', 'lab', 'LAB', { lab_name: 'City Lab', mobile: '3334445555' });
  await testRole('Medical Records Staff', 'mrs', 'MRS', { org: 'Metro Hospital', mobile: '4445556666' });
}

runAll().catch(console.error);
