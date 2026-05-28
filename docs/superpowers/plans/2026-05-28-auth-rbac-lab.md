# Auth & RBAC Lab Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build 4 hands-on exercises under `/lab/auth-rbac/` covering session management with cookies, three layers of route protection (proxy/layout/page), role-based access control with server-side enforcement, and the Data Access Layer (DAL) pattern using React `cache()`.

**Architecture:** Each exercise sits under `src/app/lab/auth-rbac/`. A shared in-lab DAL (`_dal/`) provides `getSession()` (cached) and `requireUser`/`requireRole` helpers used by exercises 02-04. The lab uses its own `lab-session` cookie scoped to `/lab/auth-rbac` so it does NOT interfere with the existing `features/auth/` real-app role cookie or any other code in the project. The existing `src/proxy.ts` is NOT modified — route protection is demonstrated via layout and page guards (proxy guards are documented as a third option but not wired).

**Tech Stack:** Next.js 16.2.3, React 19.2.4 (`cache()`), TypeScript, Tailwind v4

**Spec:** `docs/superpowers/specs/2026-05-28-nextjs-interview-prep-design.md` (Phase 1, Lab 4)

**Verification policy:** After each task, type-check with `pnpm exec tsc --noEmit`. Final task runs `pnpm lint`. Do NOT run `pnpm dev` from subagents.

---

## File Structure

| Path | Purpose | Status |
|---|---|---|
| `src/app/lab/auth-rbac/page.tsx` | Index listing 4 exercises | NEW |
| `src/app/lab/auth-rbac/_dal/types.ts` | Session, User, Role types | NEW |
| `src/app/lab/auth-rbac/_dal/session.ts` | `getSession()` wrapped in `cache()`, `'server-only'` | NEW |
| `src/app/lab/auth-rbac/_dal/auth.ts` | `requireUser`, `requireRole` assertion helpers | NEW |
| `src/app/lab/auth-rbac/_lib/cookie.ts` | Cookie name + lifetime constants | NEW |
| `src/app/lab/auth-rbac/01-session/page.tsx` | Session state demo + login/logout | NEW |
| `src/app/lab/auth-rbac/01-session/_actions.ts` | startSession / endSession Server Actions | NEW |
| `src/app/lab/auth-rbac/01-session/_components/SessionPanel.tsx` | Form for "login" + status badge | NEW |
| `src/app/lab/auth-rbac/02-protection/page.tsx` | Intro + links to each protection style | NEW |
| `src/app/lab/auth-rbac/02-protection/layout-guarded/layout.tsx` | Layout-level guard (redirect if no session) | NEW |
| `src/app/lab/auth-rbac/02-protection/layout-guarded/page.tsx` | Protected content under layout guard | NEW |
| `src/app/lab/auth-rbac/02-protection/page-guarded/page.tsx` | Page-level guard | NEW |
| `src/app/lab/auth-rbac/03-rbac/page.tsx` | RBAC intro + role-aware demo | NEW |
| `src/app/lab/auth-rbac/03-rbac/_components/RoleGate.tsx` | Server Component that hides children by role | NEW |
| `src/app/lab/auth-rbac/03-rbac/_actions.ts` | Server Action that re-checks role server-side | NEW |
| `src/app/lab/auth-rbac/03-rbac/admin/layout.tsx` | Admin-only layout guard | NEW |
| `src/app/lab/auth-rbac/03-rbac/admin/page.tsx` | Admin-only content | NEW |
| `src/app/lab/auth-rbac/04-dal/page.tsx` | DAL profile view + cached calls counter | NEW |
| `src/app/lab/auth-rbac/04-dal/_components/ProfileCard.tsx` | Uses `getProfile()` DTO from DAL | NEW |
| `src/app/lab/auth-rbac/04-dal/_dto.ts` | `getProfileDTO()` returning safe shape | NEW |

---

## Task 1: Lab index + shared DAL

This task establishes the lab's foundation: type definitions, the cached session reader, and assertion helpers used across exercises.

**Files:**
- Create: `src/app/lab/auth-rbac/_dal/types.ts`
- Create: `src/app/lab/auth-rbac/_lib/cookie.ts`
- Create: `src/app/lab/auth-rbac/_dal/session.ts`
- Create: `src/app/lab/auth-rbac/_dal/auth.ts`
- Create: `src/app/lab/auth-rbac/page.tsx`

