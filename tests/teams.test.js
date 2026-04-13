const request = require('supertest');
const bcrypt = require('bcrypt');
const app = require('../server');
const { setupDatabase } = require('../database/setup');
const { Team, User } = require('../models');

async function createCoachAndToken() {
  await User.scope('withPassword').create({
    name: 'Coach Test',
    email: 'coach@example.com',
    password: await bcrypt.hash('password123', 10),
    role: 'coach',
  });

  const loginResponse = await request(app).post('/auth/login').send({
    email: 'coach@example.com',
    password: 'password123',
  });

  return loginResponse.body.token;
}

describe('Team routes', () => {
  beforeEach(async () => {
    await setupDatabase({ force: true });
    await Team.create({
      team_name: 'Existing Team',
      league_name: 'Starter League',
    });
  });

  test('GET /teams', async () => {
    const response = await request(app).get('/teams');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].team_name).toBe('Existing Team');
  });

  test('creating a team (coach only)', async () => {
    const token = await createCoachAndToken();

    const response = await request(app)
      .post('/teams')
      .set('Authorization', `Bearer ${token}`)
      .send({
        team_name: 'New Team',
        league_name: 'Premier Test League',
      });

    expect(response.status).toBe(201);
    expect(response.body.team_name).toBe('New Team');
  });

  test('unauthorized access returns 401', async () => {
    const response = await request(app).post('/teams').send({
      team_name: 'Blocked Team',
      league_name: 'No Access League',
    });

    expect(response.status).toBe(401);
    expect(response.body.error).toBeDefined();
  });
});
