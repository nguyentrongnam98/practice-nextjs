# Data Fetching & Caching Lab — Design

**Date:** 2026-04-16
**Status:** Approved (pending implementation plan)
**Stack:** Next.js 16.2.3 (Cache Components enabled), React 19.2.4, Tailwind v4, TypeScript
**Purpose:** Interview prep — hands-on exercises for Next.js 16 caching model

## Goal

Build 6 practical exercises under `/lab/caching/` that each demonstrate one caching concept using the **new Cache Components model** (`cacheComponents: true`). Each exercise is a standalone route with live demo, concept explanation, and interview questions.

## Prerequisites

- Requires `cacheComponents: true` in `next.config.ts` (Task 0 of implementation plan)
- `dummyjson.com` used as real API for realistic caching behavior
- Reuses `ExerciseLayout` from RSC lab (`src/app/lab/rsc/_components/ExerciseLayout.tsx`)

## Non-Goals

- Unit tests
- Old caching model (fetch options, unstable_cache) — only new `'use cache'` model
- Real database
- Auth guard for lab routes

## Config Change

```ts
// next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  cacheComponents: true,
}

export default nextConfig
```

## Route Map

| # | Route | Concept | Key demonstration |
|---|---|---|---|
| 01 | `/lab/caching/01-use-cache` | `'use cache'` directive | Data-level + UI-level caching. Timestamp proves cache hit on refresh. |
| 02 | `/lab/caching/02-cache-life` | `cacheLife` profiles | 3 sections with `seconds`, `minutes`, `hours` — different TTLs visible via timestamps. |
| 03 | `/lab/caching/03-on-demand` | `cacheTag` + `revalidateTag` | Cached todo list with "Revalidate" button. Refresh shows fresh data after invalidation. |
| 04 | `/lab/caching/04-update-tag` | `updateTag` vs `revalidateTag` | Side-by-side: `updateTag` (instant) vs `revalidateTag` (stale-while-revalidate). |
| 05 | `/lab/caching/05-runtime` | Runtime APIs + cache | Cookie `theme` → cached function. Different theme = different cache entry. |
| 06 | `/lab/caching/06-no-cache` | Streaming uncached data | Cached section (instant) vs uncached section (streaming via Suspense). |

**Index page** `/lab/caching/` lists all exercises with links.

## File Structure

```
src/app/lab/caching/
├── page.tsx                              ← index: exercise list
│
├── 01-use-cache/
│   ├── page.tsx                          ← demo data-level + UI-level
│   └── _components/
│       ├── CachedProducts.tsx            ← 'use cache' component (UI-level)
│       └── ProductList.tsx               ← Client: display timestamp + data
│
├── 02-cache-life/
│   ├── page.tsx                          ← 3 Suspense sections side by side
│   └── _components/
│       ├── ShortLived.tsx                ← cacheLife('seconds')
│       ├── MediumLived.tsx               ← cacheLife('minutes')
│       └── LongLived.tsx                 ← cacheLife('hours')
│
├── 03-on-demand/
│   ├── page.tsx
│   └── _components/
│       ├── CachedTodos.tsx               ← 'use cache' + cacheTag('todos')
│       └── RevalidateButton.tsx          ← Client: calls revalidateTag action
│
├── 04-update-tag/
│   ├── page.tsx
│   └── _components/
│       ├── AddTodoForm.tsx               ← Client: form to "add" todo
│       ├── TodoListA.tsx                 ← cached, invalidated via updateTag
│       └── TodoListB.tsx                 ← cached, invalidated via revalidateTag
│
├── 05-runtime/
│   ├── page.tsx                          ← reads cookie, passes to cached fn
│   └── _components/
│       ├── ThemeToggle.tsx               ← Client: toggle theme cookie
│       └── ThemedContent.tsx             ← 'use cache' receiving theme as arg
│
└── 06-no-cache/
    ├── page.tsx                          ← compares cached vs uncached
    └── _components/
        ├── CachedSection.tsx             ← 'use cache' → instant
        └── FreshSection.tsx              ← no cache → streams every request
```

Also modify:
- `next.config.ts` — add `cacheComponents: true`

## Exercise Details

### 01 — `'use cache'` directive

**Data-level caching:**
```tsx
async function getProducts() {
  'use cache'
  const res = await fetch('https://dummyjson.com/products?limit=5')
  return res.json()
}
```

**UI-level caching:**
```tsx
async function CachedProducts() {
  'use cache'
  const data = await fetch('https://dummyjson.com/products?limit=5')
  const { products } = await data.json()
  return (
    <div>
      <p>Cached at: {new Date().toISOString()}</p>
      {/* render products */}
    </div>
  )
}
```

**ProductList** (Client Component) receives products + timestamp via props. Displays "Fetched at: {timestamp}" — on refresh, timestamp stays the same = proof of cache hit.

Page shows both approaches side by side with explanation of when to use each.

**Interview questions:**
- What does the `'use cache'` directive do?
- What's the difference between data-level and UI-level caching?
- Are `fetch` requests cached by default in Next.js 16?

### 02 — `cacheLife` profiles

Three components fetching `dummyjson.com/quotes/random`, each with different `cacheLife`:

```tsx
// ShortLived.tsx
async function ShortLived() {
  'use cache'
  cacheLife('seconds')  // stale: 0, revalidate: 1s, expire: 60s
  const res = await fetch('https://dummyjson.com/quotes/random')
  const quote = await res.json()
  return <div>"{quote.quote}" — fetched at {new Date().toISOString()}</div>
}
```

