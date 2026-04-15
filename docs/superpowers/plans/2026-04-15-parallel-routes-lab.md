# Parallel Routes Lab Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a hands-on lab inside `practice-nextjs` that exercises every Next.js 16 Parallel Routes pattern — slots, `default.tsx`, per-slot loading/error, tab groups, conditional routes, and modal+intercepting routes.

**Architecture:** Move the existing dashboard out of the route-group conflict (Task 0), then extend it with `@analytics`/`@team` slots, add `@auth` slot at root layout for the modal+intercepting login pattern, mock all data via async services with artificial latency to demonstrate streaming. A cookie `role` (`admin`/`user`) drives the conditional routes; a Server Action `setRoleAction` and a client `RoleSwitcher` toggle it.

**Tech Stack:** Next.js 16.2.3 (App Router, Server Components, Server Actions), React 19.2.4, TypeScript, Tailwind v4, Vitest + Testing Library, Zod (already in project).

**Spec:** `docs/superpowers/specs/2026-04-15-parallel-routes-lab-design.md`

**Pre-flight finding:** The existing `src/app/(dashboard)/page.tsx` produces URL `/`, conflicting silently with `src/app/page.tsx`. Result: `/dashboard` returns 404 today. Task 0 fixes this by renaming the route group folder `(dashboard)` → `dashboard` so it becomes a real URL segment. The route group provides no value here since it only contains one route.

**Side note (not in scope):** Build emits `⚠ The "middleware" file convention is deprecated. Please use "proxy" instead.` Renaming `src/middleware.ts` → `src/proxy.ts` is recommended in a separate change but is not required for this lab.

---

## File Structure

| Path | Purpose | Status |
|---|---|---|
| `src/app/(dashboard)/` | Existing folder — rename to `dashboard/` | RENAME |
| `src/features/dashboard/services/mock.ts` | Mock async data with sleep() | NEW |
| `src/features/dashboard/services/mock.test.ts` | Unit tests for mock services | NEW |
| `src/features/auth/helpers/role.ts` | Server-only `getRole()` reading cookie | NEW |
| `src/features/auth/helpers/role.test.ts` | Unit test mocking `next/headers` | NEW |
| `src/features/auth/actions/setRole.ts` | Server Action to set role cookie | NEW |
| `src/features/auth/actions/login.ts` | Existing — set role on successful login | MODIFY |
| `src/features/auth/actions/login.test.ts` | Existing — extend with cookie tests | MODIFY |
| `src/shared/components/feedback/Modal.tsx` | Generic modal (Esc/backdrop close) | NEW |
| `src/shared/components/feedback/Modal.test.tsx` | Unit tests for Modal | NEW |
| `src/shared/components/feedback/index.ts` | Add Modal export | MODIFY |
| `src/app/layout.tsx` | Accept `auth` slot prop | MODIFY |
| `src/app/page.tsx` | Existing — keep but add link to /dashboard works after Task 0 | KEEP |
| `src/app/@auth/default.tsx` | Modal slot fallback | NEW |
| `src/app/@auth/page.tsx` | Returns null when at `/` | NEW |
| `src/app/@auth/[...catchAll]/page.tsx` | Closes modal on other navs | NEW |
| `src/app/@auth/(.)login/page.tsx` | Intercepted modal version of /login | NEW |
| `src/app/dashboard/layout.tsx` | Accept slots, render RoleSwitcher | MODIFY (after rename) |
| `src/app/dashboard/page.tsx` | Add nav links | MODIFY (after rename) |
| `src/app/dashboard/default.tsx` | Children fallback | NEW |
| `src/app/dashboard/_components/RoleSwitcher.tsx` | Client toggle UI | NEW |
| `src/app/dashboard/@analytics/page.tsx` | Overview card (uses mock) | NEW |
| `src/app/dashboard/@analytics/loading.tsx` | Skeleton | NEW |
| `src/app/dashboard/@analytics/error.tsx` | Error boundary | NEW |
| `src/app/dashboard/@analytics/default.tsx` | Slot fallback | NEW |
| `src/app/dashboard/@analytics/(tabs)/layout.tsx` | Tab nav | NEW |
| `src/app/dashboard/@analytics/(tabs)/page-views/page.tsx` | Tab content | NEW |
| `src/app/dashboard/@analytics/(tabs)/visitors/page.tsx` | Tab content | NEW |
| `src/app/dashboard/@team/page.tsx` | Team list (uses mock) | NEW |
| `src/app/dashboard/@team/loading.tsx` | Skeleton | NEW |
| `src/app/dashboard/@team/error.tsx` | Error boundary | NEW |
| `src/app/dashboard/@team/default.tsx` | Slot fallback | NEW |
| `src/app/dashboard/reports/layout.tsx` | Reads role, picks slot | NEW |
| `src/app/dashboard/reports/default.tsx` | Children fallback | NEW |
| `src/app/dashboard/reports/@admin/page.tsx` | Admin reports view | NEW |
| `src/app/dashboard/reports/@user/page.tsx` | User reports view | NEW |

