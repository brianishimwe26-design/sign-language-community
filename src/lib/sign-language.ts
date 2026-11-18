import { z } from 'zod';

export const signLanguages = [
  'American Sign Language', 'Rwandan Sign Language', 'South African Sign Language',
  'British Sign Language', 'Kenyan Sign Language', 'Ugandan Sign Language',
  'French Sign Language', 'Australian Sign Language', 'Indian Sign Language',
  'International Sign',
] as const;
export const languageSchema = z.string().trim().min(3).max(100);
export const searchSchema = z.object({ phrase: z.string().trim().min(1).max(200), language: languageSchema });
export const trimSchema = z.object({
  id: z.string().uuid(), start: z.number().finite().min(0), end: z.number().finite().positive(),
  rightsConfirmed: z.literal(true),
}).refine((value) => value.end > value.start, 'End must be after start');
export const sourceSchema = z.object({ title: z.string(), url: z.string().url(), description: z.string().optional() });
export type SignSource = z.infer<typeof sourceSchema>;

export function buildSignQuery(phrase: string, language: string) {
  return `${JSON.stringify(phrase)} ${JSON.stringify(language)} sign dictionary video`;
}