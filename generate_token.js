const jwt = require('jsonwebtoken');
require('dotenv').config({ path: 'bws-middleware/.env' });

const token = jwt.sign(
  { 
    employeeId: 'TEST1234', 
    employeeSpId: 99,
    role: 'Worker'
  }, 
  process.env.JWT_SECRET, 
  { expiresIn: '12h' }
);
console.log(token);
