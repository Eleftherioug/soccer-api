require('dotenv').config();

const express = require('express');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const teamRoutes = require('./routes/teams');
const matchRoutes = require('./routes/matches');
const statisticsRoutes = require('./routes/statistics');
const logger = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');
const { setupDatabase } = require('./database/setup');

const app = express();

app.use(express.json());
app.use(logger);

app.get('/health', (req, res) => {
  res.send('OK');
});

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/teams', teamRoutes);
app.use('/matches', matchRoutes);
app.use('/statistics', statisticsRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use(errorHandler);

const PORT = 3000;

if (require.main === module) {
  setupDatabase()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });
    })
    .catch((error) => {
      console.error('Failed to start server:', error);
      process.exit(1);
    });
}

module.exports = app;
