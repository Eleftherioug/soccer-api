const express = require('express');
const authMiddleware = require('../middleware/auth');
const { Team, User } = require('../models');

const router = express.Router();

router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const users = await User.findAll({
      include: [
        {
          model: Team,
          attributes: ['id', 'team_name', 'league_name'],
        },
      ],
      order: [['id', 'ASC']],
    });

    return res.json(users);
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