- [ ] **Step 1: Types**

```ts
// src/app/lab/auth-rbac/_dal/types.ts
export type Role = 'admin' | 'user' | 'guest'

export type User = {
  id: string
  name: string
  email: string
  role: Role
}

export type Session = {
  user: User
  issuedAt: string
}
```

- [ ] **Step 2: Cookie config**

```ts
// src/app/lab/auth-rbac/_lib/cookie.ts
export const SESSION_COOKIE = 'lab-session'
export const SESSION_PATH = '/lab/auth-rbac'
export const SESSION_MAX_AGE = 60 * 60 // 1 hour
```

- [ ] **Step 3: Cached session reader**

```ts
// src/app/lab/auth-rbac/_dal/session.ts
import 'server-only'
import { cache } from 'react'
import { cookies } from 'next/headers'
import { SESSION_COOKIE } from '../_lib/cookie'
import type { Session } from './types'

// React's cache() ensures multiple callers within the same request share one result.
// This means getSession() can be called freely from RSC, Server Actions, helpers, etc.,
// without re-reading cookies or re-validating tokens every time.
export const getSession = cache(async (): Promise<Session | null> => {
  const c = await cookies()
  const raw = c.get(SESSION_COOKIE)?.value
  if (!raw) return null
  try {
    const session = JSON.parse(raw) as Session
    // In a real app: verify signature / decrypt token / validate expiry here.
    return session
  } catch {
    return null
  }
})
```

- [ ] **Step 4: Auth assertion helpers**

```ts
// src/app/lab/auth-rbac/_dal/auth.ts
import 'server-only'
import { redirect } from 'next/navigation'
import { getSession } from './session'
import type { Role, Session } from './types'

// Returns the session or redirects. Use in any RSC or layout that requires auth.
export async function requireUser(redirectTo = '/lab/auth-rbac/01-session'): Promise<Session> {
  const session = await getSession()
  if (!session) {
    redirect(`${redirectTo}?reason=login-required`)
  }
  return session
}

// Returns the session if the role is allowed; otherwise redirects.
// Throws on the assertion path means downstream code can rely on the role being correct.
export async function requireRole(allowed: Role[]): Promise<Session> {
  const session = await requireUser()
  if (!allowed.includes(session.user.role)) {
    redirect('/lab/auth-rbac/03-rbac?reason=forbidden')
  }
  return session
}
```

- [ ] **Step 5: Index page**

```tsx
// src/app/lab/auth-rbac/page.tsx
import Link from 'next/link'

const EXERCISES = [
  {
    num: '01',
    slug: '01-session',
    title: 'Session management',
    desc: 'Create a session in an httpOnly cookie; read it server-side; sign out.',
  },
  {
    num: '02',
    slug: '02-protection',
    title: 'Route protection (3 layers)',
    desc: 'Compare proxy.ts guard vs layout.tsx guard vs page-level guard.',
  },
  {
    num: '03',
    slug: '03-rbac',
    title: 'Role-based access control',
    desc: 'Hide UI by role and prove client-only hiding is insecure with a server check.',
  },
  {
    num: '04',
    slug: '04-dal',
    title: 'Data Access Layer pattern',
    desc: 'Wrap getSession in React cache(); return safe DTOs; centralise authorization.',
  },
]

export default function AuthRbacIndex() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Auth & RBAC Lab</h1>
      <p className="mt-1 text-sm text-gray-500">
        4 exercises on session, route guards, role checks, and the DAL pattern
      </p>
      <div className="mt-6 space-y-3">
        {EXERCISES.map((ex) => (
          <Link
            key={ex.slug}
            href={`/lab/auth-rbac/${ex.slug}`}
            className="block rounded-lg border bg-white p-4 hover:border-blue-300 hover:shadow-sm transition-all"
          >
            <span className="text-xs font-mono text-gray-400">{ex.num}</span>
            <h2 className="font-semibold">{ex.title}</h2>
            <p className="mt-1 text-sm text-gray-600">{ex.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 6: Type-check + commit**

```
pnpm exec tsc --noEmit
git add src/app/lab/auth-rbac/
git commit -m "feat(lab/auth-rbac): scaffold lab index + DAL primitives"
```

---

## Task 2: Exercise 01 — Session management

**Concept:** A session is server-validated identity carried across requests, usually via an httpOnly cookie. The cookie payload should be opaque to the client (signed JWT or random session id resolved server-side). Demo uses a JSON-encoded shape for simplicity — real apps must sign/encrypt.

**Files:**
- Create: `src/app/lab/auth-rbac/01-session/_actions.ts`
- Create: `src/app/lab/auth-rbac/01-session/_components/SessionPanel.tsx`
- Create: `src/app/lab/auth-rbac/01-session/page.tsx`

- [ ] **Step 1: Actions**

```ts
// src/app/lab/auth-rbac/01-session/_actions.ts
'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { SESSION_COOKIE, SESSION_PATH, SESSION_MAX_AGE } from '../_lib/cookie'
import type { Role, Session } from '../_dal/types'

