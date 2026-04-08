# Edulamad Frontend — Cursor Rules (forked from Nsuo aquaculture stack)

## Stack
- Next.js 15 Pages Router
- TypeScript (strict)
- TanStack Query v5 for all server state
- Zustand for client state (auth, UI)
- TanStack Table v8 for all data tables
- React Hook Form + Zod for all forms
- Axios with interceptors for API calls
- Tailwind CSS for styling
- Recharts for charts
- Lucide React for icons
- Framer Motion for animation; `react-icons` when Lucide lacks a glyph; optional `@21st-sdk/react` for agent/chat UI

## Non-negotiable rules

1. NEVER use `any` type — infer or explicitly type everything
2. NEVER call axios directly — always use apiClient from 
   src/api/client.ts
3. NEVER use useEffect for data fetching — use TanStack Query
4. NEVER hardcode strings that should be constants — 
   use API endpoints object, query keys object, enums
5. NEVER read orgId from URL or form body — 
   only from auth store
6. ALL forms must use react-hook-form with zodResolver
7. ALL tables must use the DataTable component
8. ALL mutations must invalidate relevant query keys on success
9. ALL API types must come from src/api/types/ — 
   never define inline
10. ALL permission checks must use hasPermission() helper

## File naming
- hooks: use[ResourceName].ts (camelCase)
- types: resource.types.ts (kebab-case)
- schemas: resource.schema.ts (kebab-case)
- components: PascalCase.tsx
- pages: kebab-case.js (keep existing convention)

## Query patterns
- useQuery for reads
- useMutation for writes
- Always specify queryKey using queryKeys object
- staleTime: 2 minutes default
- Refetch on window focus: OFF

## Error handling
- Use ApiErrorMessage component for all API errors
- Use ErrorBoundary around page-level components
- Validation errors: show inline under each form field
- Network errors: toast notification

## Component structure
Each component file:
1. Imports
2. Types/interfaces
3. Component function
4. Export

## When in doubt
- Check src/api/types/ for the correct type
- Check src/api/endpoints.ts for the correct URL
- Check src/api/query-keys.ts for the correct query key
- Check src/lib/permissions.ts for permission checks
