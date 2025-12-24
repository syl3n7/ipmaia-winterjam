// JWT utilities for isolated authentication
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key';
const JWT_EXPIRES_IN = '2h';

function generateToken(user) {
  return jwt.sign({
    id: user.id,
    username: user.username,
    email: user.email,
    role: (user && user.role) ? user.role : 'user',
    is_active: typeof user?.is_active === 'boolean' ? user.is_active : true
  }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

module.exports = { generateToken, verifyToken };
