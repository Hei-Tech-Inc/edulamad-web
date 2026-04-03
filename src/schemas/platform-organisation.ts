import { z } from 'zod';

/** Aligns with `CreateOrganizationDto` in OpenAPI. */
export const createPlatformOrganisationSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(255),
  slug: z
    .string()
    .trim()
    .min(1, 'Slug is required')
    .regex(/^[a-z0-9-]+$/, 'Use lowercase letters, numbers, and hyphens only'),
  description: z.string().optional(),
  ownerId: z
    .string()
    .optional()
    .refine((v) => !v || /^[0-9a-f-]{36}$/i.test(v), 'Must be a valid UUID'),
});

export type CreatePlatformOrganisationValues = z.infer<
  typeof createPlatformOrganisationSchema
>;

/** Aligns with `UpdateOrganizationDto` in OpenAPI. */
export const updatePlatformOrganisationSchema = z.object({
  name: z.string().trim().max(255).optional(),
  description: z.string().optional(),
  logo: z.string().optional(),
  website: z
    .string()
    .optional()
    .refine(
      (v) => !v || z.string().url().safeParse(v).success,
      'Must be a valid URL',
    ),
  isActive: z.boolean().optional(),
});

export type UpdatePlatformOrganisationValues = z.infer<
  typeof updatePlatformOrganisationSchema
>;
