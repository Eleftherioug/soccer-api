const { DataTypes } = require('sequelize');

module.exports = (sequelize) =>
  sequelize.define(
    'PlayerStat',
    {
      goals: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      assists: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      minutes_played: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      yellow_cards: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      red_cards: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      UserId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      MatchId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      timestamps: false,
    }
  );
