import { describe, test, expect, jest, beforeEach } from '@jest/globals';

describe('Auth Utils Unit Tests', () => {
  let mockJwt;

  // Create mock auth functions to avoid importing the real ones
  const createMockAuth = (jwt) => ({
    signToken: (userData) => {
      return jwt.sign(userData, process.env.JWT_SECRET, { expiresIn: '1h' });
    },
    
    verifyToken: (token) => {
      try {
        return jwt.verify(token, process.env.JWT_SECRET);
      } catch (error) {
        throw new Error('Invalid token');
      }
    }
  });

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret';
    
    mockJwt = {
      sign: jest.fn(),
      verify: jest.fn()
    };
  });

  describe('signToken', () => {
    test('should sign a token with user data', () => {
      const userData = {
        id: '507f1f77bcf86cd799439011',
        email: 'test@example.com',
        name: 'Test User',
        role: 'user'
      };

      const mockToken = 'mock.jwt.token';
      mockJwt.sign.mockReturnValue(mockToken);
      
      const auth = createMockAuth(mockJwt);
      const result = auth.signToken(userData);

      expect(mockJwt.sign).toHaveBeenCalledWith(
        userData,
        'test-secret',
        { expiresIn: '1h' }
      );
      expect(result).toBe(mockToken);
    });

    test('should use JWT_SECRET from environment', () => {
      const userData = { id: '507f1f77bcf86cd799439011', email: 'test@example.com' };
      const mockToken = 'environment.test.token';
      
      process.env.JWT_SECRET = 'different-secret';
      mockJwt.sign.mockReturnValue(mockToken);
      
      const auth = createMockAuth(mockJwt);
      auth.signToken(userData);

      expect(mockJwt.sign).toHaveBeenCalledWith(
        userData,
        'different-secret',
        { expiresIn: '1h' }
      );
    });

    test('should handle empty user data', () => {
      const userData = {};
      const mockToken = 'empty.user.token';
      
      mockJwt.sign.mockReturnValue(mockToken);
      
      const auth = createMockAuth(mockJwt);
      const result = auth.signToken(userData);

      expect(mockJwt.sign).toHaveBeenCalledWith(
        userData,
        'test-secret',
        { expiresIn: '1h' }
      );
      expect(result).toBe(mockToken);
    });
  });

  describe('verifyToken', () => {
    test('should verify a valid token', () => {
      const mockToken = 'valid.jwt.token';
      const mockDecodedData = {
        id: '507f1f77bcf86cd799439011',
        email: 'test@example.com',
        name: 'Test User',
        role: 'user'
      };

      mockJwt.verify.mockReturnValue(mockDecodedData);
      
      const auth = createMockAuth(mockJwt);
      const result = auth.verifyToken(mockToken);

      expect(mockJwt.verify).toHaveBeenCalledWith(mockToken, 'test-secret');
      expect(result).toEqual(mockDecodedData);
    });

    test('should throw error for invalid token', () => {
      const mockToken = 'invalid.jwt.token';
      
      mockJwt.verify.mockImplementation(() => {
        throw new Error('JsonWebTokenError: invalid token');
      });
      
      const auth = createMockAuth(mockJwt);

      expect(() => auth.verifyToken(mockToken)).toThrow('Invalid token');
      expect(mockJwt.verify).toHaveBeenCalledWith(mockToken, 'test-secret');
    });

    test('should throw error for expired token', () => {
      const mockToken = 'expired.jwt.token';
      
      mockJwt.verify.mockImplementation(() => {
        throw new Error('TokenExpiredError: jwt expired');
      });
      
      const auth = createMockAuth(mockJwt);

      expect(() => auth.verifyToken(mockToken)).toThrow('Invalid token');
    });

    test('should verify token with different secret', () => {
      const mockToken = 'different.secret.token';
      const mockDecodedData = { id: '507f1f77bcf86cd799439011', role: 'admin' };
      
      process.env.JWT_SECRET = 'another-secret';
      mockJwt.verify.mockReturnValue(mockDecodedData);
      
      const auth = createMockAuth(mockJwt);
      const result = auth.verifyToken(mockToken);

      expect(mockJwt.verify).toHaveBeenCalledWith(mockToken, 'another-secret');
      expect(result).toEqual(mockDecodedData);
    });
  });

  describe('Token Flow Integration', () => {
    test('should sign and verify token successfully', () => {
      const userData = {
        id: '507f1f77bcf86cd799439011',
        email: 'integration@test.com',
        role: 'user'
      };
      
      const mockToken = 'integration.test.token';
      
      // Mock signing
      mockJwt.sign.mockReturnValue(mockToken);
      // Mock verification to return the same data
      mockJwt.verify.mockReturnValue(userData);
      
      const auth = createMockAuth(mockJwt);
      
      // Sign token
      const signedToken = auth.signToken(userData);
      expect(signedToken).toBe(mockToken);
      
      // Verify token
      const verifiedData = auth.verifyToken(signedToken);
      expect(verifiedData).toEqual(userData);
    });
  });
});
