const jwt = require('jsonwebtoken');
require('dotenv').config();

const workerToken = jwt.sign({ employeeId: 'TEST1234', employeeSpId: 99, role: 'Worker' }, process.env.JWT_SECRET, { expiresIn: '12h' });
const adminToken = jwt.sign({ employeeId: 'ADMIN999', employeeSpId: 1, role: 'Admin' }, process.env.JWT_SECRET, { expiresIn: '12h' });

console.log('WORKER_TOKEN=' + workerToken);
console.log('ADMIN_TOKEN=' + adminToken);
