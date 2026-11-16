const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Default error
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // MySQL errors
  if (err.code === 'ER_DUP_ENTRY') {
    statusCode = 400;
    message = 'Duplicate entry. This record already exists.';
  } else if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    statusCode = 400;
    message = 'Referenced record does not exist.';
  } else if (err.code === 'ER_ROW_IS_REFERENCED_2') {
    statusCode = 400;
    message = 'Cannot delete this record because it is referenced by other records.';
  } else if (err.code === 'ER_TRUNCATED_WRONG_VALUE') {
    statusCode = 400;
    message = 'Invalid data format provided.';
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token. Please log in again.';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired. Please log in again.';
  }

  // Validation errors (express-validator)
  if (err.array && typeof err.array === 'function') {
    statusCode = 400;
    message = err.array().map(e => e.msg).join(', ');
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;
