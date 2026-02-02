import { z } from 'zod';

// Get session by ID
export const getSessionSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid session ID'),
  }),
});

// Revoke session
export const revokeSessionSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid session ID'),
  }),
});
