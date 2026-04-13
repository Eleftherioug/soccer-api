const { ValidationError, UniqueConstraintError } = require('sequelize');

function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  if (error instanceof ValidationError || error instanceof UniqueConstraintError) {
    const message = error.errors?.[0]?.message || 'Bad request';
    return res.status(400).json({ error: message });
  }

  if (error.status) {
    return res.status(error.status).json({ error: error.message });
  }

  console.error(error);
  return res.status(500).json({ error: 'Server error' });
}

module.exports = errorHandler;
