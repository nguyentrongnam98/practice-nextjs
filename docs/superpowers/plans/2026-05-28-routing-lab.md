# Routing Lab Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build 5 hands-on exercises under `/lab/routing/` covering Intercepting Routes, Route Groups, Dynamic Segments / Catch-All, Route Handlers (API), and Proxy (formerly Middleware) for mid-senior Next.js interview prep.

**Architecture:** Each exercise is an independent subtree under `src/app/lab/routing/NN-name/`. Reuses the existing `ExerciseLayout` from RSC lab. No unit tests for lab pages — verified visually. The Proxy exercise is the only one that adds a project-wide file (`src/proxy.ts`); its `matcher` is scoped to `/lab/routing/05-proxy/*` to avoid affecting other routes.

**Tech Stack:** Next.js 16.2.3, React 19.2.4, TypeScript, Tailwind v4

**Spec:** `docs/superpowers/specs/2026-05-28-nextjs-interview-prep-design.md` (Phase 1, Lab 2)

**Next.js 16 breaking-change note:** Middleware was renamed to **Proxy** in Next.js 16. File is `proxy.ts` (not `middleware.ts`); export `proxy` function or default. Source: `node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md`.

**Verification policy:** After each exercise, type-check with `pnpm exec tsc --noEmit`. Final task runs `pnpm build` and `pnpm lint`. Do NOT run `pnpm dev` from subagents (it would block).

---

## File Structure

| Path | Purpose | Status |
|---|---|---|
| `src/app/lab/routing/page.tsx` | Index listing 5 exercises | NEW |
| `src/app/lab/routing/01-intercept/layout.tsx` | Layout with parallel `@modal` slot | NEW |
| `src/app/lab/routing/01-intercept/default.tsx` | Default fallback for unmatched slot | NEW |
| `src/app/lab/routing/01-intercept/page.tsx` | Photo gallery (Server) | NEW |
| `src/app/lab/routing/01-intercept/_data.ts` | Mock photo list | NEW |
| `src/app/lab/routing/01-intercept/photo/[id]/page.tsx` | Full-page photo view | NEW |
| `src/app/lab/routing/01-intercept/@modal/default.tsx` | Empty modal slot default | NEW |
| `src/app/lab/routing/01-intercept/@modal/(.)photo/[id]/page.tsx` | Intercepted modal view | NEW |
| `src/app/lab/routing/02-groups/page.tsx` | Entry page with links | NEW |
| `src/app/lab/routing/02-groups/(narrow)/layout.tsx` | Narrow group layout (max-w-md) | NEW |
| `src/app/lab/routing/02-groups/(narrow)/narrow/page.tsx` | Resolves to `/lab/routing/02-groups/narrow` | NEW |
| `src/app/lab/routing/02-groups/(wide)/layout.tsx` | Wide group layout (max-w-6xl) | NEW |
| `src/app/lab/routing/02-groups/(wide)/wide/page.tsx` | Resolves to `/lab/routing/02-groups/wide` | NEW |
| `src/app/lab/routing/02-groups/(focused)/layout.tsx` | Focused layout (no chrome) | NEW |
| `src/app/lab/routing/02-groups/(focused)/focused/page.tsx` | Resolves to `/lab/routing/02-groups/focused` | NEW |
| `src/app/lab/routing/03-dynamic/page.tsx` | Intro + links to 3 segment types | NEW |
| `src/app/lab/routing/03-dynamic/single/[id]/page.tsx` | `[id]` demo + generateStaticParams | NEW |
| `src/app/lab/routing/03-dynamic/tag/[...slug]/page.tsx` | `[...slug]` catch-all | NEW |
| `src/app/lab/routing/03-dynamic/docs/[[...path]]/page.tsx` | `[[...path]]` optional catch-all | NEW |
| `src/app/lab/routing/04-handlers/page.tsx` | Page with buttons to call each handler | NEW |
| `src/app/lab/routing/04-handlers/_components/HandlersDemo.tsx` | Client component calling fetch on the handlers | NEW |
| `src/app/lab/routing/04-handlers/api/hello/route.ts` | GET returning JSON | NEW |
| `src/app/lab/routing/04-handlers/api/echo/route.ts` | POST echoes request body | NEW |
| `src/app/lab/routing/04-handlers/api/users/[id]/route.ts` | Dynamic param via RouteContext | NEW |
| `src/app/lab/routing/04-handlers/api/stream/route.ts` | Streaming response via ReadableStream | NEW |
| `src/app/lab/routing/05-proxy/page.tsx` | Demo intro + links | NEW |
| `src/app/lab/routing/05-proxy/original/page.tsx` | Rewrite target | NEW |
| `src/app/lab/routing/05-proxy/protected/page.tsx` | Page guarded by cookie | NEW |
| `src/app/lab/routing/05-proxy/_components/ProxyDemo.tsx` | Client buttons to set/clear cookie | NEW |
| `src/proxy.ts` | Proxy entrypoint, matcher scoped to lab | NEW |

---

## Task 1: Routing lab index page

**Files:**
- Create: `src/app/lab/routing/page.tsx`

