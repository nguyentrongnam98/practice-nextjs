# Parallel Routes Lab — Design

**Date:** 2026-04-15
**Status:** Approved (pending implementation plan)
**Stack:** Next.js 16.2.3, React 19.2.4, Tailwind v4, Vitest

## Goal

Build a hands-on lab inside the existing `practice-nextjs` project that exercises **all** Parallel Routes patterns from the Next.js 16 docs:

1. Basic parallel slots (`@analytics`, `@team`)
2. Independent loading and error UI per slot
3. `default.tsx` fallback behavior
4. Tab Group via layout inside a slot
5. Conditional Routes based on user role
6. Modal with Intercepting Routes (`@auth/(.)login`)

The lab extends the existing `(dashboard)` route group and adds an `@auth` slot at the root layout. Existing `(auth)/login` page is preserved as the full-page version.

## Non-Goals

- Real authentication integration (NextAuth, Lucia, etc.)
- Database or real API integration — all data is mocked
- i18n
- E2E tests (Playwright is not set up)
- Refactoring `auth.service.ts` beyond a single-line role assignment

## URL Map

| URL | Pattern demonstrated |
|---|---|
| `/dashboard` | Parallel slots `@analytics` + `@team`, per-slot `loading.tsx` and `error.tsx`, `default.tsx` fallback |
| `/dashboard/page-views`, `/dashboard/visitors` | Tab Group inside `@analytics` (slot navigates independently, `@team` stays mounted) |
| `/dashboard/reports` | Conditional Routes — render `@admin` or `@user` slot based on cookie role |
| `/login` | Full-page login (existing) AND modal version when navigated via `<Link>` from anywhere (intercepted by `@auth/(.)login`) |

## File Tree (additions and changes only)

```
src/app/
├── layout.tsx                              [MODIFY] accept @auth slot prop
├── @auth/
│   ├── default.tsx                         [NEW] return null
│   ├── page.tsx                            [NEW] return null (closes modal at /)
│   ├── [...catchAll]/page.tsx              [NEW] return null (closes when navigating elsewhere)
│   └── (.)login/page.tsx                   [NEW] <Modal><LoginForm /></Modal>
│
├── (dashboard)/
│   ├── layout.tsx                          [MODIFY] accept @analytics + @team slots, render RoleSwitcher
│   ├── page.tsx                            [KEEP]
│   ├── default.tsx                         [NEW] children fallback
│   │
│   ├── @analytics/
│   │   ├── default.tsx                     [NEW]
│   │   ├── loading.tsx                     [NEW] skeleton
│   │   ├── error.tsx                       [NEW] error boundary
│   │   ├── page.tsx                        [NEW] overview card
│   │   └── (tabs)/                         ← route group, omitted from URL
│   │       ├── layout.tsx                  [NEW] tab nav
│   │       ├── page-views/page.tsx         [NEW]
│   │       └── visitors/page.tsx           [NEW]
│   │
│   ├── @team/
│   │   ├── default.tsx                     [NEW]
│   │   ├── loading.tsx                     [NEW]
│   │   ├── error.tsx                       [NEW]
│   │   └── page.tsx                        [NEW] team list
│   │
│   ├── reports/
│   │   ├── layout.tsx                      [NEW] reads role, renders @admin or @user
│   │   ├── default.tsx                     [NEW]
│   │   ├── @admin/page.tsx                 [NEW]
│   │   └── @user/page.tsx                  [NEW]
│   │
│   └── _components/
│       └── RoleSwitcher.tsx                [NEW] client UI to flip role cookie
│
src/features/
├── dashboard/                              [NEW feature module]
│   └── services/
│       └── mock.ts                         [NEW] async getAnalytics/getTeam/getReports + sleep()
│
└── auth/
    ├── helpers/role.ts                     [NEW] server-only get/set role from cookie
    └── actions/setRole.ts                  [NEW] Server Action to set role cookie
│
src/shared/components/feedback/
└── Modal.tsx                               [NEW] generic modal with Esc/backdrop close, a11y attrs
```

## Pattern Mechanics

### A. Parallel slots at `/dashboard`

Layout signature receives slots as props. `children` is the implicit slot.

