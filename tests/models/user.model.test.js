import { describe, test, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { UserModel } from '../../src/models/user.mongoose.model.js';

// Mock mongoose
jest.mock('mongoose');

describe('User Model', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should have correct schema properties', () => {
    const userSchema = UserModel.schema;
    
    // Check if the schema has the expected paths
    expect(userSchema.paths).toHaveProperty('name');
    expect(userSchema.paths).toHaveProperty('email');
    expect(userSchema.paths).toHaveProperty('password');
    expect(userSchema.paths).toHaveProperty('age');
    expect(userSchema.paths).toHaveProperty('role');
    expect(userSchema.paths).toHaveProperty('isActive');
  });

  test('should validate required fields', () => {
    const userSchema = UserModel.schema;
    
    // Check required fields
    expect(userSchema.paths.name.isRequired).toBe(true);
    expect(userSchema.paths.email.isRequired).toBe(true);
    expect(userSchema.paths.password.isRequired).toBe(true);
  });

  test('should have correct default values', () => {
    const userSchema = UserModel.schema;
    
    // Check default values
    expect(userSchema.paths.role.defaultValue).toBe('user');
    expect(userSchema.paths.isActive.defaultValue).toBe(true);
  });

  test('should have correct enum values for role', () => {
    const userSchema = UserModel.schema;
    
    // Check enum values for role
    expect(userSchema.paths.role.enumValues).toEqual(['user', 'admin']);
  });

  test('should have correct field constraints', () => {
    const userSchema = UserModel.schema;
    
    // Check field constraints
    expect(userSchema.paths.name.options.maxlength).toBe(100);
    expect(userSchema.paths.email.options.maxlength).toBe(200);
    expect(userSchema.paths.email.options.unique).toBe(true);
    expect(userSchema.paths.age.options.min).toBe(13);
  });
});
