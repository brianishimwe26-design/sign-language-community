import { describe, expect, it } from 'vitest';
import { buildSignQuery, languageSchema, signLanguages, trimSchema } from '@/lib/sign-language';

describe('Sign language searches', () => {
  it('offers Rwandan Sign Language', () => expect(signLanguages).toContain('Rwandan Sign Language'));
  it('offers American Sign Language', () => expect(signLanguages).toContain('American Sign Language'));
  it('accepts an unlisted sign language', () => expect(languageSchema.parse('Ghanaian Sign Language')).toBe('Ghanaian Sign Language'));
  it('searches the requested word in the selected language', () => expect(buildSignQuery('hello', 'Rwandan Sign Language')).toBe('"hello" "Rwandan Sign Language" sign dictionary video'));
  it('requires permission before trimming', () => expect(trimSchema.safeParse({ id: 'cdb5b083-36a6-4bef-9cbe-24604e433e17', start: 0, end: 3, rightsConfirmed: false }).success).toBe(false));
  it('rejects a reversed clip range', () => expect(trimSchema.safeParse({ id: 'cdb5b083-36a6-4bef-9cbe-24604e433e17', start: 4, end: 3, rightsConfirmed: true }).success).toBe(false));
});