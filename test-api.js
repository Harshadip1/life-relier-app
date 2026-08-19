const https = require('https');
const options = {
  hostname: 'dn8labapi.liferelier.in',
  port: 443,
  path: '/api/EditPatient/GetGrid',
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
};

const req = https.request(options, res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      const list = json.GridData || json.Table0 || [];
      console.log("Keys of row 0:", Object.keys(list[0]));
    } catch(e) {}
  });
});

req.write(JSON.stringify({ BranchId: 1, FromDate: '2024-01-01T00:00:00', ToDate: '2026-12-31T23:59:59', PageNo: 1, PageSize: 50, PatientName: '' }));
req.end();
