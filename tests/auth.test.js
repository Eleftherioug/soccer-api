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

  test('registration hashes passwords and forces the default player role', async () => {
    const response = await request(app).post('/auth/register').send({
      name: 'New User',
      email: 'newuser@test.com',
      password: 'password123',
      role: 'manager',
    });

    expect(response.status).toBe(201);
    expect(response.body.role).toBe('player');

    const user = await User.scope('withPassword').findOne({
      where: { email: 'newuser@test.com' },
    });

    expect(user).not.toBeNull();
    expect(user.role).toBe('player');
    expect(user.password).not.toBe('password123');

    const isMatch = await bcrypt.compare('password123', user.password);
    expect(isMatch).toBe(true);
  });

  test('jwt module requires JWT_SECRET', () => {
    const originalSecret = process.env.JWT_SECRET;

    jest.resetModules();
    delete process.env.JWT_SECRET;

    expect(() => require('../auth/jwt')).toThrow('JWT_SECRET environment variable is required');

    process.env.JWT_SECRET = originalSecret;
    jest.resetModules();
  });
});