const MOCK_USERS: Record<string, { name: string; email: string; role: Role }> = {
  admin: { name: 'Admin Hùng', email: 'admin@example.com', role: 'admin' },
  user: { name: 'User Alice', email: 'alice@example.com', role: 'user' },
}

export type LoginState =
  | { ok: true; role: Role }
  | { ok: false; error: string }
  | { idle: true }

export async function startSession(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const username = String(formData.get('username') ?? '').trim()
  const profile = MOCK_USERS[username]
  if (!profile) {
    return { ok: false, error: 'Try "admin" or "user".' }
  }

  const session: Session = {
    user: { id: username, ...profile },
    issuedAt: new Date().toISOString(),
  }

  const c = await cookies()
  c.set(SESSION_COOKIE, JSON.stringify(session), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: SESSION_PATH,
    maxAge: SESSION_MAX_AGE,
  })

  revalidatePath(SESSION_PATH, 'layout')
  return { ok: true, role: profile.role }
}

export async function endSession(): Promise<void> {
  const c = await cookies()
  c.delete(SESSION_COOKIE)
  revalidatePath(SESSION_PATH, 'layout')
}
```

- [ ] **Step 2: Session panel (Client Component)**

```tsx
// src/app/lab/auth-rbac/01-session/_components/SessionPanel.tsx
'use client'

import { useActionState } from 'react'
import { Button } from '@/shared/components/ui'
import { startSession, type LoginState } from '../_actions'

const initial: LoginState = { idle: true }

type Props = { active: boolean }

export function SessionPanel({ active }: Props) {
  const [state, action, pending] = useActionState(startSession, initial)

  if (active) {
    return (
      <p className="rounded-md bg-green-50 p-3 text-sm text-green-700">
        ✓ Session is active. See the panel below for details. Use the &quot;Sign out&quot; button to end it.
      </p>
    )
  }

  return (
    <form action={action} className="flex flex-col gap-3">
      <label className="text-sm font-medium text-gray-700">
        Username (type &quot;admin&quot; or &quot;user&quot;)
      </label>
      <input
        name="username"
        autoComplete="off"
        defaultValue=""
        placeholder="admin"
        className="h-10 rounded-md border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <Button type="submit" loading={pending}>
        Start session
      </Button>
      {'ok' in state && state.ok === false && (
        <p className="text-sm text-red-500">{state.error}</p>
      )}
    </form>
  )
}
```

- [ ] **Step 3: Exercise page**

```tsx
// src/app/lab/auth-rbac/01-session/page.tsx
import { ExerciseLayout } from '@/app/lab/rsc/_components/ExerciseLayout'
import { Button } from '@/shared/components/ui'
import { getSession } from '../_dal/session'
import { endSession } from './_actions'
import { SessionPanel } from './_components/SessionPanel'

