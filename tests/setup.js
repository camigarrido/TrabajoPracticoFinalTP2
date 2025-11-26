// Global test setup

// Mock environment variables for testing
process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = 'mongodb://localhost:27017/test-database';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
process.env.SERVER_PORT = '3005';
process.env.SERVER_HOST = '127.0.0.1';

// Console log control for tests
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

// Suppress console logs during tests for cleaner output
console.log = () => {};
console.error = () => {};

// Cleanup after tests
afterAll(() => {
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
});
