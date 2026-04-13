require('dotenv').config();

const bcrypt = require('bcrypt');
const { setupDatabase } = require('./setup');
const { Match, PlayerStat, Team, User } = require('../models');

async function seedDatabase() {
  await setupDatabase({ force: true });

  const password = await bcrypt.hash('password123', 10);

  const team = await Team.create({
    team_name: 'Chicago Strikers',
    league_name: 'Midwest Premier League',
  });

  const [coach, manager, playerOne, playerTwo] = await Promise.all([
    User.create({
      name: 'Coach Carter',
      email: 'coach@soccerapi.com',
      password,
      role: 'coach',
      TeamId: team.id,
    }),
    User.create({
      name: 'Manager Mia',
      email: 'manager@soccerapi.com',
      password,
      role: 'manager',
      TeamId: team.id,
    }),
    User.create({
      name: 'Player Pablo',
      email: 'player1@soccerapi.com',
      password,
      role: 'player',
      TeamId: team.id,
    }),
    User.create({
      name: 'Player Priya',
      email: 'player2@soccerapi.com',
      password,
      role: 'player',
      TeamId: team.id,
    }),
  ]);

  const [matchOne, matchTwo] = await Promise.all([
    Match.create({
      opponent_name: 'Lakeside FC',
      match_date: '2026-04-20',
      location: 'Home Stadium',
      final_score: '3-1',
      TeamId: team.id,
    }),
    Match.create({
      opponent_name: 'River Town United',
      match_date: '2026-04-27',
      location: 'River Park',
      final_score: '1-1',
      TeamId: team.id,
    }),
  ]);

  await PlayerStat.bulkCreate([
    {
      goals: 2,
      assists: 1,
      minutes_played: 90,
      yellow_cards: 0,
      red_cards: 0,
      UserId: playerOne.id,
      MatchId: matchOne.id,
    },
    {
      goals: 0,
      assists: 1,
      minutes_played: 85,
      yellow_cards: 1,
      red_cards: 0,
      UserId: playerTwo.id,
      MatchId: matchOne.id,
    },
    {
      goals: 1,
      assists: 0,
      minutes_played: 88,
      yellow_cards: 0,
      red_cards: 0,
      UserId: playerOne.id,
      MatchId: matchTwo.id,
    },
  ]);

  return {
    coach,
    manager,
    playerOne,
    playerTwo,
    team,
    matches: [matchOne, matchTwo],
  };
}

if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('Database seeded successfully.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Failed to seed database:', error);
      process.exit(1);
    });
}

module.exports = {
  seedDatabase,
};