export default async function SessionExercise() {
  const session = await getSession()

  return (
    <ExerciseLayout
      number="01"
      title="Session management"
      concept="A session lives in an httpOnly, sameSite, secure-in-production cookie. The body is opaque to the client (signed JWT or random id resolved server-side). The lab uses JSON encoding for simplicity, but real apps MUST sign or encrypt to prevent tampering."
      questions={[
        'Why does the session cookie have to be httpOnly?',
        'What is the difference between sameSite=lax and sameSite=strict?',
        'Why must session integrity be verified server-side, not by trusting the cookie body?',
        'When would you use a session store (DB / Redis) vs a self-contained JWT?',
        'Where should you put the secure flag, and how does it interact with localhost dev?',
      ]}
    >
      <SessionPanel active={!!session} />

      {session && (
        <section className="mt-6 space-y-3">
          <div className="rounded-md border bg-gray-50 p-3 text-sm">
            <p>
              <strong>User:</strong> {session.user.name} ({session.user.email})
            </p>
            <p>
              <strong>Role:</strong> {session.user.role}
            </p>
            <p>
              <strong>Issued at:</strong> {session.issuedAt}
            </p>
          </div>
          <form action={endSession}>
            <Button type="submit">Sign out</Button>
          </form>
        </section>
      )}

      <p className="mt-6 rounded-md bg-yellow-50 p-3 text-xs text-yellow-800">
        <strong>Security note:</strong> This demo stores the session as JSON. A real app would sign
        the cookie (HMAC) or encrypt it (JWE) so a client can&apos;t forge the role field. The session
        is also path-scoped to <code>/lab/auth-rbac</code> so it doesn&apos;t leak to other routes.
      </p>
    </ExerciseLayout>
  )
}
```

- [ ] **Step 4: Type-check + commit**

```
pnpm exec tsc --noEmit
git add src/app/lab/auth-rbac/01-session/
git commit -m "feat(lab/auth-rbac): add 01-session exercise"
```

---

## Task 3: Exercise 02 — Route protection (3 layers)

**Concept:** Three places to enforce auth:
1. **Proxy** (`src/proxy.ts`) — runs before the request reaches your route. Fast (no compile), but limited APIs (no DB calls).
2. **Layout** — runs once per render of the layout segment. Can read DB, can use `cache()` to share.
3. **Page** — runs per page render. Same capabilities as layout but no sharing across child segments.

Layouts and pages are the *real* security boundary; proxy is an optimistic optimization (per Next.js docs, do not use proxy as the only auth check).

**Files:**
- Create: `src/app/lab/auth-rbac/02-protection/page.tsx`
- Create: `src/app/lab/auth-rbac/02-protection/layout-guarded/layout.tsx`
- Create: `src/app/lab/auth-rbac/02-protection/layout-guarded/page.tsx`
- Create: `src/app/lab/auth-rbac/02-protection/page-guarded/page.tsx`

- [ ] **Step 1: Intro page**

```tsx
// src/app/lab/auth-rbac/02-protection/page.tsx
import Link from 'next/link'
import { ExerciseLayout } from '@/app/lab/rsc/_components/ExerciseLayout'
import { getSession } from '../_dal/session'

export default async function ProtectionIntro() {
  const session = await getSession()

  return (
    <ExerciseLayout
      number="02"
      title="Route protection (3 layers)"
      concept="Three places to enforce auth: proxy.ts (fast, limited API), layout.tsx (renders once per layout, can use DAL), and page-level guards. Per the Next.js Data Security guide, the page/layout/DAL is the real security boundary — proxy is an optimistic shortcut."
      questions={[
        'Why does the Next.js team recommend NOT relying on proxy alone for authorization?',
        'What runs more often: layout.tsx or page.tsx?',
        'How does cache() in the DAL help when the layout and the page both call getSession()?',
        'What happens to in-flight Server Actions if you redirect from a layout?',
        'When would you choose a layout guard vs a page guard for the same protected segment?',
      ]}
    >
      <p className="mb-3 text-sm text-gray-600">
        Current session state: <strong>{session ? `signed in as ${session.user.role}` : 'no session'}</strong>.
        {!session && (
          <>
            {' '}
            <Link href="/lab/auth-rbac/01-session" className="text-blue-600 hover:underline">
              Start a session first
            </Link>
            .
          </>
        )}
      </p>

      <ol className="space-y-3 text-sm">
        <li className="rounded-md border bg-white p-3">
          <h3 className="font-semibold">1. Layout-guarded</h3>
          <p className="mt-1 text-xs text-gray-600">
            The layout calls <code>requireUser()</code>. The check protects the page and any future
            sibling routes that share the layout.
          </p>
          <Link
            href="/lab/auth-rbac/02-protection/layout-guarded"
            className="mt-2 inline-block text-blue-600 hover:underline"
          >
            Visit layout-guarded →
          </Link>
        </li>
        <li className="rounded-md border bg-white p-3">
          <h3 className="font-semibold">2. Page-guarded</h3>
          <p className="mt-1 text-xs text-gray-600">
            The page itself calls <code>requireUser()</code>. Easy and explicit, but you must remember to
            do this on every protected page.
          </p>
          <Link
            href="/lab/auth-rbac/02-protection/page-guarded"
            className="mt-2 inline-block text-blue-600 hover:underline"
          >
            Visit page-guarded →
          </Link>
        </li>
        <li className="rounded-md border bg-white p-3">
          <h3 className="font-semibold">3. Proxy-guarded (not wired here)</h3>
          <p className="mt-1 text-xs text-gray-600">
            Documented for completeness. Would live in <code>src/proxy.ts</code> with{' '}
            <code>matcher</code> covering the route. The existing project proxy demonstrates this for{' '}
            <code>/dashboard</code> already.
          </p>
        </li>
      </ol>
    </ExerciseLayout>
  )
}
```

- [ ] **Step 2: Layout-guarded segment**

```tsx
// src/app/lab/auth-rbac/02-protection/layout-guarded/layout.tsx
import { requireUser } from '../../_dal/auth'

