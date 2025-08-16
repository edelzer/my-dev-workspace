
const crypto = require('crypto');

// VULNERABLE: Weak random number generation
function generateToken() {
  return Math.random().toString(36);
}

// VULNERABLE: Hardcoded secret
const SECRET_KEY = 'hardcoded-secret-key-123';

// VULNERABLE: Weak encryption
function encryptData(data) {
  const cipher = crypto.createCipher('des', SECRET_KEY);
  return cipher.update(data, 'utf8', 'hex') + cipher.final('hex');
}

// VULNERABLE: MD5 hashing
function hashPassword(password) {
  return crypto.createHash('md5').update(password).digest('hex');
}

// SECURE: Strong random generation
function generateSecureToken() {
  return crypto.randomBytes(32).toString('hex');
}