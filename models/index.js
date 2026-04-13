const sequelize = require('../database');
const defineUser = require('./User');
const defineTeam = require('./Team');
const defineMatch = require('./Match');
const definePlayerStat = require('./PlayerStat');

const User = defineUser(sequelize);
const Team = defineTeam(sequelize);
const Match = defineMatch(sequelize);
const PlayerStat = definePlayerStat(sequelize);

Team.hasMany(User);
User.belongsTo(Team);

Team.hasMany(Match);
Match.belongsTo(Team);

User.hasMany(PlayerStat);
Match.hasMany(PlayerStat);
PlayerStat.belongsTo(User);
PlayerStat.belongsTo(Match);

module.exports = {
  sequelize,
  User,
  Team,
  Match,
  PlayerStat,
};
