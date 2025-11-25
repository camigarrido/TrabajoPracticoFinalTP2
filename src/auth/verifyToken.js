import { authenticateToken } from './index.js';

// Legacy function for backward compatibility
// Use authenticateToken instead for new implementations
export function verifyToken(req, res, next) {
  return authenticateToken(req, res, next);
}

// Re-export all auth functions for convenience
export * from './index.js';