---

## Task 0: Fix dashboard route conflict

**Files:**
- Move: `src/app/(dashboard)/layout.tsx` → `src/app/dashboard/layout.tsx`
- Move: `src/app/(dashboard)/page.tsx` → `src/app/dashboard/page.tsx`

- [ ] **Step 1: Verify the bug exists**

Run: `pnpm build`
Expected output includes route list showing only `/`, `/_not-found`, `/login` — no `/dashboard`.

- [ ] **Step 2: Rename folder via git mv**

```bash
cd d:/practice-nextjs
git mv "src/app/(dashboard)" src/app/dashboard
```

- [ ] **Step 3: Verify the move**

Run: `git status`
Expected: shows two renames (layout.tsx and page.tsx).

- [ ] **Step 4: Verify build now generates /dashboard**

Run: `pnpm build`
Expected output route list now includes `/dashboard`.

- [ ] **Step 5: Commit**

```bash
git commit -m "fix(app): move dashboard out of route group to fix /dashboard URL

Route group (dashboard) was conflicting with app/page.tsx — both at /.
Renaming makes /dashboard a real route segment. Route group served no
purpose with a single route inside it.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 1: Mock dashboard services (TDD)

**Files:**
- Create: `src/features/dashboard/services/mock.ts`
- Create: `src/features/dashboard/services/mock.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
// src/features/dashboard/services/mock.test.ts
import { describe, it, expect } from 'vitest'
import { getAnalytics, getTeam, getReports } from './mock'

