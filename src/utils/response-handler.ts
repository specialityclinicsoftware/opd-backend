import { Response } from 'express';

/**
 * Send success response
 */
export const sendSuccess = (
  res: Response,
  data: any,
  message?: string,
  statusCode: number = 200
): void => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * Send error response
 */
export const sendError = (
  res: Response,
  message: string,
  statusCode: number = 500,
  error?: any
): void => {
  res.status(statusCode).json({
    success: false,
    message,
    error: process.env.NODE_ENV === 'development' ? error : undefined,
  });
};

/**
 * Send not found response
 */
export const sendNotFound = (res: Response, resource: string): void => {
  res.status(404).json({
    success: false,
    message: `${resource} not found`,
  });
};

/**
 * Send validation error response
 */
export const sendValidationError = (res: Response, message: string): void => {
  res.status(400).json({
    success: false,
    message,
  });
};

/**
 * Send created response
 */
export const sendCreated = (res: Response, data: any, message: string): void => {
  res.status(201).json({
    success: true,
    message,
    data,
  });
};
