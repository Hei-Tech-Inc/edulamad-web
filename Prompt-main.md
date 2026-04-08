You are a senior frontend engineer building a production-ready 
multi-tenant aquaculture farm management platform called Nsuo.

I am providing you with the Swagger JSON for the backend API. 
Read it completely before writing any code. Every API call, 
type, and endpoint must come from that Swagger JSON — do not 
invent endpoints or fields.

This is an end-to-end setup prompt. Complete everything in order.
Do not skip any section.

═══════════════════════════════════════════════════════
SECTION 1 — WHAT WE ARE BUILDING
═══════════════════════════════════════════════════════

Platform: Nsuo — fish farm management SaaS
Users: farm owners, managers, supervisors, workers, viewers
Data: farms, units (ponds/cages/nurseries), stock cycles, 
      daily records, weight samples, feeding logs, 
      harvests, disease events, weather observations,
      feed inventory, analytics, research API

Existing codebase: Next.js 15 Pages Router, Tailwind CSS,
Redux Toolkit, Supabase (being replaced by Nsuo API),
Recharts, xlsx, Lucide icons.

Goal: replace all direct Supabase calls with Nsuo API calls.
Keep all existing UI components that work. Replace only the 
data layer.

═══════════════════════════════════════════════════════
SECTION 2 — TECH STACK TO SET UP
═══════════════════════════════════════════════════════

Install these packages if not present:
  @tanstack/react-query@5
  @tanstack/react-query-devtools@5
  axios
  zod
  react-hook-form
  @hookform/resolvers
  zustand
  @tanstack/react-table@8
  date-fns (already installed)

Do NOT install redux or redux-toolkit for new code.
Keep existing Redux store for now — migrate slices to 
Zustand one at a time without breaking anything.

Do NOT remove Recharts — keep all existing charts.
Do NOT remove xlsx — keep export functionality.

Do Not forget to have Organization Onbarding flow.

═══════════════════════════════════════════════════════
SECTION 3 — PROJECT STRUCTURE
═══════════════════════════════════════════════════════

Create this structure. Do not move existing files.
Add new files alongside existing ones.

src/
├── api/
│   ├── client.ts           ← axios instance
│   ├── endpoints.ts        ← all API endpoint strings
│   └── types/              ← one file per domain, 
│       ├── auth.types.ts      generated from Swagger JSON
│       ├── farm.types.ts
│       ├── unit.types.ts
│       ├── cycle.types.ts
│       ├── daily-record.types.ts
│       ├── weight-sample.types.ts
│       ├── feeding-log.types.ts
│       ├── harvest.types.ts
│       ├── disease-event.types.ts
│       ├── weather.types.ts
│       ├── feed.types.ts
│       ├── analytics.types.ts
│       ├── notification.types.ts
│       └── common.types.ts  ← PaginatedResponse, ApiResponse,
│                               ApiError, RequestUser
├── hooks/
│   ├── auth/
│   │   ├── useAuth.ts
│   │   ├── useLogin.ts
│   │   ├── useRegister.ts
│   │   └── useLogout.ts
│   ├── farms/
│   │   ├── useFarms.ts
│   │   ├── useFarm.ts
│   │   ├── useFarmSummary.ts
│   │   ├── useCreateFarm.ts
│   │   ├── useUpdateFarm.ts
│   │   └── useDeleteFarm.ts
│   ├── units/
│   │   ├── useUnits.ts
│   │   ├── useUnit.ts
│   │   ├── useUnitSummary.ts
│   │   ├── useCreateUnit.ts
│   │   ├── useUpdateUnit.ts
│   │   └── useDeleteUnit.ts
│   ├── cycles/
│   │   ├── useCycles.ts
│   │   ├── useCycle.ts
│   │   ├── useCycleGrowth.ts
│   │   ├── useCreateCycle.ts
│   │   └── useApproveCycle.ts
│   ├── daily-records/
│   │   ├── useDailyRecords.ts
│   │   ├── useCreateDailyRecord.ts
│   │   ├── useBulkCreateDailyRecords.ts
│   │   └── useVerifyDailyRecord.ts
│   ├── weight-samples/
│   │   ├── useWeightSamples.ts
│   │   ├── useCreateWeightSample.ts
│   │   └── useApproveWeightSample.ts
│   ├── feeding-logs/
│   │   ├── useFeedingLogs.ts
│   │   ├── useCreateFeedingLog.ts
│   │   └── useFcr.ts
│   ├── harvests/
│   │   ├── useHarvests.ts
│   │   ├── useCreateHarvest.ts
│   │   ├── useApproveHarvest.ts
│   │   └── useProfitability.ts
│   ├── feed/
│   │   ├── useFeedSuppliers.ts
│   │   ├── useFeedTypes.ts
│   │   ├── useLowStock.ts
│   │   ├── useFeedInventory.ts
│   │   ├── useFeedPurchases.ts
│   │   ├── useFeedPurchaseSummary.ts
│   │   ├── useCreateFeedPurchase.ts
│   │   └── useInventoryAdjustment.ts
│   ├── analytics/
│   │   ├── useOverview.ts
│   │   ├── useGrowthTrends.ts
│   │   ├── useHarvestReadiness.ts
│   │   ├── useMortalityTrends.ts
│   │   ├── useFeedEfficiency.ts
│   │   ├── useFeedCostTrends.ts
│   │   └── useFeedBrandPerformance.ts
│   ├── notifications/
│   │   ├── useNotifications.ts
│   │   ├── useMarkRead.ts
│   │   └── useMarkAllRead.ts
│   └── users/
│       ├── useUsers.ts
│       ├── useInviteUser.ts
│       └── useUpdateUserRole.ts
├── stores/
│   ├── auth.store.ts       ← Zustand (replaces authSlice)
│   └── ui.store.ts         ← sidebar open, active farm, etc
├── lib/
│   ├── query-client.ts     ← TanStack Query client config
│   ├── axios.ts            ← re-export of api/client
│   └── permissions.ts      ← hasPermission() helper
└── schemas/
    ├── farm.schema.ts      ← Zod schemas for all forms
    ├── unit.schema.ts
    ├── cycle.schema.ts
    ├── daily-record.schema.ts
    ├── weight-sample.schema.ts
    ├── feeding-log.schema.ts
    ├── harvest.schema.ts
    ├── disease-event.schema.ts
    ├── weather.schema.ts
    └── feed.schema.ts

