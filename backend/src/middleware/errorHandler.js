const AppError = require('../utils/AppError');

module.exports = (err, req, res, next) => {
  console.error('[Error Handler] Caught exception:', err);

  // Default to 500 Internal Server Error
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  let error = { ...err };
  error.message = err.message;
  error.name = err.name;
  error.code = err.code;

  // Handle Mongoose Validation Errors
  if (error.name === 'ValidationError') {
    const message = Object.values(error.errors)
      .map((val) => val.message)
      .join(', ');
    error = new AppError(message, 400);
  }

  // Handle MongoDB Duplicate Key Errors
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    const message = `An account with that ${field} is already in use.`;
    error = new AppError(message, 400);
  }

  // Handle CastError (invalid ObjectId)
  if (error.name === 'CastError') {
    const message = `Invalid format for field ${error.path}`;
    error = new AppError(message, 400);
  }

  // Handle JWT Errors
  if (error.name === 'JsonWebTokenError') {
    error = new AppError('Invalid authentication token. Please log in again.', 401);
  }
  if (error.name === 'TokenExpiredError') {
    error = new AppError('Your session has expired. Please log in again.', 401);
  }

  // Handle Mongoose Connection & Buffering Timeouts
  if (
    error.name === 'MongooseServerSelectionError' ||
    (error.message &&
      (error.message.includes('buffering timed out') ||
        error.message.includes('ECONNREFUSED') ||
        error.message.includes('ENOTFOUND') ||
        error.message.includes('connection timed out')))
  ) {
    error = new AppError('Database connection error. Please try again later.', 503);
  }

  if (process.env.NODE_ENV === 'development') {
    res.status(error.statusCode).json({
      status: error.status,
      error: error,
      message: error.message,
      stack: err.stack,
    });
  } else {
    // Production
    if (error.isOperational) {
      res.status(error.statusCode).json({
        status: error.status,
        message: error.message,
      });
    } else {
      console.error('ERROR 💥', err);
      res.status(500).json({
        status: 'error',
        message: 'Something went very wrong!',
      });
    }
  }
};
