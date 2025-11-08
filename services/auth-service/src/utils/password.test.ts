import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword, validatePasswordStrength } from './password';

describe('Password Utilities', () => {
  describe('hashPassword', () => {
    it('should hash a password', async () => {
      const password = 'SecurePass123!';
      const hash = await hashPassword(password);

      expect(hash).toBeTruthy();
      expect(typeof hash).toBe('string');
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(50); // bcrypt hashes are ~60 chars
    });

    it('should generate different hashes for same password', async () => {
      const password = 'SecurePass123!';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      expect(hash1).not.toBe(hash2); // Different salts
    });

    it('should handle special characters', async () => {
      const password = 'P@ssw0rd!#$%^&*()_+-=[]{}|;:,.<>?';
      const hash = await hashPassword(password);

      expect(hash).toBeTruthy();
      expect(hash).not.toBe(password);
    });

    it('should handle unicode characters', async () => {
      const password = 'Pässwörd123!';
      const hash = await hashPassword(password);

      expect(hash).toBeTruthy();
      expect(hash).not.toBe(password);
    });

    it('should handle very long passwords', async () => {
      const password = 'A'.repeat(100) + '1!aZ';
      const hash = await hashPassword(password);

      expect(hash).toBeTruthy();
    });

    it('should start with bcrypt identifier', async () => {
      const password = 'SecurePass123!';
      const hash = await hashPassword(password);

      expect(hash.startsWith('$2')).toBe(true); // bcrypt identifier
    });
  });

  describe('verifyPassword', () => {
    it('should verify correct password', async () => {
      const password = 'SecurePass123!';
      const hash = await hashPassword(password);

      const isValid = await verifyPassword(password, hash);
      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const password = 'SecurePass123!';
      const wrongPassword = 'WrongPass123!';
      const hash = await hashPassword(password);

      const isValid = await verifyPassword(wrongPassword, hash);
      expect(isValid).toBe(false);
    });

    it('should be case sensitive', async () => {
      const password = 'SecurePass123!';
      const hash = await hashPassword(password);

      const isValid = await verifyPassword('securepass123!', hash);
      expect(isValid).toBe(false);
    });

    it('should reject password with extra characters', async () => {
      const password = 'SecurePass123!';
      const hash = await hashPassword(password);

      const isValid = await verifyPassword('SecurePass123!extra', hash);
      expect(isValid).toBe(false);
    });

    it('should reject password with missing characters', async () => {
      const password = 'SecurePass123!';
      const hash = await hashPassword(password);

      const isValid = await verifyPassword('SecurePass123', hash);
      expect(isValid).toBe(false);
    });

    it('should handle special characters correctly', async () => {
      const password = 'P@ss!#$%^&*()';
      const hash = await hashPassword(password);

      const isValid = await verifyPassword(password, hash);
      expect(isValid).toBe(true);
    });

    it('should reject empty password', async () => {
      const password = 'SecurePass123!';
      const hash = await hashPassword(password);

      const isValid = await verifyPassword('', hash);
      expect(isValid).toBe(false);
    });

    it('should handle unicode passwords correctly', async () => {
      const password = 'Pässwörd123!';
      const hash = await hashPassword(password);

      const isValid = await verifyPassword(password, hash);
      expect(isValid).toBe(true);

      const invalidUnicode = await verifyPassword('Password123!', hash);
      expect(invalidUnicode).toBe(false);
    });
  });

  describe('validatePasswordStrength', () => {
    it('should accept strong password', () => {
      const result = validatePasswordStrength('SecurePass123!');

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject password shorter than 8 characters', () => {
      const result = validatePasswordStrength('Pass1!');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must be at least 8 characters long');
    });

    it('should reject password without uppercase letter', () => {
      const result = validatePasswordStrength('securepass123!');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one uppercase letter');
    });

    it('should reject password without lowercase letter', () => {
      const result = validatePasswordStrength('SECUREPASS123!');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one lowercase letter');
    });

    it('should reject password without number', () => {
      const result = validatePasswordStrength('SecurePass!');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one number');
    });

    it('should reject password without special character', () => {
      const result = validatePasswordStrength('SecurePass123');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one special character');
    });

    it('should return multiple errors for very weak password', () => {
      const result = validatePasswordStrength('weak');

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
      expect(result.errors).toContain('Password must be at least 8 characters long');
      expect(result.errors).toContain('Password must contain at least one uppercase letter');
      expect(result.errors).toContain('Password must contain at least one number');
      expect(result.errors).toContain('Password must contain at least one special character');
    });

    it('should accept password with minimum requirements', () => {
      const result = validatePasswordStrength('Pass123!');

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should accept password with various special characters', () => {
      const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';

      for (const char of specialChars) {
        const password = `SecurePass123${char}`;
        const result = validatePasswordStrength(password);

        expect(result.valid).toBe(true);
      }
    });

    it('should handle very long passwords', () => {
      const longPassword = 'A'.repeat(100) + 'a1!';
      const result = validatePasswordStrength(longPassword);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle password with spaces', () => {
      const result = validatePasswordStrength('Secure Pass 123!');

      expect(result.valid).toBe(true);
    });

    it('should handle unicode characters', () => {
      // Unicode characters don't count as special chars in our validation
      const result = validatePasswordStrength('Pässwörd123');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one special character');
    });

    it('should reject empty password with all error messages', () => {
      const result = validatePasswordStrength('');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must be at least 8 characters long');
    });

    it('should handle password with only numbers', () => {
      const result = validatePasswordStrength('12345678');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one uppercase letter');
      expect(result.errors).toContain('Password must contain at least one lowercase letter');
      expect(result.errors).toContain('Password must contain at least one special character');
    });
  });

  describe('Integration: hash and verify', () => {
    it('should successfully hash and verify strong password', async () => {
      const password = 'SecurePass123!';
      const validation = validatePasswordStrength(password);

      expect(validation.valid).toBe(true);

      const hash = await hashPassword(password);
      const isValid = await verifyPassword(password, hash);

      expect(isValid).toBe(true);
    });

    it('should handle password lifecycle', async () => {
      const password = 'UserPassword123!';

      // 1. Validate strength
      const validation = validatePasswordStrength(password);
      expect(validation.valid).toBe(true);

      // 2. Hash for storage
      const hash = await hashPassword(password);
      expect(hash).toBeTruthy();

      // 3. Verify on login
      const isValid = await verifyPassword(password, hash);
      expect(isValid).toBe(true);

      // 4. Reject wrong password
      const wrongAttempt = await verifyPassword('WrongPassword123!', hash);
      expect(wrongAttempt).toBe(false);
    });

    it('should maintain security with multiple hashes', async () => {
      const password = 'SecurePass123!';

      // Hash same password multiple times (e.g., password reset)
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);
      const hash3 = await hashPassword(password);

      // All hashes should be different (different salts)
      expect(hash1).not.toBe(hash2);
      expect(hash2).not.toBe(hash3);
      expect(hash1).not.toBe(hash3);

      // But all should verify correctly
      expect(await verifyPassword(password, hash1)).toBe(true);
      expect(await verifyPassword(password, hash2)).toBe(true);
      expect(await verifyPassword(password, hash3)).toBe(true);
    });
  });

  describe('Security considerations', () => {
    it('should use sufficient salt rounds (timing)', async () => {
      const password = 'SecurePass123!';

      const start = Date.now();
      await hashPassword(password);
      const duration = Date.now() - start;

      // bcrypt with 12 rounds should take at least some time (>10ms)
      // This ensures we're not using a weak hash
      expect(duration).toBeGreaterThan(10);
    });

    it('should not leak information through timing attacks on verify', async () => {
      const password = 'SecurePass123!';
      const hash = await hashPassword(password);

      // Both correct and incorrect passwords should take similar time
      const start1 = Date.now();
      await verifyPassword(password, hash);
      const correctTime = Date.now() - start1;

      const start2 = Date.now();
      await verifyPassword('WrongPass123!', hash);
      const incorrectTime = Date.now() - start2;

      // Times should be within reasonable range of each other
      // (bcrypt naturally provides timing attack resistance)
      const timeDiff = Math.abs(correctTime - incorrectTime);
      expect(timeDiff).toBeLessThan(100); // Within 100ms
    });
  });
});