- [ ] **Step 1: Create the index**

```tsx
// src/app/lab/routing/page.tsx
import Link from 'next/link'

const EXERCISES = [
  {
    num: '01',
    slug: '01-intercept',
    title: 'Intercepting routes (modal pattern)',
    desc: 'Soft-navigation opens a modal; direct URL shows a full page. Uses (.) interceptor + @modal parallel slot.',
  },
  {
    num: '02',
    slug: '02-groups',
    title: 'Route Groups with separate layouts',
    desc: 'Three (group) folders, three different layouts, all sharing the same parent URL prefix.',
  },
  {
    num: '03',
    slug: '03-dynamic',
    title: 'Dynamic & catch-all segments',
    desc: '[id], [...slug], [[...path]] — plus generateStaticParams for prerender.',
  },
  {
    num: '04',
    slug: '04-handlers',
    title: 'Route Handlers (API)',
    desc: 'GET JSON, POST echo, dynamic param, and a streaming ReadableStream response.',
  },
  {
    num: '05',
    slug: '05-proxy',
    title: 'Proxy (formerly Middleware)',
    desc: 'Header injection, rewrite, and cookie-based redirect — using the Next.js 16 proxy.ts file.',
  },
]

export default function RoutingLabIndex() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Routing Lab</h1>
      <p className="mt-1 text-sm text-gray-500">5 exercises on advanced App Router patterns</p>
      <div className="mt-6 space-y-3">
        {EXERCISES.map((ex) => (
          <Link
            key={ex.slug}
            href={`/lab/routing/${ex.slug}`}
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

- [ ] **Step 2: Type-check**

Run: `pnpm exec tsc --noEmit`
Expected: no errors in `src/` (errors in `.next/dev/types/*` are OK).

- [ ] **Step 3: Commit**

```
git add src/app/lab/routing/page.tsx
git commit -m "feat(lab): add routing lab index page"
```

---

## Task 2: Exercise 01 — Intercepting routes (modal pattern)

**Concept:** Combine parallel routes (`@modal`) with the `(.)` intercept marker. A soft navigation (clicking a `<Link>` from the gallery) routes to the intercepted page rendered inside the `@modal` slot — overlay on top of the gallery. A direct URL or hard refresh skips the intercept and renders the full page at `/photo/[id]`.

**Files:**
- Create: `src/app/lab/routing/01-intercept/_data.ts`
- Create: `src/app/lab/routing/01-intercept/layout.tsx`
- Create: `src/app/lab/routing/01-intercept/default.tsx`
- Create: `src/app/lab/routing/01-intercept/page.tsx`
- Create: `src/app/lab/routing/01-intercept/photo/[id]/page.tsx`
- Create: `src/app/lab/routing/01-intercept/@modal/default.tsx`
- Create: `src/app/lab/routing/01-intercept/@modal/(.)photo/[id]/page.tsx`

- [ ] **Step 1: Create the mock data**

```ts
// src/app/lab/routing/01-intercept/_data.ts
export type Photo = { id: string; title: string; color: string }

export const PHOTOS: Photo[] = [
  { id: '1', title: 'Sunset over Hà Long', color: 'from-orange-400 to-pink-500' },
  { id: '2', title: 'Mountain trail', color: 'from-emerald-400 to-teal-600' },
  { id: '3', title: 'Ocean morning', color: 'from-sky-400 to-blue-600' },
  { id: '4', title: 'Forest path', color: 'from-lime-400 to-green-700' },
  { id: '5', title: 'Desert dunes', color: 'from-amber-300 to-yellow-600' },
  { id: '6', title: 'Night sky', color: 'from-indigo-700 to-purple-900' },
]

export function getPhoto(id: string): Photo | null {
  return PHOTOS.find((p) => p.id === id) ?? null
}
```

- [ ] **Step 2: Create the layout with parallel `@modal` slot**

```tsx
// src/app/lab/routing/01-intercept/layout.tsx
import { ExerciseLayout } from '@/app/lab/rsc/_components/ExerciseLayout'

export default function InterceptLayout({
  children,
  modal,
}: {
  children: React.ReactNode
  modal: React.ReactNode
}) {
  return (
    <ExerciseLayout
      number="01"
      title="Intercepting routes (modal pattern)"
      concept="The (.) marker before a route segment intercepts a navigation from the same level. Combined with a parallel @modal slot, a click-through opens an overlay while preserving the underlying page. A direct URL or refresh skips the intercept and renders the full page."
      questions={[
        'What is the difference between (.), (..), and (...) interceptors?',
        'Why does an intercepting route need a parallel slot to render the overlay?',
        'What happens to the modal when the user hits browser back?',
        'How does Next.js decide whether to use the intercepted route or the full page?',
        'Where do you put a default.tsx for an unmatched parallel slot, and why?',
      ]}
    >
      {children}
      {modal}
    </ExerciseLayout>
  )
}
```

- [ ] **Step 3: Create the route-segment default**

```tsx
// src/app/lab/routing/01-intercept/default.tsx
export default function Default() {
  return null
}
```

- [ ] **Step 4: Create the gallery page**

```tsx
// src/app/lab/routing/01-intercept/page.tsx
import Link from 'next/link'
import { PHOTOS } from './_data'

export default function Gallery() {
  return (
    <div>
      <p className="mb-4 text-sm text-gray-600">
        Click a tile — it opens as a modal (soft navigation). Open the same URL in a new tab — it shows
        the full page. Try browser back/forward.
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {PHOTOS.map((p) => (
          <Link
            key={p.id}
            href={`/lab/routing/01-intercept/photo/${p.id}`}
            className={`h-32 rounded-lg bg-gradient-to-br ${p.color} p-3 text-white shadow transition-transform hover:scale-[1.02]`}
          >
            <span className="text-xs opacity-80">#{p.id}</span>
            <p className="mt-6 text-sm font-medium">{p.title}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Create the full-page route**

```tsx
// src/app/lab/routing/01-intercept/photo/[id]/page.tsx
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPhoto } from '../../_data'

type Params = Promise<{ id: string }>

export default async function FullPhoto({ params }: { params: Params }) {
  const { id } = await params
  const photo = getPhoto(id)
  if (!photo) notFound()

  return (
    <div>
      <Link href="/lab/routing/01-intercept" className="text-sm text-blue-600 hover:underline">
        ← Back to gallery
      </Link>
      <div className={`mt-4 h-64 rounded-lg bg-gradient-to-br ${photo.color} p-6 text-white shadow`}>
        <span className="text-xs opacity-80">#{photo.id}</span>
        <h2 className="mt-12 text-2xl font-bold">{photo.title}</h2>
      </div>
      <p className="mt-3 text-sm text-gray-500">
        This is the FULL PAGE view. You see this when you navigate directly (refresh, paste URL).
      </p>
    </div>
  )
}
```

- [ ] **Step 6: Create the modal slot default**

```tsx
// src/app/lab/routing/01-intercept/@modal/default.tsx
export default function ModalDefault() {
  return null
}
```

- [ ] **Step 7: Create the intercepted modal page**

```tsx
// src/app/lab/routing/01-intercept/@modal/(.)photo/[id]/page.tsx
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPhoto } from '../../../_data'

type Params = Promise<{ id: string }>

export default async function PhotoModal({ params }: { params: Params }) {
  const { id } = await params
  const photo = getPhoto(id)
  if (!photo) notFound()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-lg bg-white shadow-xl">
        <div className={`h-48 rounded-t-lg bg-gradient-to-br ${photo.color} p-4 text-white`}>
          <span className="text-xs opacity-80">#{photo.id}</span>
          <h2 className="mt-12 text-xl font-bold">{photo.title}</h2>
        </div>
        <div className="flex justify-between p-4">
          <span className="text-xs text-gray-500">
            This is the INTERCEPTED MODAL — soft navigation.
          </span>
          <Link
            href="/lab/routing/01-intercept"
            className="text-sm text-blue-600 hover:underline"
          >
            Close
          </Link>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 8: Type-check + commit**

```
pnpm exec tsc --noEmit
git add src/app/lab/routing/01-intercept/
git commit -m "feat(lab/routing): add 01-intercept exercise"
```

---

## Task 3: Exercise 02 — Route Groups with separate layouts

**Concept:** A folder wrapped in parentheses `(name)` does NOT appear in the URL. Use route groups to split the file tree by feature/concern, give each group its own `layout.tsx`, and produce different layouts under the same URL prefix.

**Files:**
- Create: `src/app/lab/routing/02-groups/page.tsx`
- Create: `src/app/lab/routing/02-groups/(narrow)/layout.tsx`
- Create: `src/app/lab/routing/02-groups/(narrow)/narrow/page.tsx`
- Create: `src/app/lab/routing/02-groups/(wide)/layout.tsx`
- Create: `src/app/lab/routing/02-groups/(wide)/wide/page.tsx`
- Create: `src/app/lab/routing/02-groups/(focused)/layout.tsx`
- Create: `src/app/lab/routing/02-groups/(focused)/focused/page.tsx`

- [ ] **Step 1: Intro page**

```tsx
// src/app/lab/routing/02-groups/page.tsx
import Link from 'next/link'
import { ExerciseLayout } from '@/app/lab/rsc/_components/ExerciseLayout'

export default function GroupsIntro() {
  return (
    <ExerciseLayout
      number="02"
      title="Route Groups with separate layouts"
      concept="A folder named (name) is a route group — it does not appear in the URL. Each group can have its own layout.tsx, so siblings under the same parent can have completely different chrome."
      questions={[
        'Do route groups affect URL structure?',
        'When would you use a route group instead of a regular folder?',
        'Can two route groups at the same level both contain a page.tsx with the same name?',
        'What happens to the global root layout when a group has its own layout?',
        'How do route groups interact with parallel routes?',
      ]}
    >
      <p className="mb-3 text-sm text-gray-600">
        Three pages, three layouts, no extra URL segments. Open each and notice the layout change.
      </p>
      <ul className="space-y-2 text-sm">
        <li>
          <Link className="text-blue-600 hover:underline" href="/lab/routing/02-groups/narrow">
            /lab/routing/02-groups/narrow
          </Link>{' '}
          → narrow column from `(narrow)` group
        </li>
        <li>
          <Link className="text-blue-600 hover:underline" href="/lab/routing/02-groups/wide">
            /lab/routing/02-groups/wide
          </Link>{' '}
          → full-width from `(wide)` group
        </li>
        <li>
          <Link className="text-blue-600 hover:underline" href="/lab/routing/02-groups/focused">
            /lab/routing/02-groups/focused
          </Link>{' '}
          → no chrome from `(focused)` group
        </li>
      </ul>
    </ExerciseLayout>
  )
}
```

- [ ] **Step 2: Narrow group layout + page**

```tsx
// src/app/lab/routing/02-groups/(narrow)/layout.tsx
import Link from 'next/link'

export default function NarrowLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-md">
      <Link href="/lab/routing/02-groups" className="text-sm text-blue-600 hover:underline">
        ← Back
      </Link>
      <div className="mt-2 rounded-lg border-2 border-blue-300 bg-blue-50 p-3 text-xs text-blue-800">
        I am the <strong>(narrow)</strong> group layout. max-w-md.
      </div>
      <div className="mt-3">{children}</div>
    </div>
  )
}
```

```tsx
// src/app/lab/routing/02-groups/(narrow)/narrow/page.tsx
export default function NarrowPage() {
  return (
    <div className="rounded-md border bg-white p-3 text-sm">
      Content of <code>/lab/routing/02-groups/narrow</code>. Lives in the <code>(narrow)</code> group.
    </div>
  )
}
```

- [ ] **Step 3: Wide group layout + page**

```tsx
// src/app/lab/routing/02-groups/(wide)/layout.tsx
import Link from 'next/link'

export default function WideLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-6xl">
      <Link href="/lab/routing/02-groups" className="text-sm text-blue-600 hover:underline">
        ← Back
      </Link>
      <div className="mt-2 rounded-lg border-2 border-emerald-300 bg-emerald-50 p-3 text-xs text-emerald-800">
        I am the <strong>(wide)</strong> group layout. max-w-6xl.
      </div>
      <div className="mt-3">{children}</div>
    </div>
  )
}
```

```tsx
// src/app/lab/routing/02-groups/(wide)/wide/page.tsx
export default function WidePage() {
  return (
    <div className="rounded-md border bg-white p-3 text-sm">
      Content of <code>/lab/routing/02-groups/wide</code>. Lives in the <code>(wide)</code> group — same
      URL prefix but completely different layout chrome.
    </div>
  )
}
```

- [ ] **Step 4: Focused group layout + page**

```tsx
// src/app/lab/routing/02-groups/(focused)/layout.tsx
import Link from 'next/link'

export default function FocusedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/lab/routing/02-groups" className="text-xs text-gray-400 hover:underline">
        × close
      </Link>
      <div className="mt-3 rounded-lg border-2 border-gray-300 bg-white p-6 shadow-lg">
        {children}
      </div>
    </div>
  )
}
```

```tsx
// src/app/lab/routing/02-groups/(focused)/focused/page.tsx
export default function FocusedPage() {
  return (
    <div className="text-sm">
      <h3 className="text-base font-semibold">Focused mode</h3>
      <p className="mt-2 text-gray-600">
        The <code>(focused)</code> layout strips out the back link / coloured banner and shows just a
        white card. Useful for "wizard" or "blocking" UIs sharing the same URL parent as the chromed
        siblings.
      </p>
    </div>
  )
}
```

- [ ] **Step 5: Type-check + commit**

```
pnpm exec tsc --noEmit
git add src/app/lab/routing/02-groups/
git commit -m "feat(lab/routing): add 02-groups exercise"
```

---

## Task 4: Exercise 03 — Dynamic & catch-all segments

**Concept:** `[id]` matches a single segment. `[...slug]` matches one or more segments (catch-all). `[[...slug]]` matches zero or more segments (optional catch-all). `generateStaticParams` lets you prerender selected param combinations at build time.

**Files:**
- Create: `src/app/lab/routing/03-dynamic/page.tsx`
- Create: `src/app/lab/routing/03-dynamic/single/[id]/page.tsx`
- Create: `src/app/lab/routing/03-dynamic/tag/[...slug]/page.tsx`
- Create: `src/app/lab/routing/03-dynamic/docs/[[...path]]/page.tsx`

- [ ] **Step 1: Intro page**

```tsx
// src/app/lab/routing/03-dynamic/page.tsx
import Link from 'next/link'
import { ExerciseLayout } from '@/app/lab/rsc/_components/ExerciseLayout'

export default function DynamicIntro() {
  return (
    <ExerciseLayout
      number="03"
      title="Dynamic & catch-all segments"
      concept="Square brackets in folder names declare dynamic params. [id] is single; [...slug] is required catch-all; [[...slug]] is optional catch-all (also matches the parent URL). Combine with generateStaticParams to prerender."
      questions={[
        'What is the difference between [...slug] and [[...slug]]?',
        'When does Next.js generate static pages from generateStaticParams?',
        'Can you have multiple dynamic segments in one path like /[category]/[id]?',
        'What does params look like for a 3-segment catch-all match?',
        'What happens if the user visits a param value not returned by generateStaticParams?',
      ]}
    >
      <ul className="space-y-2 text-sm">
        <li>
          <Link className="text-blue-600 hover:underline" href="/lab/routing/03-dynamic/single/42">
            /lab/routing/03-dynamic/single/42
          </Link>{' '}
          — single segment
        </li>
        <li>
          <Link
            className="text-blue-600 hover:underline"
            href="/lab/routing/03-dynamic/tag/nextjs/server-components/streaming"
          >
            /lab/routing/03-dynamic/tag/nextjs/server-components/streaming
          </Link>{' '}
          — catch-all (3 segments)
        </li>
        <li>
          <Link className="text-blue-600 hover:underline" href="/lab/routing/03-dynamic/docs">
            /lab/routing/03-dynamic/docs
          </Link>{' '}
          — optional catch-all (zero segments)
        </li>
        <li>
          <Link className="text-blue-600 hover:underline" href="/lab/routing/03-dynamic/docs/api/cache">
            /lab/routing/03-dynamic/docs/api/cache
          </Link>{' '}
          — optional catch-all (2 segments)
        </li>
      </ul>
    </ExerciseLayout>
  )
}
```

- [ ] **Step 2: Single segment with generateStaticParams**

```tsx
// src/app/lab/routing/03-dynamic/single/[id]/page.tsx
type Params = Promise<{ id: string }>

export async function generateStaticParams() {
  return [{ id: '1' }, { id: '2' }, { id: '42' }]
}

export default async function SingleSegment({ params }: { params: Params }) {
  const { id } = await params
  const wasPrerendered = ['1', '2', '42'].includes(id)
  return (
    <div className="space-y-2">
      <p className="text-sm">
        <strong>Segment value:</strong> <code>{id}</code>
      </p>
      <p className="text-sm text-gray-600">
        {wasPrerendered
          ? '✓ This id was in generateStaticParams — prerendered at build.'
          : '⚠ This id was NOT in generateStaticParams — rendered on demand.'}
      </p>
    </div>
  )
}
```

- [ ] **Step 3: Required catch-all**

```tsx
// src/app/lab/routing/03-dynamic/tag/[...slug]/page.tsx
type Params = Promise<{ slug: string[] }>

export default async function CatchAll({ params }: { params: Params }) {
  const { slug } = await params
  return (
    <div className="space-y-2">
      <p className="text-sm">
        <strong>Segments captured:</strong>
      </p>
      <ol className="ml-6 list-decimal text-sm">
        {slug.map((s, i) => (
          <li key={i}>
            <code>{s}</code>
          </li>
        ))}
      </ol>
      <p className="mt-3 text-xs text-gray-500">
        Try removing trailing segments from the URL — note: <code>/tag</code> alone will 404 because
        catch-all requires at least one segment.
      </p>
    </div>
  )
}
```

- [ ] **Step 4: Optional catch-all**

```tsx
// src/app/lab/routing/03-dynamic/docs/[[...path]]/page.tsx
type Params = Promise<{ path?: string[] }>

export default async function OptionalCatchAll({ params }: { params: Params }) {
  const { path } = await params
  return (
    <div className="space-y-2">
      <p className="text-sm">
        <strong>Path segments:</strong> {path ? `[${path.join(', ')}]` : '(none)'}
      </p>
      <p className="text-sm text-gray-600">
        {!path && 'Zero segments → renders parent URL /docs.'}
        {path && `Captured ${path.length} segments.`}
      </p>
    </div>
  )
}
```

- [ ] **Step 5: Type-check + commit**

```
pnpm exec tsc --noEmit
git add src/app/lab/routing/03-dynamic/
git commit -m "feat(lab/routing): add 03-dynamic exercise"
```

---

## Task 5: Exercise 04 — Route Handlers

**Concept:** A `route.ts` file exports named HTTP-method functions (`GET`, `POST`, etc.) returning a `Response`. Cannot coexist with `page.tsx` in the same segment. In Next.js 16 typed routes, dynamic params use `ctx: RouteContext<'/path/[id]'>` with `await ctx.params`.

**Files:**
- Create: `src/app/lab/routing/04-handlers/api/hello/route.ts`
- Create: `src/app/lab/routing/04-handlers/api/echo/route.ts`
- Create: `src/app/lab/routing/04-handlers/api/users/[id]/route.ts`
- Create: `src/app/lab/routing/04-handlers/api/stream/route.ts`
- Create: `src/app/lab/routing/04-handlers/_components/HandlersDemo.tsx`
- Create: `src/app/lab/routing/04-handlers/page.tsx`

- [ ] **Step 1: GET JSON**

```ts
// src/app/lab/routing/04-handlers/api/hello/route.ts
export async function GET() {
  return Response.json({
    message: 'Hello from a Route Handler!',
    at: new Date().toISOString(),
  })
}
```

- [ ] **Step 2: POST echo**

```ts
// src/app/lab/routing/04-handlers/api/echo/route.ts
import type { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  const contentType = request.headers.get('content-type') ?? ''
  const body =
    contentType.includes('application/json')
      ? await request.json()
      : await request.text()

  return Response.json({
    method: 'POST',
    contentType,
    received: body,
    receivedAt: new Date().toISOString(),
  })
}
```

- [ ] **Step 3: Dynamic param**

```ts
// src/app/lab/routing/04-handlers/api/users/[id]/route.ts
import type { NextRequest } from 'next/server'

const USERS: Record<string, { id: string; name: string }> = {
  '1': { id: '1', name: 'Hùng' },
  '2': { id: '2', name: 'Alice' },
  '3': { id: '3', name: 'Bob' },
}

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params
  const user = USERS[id]
  if (!user) {
    return Response.json({ error: 'Not found' }, { status: 404 })
  }
  return Response.json(user)
}
```

> Note: We use an inline `params` type rather than the global `RouteContext<...>` helper to keep this exercise independent of dev-server typegen. Both styles work in Next.js 16.

- [ ] **Step 4: Streaming response**

```ts
// src/app/lab/routing/04-handlers/api/stream/route.ts
export async function GET() {
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      for (let i = 1; i <= 5; i++) {
        controller.enqueue(encoder.encode(`chunk ${i} at ${new Date().toISOString()}\n`))
        await new Promise((r) => setTimeout(r, 500))
      }
      controller.close()
    },
  })

  return new Response(stream, {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'no-store',
    },
  })
}
```

- [ ] **Step 5: Client demo component**

```tsx
// src/app/lab/routing/04-handlers/_components/HandlersDemo.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/shared/components/ui'

const ENDPOINTS = {
  hello: '/lab/routing/04-handlers/api/hello',
  echo: '/lab/routing/04-handlers/api/echo',
  user: (id: string) => `/lab/routing/04-handlers/api/users/${id}`,
  stream: '/lab/routing/04-handlers/api/stream',
} as const

export function HandlersDemo() {
  const [out, setOut] = useState<string>('')
  const [busy, setBusy] = useState(false)

  async function run(fn: () => Promise<string>) {
    setBusy(true)
    try {
      setOut(await fn())
    } catch (e) {
      setOut(`Error: ${(e as Error).message}`)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          onClick={() =>
            run(async () => {
              const r = await fetch(ENDPOINTS.hello)
              return JSON.stringify(await r.json(), null, 2)
            })
          }
          disabled={busy}
        >
          GET /hello
        </Button>
        <Button
          type="button"
          onClick={() =>
            run(async () => {
              const r = await fetch(ENDPOINTS.echo, {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ greeting: 'xin chào', when: Date.now() }),
              })
              return JSON.stringify(await r.json(), null, 2)
            })
          }
          disabled={busy}
        >
          POST /echo (JSON)
        </Button>
        <Button
          type="button"
          onClick={() =>
            run(async () => {
              const r = await fetch(ENDPOINTS.user('2'))
              return `${r.status} ${r.statusText}\n${JSON.stringify(await r.json(), null, 2)}`
            })
          }
          disabled={busy}
        >
          GET /users/2
        </Button>
        <Button
          type="button"
          onClick={() =>
            run(async () => {
              const r = await fetch(ENDPOINTS.user('999'))
              return `${r.status} ${r.statusText}\n${JSON.stringify(await r.json(), null, 2)}`
            })
          }
          disabled={busy}
        >
          GET /users/999 (404)
        </Button>
        <Button
          type="button"
          onClick={() =>
            run(async () => {
              const r = await fetch(ENDPOINTS.stream)
              const reader = r.body!.getReader()
              const decoder = new TextDecoder()
              let acc = ''
              while (true) {
                const { done, value } = await reader.read()
                if (done) break
                acc += decoder.decode(value)
                setOut(acc) // live update
              }
              return acc
            })
          }
          disabled={busy}
        >
          GET /stream (live)
        </Button>
      </div>
      <pre className="overflow-x-auto rounded-md bg-gray-900 p-3 text-xs text-green-200">
        {out || '↑ click a button'}
      </pre>
    </div>
  )
}
```

- [ ] **Step 6: Exercise page**

```tsx
// src/app/lab/routing/04-handlers/page.tsx
import { ExerciseLayout } from '@/app/lab/rsc/_components/ExerciseLayout'
import { HandlersDemo } from './_components/HandlersDemo'

export default function HandlersExercise() {
  return (
    <ExerciseLayout
      number="04"
      title="Route Handlers (API)"
      concept="A route.ts file exports HTTP-method functions (GET, POST, …) and returns a Response. Dynamic params come from the ctx.params Promise. Cannot coexist with page.tsx in the same segment."
      questions={[
        'Why does Next.js disallow route.ts and page.ts in the same folder?',
        'How do you make a Route Handler cacheable in the new Cache Components model?',
        'What is the difference between Request and NextRequest?',
        'How do you stream a response from a Route Handler?',
        'Why are params returned as a Promise in Next.js 16?',
      ]}
    >
      <p className="mb-4 text-sm text-gray-600">
        Click each button to call the corresponding Route Handler. Watch the output panel. The streaming
        endpoint updates the panel line-by-line as chunks arrive (~500 ms apart).
      </p>
      <HandlersDemo />
    </ExerciseLayout>
  )
}
```

- [ ] **Step 7: Type-check + commit**

```
pnpm exec tsc --noEmit
git add src/app/lab/routing/04-handlers/
git commit -m "feat(lab/routing): add 04-handlers exercise"
```

---

## Task 6: Exercise 05 — Proxy (formerly Middleware)

**Concept:** Next.js 16 renamed Middleware to Proxy. File is `src/proxy.ts` (project root or `src/`). Exports a `proxy` function (named or default) returning a `NextResponse`. `config.matcher` filters which paths invoke it. Use cases: header injection, rewrite, redirect, cookie-based access control.

> **Critical scoping:** This is the only file in the whole project — its matcher must NOT match anything outside `/lab/routing/05-proxy/*`.

**Files:**
- Create: `src/proxy.ts`
- Create: `src/app/lab/routing/05-proxy/page.tsx`
- Create: `src/app/lab/routing/05-proxy/original/page.tsx`
- Create: `src/app/lab/routing/05-proxy/protected/page.tsx`
- Create: `src/app/lab/routing/05-proxy/_components/ProxyDemo.tsx`

- [ ] **Step 1: Create the proxy**

```ts
// src/proxy.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const LAB_PREFIX = '/lab/routing/05-proxy'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 1. Rewrite: /lab/routing/05-proxy/rewrite → /lab/routing/05-proxy/original (URL stays)
  if (pathname === `${LAB_PREFIX}/rewrite`) {
    const url = request.nextUrl.clone()
    url.pathname = `${LAB_PREFIX}/original`
    return NextResponse.rewrite(url)
  }

  // 2. Redirect-if-not-authed: protected page requires a 'lab-auth' cookie
  if (pathname === `${LAB_PREFIX}/protected`) {
    const authed = request.cookies.get('lab-auth')?.value === '1'
    if (!authed) {
      const url = request.nextUrl.clone()
      url.pathname = LAB_PREFIX
      url.searchParams.set('reason', 'login-required')
      return NextResponse.redirect(url)
    }
  }

  // 3. Header injection: all paths under the lab get x-lab-proxy: 1
  const res = NextResponse.next()
  res.headers.set('x-lab-proxy', '1')
  return res
}

export const config = {
  matcher: ['/lab/routing/05-proxy/:path*'],
}
```

- [ ] **Step 2: Create the demo page (intro + reason banner)**

```tsx
// src/app/lab/routing/05-proxy/page.tsx
import { ExerciseLayout } from '@/app/lab/rsc/_components/ExerciseLayout'
import { ProxyDemo } from './_components/ProxyDemo'

type SearchParams = Promise<{ reason?: string }>

export default async function ProxyIntro({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const { reason } = await searchParams
  return (
    <ExerciseLayout
      number="05"
      title="Proxy (formerly Middleware)"
      concept="Next.js 16 renamed Middleware to Proxy. The file is proxy.ts at project root or src/. The exported proxy function runs before the response and can rewrite, redirect, or inject headers. matcher in config scopes which paths trigger it."
      questions={[
        'What is the difference between rewrite and redirect?',
        'Why was Middleware renamed to Proxy in Next.js 16? Did the API change?',
        'How does the matcher config affect performance?',
        'Can you read or write cookies from inside proxy.ts?',
        'Why is proxy.ts not a good place for full session/authorization logic?',
      ]}
    >
      {reason === 'login-required' && (
        <div className="mb-4 rounded-md bg-yellow-50 p-3 text-sm text-yellow-800">
          ⚠ You were redirected here because the protected page needs the <code>lab-auth=1</code> cookie.
        </div>
      )}
      <ProxyDemo />
    </ExerciseLayout>
  )
}
```

- [ ] **Step 3: Create the rewrite target**

```tsx
// src/app/lab/routing/05-proxy/original/page.tsx
export default function OriginalPage() {
  return (
    <div className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-800">
      ✓ This is <code>/original</code>. If you arrived via <code>/rewrite</code>, the URL bar still says
      <code> /rewrite</code> — that's a Proxy rewrite in action.
    </div>
  )
}
```

- [ ] **Step 4: Create the protected target**

```tsx
// src/app/lab/routing/05-proxy/protected/page.tsx
export default function ProtectedPage() {
  return (
    <div className="rounded-md bg-blue-50 p-3 text-sm text-blue-800">
      ✓ Welcome to the protected page. The proxy let you through because the <code>lab-auth=1</code> cookie
      is set.
    </div>
  )
}
```

- [ ] **Step 5: Create the client demo (cookie toggle + links)**

```tsx
// src/app/lab/routing/05-proxy/_components/ProxyDemo.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/shared/components/ui'

export function ProxyDemo() {
  const [authed, setAuthed] = useState(false)
  const [headers, setHeaders] = useState<string | null>(null)

  useEffect(() => {
    setAuthed(document.cookie.split('; ').some((c) => c.startsWith('lab-auth=1')))
  }, [])

  function setCookie() {
    document.cookie = 'lab-auth=1; path=/lab/routing/05-proxy; max-age=3600'
    setAuthed(true)
  }

  function clearCookie() {
    document.cookie = 'lab-auth=; path=/lab/routing/05-proxy; max-age=0'
    setAuthed(false)
  }

  async function inspectHeaders() {
    // Use the rewrite target so we exercise the proxy. The handler doesn't exist here —
    // we just want the response headers, so any 404 page also has x-lab-proxy.
    const r = await fetch('/lab/routing/05-proxy/', { cache: 'no-store' })
    const value = r.headers.get('x-lab-proxy')
    setHeaders(value ? `x-lab-proxy: ${value}` : '(header not set — proxy did not run)')
  }

  return (
    <div className="space-y-4">
      <section className="space-y-2">
        <h3 className="text-sm font-semibold">1. Rewrite</h3>
        <p className="text-xs text-gray-600">
          The proxy rewrites <code>/rewrite</code> to <code>/original</code>. URL stays as
          <code> /rewrite</code>, but content from <code>/original</code> shows.
        </p>
        <Link
          href="/lab/routing/05-proxy/rewrite"
          className="inline-block rounded-md border px-3 py-1 text-sm text-blue-600 hover:underline"
        >
          Visit /rewrite
        </Link>
      </section>

      <section className="space-y-2">
        <h3 className="text-sm font-semibold">2. Cookie-gated redirect</h3>
        <p className="text-xs text-gray-600">
          The proxy redirects to here with a <code>?reason</code> banner if the <code>lab-auth</code>
          cookie isn't set.
        </p>
        <div className="flex gap-2">
          {authed ? (
            <Button type="button" onClick={clearCookie}>
              Clear lab-auth cookie
            </Button>
          ) : (
            <Button type="button" onClick={setCookie}>
              Set lab-auth=1
            </Button>
          )}
          <Link
            href="/lab/routing/05-proxy/protected"
            className="rounded-md border px-3 py-1 text-sm text-blue-600 hover:underline"
          >
            Visit /protected
          </Link>
        </div>
        <p className="text-xs text-gray-500">
          Current cookie state: <strong>{authed ? 'lab-auth=1' : '(not set)'}</strong>
        </p>
      </section>

      <section className="space-y-2">
        <h3 className="text-sm font-semibold">3. Header injection</h3>
        <p className="text-xs text-gray-600">
          The proxy adds <code>x-lab-proxy: 1</code> to every response under this URL prefix.
        </p>
        <Button type="button" onClick={inspectHeaders}>
          Inspect headers
        </Button>
        {headers && <p className="text-xs font-mono text-gray-700">{headers}</p>}
      </section>
    </div>
  )
}
```

- [ ] **Step 6: Type-check + commit**

```
pnpm exec tsc --noEmit
git add src/proxy.ts src/app/lab/routing/05-proxy/
git commit -m "feat(lab/routing): add 05-proxy exercise + src/proxy.ts"
```

---

## Task 7: Final build verification

- [ ] **Step 1: Build**

Run: `pnpm build`

Expected: build succeeds and lists the new routes under `/lab/routing/`. The pre-existing caching-lab SSL failure (from a previous task) is unrelated; if the build still exits non-zero only because of caching-lab SSL, document it and DO NOT fix it as part of this task. If the build fails specifically inside `/lab/routing/*`, that's our bug — investigate and report.

- [ ] **Step 2: Lint**

Run: `pnpm lint`. Fix any new errors introduced under `src/app/lab/routing/` or `src/proxy.ts`. Common fix: escape `"` inside JSX text using `&ldquo;`/`&rdquo;` or `&quot;`.

- [ ] **Step 3: Commit fixes if any**

```
git add -A
git status
git commit -m "chore(lab/routing): fix lint issues"
```

Skip if nothing to fix.

---

## Acceptance Criteria

1. `pnpm dev` (run manually after subagents finish) and `http://localhost:3000/lab/routing` shows 5 exercise cards.
2. Each exercise route renders and demonstrates its concept:
   - 01: Click tile → modal overlay. Refresh on the URL → full page.
   - 02: Three URLs share `/lab/routing/02-groups/*` parent but show three different layouts.
   - 03: Single, catch-all, optional catch-all all render with their captured params.
   - 04: Each handler button returns expected response; streaming endpoint shows incremental output.
   - 05: Rewrite changes content not URL; cookie toggle gates the protected page; inspect-headers shows `x-lab-proxy: 1`.
3. `pnpm exec tsc --noEmit` clean for `src/`.
4. `pnpm lint` clean for new files.
5. `src/proxy.ts` matcher does NOT affect routes outside `/lab/routing/05-proxy/*`.

## Out of Scope

- Unit tests (spec non-goal for labs).
- E2E tests (covered in Lab 6 later).
- Real authentication — proxy uses a cookie only as a guarded-route demo.
- Responsive styling beyond Tailwind defaults.
- Pre-existing build failure in caching lab — separate fix.
