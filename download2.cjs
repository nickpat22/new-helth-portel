const fs = require('fs');
const https = require('https');

https.get('https://medical-health-record.vercel.app/assets/index-be0d7495.js', (res) => {
  let data = [];
  res.on('data', chunk => data.push(chunk));
  res.on('end', () => {
    const buffer = Buffer.concat(data);
    fs.writeFileSync('vercel_bundle2.js', buffer);
    console.log(`Downloaded bytes`);
    
    // Check for weird characters
    const str = buffer.toString('utf8');
    const idx = str.indexOf('sb_publishable');
    if (idx !== -1) {
      const match = str.substring(idx - 10, idx + 60);
      console.log('Match:', JSON.stringify(match));
      console.log('Hex:', Buffer.from(match).toString('hex'));
    } else {
      console.log('API key not found');
    }
  });
}).on('error', console.error);