```tsx
// src/app/(dashboard)/layout.tsx
export default async function DashboardLayout({
  children,
  analytics,
  team,
}: {
  children: React.ReactNode
  analytics: React.ReactNode
  team: React.ReactNode
}) {
  const role = await getRole()
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b bg-white px-6 py-4 flex items-center">
        <span className="font-semibold">Dashboard</span>
        <RoleSwitcher current={role} />
      </nav>
      <div className="grid gap-6 p-6 lg:grid-cols-3">
        <section className="lg:col-span-2">{children}</section>
        <aside>{analytics}</aside>
        <aside>{team}</aside>
      </div>
    </div>
  )
}
```

`@analytics/page.tsx` calls `await getAnalytics()` (sleeps 2000ms). `@team/page.tsx` calls `await getTeam()` (sleeps 800ms). React Suspense boundaries from each slot's `loading.tsx` allow them to stream independently.

### B. Tab Group inside `@analytics`

```
@analytics/
├── page.tsx          → /dashboard (overview)
└── (tabs)/
    ├── layout.tsx    → tab nav + {children}
    ├── page-views/page.tsx   → /dashboard/page-views
    └── visitors/page.tsx     → /dashboard/visitors
```

`(tabs)` is a route group — it organizes files without affecting URL. Navigation between `page-views` and `visitors` re-renders only the `@analytics` slot; `@team` and `children` stay mounted (verifiable in DevTools Network).

### C. Conditional Routes at `/dashboard/reports`

```tsx
// src/app/(dashboard)/reports/layout.tsx
import { getRole } from '@/features/auth/helpers/role'

export default async function ReportsLayout({
  admin,
  user,
}: {
  admin: React.ReactNode
  user: React.ReactNode
}) {
  const role = await getRole()
  return role === 'admin' ? admin : user
}
```

No `children` — layout selects one of the two slots. `default.tsx` returns `null` so unmatched cases don't 404.

### D. Modal with Intercepting Routes

Root layout accepts `@auth` slot, rendered alongside `children`:

```tsx
// src/app/layout.tsx (modified)
export default function RootLayout({
  children,
  auth,
}: {
  children: React.ReactNode
  auth: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <AppProviders>
          {children}
          {auth}
        </AppProviders>
      </body>
    </html>
  )
}
```

```tsx
// src/app/@auth/(.)login/page.tsx
import { Modal } from '@/shared/components/feedback/Modal'
import { LoginForm } from '@/features/auth'

export default function LoginModalPage() {
  return (
    <Modal>
      <LoginForm />
    </Modal>
  )
}
```

```tsx
// src/shared/components/feedback/Modal.tsx
'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function Modal({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && router.back()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [router])

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={() => router.back()}
      className="fixed inset-0 z-50 grid place-items-center bg-black/50"
    >
      <div onClick={(e) => e.stopPropagation()} className="relative rounded-lg bg-white p-6 shadow-xl">
        <button
          aria-label="Close"
          onClick={() => router.back()}
          className="absolute right-2 top-2 text-2xl"
        >
          ×
        </button>
        {children}
      </div>
    </div>
  )
}
```

Behavior:
- Click `<Link href="/login">` from anywhere → modal opens (interception fires)
- Refresh on `/login` → renders full page from `(auth)/login/page.tsx` (no interception on hard nav)
- Esc / backdrop click / × button → `router.back()` closes modal
- Navigating to any other URL → `[...catchAll]/page.tsx` matches and returns `null`, closing the modal

Note on route group: `/login` lives under `(auth)` group. Intercepting convention `(.)` matches by **URL level**, not file level — route groups don't count as a URL level, so `@auth/(.)login` at root correctly intercepts `/login`.

### E. `default.tsx` requirement

Without `default.tsx`, refreshing on a URL where a slot has no matching segment causes 404. Each slot (and `children` at the dashboard level) gets a `default.tsx` returning `null` or a sensible fallback.

## Mock Data & Role Mechanism

### Mock services

```ts
// src/features/dashboard/services/mock.ts
import 'server-only'
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

export async function getAnalytics() {
  await sleep(2000)
  return { views: 12_345, visitors: 890, growth: 0.12 }
}

export async function getTeam() {
  await sleep(800)
  return [
    { id: '1', name: 'Hùng', role: 'Lead' },
    { id: '2', name: 'Lan', role: 'Designer' },
  ]
}

export async function getReports(role: 'admin' | 'user') {
  await sleep(1200)
  return role === 'admin'
    ? { revenue: 1_200_000, cost: 450_000, margin: 0.625 }
    : { tasksDone: 12, tasksOpen: 4 }
}
```

