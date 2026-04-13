const express = require('express');
const bcrypt = require('bcrypt');
const { generateToken } = require('../auth/jwt');
const { User } = require('../models');

const router = express.Router();

router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, role, TeamId } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'name, email, password, and role are required' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.scope('withPassword').create({
      name,
      email,
      password: hashedPassword,
      role,
      TeamId: TeamId || null,
    });

    return res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      TeamId: user.TeamId,
    });
  } catch (error) {
    return next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }

    const user = await User.scope('withPassword').findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    return res.json({
      token: generateToken(user),
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