═══════════════════════════════════════════════════════
SECTION 4 — API CLIENT
═══════════════════════════════════════════════════════

src/api/client.ts:

Create an axios instance with:
  baseURL: process.env.NEXT_PUBLIC_API_URL
    (default http://localhost:3001/api/v1)

Request interceptor:
  Read access token from auth store (Zustand).
  Attach as: Authorization: Bearer {token}
  Attach X-Request-ID: nanoid() on every request

Response interceptor — handle errors:
  401 → attempt token refresh via POST /auth/refresh
        using refresh token from auth store.
        If refresh succeeds: retry original request
          with new access token.
        If refresh fails: clear auth store, 
          redirect to /login.
  403 → do not redirect. Return error so component
        can show permission denied message.
  422 → extract validation errors array from 
        error.response.data.error.details,
        return as structured ValidationError.
  500 → log to console in dev, show generic message.
  Network error → show "Cannot connect to server" toast.

All responses follow this envelope:
{
  success: boolean,
  data: T,
  meta: { timestamp, version, requestId },
  pagination?: { page, limit, total, pages }
}
Unwrap automatically in interceptor so hooks receive 
data directly, not the envelope.

src/api/endpoints.ts:

Export a typed const object with all endpoint strings.
Derive every endpoint from the Swagger JSON provided.
Example structure:
const API = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    refresh: '/auth/refresh',
    logout: '/auth/logout',
    me: '/auth/me',
  },
  farms: {
    list: '/farms',
    create: '/farms',
    detail: (id: string) => `/farms/${id}`,
    update: (id: string) => `/farms/${id}`,
    delete: (id: string) => `/farms/${id}`,
    summary: (id: string) => `/farms/${id}/summary`,
  },
  // ... complete for every endpoint in the Swagger JSON
}
export default API;

═══════════════════════════════════════════════════════
SECTION 5 — TYPESCRIPT TYPES
═══════════════════════════════════════════════════════

Read the Swagger JSON schemas section completely.
Generate TypeScript interfaces for every schema.
Rules:
- Use the exact field names from the Swagger JSON
- All nullable fields: field?: Type | null
- All enums: TypeScript string union types
- Do not use `any` anywhere
- Export every type

