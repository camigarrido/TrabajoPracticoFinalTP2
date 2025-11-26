import { describe, test, expect, jest, beforeEach } from '@jest/globals';
import { updateModel } from '../../src/utils/updateModel.utils.js';

describe('Update Model Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should update model with provided fields', () => {
    const existingModel = {
      name: 'Original Name',
      email: 'original@email.com',
      age: 25,
      role: 'user'
    };

    const updateData = {
      name: 'Updated Name',
      age: 30
    };

    const result = updateModel(existingModel, updateData);

    expect(result).toEqual({
      name: 'Updated Name',
      email: 'original@email.com',
      age: 30,
      role: 'user'
    });
  });

  test('should not modify original object', () => {
    const existingModel = {
      name: 'Original Name',
      email: 'original@email.com',
      age: 25
    };

    const originalCopy = { ...existingModel };
    const updateData = { name: 'Updated Name' };

    updateModel(existingModel, updateData);

    expect(existingModel).toEqual(originalCopy);
  });

  test('should handle empty update data', () => {
    const existingModel = {
      name: 'Original Name',
      email: 'original@email.com',
      age: 25
    };

    const result = updateModel(existingModel, {});

    expect(result).toEqual(existingModel);
  });

  test('should ignore undefined values', () => {
    const existingModel = {
      name: 'Original Name',
      email: 'original@email.com',
      age: 25
    };

    const updateData = {
      name: 'Updated Name',
      email: undefined,
      age: null
    };

    const result = updateModel(existingModel, updateData);

    expect(result).toEqual({
      name: 'Updated Name',
      email: 'original@email.com',
      age: null
    });
  });
});
