const express = require('express');
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/role');
const { Match, PlayerStat, Team } = require('../models');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const matches = await Match.findAll({
      include: [
        {
          model: Team,
          attributes: ['id', 'team_name', 'league_name'],
        },
        {
          model: PlayerStat,
          attributes: ['id', 'goals', 'assists', 'minutes_played', 'yellow_cards', 'red_cards', 'UserId', 'MatchId'],
        },
      ],
      order: [['id', 'ASC']],
    });

    return res.json(matches);
  } catch (error) {
    return next(error);
  }
});

router.post('/', authMiddleware, roleMiddleware(['coach', 'manager']), async (req, res, next) => {
  try {
    const { opponent_name, match_date, location, final_score, TeamId } = req.body;

    if (!opponent_name || !match_date || !location || !TeamId) {
      return res
        .status(400)
        .json({ error: 'opponent_name, match_date, location, and TeamId are required' });
    }

    const team = await Team.findByPk(TeamId);
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    const match = await Match.create({
      opponent_name,
      match_date,
      location,
      final_score,
      TeamId,
    });

    return res.status(201).json(match);
  } catch (error) {
    return next(error);
  }
});

router.put('/:id', authMiddleware, roleMiddleware(['coach', 'manager']), async (req, res, next) => {
  try {
    const match = await Match.findByPk(req.params.id);
    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    const { opponent_name, match_date, location, final_score, TeamId } = req.body;

    if (TeamId) {
      const team = await Team.findByPk(TeamId);
      if (!team) {
        return res.status(404).json({ error: 'Team not found' });
      }
    }

    await match.update({
      opponent_name: opponent_name ?? match.opponent_name,
      match_date: match_date ?? match.match_date,
      location: location ?? match.location,
      final_score: final_score ?? match.final_score,
      TeamId: TeamId ?? match.TeamId,
    });

    return res.json(match);
  } catch (error) {
    return next(error);
  }
});

router.delete('/:id', authMiddleware, roleMiddleware(['coach']), async (req, res, next) => {
  try {
    const match = await Match.findByPk(req.params.id);
    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    await match.destroy();
    return res.json({ message: 'Match deleted successfully' });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
