const express = require('express');
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/role');
const { Match, PlayerStat, User } = require('../models');

const router = express.Router();

router.get('/', authMiddleware, async (req, res, next) => {
  try {
    if (req.user.role === 'manager') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const where = req.user.role === 'player' ? { UserId: req.user.id } : {};
    const statistics = await PlayerStat.findAll({
      where,
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'email', 'role', 'TeamId'],
        },
        {
          model: Match,
          attributes: ['id', 'opponent_name', 'match_date', 'location', 'final_score', 'TeamId'],
        },
      ],
      order: [['id', 'ASC']],
    });

    return res.json(statistics);
  } catch (error) {
    return next(error);
  }
});

router.post('/', authMiddleware, roleMiddleware(['coach']), async (req, res, next) => {
  try {
    const { goals, assists, minutes_played, yellow_cards, red_cards, UserId, MatchId } = req.body;

    if (!UserId || !MatchId) {
      return res.status(400).json({ error: 'UserId and MatchId are required' });
    }

    const [user, match] = await Promise.all([User.findByPk(UserId), Match.findByPk(MatchId)]);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    const stat = await PlayerStat.create({
      goals,
      assists,
      minutes_played,
      yellow_cards,
      red_cards,
      UserId,
      MatchId,
    });

    return res.status(201).json(stat);
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
