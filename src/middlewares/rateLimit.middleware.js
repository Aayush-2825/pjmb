import rateLimit from 'express-rate-limit';
import { ApiError } from '../utils/api-error.js';

// Default rate limiter for general API endpoints
export const defaultRateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res, next) => {
    next(new ApiError(429, 'Too many requests, please try again later.'));
  },
});

// Stricter rate limiter for authentication endpoints
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  skipSuccessfulRequests: false,
  message: 'Too many authentication attempts, please try again later.',
  handler: (req, res, next) => {
    next(new ApiError(429, 'Too many authentication attempts. Please try again after 15 minutes.'));
  },
});

// Rate limiter for login endpoint (allows more attempts)
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 login attempts per windowMs
  skipSuccessfulRequests: true, // Don't count successful logins
  message: 'Too many login attempts, please try again later.',
  handler: (req, res, next) => {
    next(new ApiError(429, 'Too many login attempts. Please try again after 15 minutes.'));
  },
});

// Rate limiter for registration
export const registerRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // limit each IP to 3 registrations per hour
  message: 'Too many accounts created from this IP, please try again later.',
  handler: (req, res, next) => {
    next(new ApiError(429, 'Too many registration attempts. Please try again after 1 hour.'));
  },
});

// Rate limiter for password reset requests
export const passwordResetRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // limit each IP to 3 password reset requests per hour
  message: 'Too many password reset requests, please try again later.',
  handler: (req, res, next) => {
    next(new ApiError(429, 'Too many password reset attempts. Please try again after 1 hour.'));
  },
});

// Rate limiter for 2FA verification
export const twoFactorRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5, // limit each IP to 5 2FA attempts per 10 minutes
  skipSuccessfulRequests: true,
  message: 'Too many 2FA verification attempts, please try again later.',
  handler: (req, res, next) => {
    next(new ApiError(429, 'Too many 2FA verification attempts. Please try again after 10 minutes.'));
  },
});

// Rate limiter for email verification resend
export const emailResendRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // limit each IP to 3 resend attempts per 15 minutes
  message: 'Too many email resend requests, please try again later.',
  handler: (req, res, next) => {
    next(new ApiError(429, 'Too many email resend attempts. Please try again after 15 minutes.'));
  },
});
