const http = require('http');

async function sendRequest(url, method, body, token) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: data ? JSON.parse(data) : null });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', e => reject(e));
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

const workerToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbXBsb3llZUlkIjoiVEVTVDEyMzQiLCJlbXBsb3llZVNwSWQiOjk5LCJyb2xlIjoiV29ya2VyIiwiaWF0IjoxNzkwODM1NjcwLCJleHAiOjE3OTA4Nzg4NzB9.Fe6FKsW-OWJm-j9qIAZfI8m_87CFgthelN-LvuB3o-g';
const adminToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbXBsb3llZUlkIjoiQURNSU45OTkiLCJlbXBsb3llZVNwSWQiOjEsInJvbGUiOiJBZG1pbiIsImlhdCI6MTc5MDgzNTY3MCwiZXhwIjoxNzkwODc4ODcwfQ.yE88CjvB3jFhb7nmhW1OOoRXlslVGbpeduCFcdCDfq4';

async function runTests() {
  const NODE_URL = 'http://localhost:3000/api';
  const PHP_URL = 'http://localhost:8000'; // PHP's built-in server is mapped to the api/ directory directly

  console.log('1. Health Test');
  try {
    const phpHealth = await sendRequest(`${PHP_URL}/health`, 'GET');
    console.log(`PHP Health: ${phpHealth.status} -`, phpHealth.body);
  } catch (e) {
    console.log('Health Test Failed', e.message);
  }

  console.log('\n2. Login Test');
  try {
    const payload = { employeeId: 'TEST1234', pin: '0000' };
    const nodeLogin = await sendRequest(`${NODE_URL}/login`, 'POST', payload);
    const phpLogin = await sendRequest(`${PHP_URL}/login`, 'POST', payload);
    console.log(`Node Login: ${nodeLogin.status}`);
    console.log(`PHP Login: ${phpLogin.status}`);
  } catch (e) {
    console.log('Login Test Failed', e.message);
  }

  console.log('\n3. JWT Validation Tests');
  try {
    // Missing token
    const nodeMissing = await sendRequest(`${NODE_URL}/listEmployees`, 'POST', {});
    const phpMissing = await sendRequest(`${PHP_URL}/listEmployees`, 'POST', {});
    console.log(`Node Missing Token: ${nodeMissing.status} -`, nodeMissing.body);
    console.log(`PHP Missing Token: ${phpMissing.status} -`, phpMissing.body);

    // Invalid token
    const nodeInvalid = await sendRequest(`${NODE_URL}/listEmployees`, 'POST', {}, 'invalid_token_123');
    const phpInvalid = await sendRequest(`${PHP_URL}/listEmployees`, 'POST', {}, 'invalid_token_123');
    console.log(`Node Invalid Token: ${nodeInvalid.status} -`, nodeInvalid.body);
    console.log(`PHP Invalid Token: ${phpInvalid.status} -`, phpInvalid.body);
    
    // Worker accessing Admin
    const nodeAdmin = await sendRequest(`${NODE_URL}/adminGetEntries`, 'POST', {}, workerToken);
    const phpAdmin = await sendRequest(`${PHP_URL}/adminGetEntries`, 'POST', {}, workerToken);
    console.log(`Node Worker accessing Admin: ${nodeAdmin.status} -`, nodeAdmin.body);
    console.log(`PHP Worker accessing Admin: ${phpAdmin.status} -`, phpAdmin.body);

    // Admin accessing Admin
    const nodeAdminOk = await sendRequest(`${NODE_URL}/adminGetEntries`, 'POST', {}, adminToken);
    const phpAdminOk = await sendRequest(`${PHP_URL}/adminGetEntries`, 'POST', {}, adminToken);
    console.log(`Node Admin accessing Admin: ${nodeAdminOk.status}`);
    console.log(`PHP Admin accessing Admin: ${phpAdminOk.status}`);
  } catch (e) {
    console.log('JWT Validation Tests Failed', e.message);
  }

  console.log('\n4. Identity Spoofing Test');
  try {
    const payload = { employeeId: 'SPOOFED_ADMIN' };
    const nodeSpoof = await sendRequest(`${NODE_URL}/submitEntry`, 'POST', payload, workerToken);
    const phpSpoof = await sendRequest(`${PHP_URL}/submitEntry`, 'POST', payload, workerToken);
    console.log(`Node Spoof: ${nodeSpoof.status}`);
    console.log(`PHP Spoof: ${phpSpoof.status}`);
  } catch (e) {
    console.log('Identity Spoofing Test Failed', e.message);
  }

  console.log('\n5. Photo Testing');
  try {
    // Test 1MB
    const largeStr = 'A'.repeat(1024 * 1024);
    const payload = { employeeId: 'TEST1234', photoBase64: largeStr };
    
    console.log('Uploading 1MB to Node...');
    const nodePhoto = await sendRequest(`${NODE_URL}/uploadPhoto`, 'POST', payload, workerToken);
    console.log(`Node Photo (1MB): ${nodePhoto.status}`);

    console.log('Uploading 1MB to PHP...');
    const phpPhoto = await sendRequest(`${PHP_URL}/uploadPhoto`, 'POST', payload, workerToken);
    console.log(`PHP Photo (1MB): ${phpPhoto.status}`);

    // Test 10MB
    const str10 = 'A'.repeat(10 * 1024 * 1024);
    const p10 = { employeeId: 'TEST1234', photoBase64: str10 };
    console.log('Uploading 10MB to Node...');
    const n10 = await sendRequest(`${NODE_URL}/uploadPhoto`, 'POST', p10, workerToken);
    console.log(`Node Photo (10MB): ${n10.status}`);

    console.log('Uploading 10MB to PHP...');
    const p10Res = await sendRequest(`${PHP_URL}/uploadPhoto`, 'POST', p10, workerToken);
    console.log(`PHP Photo (10MB): ${p10Res.status}`);

    // Test 50MB
    const str50 = 'A'.repeat(50 * 1024 * 1024);
    const p50 = { employeeId: 'TEST1234', photoBase64: str50 };
    console.log('Uploading 50MB to Node...');
    const n50 = await sendRequest(`${NODE_URL}/uploadPhoto`, 'POST', p50, workerToken);
    console.log(`Node Photo (50MB): ${n50.status}`);

    console.log('Uploading 50MB to PHP...');
    const p50Res = await sendRequest(`${PHP_URL}/uploadPhoto`, 'POST', p50, workerToken);
    console.log(`PHP Photo (50MB): ${p50Res.status}`);

  } catch (e) {
    console.log('Photo Test Failed', e.message);
  }

  console.log('\n6. Malformed JSON Test');
  try {
    const nodeMalformed = await sendRequest(`${NODE_URL}/submitEntry`, 'POST', undefined, workerToken);
    const phpMalformed = await sendRequest(`${PHP_URL}/submitEntry`, 'POST', undefined, workerToken);
    console.log(`Node Malformed: ${nodeMalformed.status}`);
    console.log(`PHP Malformed: ${phpMalformed.status}`);
  } catch(e) {
    console.log('Malformed Test Failed', e.message);
  }
}

runTests();
