import { z } from 'zod';

// Password validation schema
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(100, 'Password must be less than 100 characters')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

// Email validation schema
const emailSchema = z
  .string()
  .email('Invalid email format')
  .toLowerCase()
  .trim();

// Register validation
export const registerSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(3, 'Name must be at least 3 characters')
      .max(60, 'Name must be less than 60 characters')
      .trim(),
    email: emailSchema,
    password: passwordSchema,
  }),
});

// Login validation
export const loginSchema = z.object({
  body: z.object({
    email: emailSchema,
    password: z.string().min(1, 'Password is required'),
    loginCode: z.string().length(6, '2FA code must be 6 digits').optional(),
    recoveryCode: z.string().optional(),
  }),
});

// Refresh token validation
export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
  }),
});

// Email verification
export const verifyEmailSchema = z.object({
  query: z.object({
    code: z.string().min(1, 'Verification code is required'),
  }),
});

// Resend verification email
export const resendVerificationSchema = z.object({
  body: z.object({
    email: emailSchema,
  }),
});

// Forgot password
export const forgotPasswordSchema = z.object({
  body: z.object({
    email: emailSchema,
  }),
});

// Reset password
export const resetPasswordSchema = z.object({
  query: z.object({
    code: z.string().min(1, 'Reset code is required'),
  }),
  body: z.object({
    password: passwordSchema,
  }),
});
