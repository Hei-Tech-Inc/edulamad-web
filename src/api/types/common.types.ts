/** Shared API contracts — envelope matches Nsuo backend when enabled; client unwraps when present. */

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta: {
    timestamp: string;
    version: string;
    requestId: string;
  };
  pagination?: Pagination;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface ApiErrorBody {
  code: string;
  message: string;
  details?: ValidationErrorDetail[];
}

export interface ValidationErrorDetail {
  field: string;
  message: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: Pagination;
}

/** Permission string from RBAC, e.g. `organization:manage` */
export type Permission = string;

export type OrgRole =
  | 'owner'
  | 'admin'
  | 'manager'
  | 'supervisor'
  | 'worker'
  | 'viewer';

export interface RequestUser {
  id: string;
  email?: string;
  name?: string | null;
  orgId: string | null;
  role: OrgRole;
  permissions: Permission[];
  /** SaaS platform super admin — `GET /platform/*`, optional `X-Act-As-Org-Id` on tenant routes. */
  isPlatformSuperAdmin?: boolean;
  emailVerified?: boolean;
  isActive?: boolean;
  createdAt?: string;
}