describe('mock dashboard services', () => {
  it('getAnalytics returns shape', async () => {
    const data = await getAnalytics()
    expect(data).toMatchObject({
      views: expect.any(Number),
      visitors: expect.any(Number),
      growth: expect.any(Number),
    })
  })

  it('getTeam returns array of members', async () => {
    const team = await getTeam()
    expect(Array.isArray(team)).toBe(true)
    expect(team.length).toBeGreaterThan(0)
    expect(team[0]).toMatchObject({
      id: expect.any(String),
      name: expect.any(String),
      role: expect.any(String),
    })
  })

  it('getReports returns admin shape when role=admin', async () => {
    const data = await getReports('admin')
    expect(data).toMatchObject({
      revenue: expect.any(Number),
      cost: expect.any(Number),
      margin: expect.any(Number),
    })
  })

  it('getReports returns user shape when role=user', async () => {
    const data = await getReports('user')
    expect(data).toMatchObject({
      tasksDone: expect.any(Number),
      tasksOpen: expect.any(Number),
    })
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm test src/features/dashboard/services/mock.test.ts`
Expected: FAIL — module `./mock` does not exist.

- [ ] **Step 3: Implement the mock service**

```ts
// src/features/dashboard/services/mock.ts
import 'server-only'

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

export type Analytics = { views: number; visitors: number; growth: number }
export type TeamMember = { id: string; name: string; role: string }
export type AdminReport = { revenue: number; cost: number; margin: number }
export type UserReport = { tasksDone: number; tasksOpen: number }

export async function getAnalytics(): Promise<Analytics> {
  await sleep(2000)
  return { views: 12_345, visitors: 890, growth: 0.12 }
}

export async function getTeam(): Promise<TeamMember[]> {
  await sleep(800)
  return [
    { id: '1', name: 'Hùng', role: 'Lead' },
    { id: '2', name: 'Lan', role: 'Designer' },
    { id: '3', name: 'Minh', role: 'Engineer' },
  ]
}

export async function getReports(role: 'admin'): Promise<AdminReport>
export async function getReports(role: 'user'): Promise<UserReport>
export async function getReports(role: 'admin' | 'user'): Promise<AdminReport | UserReport> {
  await sleep(1200)
  if (role === 'admin') return { revenue: 1_200_000, cost: 450_000, margin: 0.625 }
  return { tasksDone: 12, tasksOpen: 4 }
}
```

> Note: `'server-only'` import will throw if accidentally bundled into a client component. The test file runs in node/jsdom where this is benign.

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm test src/features/dashboard/services/mock.test.ts`
Expected: 4 tests pass.

> Note: tests will be slow (~2s for getAnalytics) — that's expected since sleep is real.

- [ ] **Step 5: Commit**

```bash
git add src/features/dashboard/
git commit -m "feat(dashboard): add mock services with artificial latency

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 2: Role helper (TDD)

**Files:**
- Create: `src/features/auth/helpers/role.ts`
- Create: `src/features/auth/helpers/role.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
// src/features/auth/helpers/role.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

const cookiesMock = vi.fn()
vi.mock('next/headers', () => ({
  cookies: () => cookiesMock(),
}))

import { getRole } from './role'

describe('getRole', () => {
  beforeEach(() => {
    cookiesMock.mockReset()
  })

  it("returns 'user' when no cookie set", async () => {
    cookiesMock.mockResolvedValue({ get: () => undefined })
    expect(await getRole()).toBe('user')
  })

  it("returns 'admin' when cookie is admin", async () => {
    cookiesMock.mockResolvedValue({ get: () => ({ value: 'admin' }) })
    expect(await getRole()).toBe('admin')
  })

  it("returns 'user' when cookie is user", async () => {
    cookiesMock.mockResolvedValue({ get: () => ({ value: 'user' }) })
    expect(await getRole()).toBe('user')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm test src/features/auth/helpers/role.test.ts`
Expected: FAIL — module `./role` does not exist.

- [ ] **Step 3: Implement helper**

```ts
// src/features/auth/helpers/role.ts
import 'server-only'
import { cookies } from 'next/headers'

export type Role = 'admin' | 'user'

export async function getRole(): Promise<Role> {
  const c = await cookies()
  const value = c.get('role')?.value
  return value === 'admin' ? 'admin' : 'user'
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm test src/features/auth/helpers/role.test.ts`
Expected: 3 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/features/auth/helpers/
git commit -m "feat(auth): add server-only getRole helper backed by cookie

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 3: setRole Server Action

**Files:**
- Create: `src/features/auth/actions/setRole.ts`

This action uses `next/headers` `cookies()` and `revalidatePath` which require Next runtime — skipping unit test (covered by manual verification at end).

- [ ] **Step 1: Implement the action**

```ts
// src/features/auth/actions/setRole.ts
'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import type { Role } from '../helpers/role'

export async function setRoleAction(role: Role) {
  const c = await cookies()
  c.set('role', role, {
    httpOnly: false,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })
  revalidatePath('/dashboard', 'layout')
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `pnpm tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/features/auth/actions/setRole.ts
git commit -m "feat(auth): add setRoleAction server action

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 4: Generic Modal component (TDD)

**Files:**
- Create: `src/shared/components/feedback/Modal.tsx`
- Create: `src/shared/components/feedback/Modal.test.tsx`
- Modify: `src/shared/components/feedback/index.ts`

- [ ] **Step 1: Write failing tests**

```tsx
// src/shared/components/feedback/Modal.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const back = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ back }),
}))

import { Modal } from './Modal'

describe('Modal', () => {
  beforeEach(() => {
    back.mockReset()
  })

  it('renders children inside dialog', () => {
    render(<Modal><span>Hello</span></Modal>)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })

  it('has aria-modal attribute', () => {
    render(<Modal><span>x</span></Modal>)
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true')
  })

  it('calls router.back when close button clicked', async () => {
    const user = userEvent.setup()
    render(<Modal><span>x</span></Modal>)
    await user.click(screen.getByRole('button', { name: /close/i }))
    expect(back).toHaveBeenCalledOnce()
  })

  it('calls router.back when Escape pressed', async () => {
    const user = userEvent.setup()
    render(<Modal><span>x</span></Modal>)
    await user.keyboard('{Escape}')
    expect(back).toHaveBeenCalledOnce()
  })

  it('calls router.back when backdrop clicked', async () => {
    const user = userEvent.setup()
    render(<Modal><span>content</span></Modal>)
    await user.click(screen.getByRole('dialog'))
    expect(back).toHaveBeenCalledOnce()
  })

  it('does NOT call router.back when content clicked', async () => {
    const user = userEvent.setup()
    render(<Modal><span data-testid="content">content</span></Modal>)
    await user.click(screen.getByTestId('content'))
    expect(back).not.toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm test src/shared/components/feedback/Modal.test.tsx`
Expected: FAIL — module `./Modal` does not exist.

- [ ] **Step 3: Implement Modal**

```tsx
// src/shared/components/feedback/Modal.tsx
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface ModalProps {
  children: React.ReactNode
}

export function Modal({ children }: ModalProps) {
  const router = useRouter()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') router.back()
    }
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
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
      >
        <button
          aria-label="Close"
          onClick={() => router.back()}
          className="absolute right-3 top-2 text-2xl leading-none text-gray-500 hover:text-gray-900"
        >
          ×
        </button>
        {children}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm test src/shared/components/feedback/Modal.test.tsx`
Expected: 6 tests pass.

- [ ] **Step 5: Export from barrel**

```ts
// src/shared/components/feedback/index.ts
export { LoadingSpinner } from './LoadingSpinner'
export { Modal } from './Modal'
```

- [ ] **Step 6: Commit**

```bash
git add src/shared/components/feedback/
git commit -m "feat(shared): add Modal component with Esc/backdrop close

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 5: RoleSwitcher client component

**Files:**
- Create: `src/app/dashboard/_components/RoleSwitcher.tsx`

No unit test — primarily verified by manual interaction (involves Server Action + cookie round-trip).

- [ ] **Step 1: Implement**

```tsx
// src/app/dashboard/_components/RoleSwitcher.tsx
'use client'

import { useTransition } from 'react'
import { setRoleAction } from '@/features/auth/actions/setRole'
import type { Role } from '@/features/auth/helpers/role'

interface RoleSwitcherProps {
  current: Role
}

const ROLES: Role[] = ['user', 'admin']

export function RoleSwitcher({ current }: RoleSwitcherProps) {
  const [pending, start] = useTransition()
  return (
    <div className="ml-auto flex items-center gap-2 text-sm">
      <span className="text-gray-500">Role:</span>
      {ROLES.map((r) => (
        <button
          key={r}
          type="button"
          disabled={pending || current === r}
          onClick={() => start(() => setRoleAction(r))}
          className={
            current === r
              ? 'font-bold underline text-blue-600'
              : 'text-gray-600 hover:text-gray-900 disabled:opacity-50'
          }
        >
          {r}
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `pnpm tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/dashboard/_components/
git commit -m "feat(dashboard): add RoleSwitcher client component

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 6: Modify dashboard layout to accept slots

**Files:**
- Modify: `src/app/dashboard/layout.tsx`
- Create: `src/app/dashboard/default.tsx`

- [ ] **Step 1: Replace dashboard layout**

```tsx
// src/app/dashboard/layout.tsx
import { getRole } from '@/features/auth/helpers/role'
import { RoleSwitcher } from './_components/RoleSwitcher'

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
      <nav className="flex items-center border-b bg-white px-6 py-4">
        <span className="font-semibold">Dashboard</span>
        <RoleSwitcher current={role} />
      </nav>
      <div className="grid gap-6 p-6 lg:grid-cols-3">
        <section className="lg:col-span-2">{children}</section>
        <aside className="space-y-4">{analytics}</aside>
        <aside className="space-y-4">{team}</aside>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Add children fallback**

```tsx
// src/app/dashboard/default.tsx
export default function Default() {
  return null
}
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `pnpm tsc --noEmit`
Expected: no errors.

> Note: at this point Next.js will need the `@analytics` and `@team` slots to exist before the route renders. Build will fail until Tasks 7-8 add them. Don't run `pnpm dev` yet.

- [ ] **Step 4: Commit**

```bash
git add src/app/dashboard/layout.tsx src/app/dashboard/default.tsx
git commit -m "feat(dashboard): wire layout to accept analytics and team slots

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 7: @analytics slot — page, loading, error, default

**Files:**
- Create: `src/app/dashboard/@analytics/page.tsx`
- Create: `src/app/dashboard/@analytics/loading.tsx`
- Create: `src/app/dashboard/@analytics/error.tsx`
- Create: `src/app/dashboard/@analytics/default.tsx`

- [ ] **Step 1: Create the page that fetches analytics**

```tsx
// src/app/dashboard/@analytics/page.tsx
import { getAnalytics } from '@/features/dashboard/services/mock'

export default async function AnalyticsPage() {
  const data = await getAnalytics()
  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <h2 className="text-sm font-semibold text-gray-500 uppercase">Analytics</h2>
      <dl className="mt-3 grid grid-cols-2 gap-3">
        <div>
          <dt className="text-xs text-gray-500">Views</dt>
          <dd className="text-2xl font-bold">{data.views.toLocaleString()}</dd>
        </div>
        <div>
          <dt className="text-xs text-gray-500">Visitors</dt>
          <dd className="text-2xl font-bold">{data.visitors.toLocaleString()}</dd>
        </div>
        <div className="col-span-2">
          <dt className="text-xs text-gray-500">Growth</dt>
          <dd className="text-lg font-medium text-green-600">
            +{(data.growth * 100).toFixed(1)}%
          </dd>
        </div>
      </dl>
    </div>
  )
}
```

- [ ] **Step 2: Create loading skeleton**

```tsx
// src/app/dashboard/@analytics/loading.tsx
export default function AnalyticsLoading() {
  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <div className="h-3 w-20 animate-pulse rounded bg-gray-200" />
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="h-8 animate-pulse rounded bg-gray-200" />
        <div className="h-8 animate-pulse rounded bg-gray-200" />
        <div className="col-span-2 h-5 animate-pulse rounded bg-gray-200" />
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Create error boundary**

```tsx
// src/app/dashboard/@analytics/error.tsx
'use client'

export default function AnalyticsError({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4">
      <h2 className="text-sm font-semibold text-red-700">Analytics failed</h2>
      <p className="mt-1 text-xs text-red-600">{error.message}</p>
      <button
        onClick={reset}
        className="mt-3 rounded border border-red-300 px-3 py-1 text-xs text-red-700 hover:bg-red-100"
      >
        Retry
      </button>
    </div>
  )
}
```

- [ ] **Step 4: Create default fallback**

```tsx
// src/app/dashboard/@analytics/default.tsx
export default function AnalyticsDefault() {
  return null
}
```

- [ ] **Step 5: Verify TypeScript compiles**

Run: `pnpm tsc --noEmit`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/app/dashboard/@analytics/
git commit -m "feat(dashboard): add @analytics slot with loading/error/default

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 8: @team slot — page, loading, error, default

**Files:**
- Create: `src/app/dashboard/@team/page.tsx`
- Create: `src/app/dashboard/@team/loading.tsx`
- Create: `src/app/dashboard/@team/error.tsx`
- Create: `src/app/dashboard/@team/default.tsx`

- [ ] **Step 1: Create the page**

```tsx
// src/app/dashboard/@team/page.tsx
import { getTeam } from '@/features/dashboard/services/mock'

export default async function TeamPage() {
  const team = await getTeam()
  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <h2 className="text-sm font-semibold text-gray-500 uppercase">Team</h2>
      <ul className="mt-3 space-y-2">
        {team.map((m) => (
          <li key={m.id} className="flex items-center justify-between">
            <span className="font-medium">{m.name}</span>
            <span className="text-xs text-gray-500">{m.role}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
```

- [ ] **Step 2: Create loading skeleton**

```tsx
// src/app/dashboard/@team/loading.tsx
export default function TeamLoading() {
  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <div className="h-3 w-16 animate-pulse rounded bg-gray-200" />
      <div className="mt-4 space-y-3">
        <div className="h-4 animate-pulse rounded bg-gray-200" />
        <div className="h-4 animate-pulse rounded bg-gray-200" />
        <div className="h-4 animate-pulse rounded bg-gray-200" />
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Create error boundary**

```tsx
// src/app/dashboard/@team/error.tsx
'use client'

export default function TeamError({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4">
      <h2 className="text-sm font-semibold text-red-700">Team failed</h2>
      <p className="mt-1 text-xs text-red-600">{error.message}</p>
      <button
        onClick={reset}
        className="mt-3 rounded border border-red-300 px-3 py-1 text-xs text-red-700 hover:bg-red-100"
      >
        Retry
      </button>
    </div>
  )
}
```

- [ ] **Step 4: Create default fallback**

```tsx
// src/app/dashboard/@team/default.tsx
export default function TeamDefault() {
  return null
}
```

- [ ] **Step 5: Run dev server and verify streaming**

Run: `pnpm dev` in a separate terminal.

Visit http://localhost:3000/dashboard

Expected behavior:
- Both slots show skeleton initially
- `@team` content (~800ms) appears first
- `@analytics` content (~2s) appears after
- The page (children) "Welcome back!" renders immediately

If something fails, fix before proceeding. Stop the dev server when done.

- [ ] **Step 6: Commit**

```bash
git add src/app/dashboard/@team/
git commit -m "feat(dashboard): add @team slot with loading/error/default

Slots stream independently; team (~800ms) renders before analytics (~2s).

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 9: Tab Group inside @analytics

**Files:**
- Create: `src/app/dashboard/@analytics/(tabs)/layout.tsx`
- Create: `src/app/dashboard/@analytics/(tabs)/page-views/page.tsx`
- Create: `src/app/dashboard/@analytics/(tabs)/visitors/page.tsx`

`(tabs)` is a route group — does not appear in URL. The layout adds tab navigation. The slot `@analytics` and the route group `(tabs)` are both URL-invisible, so the subpages render at `/dashboard/page-views` and `/dashboard/visitors`.

> Important: because slots and route groups are URL-invisible, the `page-views` and `visitors` segments live at `/dashboard/page-views` and `/dashboard/visitors`, not at `/dashboard/@analytics/page-views`. The `<Link href="/dashboard/page-views">` form is required.

- [ ] **Step 1: Create tabs layout**

```tsx
// src/app/dashboard/@analytics/(tabs)/layout.tsx
import Link from 'next/link'

export default function TabsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <nav className="flex gap-3 border-b pb-2 text-sm">
        <Link href="/dashboard/page-views" className="text-blue-600 hover:underline">
          Page Views
        </Link>
        <Link href="/dashboard/visitors" className="text-blue-600 hover:underline">
          Visitors
        </Link>
      </nav>
      <div className="mt-4">{children}</div>
    </div>
  )
}
```

- [ ] **Step 2: Create page-views page**

```tsx
// src/app/dashboard/@analytics/(tabs)/page-views/page.tsx
export default function PageViewsTab() {
  return (
    <div>
      <h3 className="text-xs font-semibold text-gray-500 uppercase">Page Views</h3>
      <p className="mt-2 text-2xl font-bold">12,345</p>
      <p className="text-xs text-gray-500">Last 30 days</p>
    </div>
  )
}
```

- [ ] **Step 3: Create visitors page**

```tsx
// src/app/dashboard/@analytics/(tabs)/visitors/page.tsx
export default function VisitorsTab() {
  return (
    <div>
      <h3 className="text-xs font-semibold text-gray-500 uppercase">Visitors</h3>
      <p className="mt-2 text-2xl font-bold">890</p>
      <p className="text-xs text-gray-500">Unique, last 30 days</p>
    </div>
  )
}
```

- [ ] **Step 4: Run dev server and verify**

Run: `pnpm dev`

Visit http://localhost:3000/dashboard/page-views

Expected:
- URL is `/dashboard/page-views`
- `@analytics` slot shows tab nav + Page Views content
- `@team` slot still shows team list
- `children` shows "Welcome back!"

Click the "Visitors" tab. Expected:
- URL changes to `/dashboard/visitors`
- Only `@analytics` re-renders
- `@team` content stays mounted (no spinner, no flicker)

In DevTools Network, observe RSC requests fire only for the analytics segment.

Stop dev server when done.

- [ ] **Step 5: Commit**

```bash
git add src/app/dashboard/@analytics/\(tabs\)/
git commit -m "feat(dashboard): add tab group inside @analytics slot

Independent navigation between /dashboard/page-views and /dashboard/visitors
without re-rendering @team slot.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 10: Conditional Routes at /dashboard/reports

**Files:**
- Create: `src/app/dashboard/reports/layout.tsx`
- Create: `src/app/dashboard/reports/default.tsx`
- Create: `src/app/dashboard/reports/@admin/page.tsx`
- Create: `src/app/dashboard/reports/@user/page.tsx`

- [ ] **Step 1: Create reports layout**

```tsx
// src/app/dashboard/reports/layout.tsx
import { getRole } from '@/features/auth/helpers/role'

export default async function ReportsLayout({
  admin,
  user,
}: {
  admin: React.ReactNode
  user: React.ReactNode
}) {
  const role = await getRole()
  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <header className="mb-3">
        <h2 className="text-sm font-semibold text-gray-500 uppercase">Reports</h2>
        <p className="text-xs text-gray-500">Visible role: {role}</p>
      </header>
      {role === 'admin' ? admin : user}
    </div>
  )
}
```

- [ ] **Step 2: Create default fallback**

```tsx
// src/app/dashboard/reports/default.tsx
export default function ReportsDefault() {
  return null
}
```

- [ ] **Step 3: Create @admin slot**

```tsx
// src/app/dashboard/reports/@admin/page.tsx
import { getReports } from '@/features/dashboard/services/mock'

export default async function AdminReportsPage() {
  const data = await getReports('admin')
  return (
    <dl className="grid grid-cols-3 gap-3">
      <div>
        <dt className="text-xs text-gray-500">Revenue</dt>
        <dd className="text-lg font-bold">${data.revenue.toLocaleString()}</dd>
      </div>
      <div>
        <dt className="text-xs text-gray-500">Cost</dt>
        <dd className="text-lg font-bold">${data.cost.toLocaleString()}</dd>
      </div>
      <div>
        <dt className="text-xs text-gray-500">Margin</dt>
        <dd className="text-lg font-bold text-green-600">
          {(data.margin * 100).toFixed(1)}%
        </dd>
      </div>
    </dl>
  )
}
```

- [ ] **Step 4: Create @user slot**

```tsx
// src/app/dashboard/reports/@user/page.tsx
import { getReports } from '@/features/dashboard/services/mock'

export default async function UserReportsPage() {
  const data = await getReports('user')
  return (
    <dl className="grid grid-cols-2 gap-3">
      <div>
        <dt className="text-xs text-gray-500">Tasks Done</dt>
        <dd className="text-lg font-bold text-green-600">{data.tasksDone}</dd>
      </div>
      <div>
        <dt className="text-xs text-gray-500">Tasks Open</dt>
        <dd className="text-lg font-bold text-orange-600">{data.tasksOpen}</dd>
      </div>
    </dl>
  )
}
```

- [ ] **Step 5: Run dev server and verify**

Run: `pnpm dev`

Visit http://localhost:3000/dashboard/reports

Expected:
- "Visible role: user" header
- Tasks Done / Tasks Open card

Click "admin" in RoleSwitcher. Expected:
- After Server Action completes, header shows "Visible role: admin"
- Card switches to Revenue / Cost / Margin
- No full page reload

Stop dev server when done.

- [ ] **Step 6: Commit**

```bash
git add src/app/dashboard/reports/
git commit -m "feat(dashboard): add conditional /dashboard/reports route

Layout selects @admin or @user slot based on role cookie.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 11: Root @auth slot for modal

**Files:**
- Modify: `src/app/layout.tsx`
- Create: `src/app/@auth/default.tsx`
- Create: `src/app/@auth/page.tsx`
- Create: `src/app/@auth/[...catchAll]/page.tsx`

- [ ] **Step 1: Modify root layout to accept auth slot**

```tsx
// src/app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AppProviders } from '@/core/providers'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'My App',
  description: 'Built with Next.js Feature Slices Architecture',
}

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

- [ ] **Step 2: Create @auth/default.tsx**

```tsx
// src/app/@auth/default.tsx
export default function AuthDefault() {
  return null
}
```

- [ ] **Step 3: Create @auth/page.tsx**

```tsx
// src/app/@auth/page.tsx
export default function AuthPage() {
  return null
}
```

- [ ] **Step 4: Create @auth catch-all**

```tsx
// src/app/@auth/[...catchAll]/page.tsx
export default function AuthCatchAll() {
  return null
}
```

- [ ] **Step 5: Verify TypeScript compiles**

Run: `pnpm tsc --noEmit`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/app/layout.tsx src/app/@auth/
git commit -m "feat(app): add root @auth slot scaffolding for modal

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 12: Intercepting (.)login route

**Files:**
- Create: `src/app/@auth/(.)login/page.tsx`
- Modify: `src/app/dashboard/page.tsx`

The `(.)` convention intercepts the `/login` URL when navigated via `<Link>` from the same URL level. Since route groups (`(auth)`) don't count as URL levels, `/login` is at root level → `@auth/(.)login` at root intercepts it.

- [ ] **Step 1: Create intercepted modal route**

```tsx
// src/app/@auth/(.)login/page.tsx
import { Modal } from '@/shared/components/feedback'
import { LoginForm } from '@/features/auth'

export default function LoginModalPage() {
  return (
    <Modal>
      <h2 className="mb-4 text-lg font-semibold">Sign in</h2>
      <LoginForm />
    </Modal>
  )
}
```

- [ ] **Step 2: Add navigation links to dashboard for testing**

```tsx
// src/app/dashboard/page.tsx
import Link from 'next/link'

export default function DashboardPage() {
  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="mt-2 text-gray-600">Welcome back!</p>
      <div className="mt-4 flex flex-wrap gap-3 text-sm">
        <Link href="/dashboard/reports" className="text-blue-600 hover:underline">
          Reports
        </Link>
        <Link href="/dashboard/page-views" className="text-blue-600 hover:underline">
          Page Views (tab)
        </Link>
        <Link href="/dashboard/visitors" className="text-blue-600 hover:underline">
          Visitors (tab)
        </Link>
        <Link href="/login" className="text-blue-600 hover:underline">
          Open Login Modal
        </Link>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Run dev server and verify modal**

Run: `pnpm dev`

Visit http://localhost:3000/dashboard

Click "Open Login Modal". Expected:
- Modal appears over the dashboard
- URL bar changes to `/login`
- Backdrop is dim, login form visible

Press Escape. Expected:
- Modal closes
- URL returns to `/dashboard`

Click "Open Login Modal" again, then click backdrop. Expected: modal closes.

Click "Open Login Modal", then in a new tab paste http://localhost:3000/login. Expected:
- Full-page login renders (no modal — interception only happens on client-side `<Link>` nav)

Click "Open Login Modal" from dashboard, then click "Reports" link visible behind/around modal. Expected:
- Modal closes (catch-all route returns null)
- Reports page renders

Stop dev server.

- [ ] **Step 4: Commit**

```bash
git add 'src/app/@auth/(.)login/' src/app/dashboard/page.tsx
git commit -m "feat(auth): add intercepted login modal via @auth/(.)login

Click 'Login' from anywhere opens modal; refresh or direct URL
shows the full /login page.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 13: Set role on successful login

**Files:**
- Modify: `src/features/auth/actions/login.ts`
- Modify: `src/features/auth/actions/login.test.ts`

- [ ] **Step 1: Update login tests for cookie behavior**

```ts
// src/features/auth/actions/login.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

const cookieSet = vi.fn()
vi.mock('next/headers', () => ({
  cookies: async () => ({ set: cookieSet, get: () => undefined }),
}))

import { login } from './login'

describe('login action', () => {
  beforeEach(() => {
    cookieSet.mockReset()
  })

  it('returns fieldErrors for invalid email', async () => {
    const formData = new FormData()
    formData.set('email', 'not-an-email')
    formData.set('password', 'password123')

    const result = await login(formData)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.fieldErrors?.email).toBeDefined()
    }
  })

  it('returns fieldErrors for short password', async () => {
    const formData = new FormData()
    formData.set('email', 'user@example.com')
    formData.set('password', '123')

    const result = await login(formData)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.fieldErrors?.password).toBeDefined()
    }
  })

  it('returns error for wrong credentials', async () => {
    const formData = new FormData()
    formData.set('email', 'wrong@example.com')
    formData.set('password', 'password123')

    const result = await login(formData)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toBe('Invalid email or password')
    }
  })

  it('returns success for valid credentials', async () => {
    const formData = new FormData()
    formData.set('email', 'demo@example.com')
    formData.set('password', 'password123')

    const result = await login(formData)
    expect(result.success).toBe(true)
  })

  it('sets role=user cookie on successful login with non-admin email', async () => {
    const formData = new FormData()
    formData.set('email', 'demo@example.com')
    formData.set('password', 'password123')

    await login(formData)
    expect(cookieSet).toHaveBeenCalledWith(
      'role',
      'user',
      expect.objectContaining({ path: '/' }),
    )
  })

  it('does not set cookie on failed login', async () => {
    const formData = new FormData()
    formData.set('email', 'admin@example.com')
    formData.set('password', 'password123')

    await login(formData)
    // admin@example.com is not the demo credential, so authenticate returns null;
    // assert no cookie is set on failed authentication.
    expect(cookieSet).not.toHaveBeenCalled()
  })
})
```

> Note: the existing demo authenticator only accepts `demo@example.com`. To exercise the admin cookie path manually, the spec allows extending the demo auth but the constraint is "do not refactor `auth.service.ts` beyond this addition". The admin cookie path is exercised via the `RoleSwitcher` (Task 5) instead.

- [ ] **Step 2: Run tests to verify the new ones fail**

Run: `pnpm test src/features/auth/actions/login.test.ts`
Expected: 4 original tests pass; the 2 new tests fail (cookie not set / mock not called).

- [ ] **Step 3: Modify login action to set role cookie**

```ts
// src/features/auth/actions/login.ts
'use server'

import { cookies } from 'next/headers'
import type { ActionResult } from '@/shared/types/api'
import { loginSchema } from '../schemas/login.schema'
import { authenticate } from '../services/auth.service'

export async function login(formData: FormData): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData))

  if (!parsed.success) {
    return {
      success: false,
      error: 'Validation failed',
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  const user = await authenticate(parsed.data)
  if (!user) {
    return { success: false, error: 'Invalid email or password' }
  }

  const role = parsed.data.email.includes('admin') ? 'admin' : 'user'
  const c = await cookies()
  c.set('role', role, {
    httpOnly: false,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })

  return { success: true, data: undefined }
}
```

- [ ] **Step 4: Run tests to verify all pass**

Run: `pnpm test src/features/auth/actions/login.test.ts`
Expected: 6 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/features/auth/actions/login.ts src/features/auth/actions/login.test.ts
git commit -m "feat(auth): set role cookie on successful login

Email containing 'admin' becomes admin role; otherwise user.
Drives conditional /dashboard/reports rendering.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 14: End-to-end manual verification

**Files:** none modified — verification only.

- [ ] **Step 1: Run full test suite**

Run: `pnpm test`
Expected: all tests pass (existing + new).

- [ ] **Step 2: Type-check whole project**

Run: `pnpm tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Lint**

Run: `pnpm lint`
Expected: no errors.

- [ ] **Step 4: Build**

Run: `pnpm build`
Expected: build succeeds. Route list now includes `/`, `/login`, `/dashboard`, `/dashboard/page-views`, `/dashboard/visitors`, `/dashboard/reports`.

- [ ] **Step 5: Manual verification matrix**

Run: `pnpm dev`

| # | Action | Expected |
|---|---|---|
| 1 | Visit `/dashboard` | Skeletons appear; @team (~800ms) renders before @analytics (~2s); children renders immediately |
| 2 | Visit `/dashboard/visitors` then F5 refresh | No 404; @team still renders via default.tsx; @analytics shows visitors tab |
| 3 | On `/dashboard`, click "Page Views" tab then "Visitors" tab | URL changes; only @analytics re-renders; @team stays mounted (check Network tab — no RSC fetch for team) |
| 4 | Visit `/dashboard/reports` | Header shows "Visible role: user"; tasks card visible |
| 5 | Click "admin" in RoleSwitcher on `/dashboard/reports` | Card switches to revenue/cost/margin; no full reload |
| 6 | From `/dashboard`, click "Open Login Modal" | Modal opens; URL becomes `/login` |
| 7 | In modal, press Escape | Modal closes; URL returns |
| 8 | In modal, click backdrop | Modal closes |
| 9 | In modal, click × button | Modal closes |
| 10 | With modal open, click "Reports" link behind it | Modal closes; reports page renders |
| 11 | Open `/login` directly in a new browser tab | Full-page login renders, no modal |
| 12 | Login in modal with `demo@example.com` / `password123`, then visit `/dashboard/reports` | Header still shows "user" since demo email doesn't contain 'admin' |

If any step fails, debug before completing this task.

- [ ] **Step 6: Optional — induce error to verify per-slot error UI**

Temporarily edit `src/features/dashboard/services/mock.ts` `getAnalytics()`:

```ts
export async function getAnalytics(): Promise<Analytics> {
  await sleep(2000)
  throw new Error('Simulated analytics failure')  // TEMP
  return { views: 12_345, visitors: 890, growth: 0.12 }
}
```

Visit `/dashboard`. Expected:
- @analytics shows red error card with "Retry" button
- @team renders normally
- children renders normally

Revert the change. Do **not** commit the throw.

- [ ] **Step 7: Stop dev server and final commit (if any verification fixes)**

If verification revealed issues that required fixes, commit them with descriptive messages. Otherwise no commit needed.

```bash
git status   # verify clean
```

---

## Self-Review Notes

- Spec coverage: every requirement maps to Task 1-13; Task 14 verifies end-to-end.
- Pre-flight finding (route group conflict) handled by Task 0 — added after planning revealed `/dashboard` returned 404.
- No placeholders. Every code block is complete.
- Type names consistent: `Role`, `Analytics`, `TeamMember`, `AdminReport`, `UserReport`, `ActionResult`.
- File paths use forward slashes; bash `git add` for `(parens)` paths uses backslash escapes for the bash shell on Windows.
- `pnpm` is the package manager (per `pnpm-lock.yaml`).
- The `getReports` function uses overloads so each consumer gets the correct narrowed type without a type assertion.
- Middleware deprecation warning noted but not addressed (out of scope).
