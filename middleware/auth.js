const { User } = require('../models');
const { verifyToken } = require('../auth/jwt');

async function authMiddleware(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const token = header.split(' ')[1];
    const payload = verifyToken(token);
    const user = await User.findByPk(payload.id);

    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = {
      id: user.id,
      role: user.role,
      TeamId: user.TeamId,
      name: user.name,
      email: user.email,
    };

    return next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

module.exports = authMiddleware;
