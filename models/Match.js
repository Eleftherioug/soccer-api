const { DataTypes } = require('sequelize');

module.exports = (sequelize) =>
  sequelize.define(
    'Match',
    {
      opponent_name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      match_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      location: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      final_score: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      TeamId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      timestamps: false,
    }
  );
