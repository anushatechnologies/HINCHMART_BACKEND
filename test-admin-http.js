const http = require('http');

const data = JSON.stringify({
  email: 'admin@hinchmart.com',
  password: 'admin123'
});

const req = http.request({
  hostname: 'localhost',
  port: 5000,
  path: '/api/admin/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
}, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log('HTTP Status Code:', res.statusCode);
    console.log('Response Body:', body);
  });
});

req.on('error', (e) => {
  console.error('HTTP Request Error:', e);
});

req.write(data);
req.end();
