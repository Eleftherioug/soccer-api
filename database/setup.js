const { sequelize } = require('../models');

async function setupDatabase(options = {}) {
  const { force = false } = options;
  await sequelize.sync({ force });
}

module.exports = {
  setupDatabase,
};
