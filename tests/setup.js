import { jest } from '@jest/globals';

// Setup global test configuration
beforeAll(() => {
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-jwt-secret';
  process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
  process.env.MONGO_URI = 'mongodb://localhost:27017/test-db';
});

afterAll(() => {
  // Cleanup
});

// Global test timeout
jest.setTimeout(10000);
