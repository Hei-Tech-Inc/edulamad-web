/**
 * Mirrors OpenAPI `CreateOrganizationDto` / `UpdateOrganizationDto`
 * (`contexts/api-docs.json`). Platform console uses `PUT` `/platform/organisations/:id`; create may use `POST` `/admin/organizations`.
 */

export interface CreatePlatformOrganisationDto {
  name: string;
  slug: string;
  description?: string;
  /** Owner user ID (optional). */
  ownerId?: string;
}

export interface UpdatePlatformOrganisationDto {
  name?: string;
  description?: string;
  logo?: string;
  website?: string;
  isActive?: boolean;
}
