const express = require('express');
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/role');
const { Match, PlayerStat, User } = require('../models');

const router = express.Router();
const statisticsInclude = [
  {
    model: User,
    attributes: ['id', 'name'],
  },
  {
    model: Match,
    attributes: ['id', 'opponent_name', 'match_date', 'location', 'final_score', 'TeamId'],
  },
];

function canAccessStatistic(req, statistic) {
  return req.user.role !== 'player' || statistic.UserId === req.user.id;
}

async function validateStatRelations({ UserId, MatchId }) {
  const checks = [];

  if (UserId) {
    checks.push(User.findByPk(UserId));
  } else {
    checks.push(Promise.resolve(true));
  }

  if (MatchId) {
    checks.push(Match.findByPk(MatchId));
  } else {
    checks.push(Promise.resolve(true));
  }

  const [user, match] = await Promise.all(checks);

  if (!user) {
    return { status: 404, error: 'User not found' };
  }

  if (!match) {
    return { status: 404, error: 'Match not found' };
  }

  return null;
}

router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const where = req.user.role === 'player' ? { UserId: req.user.id } : {};
    const statistics = await PlayerStat.findAll({
      where,
      include: statisticsInclude,
      order: [['id', 'ASC']],
    });

    return res.json(statistics);
  } catch (error) {
    return next(error);
  }
});

router.get('/:id', authMiddleware, async (req, res, next) => {
  try {
    const statistic = await PlayerStat.findByPk(req.params.id, {
      include: statisticsInclude,
    });

    if (!statistic) {
      return res.status(404).json({ error: 'Statistic not found' });
    }

    if (!canAccessStatistic(req, statistic)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    return res.json(statistic);
  } catch (error) {
    return next(error);
  }
});

router.post('/', authMiddleware, roleMiddleware(['coach', 'manager']), async (req, res, next) => {
  try {
    const { goals, assists, minutes_played, yellow_cards, red_cards, UserId, MatchId } = req.body;

    if (!UserId || !MatchId) {
      return res.status(400).json({ error: 'UserId and MatchId are required' });
    }

    const relationError = await validateStatRelations({ UserId, MatchId });
    if (relationError) {
      return res.status(relationError.status).json({ error: relationError.error });
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

router.put('/:id', authMiddleware, roleMiddleware(['coach', 'manager']), async (req, res, next) => {
  try {
    const statistic = await PlayerStat.findByPk(req.params.id);
    if (!statistic) {
      return res.status(404).json({ error: 'Statistic not found' });
    }

    const { goals, assists, minutes_played, yellow_cards, red_cards, UserId, MatchId } = req.body;
    const relationError = await validateStatRelations({ UserId, MatchId });
    if (relationError) {
      return res.status(relationError.status).json({ error: relationError.error });
    }

    await statistic.update({
      goals: goals ?? statistic.goals,
      assists: assists ?? statistic.assists,
      minutes_played: minutes_played ?? statistic.minutes_played,
      yellow_cards: yellow_cards ?? statistic.yellow_cards,
      red_cards: red_cards ?? statistic.red_cards,
      UserId: UserId ?? statistic.UserId,
      MatchId: MatchId ?? statistic.MatchId,
    });

    return res.json(statistic);
  } catch (error) {
    return next(error);
  }
});

router.delete('/:id', authMiddleware, roleMiddleware(['coach', 'manager']), async (req, res, next) => {
  try {
    const statistic = await PlayerStat.findByPk(req.params.id);
    if (!statistic) {
      return res.status(404).json({ error: 'Statistic not found' });
    }

    await statistic.destroy();
    return res.json({ message: 'Statistic deleted successfully' });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