MediumLived uses `cacheLife('minutes')`, LongLived uses `cacheLife('hours')`.

Page renders all 3 and instructs: "Refresh the page repeatedly. Watch which timestamps change and which stay the same."

**cacheLife profiles table shown on page:**
| Profile | stale | revalidate | expire |
|---|---|---|---|
| `seconds` | 0 | 1s | 60s |
| `minutes` | 5m | 1m | 1h |
| `hours` | 5m | 1h | 1d |

**Interview questions:**
- What do `stale`, `revalidate`, and `expire` mean in cacheLife?
- When would you use `cacheLife('seconds')` vs `cacheLife('hours')`?
- Can you pass a custom object to cacheLife instead of a profile name?

### 03 — On-demand revalidation (`cacheTag` + `revalidateTag`)

**CachedTodos:**
```tsx
async function CachedTodos() {
  'use cache'
  cacheTag('lab-todos')
  const res = await fetch('https://dummyjson.com/todos?limit=5')
  const { todos } = await res.json()
  return (
    <div>
      <p>Cached at: {new Date().toISOString()}</p>
      <ul>{todos.map(t => <li key={t.id}>{t.todo}</li>)}</ul>
    </div>
  )
}
```

**RevalidateButton** (Client Component) calls Server Action:
```tsx
'use server'
import { revalidateTag } from 'next/cache'
export async function revalidateTodos() {
  revalidateTag('lab-todos')
}
```

Flow: Page shows cached todos with timestamp. Click "Revalidate" → Server Action invalidates tag → refresh page → new timestamp (fresh data).

**Interview questions:**
- How does `cacheTag` differ from the old `next: { tags }` approach?
- What happens when you call `revalidateTag`? Is the next response fresh or stale?
- Can you use the same tag across multiple cached functions?

### 04 — `updateTag` vs `revalidateTag`

Two todo lists side by side, each with its own tag:
- **List A** (`tag: 'lab-todos-a'`): after mutation → `updateTag('lab-todos-a')` → immediate expire
- **List B** (`tag: 'lab-todos-b'`): after mutation → `revalidateTag('lab-todos-b')` → stale-while-revalidate

**AddTodoForm** submits Server Action that "adds" a todo (fake — just invalidates cache so re-fetch gets different random offset), then calls both `updateTag` and `revalidateTag`.

User observes: List A updates immediately, List B may show stale data first then updates on next request.

| | `updateTag` | `revalidateTag` |
|---|---|---|
| Where | Server Actions only | Server Actions + Route Handlers |
| Behavior | Immediately expires cache | Stale-while-revalidate |
| Use case | Read-your-own-writes | Background refresh |

**Interview questions:**
- When would you use `updateTag` over `revalidateTag`?
- What does "read-your-own-writes" mean in the context of caching?
- Can you use `updateTag` in a Route Handler?

### 05 — Runtime APIs + cached functions

Page reads `theme` cookie (Server Component, uses `cookies()`). Passes theme value to cached function:

```tsx
async function getCachedContent(theme: string) {
  'use cache'
  cacheLife('minutes')
  // theme becomes part of cache key automatically
  const res = await fetch(`https://dummyjson.com/quotes/random`)
  return { quote: (await res.json()).quote, theme, cachedAt: new Date().toISOString() }
}
```

**ThemeToggle** (Client Component) calls Server Action to set `theme` cookie (`light`/`dark`).

User observes: switch theme → different cache entry → different quote + timestamp. Switch back → same quote (cache hit for that theme!). Proves: arguments to cached functions become cache keys.

Page wraps the data-reading component in `<Suspense>` because `cookies()` is a runtime API.

**Interview questions:**
- Why can't you use `cookies()` directly inside a `'use cache'` function?
- How do function arguments affect the cache key?
- Why does the component that reads cookies need to be wrapped in Suspense?

### 06 — Streaming uncached data (no cache)

Two sections on same page:

**CachedSection:**
```tsx
async function CachedSection() {
  'use cache'
  cacheLife('hours')
  const res = await fetch('https://dummyjson.com/products/1')
  const product = await res.json()
  return <div>Cached: {product.title} — at {new Date().toISOString()}</div>
}
```

**FreshSection** (NO `'use cache'`):
```tsx
async function FreshSection() {
  const res = await fetch('https://dummyjson.com/products/2')
  const product = await res.json()
  return <div>Fresh: {product.title} — at {new Date().toISOString()}</div>
}
```

Page wraps FreshSection in `<Suspense>` with skeleton. CachedSection renders instantly. FreshSection streams in after fetch completes.

Visual: on refresh, cached section appears instantly (same timestamp), fresh section shows skeleton → then data (new timestamp every time).

**Interview questions:**
- When should you NOT use caching?
- What's the role of Suspense for uncached components?
- What happens if you don't wrap an uncached async component in Suspense?

## Mock Data

All exercises use `dummyjson.com` as real API. No local mock needed — real network latency makes caching behavior visible.

For exercises needing "mutation" (04), fake it by varying the fetch URL (e.g., random offset param) so re-fetch returns different data.

## Implementation Order

1. Config change (cacheComponents: true) + caching index page
2. Exercise 01 (use cache)
3. Exercise 02 (cacheLife)
4. Exercise 03 (on-demand)
5. Exercise 04 (updateTag vs revalidateTag)
6. Exercise 05 (runtime)
7. Exercise 06 (no-cache)
8. Build verification

Detailed task breakdown to be produced by writing-plans skill.
