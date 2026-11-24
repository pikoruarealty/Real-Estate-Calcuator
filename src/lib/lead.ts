import { z } from 'zod';

/** Strip spaces, +91 / 91 / leading 0 so the result can be matched against ^[6-9]\d{9}$. */
export function normalizePhone(raw: string): string {
  let s = raw.replace(/[\s\-().]/g, '');
  if (s.startsWith('+91')) s = s.slice(3);
  else if (s.startsWith('0091')) s = s.slice(4);
  else if (s.startsWith('91') && s.length === 12) s = s.slice(2);
  else if (s.startsWith('0')) s = s.slice(1);
  return s;
}

export const PREFERRED_TIMES = ['Morning', 'Afternoon', 'Evening', 'Any'] as const;

export const leadSchema = z.object({
  name: z.string().trim().min(2, 'Enter your name (2–80 characters)').max(80, 'Name is too long'),
  phone: z
    .string()
    .transform(normalizePhone)
    .refine((p) => /^[6-9]\d{9}$/.test(p), 'Enter a valid 10-digit Indian mobile number'),
  email: z.union([z.literal(''), z.string().trim().email('Enter a valid email')]).optional().default(''),
  preferredTime: z.enum(PREFERRED_TIMES).default('Any'),
  message: z.string().trim().max(500, 'Keep the message under 500 characters').optional().default(''),
  shareUrl: z.string().max(8000).optional().default(''),
  summary: z
    .object({
      allInCost: z.number().finite().default(0),
      carpetSqft: z.number().finite().default(0),
      projectName: z.string().max(120).default(''),
    })
    .optional(),
  company: z.string().optional().default(''), // honeypot
});

export type LeadPayload = z.input<typeof leadSchema>;
