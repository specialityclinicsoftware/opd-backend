import logger from '../config/logger';

/**
 * Log error using Winston logger with context
 */
export const logError = (context: string, error: unknown): void => {
  if (error instanceof Error) {
    logger.error(`[Error in ${context}]: ${error.message}`, {
      context,
      stack: error.stack,
      error: error,
    });
  } else {
    logger.error(`[Error in ${context}]:`, { context, error });
  }
};

/**
 * Get error message from unknown error type
 */
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return 'Unknown error';
};

/**
 * Check if error is a MongoDB duplicate key error
 */
export const isDuplicateKeyError = (error: any): boolean => {
  return error?.code === 11000;
};

/**
 * Check if error is a MongoDB validation error
 */
export const isValidationError = (error: any): boolean => {
  return error?.name === 'ValidationError';
};

/**
 * Check if error is a MongoDB cast error (invalid ID format)
 */
export const isCastError = (error: any): boolean => {
  return error?.name === 'CastError';
};
