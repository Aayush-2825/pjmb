import { z } from 'zod';

// Setup 2FA - no input required
export const setup2FASchema = z.object({});

// Enable 2FA with OTP
export const enable2FASchema = z.object({
  body: z.object({
    otp: z
      .string()
      .length(6, 'OTP must be 6 digits')
      .regex(/^\d+$/, 'OTP must contain only digits'),
  }),
});

// Verify OTP
export const verify2FASchema = z.object({
  body: z.object({
    otp: z
      .string()
      .length(6, 'OTP must be 6 digits')
      .regex(/^\d+$/, 'OTP must contain only digits'),
  }),
});

// Verify recovery code
export const verifyRecovery2FASchema = z.object({
  body: z.object({
    recoveryCode: z.string().min(1, 'Recovery code is required'),
  }),
});
