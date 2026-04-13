const { DataTypes } = require('sequelize');

module.exports = (sequelize) =>
  sequelize.define('Team', {
    team_name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    league_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  });
