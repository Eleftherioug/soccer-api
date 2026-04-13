const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'soccer-api-secret';

function generateToken(user) {
  return jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
    expiresIn: '1h',
  });
}

function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

module.exports = {
  generateToken,
  verifyToken,
};
