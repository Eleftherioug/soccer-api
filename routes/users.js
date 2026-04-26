const express = require('express');
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/role');
const { Team, User } = require('../models');

const router = express.Router();
const ALLOWED_ROLES = ['player', 'coach', 'manager'];

function serializeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    TeamId: user.TeamId,
    Team: user.Team,
  };
}

router.get('/', authMiddleware, roleMiddleware(['coach', 'manager']), async (req, res, next) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'role', 'TeamId'],
      include: [
        {
          model: Team,
          attributes: ['id', 'team_name', 'league_name'],
        },
      ],
      order: [['id', 'ASC']],
    });

    return res.json(users.map(serializeUser));
  } catch (error) {
    return next(error);
  }
});

router.patch('/:id/role', authMiddleware, roleMiddleware(['manager']), async (req, res, next) => {
  try {
    const { role } = req.body;

    if (!role || !ALLOWED_ROLES.includes(role)) {
      return res.status(400).json({ error: 'role must be one of: player, coach, manager' });
    }

    const user = await User.findByPk(req.params.id, {
      include: [
        {
          model: Team,
          attributes: ['id', 'team_name', 'league_name'],
        },
      ],
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await user.update({ role });

    return res.json(serializeUser(user));
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
