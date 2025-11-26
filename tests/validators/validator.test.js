import { describe, test, expect, jest, beforeEach } from '@jest/globals';
import { validateEmail, validate } from '../../src/validators/validator.model.js';

describe('Validator Utils', () => {
  describe('validateEmail', () => {
    test('should return valid result for valid email addresses', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.org',
        'firstname.lastname@company.com'
      ];

      validEmails.forEach(email => {
        const result = validateEmail(email);
        expect(result.valid).toBe(true);
        expect(result.message).toBe("Email válido.");
      });
    });

    test('should return invalid result for invalid email addresses', () => {
      const invalidEmails = [
        'invalid-email',
        'test@',
        '@domain.com',
        'test@.com',
        ''
      ];

      invalidEmails.forEach(email => {
        const result = validateEmail(email);
        expect(result.valid).toBe(false);
        expect(result.message).toBe("Formato de email inválido.");
      });
    });

    test('should block emails from blocked domains', () => {
      const blockedEmails = [
        'user@yahoo.com',
        'test@netscape.net',
        'someone@river.org'
      ];

      blockedEmails.forEach(email => {
        const result = validateEmail(email);
        expect(result.valid).toBe(false);
        expect(result.message).toContain('No se permiten cuentas de');
      });
    });

    test('should handle null and undefined inputs', () => {
      // These will be treated as invalid emails by the regex test
      expect(validateEmail(null).valid).toBe(false);
      expect(validateEmail(undefined).valid).toBe(false);
    });
  });

  describe('validate', () => {
    test('should return valid result for valid strings', () => {
      const validStrings = [
        'Valid String',
        'Test123',
        'Another valid text',
        'SpecialChars!@#'
      ];

      validStrings.forEach(str => {
        const result = validate(str);
        expect(result.valid).toBe(true);
        expect(result.message).toBe("ok");
      });
    });

    test('should return invalid result for invalid inputs', () => {
      const invalidInputs = [
        '',
        '   ',
        null,
        undefined
      ];

      invalidInputs.forEach(input => {
        const result = validate(input);
        expect(result.valid).toBe(false);
        expect(result.message).toBe("El campo no puede estar vacío");
      });
    });
  });
});