`'server-only'` import prevents accidental client bundling.

### Role helper

```ts
// src/features/auth/helpers/role.ts
import 'server-only'
import { cookies } from 'next/headers'

export type Role = 'admin' | 'user'

export async function getRole(): Promise<Role> {
  const c = await cookies()  // Next.js 16: cookies() is async
  return (c.get('role')?.value as Role) ?? 'user'
}
```

### Set role via Server Action

```ts
// src/features/auth/actions/setRole.ts
'use server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export async function setRoleAction(role: 'admin' | 'user') {
  const c = await cookies()
  c.set('role', role, { httpOnly: false, sameSite: 'lax', path: '/' })
  revalidatePath('/dashboard', 'layout')
}
```

### Role toggle UI

```tsx
// src/app/(dashboard)/_components/RoleSwitcher.tsx
'use client'
import { useTransition } from 'react'
import { setRoleAction } from '@/features/auth/actions/setRole'

export function RoleSwitcher({ current }: { current: 'admin' | 'user' }) {
  const [pending, start] = useTransition()
  return (
    <div className="ml-auto flex gap-2 text-sm">
      <span className="text-gray-500">Role:</span>
      {(['user', 'admin'] as const).map((r) => (
        <button
          key={r}
          disabled={pending || current === r}
          onClick={() => start(() => setRoleAction(r))}
          className={current === r ? 'font-bold underline' : 'text-gray-600'}
        >
          {r}
        </button>
      ))}
    </div>
  )
}
```

### Login → role assignment

When the existing login Server Action succeeds, set cookie `role` based on email: `'admin'` if email contains `"admin"`, otherwise `'user'`. Add this minimally — either in `setRoleAction` reuse from the login action, or 2-3 lines inline in the login action. Do not refactor `auth.service.ts` beyond this addition.

## Verification Plan

| Pattern | Manual verification step |
|---|---|
| Parallel streaming | Visit `/dashboard`. `@team` content (~800ms) appears before `@analytics` (~2s). Each slot shows its own skeleton. |
| `default.tsx` | Visit `/dashboard/visitors`, then F5. Expected: page renders with `@team` from `default.tsx`, no 404. |
| Tab Group | On `/dashboard`, click `page-views` then `visitors` tab. URL changes; in DevTools Network, no request for `@team`. |
| Conditional Routes | Visit `/dashboard/reports`. See user view. Click "admin" in `RoleSwitcher`. Reports switches to admin view without full reload. |
| Modal + Intercepting | Click "Login" link in nav → modal opens, URL is `/login`. Refresh → full page renders. Esc / backdrop / × → modal closes. Navigate to `/dashboard/reports` while modal open → modal closes. |
| Per-slot error | Throw in `getAnalytics()` (temporarily). `@analytics/error.tsx` renders; `@team` still renders normally. |

## Edge Cases & Gotchas

1. **One slot dynamic → all slots at that level dynamic.** Since cookie reads and mocked sleep make the dashboard dynamic, no static prerender at this level.
2. **`children` is implicit but still needs `default.tsx`.** Added at `(dashboard)/default.tsx`.
3. **Cookie set in Server Action does not update the current request's cookie store.** `revalidatePath` triggers a fresh render that reads the new value.
4. **Modal accessibility:** `role="dialog"`, `aria-modal="true"`, Esc closes, backdrop closes, focusable close button. Full focus trap is out of scope.
5. **Route group doesn't count as URL level for interception.** `@auth/(.)login` at root intercepts `/login` (which lives under `(auth)/`).

## Test Strategy

In scope:
- Unit test: `getRole()` helper (mock `cookies()`)
- Unit test: `Modal` component (Esc key, backdrop click, close button — uses `@testing-library/react` already set up)

Out of scope:
- E2E tests (Playwright not configured)
- Tests for the parallel routing behavior itself (better verified manually in browser)

## Implementation Order (high-level)

1. Mock services + role helper + Server Action
2. Generic `Modal` component + tests
3. Dashboard parallel slots (`@analytics` + `@team` + loading + error + default)
4. Tab Group inside `@analytics`
5. Conditional Routes at `/dashboard/reports`
6. Root-level `@auth` slot + intercepting `(.)login`
7. Wire `RoleSwitcher` into dashboard nav
8. Single-line update to `auth.service.ts` for role assignment on login
9. Manual verification per the table above

Detailed step-by-step plan to be produced by the writing-plans skill.
