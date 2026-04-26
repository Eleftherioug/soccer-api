const express = require('express');
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/role');
const { Match, Team, User } = require('../models');

const router = express.Router();
const teamInclude = [
  {
    model: User,
    attributes: ['id', 'name'],
  },
  {
    model: Match,
    attributes: ['id', 'opponent_name', 'match_date', 'location', 'final_score', 'TeamId'],
  },
];

router.get('/', async (req, res, next) => {
  try {
    const teams = await Team.findAll({
      include: teamInclude,
      order: [['id', 'ASC']],
    });

    return res.json(teams);
  } catch (error) {
    return next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const team = await Team.findByPk(req.params.id, {
      include: teamInclude,
    });

    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    return res.json(team);
  } catch (error) {
    return next(error);
  }
});

router.post('/', authMiddleware, roleMiddleware(['coach', 'manager']), async (req, res, next) => {
  try {
    const { team_name, league_name } = req.body;

    if (!team_name) {
      return res.status(400).json({ error: 'team_name is required' });
    }

    const team = await Team.create({ team_name, league_name });
    return res.status(201).json(team);
  } catch (error) {
    return next(error);
  }
});

router.put('/:id', authMiddleware, roleMiddleware(['coach', 'manager']), async (req, res, next) => {
  try {
    const team = await Team.findByPk(req.params.id);
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    const { team_name, league_name } = req.body;
    await team.update({
      team_name: team_name ?? team.team_name,
      league_name: league_name ?? team.league_name,
    });

    return res.json(team);
  } catch (error) {
    return next(error);
  }
});

router.delete('/:id', authMiddleware, roleMiddleware(['coach', 'manager']), async (req, res, next) => {
  try {
    const team = await Team.findByPk(req.params.id);
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    await team.destroy();
    return res.json({ message: 'Team deleted successfully' });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
