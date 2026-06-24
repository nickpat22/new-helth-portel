const { spawnSync } = require('child_process');

function setEnv(name, value) {
  console.log(`Removing ${name}...`);
  spawnSync('npx.cmd', ['vercel', 'env', 'rm', name, 'production', '-y'], { stdio: 'inherit' });
  
  console.log(`Adding ${name}...`);
  const proc = spawnSync('npx.cmd', ['vercel', 'env', 'add', name, 'production'], {
    input: Buffer.from(value, 'utf8'),
    stdio: ['pipe', 'inherit', 'inherit']
  });
  console.log(`Added ${name} with exit code ${proc.status}`);
}

setEnv('VITE_SUPABASE_ANON_KEY', 'sb_publishable_Ok4Q7_UEW5d9vj04wSUF_A_C5yzR90w');
setEnv('VITE_SUPABASE_URL', 'https://cfyfeewbitawephfqzpg.supabase.co');
