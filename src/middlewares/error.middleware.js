import { ApiError } from "../utils/api-error.js";
import logger from "../config/logger.js";

const errorHandler = (err, req, res, next) => {
  // default values
  let statusCode = 500;
  let message = "Internal Server Error";
  let errors = [];

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.errors;
    
    // Log API errors at appropriate level
    if (statusCode >= 500) {
      logger.error({
        message: err.message,
        statusCode,
        errors,
        stack: err.stack,
        path: req.path,
        method: req.method,
      });
    } else if (statusCode >= 400) {
      logger.warn({
        message: err.message,
        statusCode,
        errors,
        path: req.path,
        method: req.method,
      });
    }
  } else {
    // unexpected errors (programming bugs)
    logger.error({
      message: err.message || 'Unexpected error',
      error: err,
      stack: err.stack,
      path: req.path,
      method: req.method,
    });
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export default errorHandler;
