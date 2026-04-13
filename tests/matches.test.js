const request = require('supertest');
const bcrypt = require('bcrypt');
const app = require('../server');
const { setupDatabase } = require('../database/setup');
const { Team, User } = require('../models');

describe('Match routes', () => {
  beforeEach(async () => {
    await setupDatabase({ force: true });
  });

  test('manager can create a match', async () => {
    const team = await Team.create({
      team_name: 'Match Team',
      league_name: 'League One',
    });

    await User.scope('withPassword').create({
      name: 'Manager Test',
      email: 'manager@example.com',
      password: await bcrypt.hash('password123', 10),
      role: 'manager',
      TeamId: team.id,
    });

    const loginResponse = await request(app).post('/auth/login').send({
      email: 'manager@example.com',
      password: 'password123',
    });

    const response = await request(app)
      .post('/matches')
      .set('Authorization', `Bearer ${loginResponse.body.token}`)
      .send({
        opponent_name: 'Opponent FC',
        match_date: '2026-05-01',
        location: 'Away Ground',
        final_score: '2-0',
        TeamId: team.id,
      });

    expect(response.status).toBe(201);
    expect(response.body.opponent_name).toBe('Opponent FC');
  });
});