export default async function LayoutGuarded({ children }: { children: React.ReactNode }) {
  // Throws-on-redirect; downstream renders only if session exists.
  await requireUser()
  return (
    <div className="rounded-md border-2 border-blue-300 bg-blue-50 p-4">
      <p className="mb-3 text-xs font-semibold text-blue-700">[LAYOUT GUARD]</p>
      {children}
    </div>
  )
}
```

```tsx
// src/app/lab/auth-rbac/02-protection/layout-guarded/page.tsx
import { getSession } from '../../_dal/session'

export default async function LayoutGuardedPage() {
  const session = await getSession()
  return (
    <div className="text-sm">
      <p>
        ✓ You see this only because the layout guard let you in. Hello,{' '}
        <strong>{session!.user.name}</strong>.
      </p>
      <p className="mt-2 text-xs text-gray-500">
        Note: the layout already called <code>getSession()</code>; this page calls it again. Thanks to{' '}
        <code>cache()</code>, both calls share the same result within this request.
      </p>
    </div>
  )
}
```

- [ ] **Step 3: Page-guarded segment**

```tsx
// src/app/lab/auth-rbac/02-protection/page-guarded/page.tsx
import { requireUser } from '../../_dal/auth'

export default async function PageGuarded() {
  const session = await requireUser()
  return (
    <div className="rounded-md border-2 border-emerald-300 bg-emerald-50 p-4 text-sm">
      <p className="mb-3 text-xs font-semibold text-emerald-700">[PAGE GUARD]</p>
      <p>
        ✓ Authenticated as <strong>{session.user.name}</strong> ({session.user.role}).
      </p>
      <p className="mt-2 text-xs text-gray-500">
        The page itself enforces auth. If you sign out and revisit this URL, you&apos;ll be redirected
        back to <code>/lab/auth-rbac/01-session</code>.
      </p>
    </div>
  )
}
```

- [ ] **Step 4: Type-check + commit**

```
pnpm exec tsc --noEmit
git add src/app/lab/auth-rbac/02-protection/
git commit -m "feat(lab/auth-rbac): add 02-protection exercise"
```

---

## Task 4: Exercise 03 — RBAC

**Concept:** Hiding UI by role on the client is a UX nicety, not security. The actual access check MUST run server-side on every protected read or action. Demo proves this by exposing a Server Action that re-checks the role even when the client tries to "skip" the hidden button.

**Files:**
- Create: `src/app/lab/auth-rbac/03-rbac/_components/RoleGate.tsx`
- Create: `src/app/lab/auth-rbac/03-rbac/_actions.ts`
- Create: `src/app/lab/auth-rbac/03-rbac/page.tsx`
- Create: `src/app/lab/auth-rbac/03-rbac/admin/layout.tsx`
- Create: `src/app/lab/auth-rbac/03-rbac/admin/page.tsx`

- [ ] **Step 1: Server-side role gate**

```tsx
// src/app/lab/auth-rbac/03-rbac/_components/RoleGate.tsx
import { getSession } from '../../_dal/session'
import type { Role } from '../../_dal/types'

type Props = {
  allow: Role[]
  children: React.ReactNode
  fallback?: React.ReactNode
}

// Server Component. Renders children only if the current session matches a role in `allow`.
// Equivalent client-side hiding would be insecure: tampering with DOM or running the action
// directly would bypass it. This is why we have requireRole() — see _actions.ts.
export async function RoleGate({ allow, children, fallback = null }: Props) {
  const session = await getSession()
  if (!session || !allow.includes(session.user.role)) return <>{fallback}</>
  return <>{children}</>
}
```

- [ ] **Step 2: Server Action with role enforcement**

```ts
// src/app/lab/auth-rbac/03-rbac/_actions.ts
'use server'