src/api/types/common.types.ts must include:

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

export interface ApiError {
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

export interface RequestUser {
  id: string;
  orgId: string;
  role: OrgRole;
  permissions: Permission[];
}

export type OrgRole = 
  'owner' | 'admin' | 'manager' | 
  'supervisor' | 'worker' | 'viewer';

═══════════════════════════════════════════════════════
SECTION 6 — AUTH STORE (Zustand)
═══════════════════════════════════════════════════════

src/stores/auth.store.ts:

interface AuthState {
  user: RequestUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  setTokens: (access: string, refresh: string) => void;
  setUser: (user: RequestUser) => void;
  clearAuth: () => void;
  hasPermission: (permission: Permission) => boolean;
}

Use zustand/middleware persist with localStorage.
Persist: accessToken, refreshToken, user.
Do not persist: isLoading.

hasPermission checks user.permissions array.
Returns false if user is null.

src/lib/permissions.ts:

export function hasPermission(
  user: RequestUser | null, 
  permission: Permission
): boolean

export function hasRole(
  user: RequestUser | null,
  role: OrgRole | OrgRole[]
): boolean

export function canApprove(
  user: RequestUser,
  record: { createdByUserId: string }
): boolean  // returns user.id !== record.createdByUserId
             // AND user has the approval permission

═══════════════════════════════════════════════════════
SECTION 7 — TANSTACK QUERY SETUP
═══════════════════════════════════════════════════════

src/lib/query-client.ts:

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,      // 2 minutes
      gcTime: 1000 * 60 * 10,         // 10 minutes  
      retry: (failureCount, error) => {
        // Do not retry on 401, 403, 404
        if (isApiError(error) && [401,403,404]
            .includes(error.status)) return false;
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      onError: (error) => {
        // Global mutation error toast
        // Extract message from ApiError shape
      }
    }
  }
});

In pages/_app.js:
Wrap with QueryClientProvider.
Add ReactQueryDevtools in development only.
Keep existing Redux Provider and other providers.

═══════════════════════════════════════════════════════
SECTION 8 — QUERY KEYS
═══════════════════════════════════════════════════════

src/api/query-keys.ts:

Export a const object with all query keys.
Keys must be structured arrays so invalidation works 
precisely:

export const queryKeys = {
  farms: {
    all: ['farms'] as const,
    lists: () => [...queryKeys.farms.all, 'list'] as const,
    list: (filters: FarmFilters) => 
      [...queryKeys.farms.lists(), filters] as const,
    details: () => [...queryKeys.farms.all, 'detail'] as const,
    detail: (id: string) => 
      [...queryKeys.farms.details(), id] as const,
    summary: (id: string) => 
      [...queryKeys.farms.all, 'summary', id] as const,
  },
  units: { /* same pattern */ },
  cycles: { /* same pattern, also by pondId */ },
  dailyRecords: { /* by pondId + date range */ },
  weightSamples: { /* by pondId */ },
  feedingLogs: { /* by pondId */ },
  harvests: { /* by orgId + filters */ },
  feed: {
    suppliers: { all, lists, detail },
    types: { all, lists, detail, lowStock },
    purchases: { all, lists, detail, summary },
    inventory: { all, transactions },
  },
  analytics: {
    overview: ['analytics', 'overview'] as const,
    growthTrends: (pondId: string) => 
      ['analytics', 'growth', pondId] as const,
    harvestReadiness: ['analytics', 'readiness'] as const,
    mortalityTrends: (filters) => 
      ['analytics', 'mortality', filters] as const,
    feedEfficiency: ['analytics', 'feed-efficiency'] as const,
  },
  notifications: {
    all: ['notifications'] as const,
  },
}

═══════════════════════════════════════════════════════
SECTION 9 — HOOKS PATTERN
═══════════════════════════════════════════════════════

Write ALL hooks following this exact pattern.
Do not deviate.

Query hook example (useFarms.ts):

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/api/query-keys';
import { apiClient } from '@/api/client';
import API from '@/api/endpoints';
import type { Farm, FarmFilters } from '@/api/types/farm.types';
import type { PaginatedResponse } from '@/api/types/common.types';

