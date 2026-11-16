import { describe, expect, it } from 'vitest';
import { accountName, accountInitials } from '@/lib/account';

describe('Email-linked account identity', () => {
  it('uses the signed-in profile instead of Ishimwe Brian', () => {
    expect(accountName('Amina Doe', 'amina@example.com')).toBe('Amina Doe');
    expect(accountInitials('Amina Doe')).toBe('AD');
  });
  it('falls back to the supplied email when no profile name exists', () => {
    expect(accountName('', 'sara@example.com')).toBe('sara');
    expect(accountName('', 'john@example.com')).toBe('john');
  });
  it('does not show another account to guests', () => {
    expect(accountName(null, null)).toBe('Guest');
  });
});