import { requireRole } from '../_dal/auth'

export type ActionResult =
  | { ok: true; message: string }
  | { ok: false; error: string }
  | { idle: true }

// This action enforces the role server-side. Even if the UI is hidden client-side
// or someone reverse-engineers and calls the action directly, requireRole will
// redirect (a 303) before the privileged work runs.
export async function deleteEverything(
  _prev: ActionResult,
  _formData: FormData,
): Promise<ActionResult> {
  const session = await requireRole(['admin'])
  // pretend to do dangerous admin work
  return {
    ok: true,
    message: `✓ Action executed by admin (${session.user.name}). Nothing was actually deleted.`,
  }
}
```

- [ ] **Step 3: RBAC intro page (uses RoleGate, exposes the action)**

```tsx
// src/app/lab/auth-rbac/03-rbac/page.tsx
import Link from 'next/link'
import { ExerciseLayout } from '@/app/lab/rsc/_components/ExerciseLayout'
import { getSession } from '../_dal/session'
import { RoleGate } from './_components/RoleGate'
import { AdminDangerForm } from './_components/AdminDangerForm'

type SearchParams = Promise<{ reason?: string }>

export default async function RbacIntro({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const { reason } = await searchParams
  const session = await getSession()

  return (
    <ExerciseLayout
      number="03"
      title="Role-based access control"
      concept="UI hiding by role is UX, not security. The actual enforcement must run server-side on every read and action. RoleGate (a Server Component) hides children; requireRole (in a Server Action) protects the work."
      questions={[
        'Why is client-side UI hiding insufficient on its own?',
        'How do you prove a Server Action is safe to call from any client?',
        'How would you write tests for an RBAC policy?',
        'What is the difference between authorization at the data layer vs the route layer?',
        'When would you use ABAC (attribute-based) instead of RBAC?',
      ]}
    >
      {reason === 'forbidden' && (
        <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
          ⛔ Access denied — your role doesn&apos;t allow that page or action.
        </div>
      )}

      <p className="mb-4 text-sm text-gray-600">
        Current role: <strong>{session?.user.role ?? 'guest (no session)'}</strong>.{' '}
        <Link href="/lab/auth-rbac/01-session" className="text-blue-600 hover:underline">
          Switch via the session exercise
        </Link>{' '}
        — try logging in as <code>user</code> first, then <code>admin</code>, to see the gate change.
      </p>

      <RoleGate allow={['admin']} fallback={
        <p className="text-sm text-gray-500 italic">
          (Admin-only section hidden. Sign in as <code>admin</code> to see it.)
        </p>
      }>
        <div className="rounded-md border-2 border-rose-300 bg-rose-50 p-3 text-sm">
          <h3 className="font-semibold">Admin zone</h3>
          <p className="mt-1 text-xs text-gray-700">
            This block is rendered server-side only for admins. The button below also re-checks the role
            in its action handler.
          </p>
          <div className="mt-3">
            <AdminDangerForm />
          </div>
        </div>
      </RoleGate>

      <div className="mt-6 rounded-md bg-gray-50 p-3 text-xs">
        <p className="font-semibold">Try to bypass:</p>
        <ol className="ml-4 mt-2 list-decimal space-y-1">
          <li>Sign in as <code>user</code> (role: user).</li>
          <li>
            Visit <Link href="/lab/auth-rbac/03-rbac/admin" className="text-blue-600 hover:underline">
              /lab/auth-rbac/03-rbac/admin
            </Link>{' '}
            directly — you&apos;ll be redirected with <code>?reason=forbidden</code>.
          </li>
        </ol>
      </div>
    </ExerciseLayout>
  )
}
```

- [ ] **Step 4: Admin-only form (separate file because it's a Client Component)**

```tsx
// src/app/lab/auth-rbac/03-rbac/_components/AdminDangerForm.tsx
'use client'

import { useActionState } from 'react'
import { Button } from '@/shared/components/ui'
import { deleteEverything, type ActionResult } from '../_actions'

const initial: ActionResult = { idle: true }

export function AdminDangerForm() {
  const [state, action, pending] = useActionState(deleteEverything, initial)
  return (
    <form action={action} className="flex flex-col gap-2">
      <Button type="submit" loading={pending}>
        Run admin action
      </Button>
      {'ok' in state && state.ok === true && (
        <p className="text-sm text-green-600">{state.message}</p>
      )}
      {'ok' in state && state.ok === false && (
        <p className="text-sm text-red-500">{state.error}</p>
      )}
    </form>
  )
}
```

> Note: This file is referenced from `page.tsx` at the path `./_components/AdminDangerForm`. Create it now.

- [ ] **Step 5: Admin-only segment with layout guard**

```tsx
// src/app/lab/auth-rbac/03-rbac/admin/layout.tsx
import { requireRole } from '../../_dal/auth'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireRole(['admin'])
  return (
    <div className="rounded-md border-2 border-rose-400 bg-rose-50 p-4">
      <p className="mb-3 text-xs font-semibold text-rose-700">[ADMIN LAYOUT GUARD]</p>
      {children}
    </div>
  )
}
```

```tsx
// src/app/lab/auth-rbac/03-rbac/admin/page.tsx
import { getSession } from '../../_dal/session'