export function useFarms(filters?: FarmFilters) {
  return useQuery({
    queryKey: queryKeys.farms.list(filters ?? {}),
    queryFn: () => apiClient.get<PaginatedResponse<Farm>>(
      API.farms.list, { params: filters }
    ),
  });
}

Mutation hook example (useCreateFarm.ts):

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/api/query-keys';
import { apiClient } from '@/api/client';
import API from '@/api/endpoints';
import type { Farm, CreateFarmDto } from '@/api/types/farm.types';

export function useCreateFarm() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateFarmDto) =>
      apiClient.post<Farm>(API.farms.create, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.farms.lists() 
      });
    },
  });
}

Write ALL hooks listed in Section 3.
Every hook must be fully implemented — not a stub.
Include all params, types, and invalidations.

Special hooks to note:

useBulkCreateDailyRecords:
  mutationFn accepts array, posts to bulk endpoint
  onSuccess: invalidate daily records AND feed inventory
    (bulk insert decrements stock)

useCreateHarvest:
  onSuccess: invalidate harvests, cycles (status changes),
    units (status changes to fallow if full harvest),
    analytics overview

useCreateFeedPurchase:
  onSuccess: invalidate feed inventory, feed types
    (stock updates), feed purchases list

useInventoryAdjustment:
  onSuccess: invalidate feed inventory, 
    feed inventory transactions

useNotifications — use useQuery with refetchInterval: 30000
  (poll every 30 seconds for new notifications)

═══════════════════════════════════════════════════════
SECTION 10 — ZOD SCHEMAS
═══════════════════════════════════════════════════════

Write Zod schemas for every form in the application.
Derive field constraints from the Swagger JSON.

src/schemas/farm.schema.ts example:

import { z } from 'zod';

export const createFarmSchema = z.object({
  name: z.string().min(2).max(255),
  region: z.enum(['greater_accra', 'volta', 'ashanti',
    'central', 'northern', 'upper_east', 'upper_west',
    'western', 'eastern', 'bono', 'other']),
  district: z.string().max(255).optional(),
  community: z.string().max(255).optional(),
  waterSource: z.enum(['river','borehole','rain',
    'municipal','pond','mixed']),
  totalLandAreaHa: z.number().positive().optional(),
  waterAreaHa: z.number().positive().optional(),
  electricityAccess: z.boolean().default(false),
  roadAccessType: z.enum(['tarred','gravel',
    'dirt','footpath']).optional(),
  gpsLatitude: z.number().min(-90).max(90).optional(),
  gpsLongitude: z.number().min(-180).max(180).optional(),
});

export type CreateFarmDto = z.infer<typeof createFarmSchema>;

Write schemas for:
createFarmSchema, updateFarmSchema,
createUnitSchema, updateUnitSchema,
createCycleSchema,
createDailyRecordSchema, bulkDailyRecordSchema,
createWeightSampleSchema,
createFeedingLogSchema,
createHarvestSchema,
createDiseaseEventSchema,
createWeatherObservationSchema,
createFeedSupplierSchema,
createFeedTypeSchema,
createFeedPurchaseSchema,
inventoryAdjustmentSchema,
loginSchema, registerSchema,
inviteUserSchema

═══════════════════════════════════════════════════════
SECTION 11 — REPLACE SUPABASE CALLS
═══════════════════════════════════════════════════════

Go through every file in lib/ that calls Supabase.
Replace each function with a call to the equivalent hook.
Map as follows:

