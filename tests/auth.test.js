const request = require('supertest');
const bcrypt = require('bcrypt');
const app = require('../server');
const { setupDatabase } = require('../database/setup');
const { User } = require('../models');

describe('Auth routes', () => {
  beforeEach(async () => {
    await setupDatabase({ force: true });
    await User.scope('withPassword').create({
      name: 'Test Coach',
      email: 'coach@test.com',
      password: await bcrypt.hash('password123', 10),
      role: 'coach',
    });
  });

  test('successful login', async () => {
    const response = await request(app).post('/auth/login').send({
      email: 'coach@test.com',
      password: 'password123',
    });

    expect(response.status).toBe(200);
    expect(response.body.token).toBeDefined();
  });
});