export default async function AdminHome() {
  const session = await getSession()
  return (
    <div className="text-sm">
      <p>
        ✓ Admin dashboard. Hello, <strong>{session!.user.name}</strong>.
      </p>
      <p className="mt-2 text-xs text-gray-500">
        If you visited this directly without being an admin, the layout guard already redirected you to
        the parent with <code>?reason=forbidden</code>.
      </p>
    </div>
  )
}
```

- [ ] **Step 6: Type-check + commit**

```
pnpm exec tsc --noEmit
git add src/app/lab/auth-rbac/03-rbac/
git commit -m "feat(lab/auth-rbac): add 03-rbac exercise"
```

---

## Task 5: Exercise 04 — Data Access Layer

**Concept:** A DAL centralises all data access in a `'server-only'` module. Public functions return DTOs (Data Transfer Objects) — minimal, safe shapes — instead of raw database rows. Authorization happens inside the DAL, not scattered across pages. React's `cache()` deduplicates within a request.

**Files:**
- Create: `src/app/lab/auth-rbac/04-dal/_dto.ts`
- Create: `src/app/lab/auth-rbac/04-dal/_components/ProfileCard.tsx`
- Create: `src/app/lab/auth-rbac/04-dal/page.tsx`

- [ ] **Step 1: DTO module**

```ts
// src/app/lab/auth-rbac/04-dal/_dto.ts
import 'server-only'
import { cache } from 'react'
import { getSession } from '../_dal/session'
import type { Role } from '../_dal/types'

// Simulated database — in real life this would be a SQL/ORM call.
const DB: Record<string, { id: string; phone: string; secret: string; team: 'platform' | 'product' }> = {
  admin: { id: 'admin', phone: '+84-900-000-001', secret: 'TOP-SECRET-ADMIN', team: 'platform' },
  user: { id: 'user', phone: '+84-900-000-002', secret: 'TOP-SECRET-USER', team: 'product' },
}

export type ProfileDTO = {
  name: string
  email: string
  role: Role
  // phone is privacy-gated
  phone: string | null
  // secret is admin-only
  secret: string | null
  team: string
}

// cache() means concurrent callers within the same request share one DB read.
// This is the canonical DAL pattern from the Next.js Data Security guide.
export const getProfileDTO = cache(async (): Promise<ProfileDTO | null> => {
  const session = await getSession()
  if (!session) return null

  const row = DB[session.user.id]
  if (!row) return null

  // Authorization rules live in the DAL, not in the consumer.
  // Phone: visible to self only (everyone is "self" in this mock).
  // Secret: admins only.
  const canSeeSecret = session.user.role === 'admin'

  return {
    name: session.user.name,
    email: session.user.email,
    role: session.user.role,
    phone: row.phone, // would be gated by viewer-vs-target in a real app
    secret: canSeeSecret ? row.secret : null,
    team: row.team,
  }
})
```

- [ ] **Step 2: Profile card (Server Component)**

```tsx
// src/app/lab/auth-rbac/04-dal/_components/ProfileCard.tsx
import { getProfileDTO } from '../_dto'

