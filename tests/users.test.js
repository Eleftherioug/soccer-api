const request = require('supertest');
const bcrypt = require('bcrypt');
const app = require('../server');
const { setupDatabase } = require('../database/setup');
const { Team, User } = require('../models');

async function createUserWithToken({ name, email, password, role, TeamId = null }) {
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

describe('User routes', () => {
  beforeEach(async () => {
    await setupDatabase({ force: true });
  });

  test('players cannot list users', async () => {
    const token = await createUserWithToken({
      name: 'Player Test',
      email: 'player@test.com',
      password: 'password123',
      role: 'player',
    });

    const response = await request(app).get('/users').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(403);
    expect(response.body.error).toBe('Forbidden');
  });

  test('coaches can list users with team data', async () => {
    const team = await Team.create({
      team_name: 'Varsity FC',
      league_name: 'Campus League',
    });

    const token = await createUserWithToken({
      name: 'Coach Test',
      email: 'coach@test.com',
      password: 'password123',
      role: 'coach',
      TeamId: team.id,
    });

    await User.scope('withPassword').create({
      name: 'Player Test',
      email: 'player@test.com',
      password: await bcrypt.hash('password123', 10),
      role: 'player',
      TeamId: team.id,
    });

    const response = await request(app).get('/users').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body[0]).toHaveProperty('email');
    expect(response.body[0]).toHaveProperty('role');
    expect(response.body[0]).toHaveProperty('Team');
    expect(response.body[0]).not.toHaveProperty('password');
  });

  test('manager can update another user role', async () => {
    const team = await Team.create({
      team_name: 'Varsity FC',
      league_name: 'Campus League',
    });

    const managerToken = await createUserWithToken({
      name: 'Manager Test',
      email: 'manager@test.com',
      password: 'password123',
      role: 'manager',
      TeamId: team.id,
    });

    const player = await User.scope('withPassword').create({
      name: 'Player Test',
      email: 'player@test.com',
      password: await bcrypt.hash('password123', 10),
      role: 'player',
      TeamId: team.id,
    });

    const response = await request(app)
      .patch(`/users/${player.id}/role`)
      .set('Authorization', `Bearer ${managerToken}`)
      .send({ role: 'coach' });

    expect(response.status).toBe(200);
    expect(response.body.role).toBe('coach');

    const updatedUser = await User.findByPk(player.id);
    expect(updatedUser.role).toBe('coach');
  });
});
