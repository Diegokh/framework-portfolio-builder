require('dotenv').config();
const jwt = require('jsonwebtoken');

const token = jwt.sign(
  { id: 1, email: 'diego@test.com' },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);

console.log('Token JWT:');
console.log(token);