export async function ProfileCard() {
  const profile = await getProfileDTO()

  if (!profile) {
    return (
      <p className="rounded-md bg-yellow-50 p-3 text-sm text-yellow-800">
        No session. Start one in exercise 01.
      </p>
    )
  }

  return (
    <dl className="rounded-md border bg-white p-4 text-sm">
      <Row label="Name" value={profile.name} />
      <Row label="Email" value={profile.email} />
      <Row label="Role" value={profile.role} />
      <Row label="Team" value={profile.team} />
      <Row label="Phone" value={profile.phone ?? '(redacted)'} />
      <Row label="Secret" value={profile.secret ?? '(redacted — admin only)'} />
    </dl>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b py-1 last:border-0">
      <dt className="text-gray-500">{label}</dt>
      <dd className="font-mono">{value}</dd>
    </div>
  )
}
```

- [ ] **Step 3: Exercise page**

```tsx
// src/app/lab/auth-rbac/04-dal/page.tsx
import { ExerciseLayout } from '@/app/lab/rsc/_components/ExerciseLayout'
import { ProfileCard } from './_components/ProfileCard'

export default function DalExercise() {
  return (
    <ExerciseLayout
      number="04"
      title="Data Access Layer pattern"
      concept="A DAL is a 'server-only' module that owns all data reads and writes. It calls the DB, runs authorization, and returns DTOs — minimal safe shapes. Wrapping with React cache() shares the result across all callers in one request, eliminating the temptation to thread the session through props."
      questions={[
        'Why does a DTO exist instead of returning the raw row?',
        'What does React cache() actually do — memoize per request or globally?',
        'Why does Next.js docs recommend NOT mixing DAL and direct fetch in the same project?',
        'How does the import "server-only" help here, and what error appears if it leaks to a Client Component?',
        'How would you test a DAL function?',
      ]}
    >
      <p className="mb-4 text-sm text-gray-600">
        The card below is rendered by a Server Component that calls{' '}
        <code>getProfileDTO()</code> from the DAL. Sign in as <code>admin</code> to see the secret;
        sign in as <code>user</code> to see it redacted.
      </p>
      <ProfileCard />
    </ExerciseLayout>
  )
}
```

- [ ] **Step 4: Type-check + commit**

```
pnpm exec tsc --noEmit
git add src/app/lab/auth-rbac/04-dal/
git commit -m "feat(lab/auth-rbac): add 04-dal exercise"
```

---

## Task 6: Lint + build verify

- [ ] **Step 1: Lint**

Run `pnpm lint`. Fix any NEW errors introduced under `src/app/lab/auth-rbac/`. Common: replace `"`/`'` in JSX text with `&ldquo;`/`&rdquo;`/`&apos;`. Apply the smallest fix.

- [ ] **Step 2: Commit fixes**

```
git add -A
git status
git commit -m "chore(lab/auth-rbac): fix lint issues"
```

Skip if nothing.

- [ ] **Step 3: Build (best-effort)**

Run `pnpm build`. Report:
- Whether auth-rbac routes compiled (the new index + 4 exercise routes + sub-routes)
- Whether the pre-existing caching-lab SSL failure still blocks prerender (not our issue)
- Any new errors specific to auth-rbac files

The Turbopack "Compiled successfully" message is the proof we need; prerender failures from unrelated labs are fine to acknowledge and skip.

---

## Acceptance Criteria

1. `http://localhost:3000/lab/auth-rbac` lists 4 cards.
2. Each exercise renders and demonstrates its concept:
   - 01: Start session as admin/user; see session details; sign out clears.
   - 02: Layout-guarded and page-guarded both redirect to 01 when no session.
   - 03: Admin block hides for `user`; admin segment redirects with `?reason=forbidden`; action re-checks role.
   - 04: ProfileCard shows secret for admin, redacted for user, nothing for guest.
3. `pnpm exec tsc --noEmit` clean for `src/`.
4. `pnpm lint` clean for new files.
5. No modifications to `src/proxy.ts` or `features/auth/`.
6. `lab-session` cookie is path-scoped to `/lab/auth-rbac` (verify in DevTools → Application → Cookies).

## Out of Scope

- JWT signing / encryption (security note in lab acknowledges the demo gap).
- Real authentication library integration (NextAuth, Clerk, etc.).
- Wiring proxy-based protection (already demonstrated in Routing lab).
- Persistent user store (mock dict is enough).
- Unit tests (spec non-goal).
- Pre-existing caching-lab SSL failure.
