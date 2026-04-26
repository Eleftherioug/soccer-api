const request = require('supertest');
const bcrypt = require('bcrypt');
const app = require('../server');
const { setupDatabase } = require('../database/setup');
const { Match, PlayerStat, Team, User } = require('../models');

async function createUserAndToken({ name, email, password, role, TeamId = null }) {
  await User.scope('withPassword').create({
    name,
    email,
    password: await bcrypt.hash(password, 10),
    role,
    TeamId,
  });

  const loginResponse = await request(app).post('/auth/login').send({
    email,
    password,
  });

  return loginResponse.body.token;
}

describe('Statistics routes', () => {
  beforeEach(async () => {
    await setupDatabase({ force: true });
  });

  test('player can only view their own statistic by id', async () => {
    const team = await Team.create({
      team_name: 'Stats Team',
      league_name: 'League One',
    });

    const [playerOne, playerTwo] = await Promise.all([
      User.scope('withPassword').create({
        name: 'Player One',
        email: 'player1@test.com',
        password: await bcrypt.hash('password123', 10),
        role: 'player',
        TeamId: team.id,
      }),
      User.scope('withPassword').create({
        name: 'Player Two',
        email: 'player2@test.com',
        password: await bcrypt.hash('password123', 10),
        role: 'player',
        TeamId: team.id,
      }),
    ]);

    const match = await Match.create({
      opponent_name: 'Opponent FC',
      match_date: '2026-05-01',
      location: 'Away Ground',
      final_score: '1-0',
      TeamId: team.id,
    });

    const stat = await PlayerStat.create({
      goals: 1,
      assists: 0,
      minutes_played: 90,
      yellow_cards: 0,
      red_cards: 0,
      UserId: playerTwo.id,
      MatchId: match.id,
    });

    const token = await createUserAndToken({
      name: 'Player Three',
      email: 'player3@test.com',
      password: 'password123',
      role: 'player',
      TeamId: team.id,
    });

    const response = await request(app)
      .get(`/statistics/${stat.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(403);
    expect(response.body.error).toBe('Forbidden');
  });

  test('coach can create, update, and delete a statistic', async () => {
    const team = await Team.create({
      team_name: 'Stats Team',
      league_name: 'League One',
    });

    const coachToken = await createUserAndToken({
      name: 'Coach Test',
      email: 'coach@test.com',
      password: 'password123',
      role: 'coach',
      TeamId: team.id,
    });

    const player = await User.scope('withPassword').create({
      name: 'Player Test',
      email: 'player@test.com',
      password: await bcrypt.hash('password123', 10),
      role: 'player',
      TeamId: team.id,
    });

    const match = await Match.create({
      opponent_name: 'Opponent FC',
      match_date: '2026-05-01',
      location: 'Away Ground',
      final_score: '1-0',
      TeamId: team.id,
    });

    const createResponse = await request(app)
      .post('/statistics')
      .set('Authorization', `Bearer ${coachToken}`)
      .send({
        goals: 1,
        assists: 2,
        minutes_played: 88,
        yellow_cards: 0,
        red_cards: 0,
        UserId: player.id,
        MatchId: match.id,
      });

    expect(createResponse.status).toBe(201);

    const updateResponse = await request(app)
      .put(`/statistics/${createResponse.body.id}`)
      .set('Authorization', `Bearer ${coachToken}`)
      .send({
        goals: 2,
      });

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.goals).toBe(2);

    const getResponse = await request(app)
      .get(`/statistics/${createResponse.body.id}`)
      .set('Authorization', `Bearer ${coachToken}`);

    expect(getResponse.status).toBe(200);
    expect(getResponse.body.id).toBe(createResponse.body.id);

    const deleteResponse = await request(app)
      .delete(`/statistics/${createResponse.body.id}`)
      .set('Authorization', `Bearer ${coachToken}`);

    expect(deleteResponse.status).toBe(200);
    expect(deleteResponse.body.message).toBe('Statistic deleted successfully');
  });
});