lib/cageService.js         → hooks/units/*
lib/stockingService.js     → hooks/cycles/*
lib/databaseService.js     → hooks/daily-records/*,
                             hooks/weight-samples/*,
                             hooks/harvests/*
lib/feedService.js         → hooks/feed/*
lib/auditLogService.js     → keep for now, wrap later
lib/userService.js         → hooks/users/*
lib/companyService.js      → replace with org API calls
lib/analyticsService.js    → hooks/analytics/*
lib/notificationService.js → hooks/notifications/*

For each page that uses a service:
- Remove the useEffect + direct service call pattern
- Replace with the appropriate hook from hooks/
- Use hook's data, isLoading, error directly

Do NOT change any UI — only replace data fetching.

═══════════════════════════════════════════════════════
SECTION 12 — AUTH MIGRATION
═══════════════════════════════════════════════════════

contexts/AuthContext.js currently uses Supabase auth.
Replace with Nsuo API auth.

Keep AuthContext.js but gut the Supabase calls:

useAuth hook:
  - reads from Zustand auth store
  - exposes: user, isAuthenticated, isLoading,
    hasPermission, hasRole

Login flow:
  - call POST /auth/login via useLogin mutation
  - on success: store tokens + user in Zustand
  - redirect to /dashboard

Register flow:
  - call POST /auth/register via useRegister mutation
  - on success: store tokens + user in Zustand
  - redirect to /dashboard

Logout flow:
  - call POST /auth/logout
  - clear Zustand store regardless of response
  - redirect to /login

Token refresh:
  - handled in axios interceptor (Section 4)
  - Zustand store updated with new tokens

Replace AuthWrapper HOC:
  - Read isAuthenticated from Zustand store
  - Keep same route protection logic
  - Remove all Supabase auth.getSession() calls

Add middleware.ts at repo root:
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_ROUTES = ['/login', '/signup', 
  '/register-company', '/pending-approval'];

export function middleware(request: NextRequest) {
  const token = request.cookies.get('accessToken')?.value;
  const isPublic = PUBLIC_ROUTES.some(route => 
    request.nextUrl.pathname.startsWith(route));
  
  if (!token && !isPublic) {
    return NextResponse.redirect(
      new URL('/login', request.url));
  }
  if (token && isPublic) {
    return NextResponse.redirect(
      new URL('/dashboard', request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};

Also store accessToken in httpOnly cookie on login 
(for middleware to read) AND in Zustand (for axios).

═══════════════════════════════════════════════════════
SECTION 13 — TANSTACK TABLE
═══════════════════════════════════════════════════════

Replace the existing DataTable.js component with 
TanStack Table v8.

Create src/components/ui/DataTable.tsx:

Features to implement:
- Server-side pagination (page, limit passed as query params)
- Server-side sorting (sort, order passed as query params)  
- Column visibility toggle
- Row selection with checkbox
- Sticky header
- Loading skeleton (same row count as current page)
- Empty state with icon and message
- Mobile: hide lower-priority columns below md breakpoint

Props interface:
interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  pagination?: Pagination;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  onSortChange?: (sort: string, order: 'ASC'|'DESC') => void;
  isLoading?: boolean;
  emptyMessage?: string;
  selectable?: boolean;
  onSelectionChange?: (rows: T[]) => void;
}

Apply this component to these existing pages:
pages/cages/index.js (now units)
pages/daily-data.js
pages/biweekly-records.js
pages/stocking-management.js
pages/audit-logs.js
pages/feed-purchases.js
pages/users.js

═══════════════════════════════════════════════════════
SECTION 14 — UNITS PAGE (replaces cages pages)
═══════════════════════════════════════════════════════

The existing pages/cages/ directory handles cages only.
The API now has a unified units endpoint.

Update pages/cages/index.js:
- Rename display to "Units" 
- Add unitType filter tabs: All / Ponds / Cages / 
  Nurseries / Tanks
- Use useUnits({ farmId, type }) hook
- Display unitType badge on each row

Update pages/create-cage.js → becomes create-unit 
effectively:
- Add unitType select field at the top of the form
- Show/hide relevant fields based on unitType
  (cage: dimensions, material — pond: soilType, liner)
- Use createUnitSchema

═══════════════════════════════════════════════════════
SECTION 15 — FEED MANAGEMENT PAGES
═══════════════════════════════════════════════════════

The existing feed management pages already have UI.
Replace their data fetching only.

pages/feed-management.js:
  Replace lib/feedService calls with:
  useFeeding logs hook, useFeedInventory hook

pages/feed-management/overview.js:
  useFeedInventory() — current stock levels
  useLowStock() — alert banner if any items low
  useFeedPurchaseSummary({ from, to }) — cost summary

pages/feed-management/analytics.js:
  useFeedEfficiency()
  useFeedCostTrends({ from, to })
  useFeedBrandPerformance()

pages/stock-levels.js:
  useLowStock() hook
  Add reorder suggestion: 
    deficit = minimumStockKg - currentStockKg
    Show "Order {deficit}kg to reach minimum" inline

pages/inventory-transactions.js:
  useFeedInventory + transactions endpoint
  Show running balance column

New page — pages/feed-purchases.js (if not exists):
  useFeedPurchases({ feedTypeId, from, to })
  DataTable with: date, supplier, feed type, qty, 
  price/kg, total, batch number
  Add "New Purchase" button → modal with 
  createFeedPurchaseSchema form

New page — pages/inventory-alerts.js:
  useLowStock() with auto-refresh every 5 minutes
  useQueryClient().invalidateQueries on manual refresh

═══════════════════════════════════════════════════════
SECTION 16 — NOTIFICATIONS
═══════════════════════════════════════════════════════

Existing NotificationContext.js uses Supabase 
real-time subscription. Replace with polling.

Update contexts/NotificationContext.js:
  Remove supabase.channel() subscription
  Use useNotifications() hook (polls every 30s)
  Keep same context shape so existing components work:
  { notifications, unreadCount, markRead, markAllRead }

Add notification bell in the top nav:
  Show unreadCount badge
  Dropdown: list last 10 notifications
  "Mark all read" button
  Link to /notifications page

New page pages/notifications.js:
  Full list, paginated
  Filter: all / unread / by type
  Mark individual as read on click

═══════════════════════════════════════════════════════
SECTION 17 — ENVIRONMENT SETUP
═══════════════════════════════════════════════════════

Create/update .env.local:
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
NEXT_PUBLIC_APP_NAME=Nsuo

Create .env.example with all variables documented.

Update next.config.mjs:
- Remove eslint: { ignoreDuringBuilds: true }
- Add rewrites for /api/* → NestJS in development
  (so CORS is not an issue during dev)
```javascript
async rewrites() {
  return [
    {
      source: '/api/backend/:path*',
      destination: 'http://localhost:3001/api/v1/:path*',
    },
  ];
},
```

═══════════════════════════════════════════════════════
SECTION 18 — ERROR HANDLING COMPONENTS
═══════════════════════════════════════════════════════

Create src/components/ui/ErrorBoundary.tsx:
  Class component ErrorBoundary
  Shows friendly error page with retry button
  Logs error to console in dev

Create src/components/ui/ApiErrorMessage.tsx:
  Renders ApiError shape into user-readable message
  Handles: VALIDATION_ERROR (show field errors),
  FORBIDDEN (show permission message),
  NOT_FOUND (show not found message),
  INTERNAL_SERVER_ERROR (show generic message)

Create src/components/ui/LoadingSkeleton.tsx:
  Variants: table, card, form, dashboard
  Uses Tailwind animate-pulse

Update pages/500.js and pages/404.js with proper
styled pages matching the app design.

═══════════════════════════════════════════════════════
SECTION 19 — PERMISSIONS IN UI
═══════════════════════════════════════════════════════

Create src/components/ui/PermissionGate.tsx:

interface PermissionGateProps {
  permission: Permission;
  fallback?: ReactNode;
  children: ReactNode;
}

function PermissionGate({ permission, fallback, children }) {
  const { user } = useAuthStore();
  if (!hasPermission(user, permission)) {
    return fallback ?? null;
  }
  return children;
}

Use PermissionGate to conditionally show:
- "New Farm" button: farms.create
- "Approve" button on stocking: stocking.approve
- "Approve" button on weight samples: biweekly.approve
- "Approve" button on harvest: harvests.approve
- Delete buttons: respective delete permissions
- Admin nav links: audit_logs.read
- Finance data: finance.read
- Export buttons: reports.export

═══════════════════════════════════════════════════════
SECTION 20 — OUTPUT CHECKLIST
═══════════════════════════════════════════════════════

When complete, output:

1. List of every new file created with one-line description
2. List of every existing file modified with what changed
3. List of any Supabase imports that still remain 
   (so we can clean up in next session)
4. List of any TODO items or decisions that need review
5. Confirmation that the app starts without errors:
   npm run dev should show no TypeScript errors
   All existing pages should still render
   Login flow should work against the NestJS API

═══════════════════════════════════════════════════════
RULES
═══════════════════════════════════════════════════════

- Never use `any` in TypeScript
- Never hardcode API URLs — always use API endpoints const
- Never call axios directly — always use apiClient
- Never read orgId from anywhere except the auth store
- All forms use react-hook-form + zodResolver
- All lists use TanStack Query — no useEffect data fetching
- All tables use TanStack Table DataTable component
- Keep all existing UI/CSS — only replace data layer
- Do not break any existing page that currently works