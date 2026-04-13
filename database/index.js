const path = require('path');
const { Sequelize } = require('sequelize');

const isTest = process.env.NODE_ENV === 'test';
const storage = isTest
  ? ':memory:'
  : process.env.DB_STORAGE || path.join(__dirname, 'soccer.sqlite');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage,
  logging: false,
});

module.exports = sequelize;
