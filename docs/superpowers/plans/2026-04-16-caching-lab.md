# Caching Lab Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build 6 hands-on exercises under `/lab/caching/` covering Next.js 16 Cache Components model for senior interview prep.

**Architecture:** Enable `cacheComponents: true` in `next.config.ts`, then build each exercise as an independent route. Reuses `ExerciseLayout` from the RSC lab. All exercises use `dummyjson.com` as real API. No unit tests — verified visually in browser.

**Tech Stack:** Next.js 16.2.3 (Cache Components), React 19.2.4, TypeScript, Tailwind v4

**Spec:** `docs/superpowers/specs/2026-04-16-caching-lab-design.md`

**Important API notes (Next.js 16):**
- `revalidateTag(tag, profile)` now **requires** a second argument. `revalidateTag('tag')` alone is deprecated. Use `revalidateTag('tag', 'max')` for stale-while-revalidate.
- `updateTag(tag)` — Server Actions only. Immediate expire (read-your-own-writes).
- `cacheTag(tag)` — must be inside a `'use cache'` scope.
- `cacheLife(profile)` — must be inside a `'use cache'` scope. Profiles: `'seconds'`, `'minutes'`, `'hours'`, `'days'`, `'weeks'`, `'max'`.

---

## File Structure

| Path | Purpose | Status |
|---|---|---|
| `next.config.ts` | Add `cacheComponents: true` | MODIFY |
| `src/app/lab/caching/page.tsx` | Index page listing all 6 exercises | NEW |
| `src/app/lab/caching/01-use-cache/page.tsx` | Exercise page | NEW |
| `src/app/lab/caching/01-use-cache/_components/CachedProducts.tsx` | UI-level cache | NEW |
| `src/app/lab/caching/01-use-cache/_components/ProductList.tsx` | Client: display + timestamp | NEW |
| `src/app/lab/caching/02-cache-life/page.tsx` | Exercise page | NEW |
| `src/app/lab/caching/02-cache-life/_components/ShortLived.tsx` | cacheLife('seconds') | NEW |
| `src/app/lab/caching/02-cache-life/_components/MediumLived.tsx` | cacheLife('minutes') | NEW |
| `src/app/lab/caching/02-cache-life/_components/LongLived.tsx` | cacheLife('hours') | NEW |
| `src/app/lab/caching/03-on-demand/page.tsx` | Exercise page | NEW |
| `src/app/lab/caching/03-on-demand/_components/CachedTodos.tsx` | Cached + tagged | NEW |
| `src/app/lab/caching/03-on-demand/_components/RevalidateButton.tsx` | Client: trigger revalidation | NEW |
| `src/app/lab/caching/04-update-tag/page.tsx` | Exercise page | NEW |
| `src/app/lab/caching/04-update-tag/_components/TodoListA.tsx` | updateTag variant | NEW |
| `src/app/lab/caching/04-update-tag/_components/TodoListB.tsx` | revalidateTag variant | NEW |
| `src/app/lab/caching/04-update-tag/_components/InvalidateButtons.tsx` | Client: trigger both | NEW |
| `src/app/lab/caching/05-runtime/page.tsx` | Exercise page | NEW |
| `src/app/lab/caching/05-runtime/_components/ThemeToggle.tsx` | Client: toggle theme cookie | NEW |
| `src/app/lab/caching/05-runtime/_components/ThemedContent.tsx` | Cached with theme arg | NEW |
| `src/app/lab/caching/06-no-cache/page.tsx` | Exercise page | NEW |
| `src/app/lab/caching/06-no-cache/_components/CachedSection.tsx` | use cache → instant | NEW |
| `src/app/lab/caching/06-no-cache/_components/FreshSection.tsx` | No cache → streaming | NEW |

---

## Task 1: Config change + caching index page

**Files:**
- Modify: `next.config.ts`
- Create: `src/app/lab/caching/page.tsx`

- [ ] **Step 1: Enable cacheComponents in next.config.ts**

Replace ALL contents of `next.config.ts` with:

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
};

export default nextConfig;
```

- [ ] **Step 2: Create caching lab index page**

```tsx
// src/app/lab/caching/page.tsx
import Link from 'next/link'

const EXERCISES = [
  { num: '01', slug: '01-use-cache', title: "'use cache' directive", desc: 'Cache functions and components. Timestamp proves cache hit.' },
  { num: '02', slug: '02-cache-life', title: 'cacheLife profiles', desc: 'seconds, minutes, hours — see different TTLs side by side.' },
  { num: '03', slug: '03-on-demand', title: 'cacheTag + revalidateTag', desc: 'Tag cached data, invalidate on-demand with a button.' },
  { num: '04', slug: '04-update-tag', title: 'updateTag vs revalidateTag', desc: 'Immediate vs stale-while-revalidate — side by side comparison.' },
  { num: '05', slug: '05-runtime', title: 'Runtime APIs + cache', desc: 'Cookie value as cache key. Different input = different cache entry.' },
  { num: '06', slug: '06-no-cache', title: 'Streaming uncached data', desc: 'Cached (instant) vs uncached (streaming) — visual comparison.' },
]

export default function CachingLabIndex() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Data Fetching & Caching Lab</h1>
      <p className="mt-1 text-sm text-gray-500">
        6 exercises for Next.js 16 Cache Components model
      </p>
      <div className="mt-6 space-y-3">
        {EXERCISES.map((ex) => (
          <Link
            key={ex.slug}
            href={`/lab/caching/${ex.slug}`}
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

- [ ] **Step 3: Verify TypeScript compiles**

Run: `pnpm tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add next.config.ts src/app/lab/caching/
git commit -m "feat(lab): enable cacheComponents and add caching lab index

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 2: Exercise 01 — 'use cache' directive

**Files:**
- Create: `src/app/lab/caching/01-use-cache/page.tsx`
- Create: `src/app/lab/caching/01-use-cache/_components/CachedProducts.tsx`
- Create: `src/app/lab/caching/01-use-cache/_components/ProductList.tsx`

- [ ] **Step 1: Create ProductList (Client Component)**

```tsx
// src/app/lab/caching/01-use-cache/_components/ProductList.tsx
'use client'

interface Product {
  id: number
  title: string
  price: number
  category: string
}

interface ProductListProps {
  products: Product[]
  cachedAt: string
  label: string
}

export function ProductList({ products, cachedAt, label }: ProductListProps) {
  return (
    <div className="rounded-lg border bg-white p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{label}</h3>
        <span className="rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
          Cached at: {cachedAt}
        </span>
      </div>
      <ul className="mt-3 space-y-2">
        {products.map((p) => (
          <li key={p.id} className="flex items-center justify-between text-sm">
            <span>{p.title}</span>
            <span className="text-gray-500">${p.price}</span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-green-600">
        Refresh the page — if timestamp stays the same, data is served from cache.
      </p>
    </div>
  )
}
```

- [ ] **Step 2: Create CachedProducts (UI-level cache)**

```tsx
// src/app/lab/caching/01-use-cache/_components/CachedProducts.tsx
import { cacheLife } from 'next/cache'

export async function CachedProducts() {
  'use cache'
  cacheLife('minutes')

  const res = await fetch('https://dummyjson.com/products?limit=3&skip=5')
  const { products } = await res.json()
  const cachedAt = new Date().toISOString()

  return (
    <div className="rounded-lg border bg-white p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">UI-level cache</h3>
        <span className="rounded bg-purple-100 px-2 py-0.5 text-xs text-purple-700">
          Cached at: {cachedAt}
        </span>
      </div>
      <ul className="mt-3 space-y-2">
        {products.map((p: { id: number; title: string; price: number }) => (
          <li key={p.id} className="flex items-center justify-between text-sm">
            <span>{p.title}</span>
            <span className="text-gray-500">${p.price}</span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-purple-600">
        Entire component output is cached — including the rendered HTML.
      </p>
    </div>
  )
}
```

- [ ] **Step 3: Create exercise page**

```tsx
// src/app/lab/caching/01-use-cache/page.tsx
import { ExerciseLayout } from '../../rsc/_components/ExerciseLayout'
import { cacheLife } from 'next/cache'
import { ProductList } from './_components/ProductList'
import { CachedProducts } from './_components/CachedProducts'

async function getProducts() {
  'use cache'
  cacheLife('minutes')
  const res = await fetch('https://dummyjson.com/products?limit=3')
  const { products } = await res.json()
  return {
    products: products.map((p: { id: number; title: string; price: number; category: string }) => ({
      id: p.id,
      title: p.title,
      price: p.price,
      category: p.category,
    })),
    cachedAt: new Date().toISOString(),
  }
}

export default async function UseCacheExercise() {
  const { products, cachedAt } = await getProducts()

  return (
    <ExerciseLayout
      number="01"
      title="'use cache' directive"
      concept="The 'use cache' directive marks a function or component as cacheable. Data-level: cache a function's return value. UI-level: cache an entire component's rendered output. fetch() is NOT cached by default in Next.js 16 — you must opt in with 'use cache'."
      questions={[
        "What does the 'use cache' directive do?",
        "What's the difference between data-level and UI-level caching?",
        'Are fetch requests cached by default in Next.js 16?',
      ]}
    >
      <div className="space-y-4">
        <ProductList products={products} cachedAt={cachedAt} label="Data-level cache" />
        <CachedProducts />
      </div>
    </ExerciseLayout>
  )
}
```

- [ ] **Step 4: Verify TypeScript compiles**

Run: `pnpm tsc --noEmit`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/app/lab/caching/01-use-cache/
git commit -m "feat(lab): add caching exercise 01 — 'use cache' directive

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 3: Exercise 02 — cacheLife profiles

**Files:**
- Create: `src/app/lab/caching/02-cache-life/page.tsx`
- Create: `src/app/lab/caching/02-cache-life/_components/ShortLived.tsx`
- Create: `src/app/lab/caching/02-cache-life/_components/MediumLived.tsx`
- Create: `src/app/lab/caching/02-cache-life/_components/LongLived.tsx`

- [ ] **Step 1: Create ShortLived**

```tsx
// src/app/lab/caching/02-cache-life/_components/ShortLived.tsx
import { cacheLife } from 'next/cache'

export async function ShortLived() {
  'use cache'
  cacheLife('seconds')

  const res = await fetch('https://dummyjson.com/quotes/random')
  const quote = await res.json()

  return (
    <div className="rounded-lg border-2 border-green-300 bg-green-50 p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-green-900">seconds</h3>
        <span className="text-xs text-green-600">{new Date().toISOString()}</span>
      </div>
      <p className="mt-2 text-sm italic text-green-800">"{quote.quote}"</p>
      <p className="mt-1 text-xs text-green-600">— {quote.author}</p>
      <p className="mt-2 rounded bg-green-100 p-1 text-xs text-green-700">
        stale: 0 | revalidate: 1s | expire: 60s
      </p>
    </div>
  )
}
```

- [ ] **Step 2: Create MediumLived**

```tsx
// src/app/lab/caching/02-cache-life/_components/MediumLived.tsx
import { cacheLife } from 'next/cache'

export async function MediumLived() {
  'use cache'
  cacheLife('minutes')

  const res = await fetch('https://dummyjson.com/quotes/random')
  const quote = await res.json()

  return (
    <div className="rounded-lg border-2 border-amber-300 bg-amber-50 p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-amber-900">minutes</h3>
        <span className="text-xs text-amber-600">{new Date().toISOString()}</span>
      </div>
      <p className="mt-2 text-sm italic text-amber-800">"{quote.quote}"</p>
      <p className="mt-1 text-xs text-amber-600">— {quote.author}</p>
      <p className="mt-2 rounded bg-amber-100 p-1 text-xs text-amber-700">
        stale: 5m | revalidate: 1m | expire: 1h
      </p>
    </div>
  )
}
```

- [ ] **Step 3: Create LongLived**

```tsx
// src/app/lab/caching/02-cache-life/_components/LongLived.tsx
import { cacheLife } from 'next/cache'

export async function LongLived() {
  'use cache'
  cacheLife('hours')

  const res = await fetch('https://dummyjson.com/quotes/random')
  const quote = await res.json()

  return (
    <div className="rounded-lg border-2 border-red-300 bg-red-50 p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-red-900">hours</h3>
        <span className="text-xs text-red-600">{new Date().toISOString()}</span>
      </div>
      <p className="mt-2 text-sm italic text-red-800">"{quote.quote}"</p>
      <p className="mt-1 text-xs text-red-600">— {quote.author}</p>
      <p className="mt-2 rounded bg-red-100 p-1 text-xs text-red-700">
        stale: 5m | revalidate: 1h | expire: 1d
      </p>
    </div>
  )
}
```

- [ ] **Step 4: Create exercise page**

```tsx
// src/app/lab/caching/02-cache-life/page.tsx
import { Suspense } from 'react'
import { ExerciseLayout } from '../../rsc/_components/ExerciseLayout'
import { ShortLived } from './_components/ShortLived'
import { MediumLived } from './_components/MediumLived'
import { LongLived } from './_components/LongLived'

function Skeleton({ label }: { label: string }) {
  return (
    <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-4">
      <div className="flex items-center gap-2">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />
        <span className="text-sm text-gray-500">Loading {label}...</span>
      </div>
    </div>
  )
}

export default function CacheLifeExercise() {
  return (
    <ExerciseLayout
      number="02"
      title="cacheLife profiles"
      concept="cacheLife controls how long cached data remains valid. Each profile defines three values: stale (serve stale immediately), revalidate (trigger background refresh), and expire (discard entirely). Use inside a 'use cache' scope."
      questions={[
        'What do stale, revalidate, and expire mean in cacheLife?',
        "When would you use cacheLife('seconds') vs cacheLife('hours')?",
        'Can you pass a custom object to cacheLife instead of a profile name?',
      ]}
    >
      <p className="mb-4 text-sm text-gray-600">
        Refresh the page repeatedly. Watch which timestamps change and which stay the same.
      </p>
      <div className="grid gap-4 sm:grid-cols-3">
        <Suspense fallback={<Skeleton label="seconds" />}>
          <ShortLived />
        </Suspense>
        <Suspense fallback={<Skeleton label="minutes" />}>
          <MediumLived />
        </Suspense>
        <Suspense fallback={<Skeleton label="hours" />}>
          <LongLived />
        </Suspense>
      </div>
      <div className="mt-4 rounded bg-gray-50 p-3 text-xs text-gray-700">
        <table className="w-full">
          <thead>
            <tr className="text-left">
              <th>Profile</th><th>stale</th><th>revalidate</th><th>expire</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>seconds</td><td>0</td><td>1s</td><td>60s</td></tr>
            <tr><td>minutes</td><td>5m</td><td>1m</td><td>1h</td></tr>
            <tr><td>hours</td><td>5m</td><td>1h</td><td>1d</td></tr>
          </tbody>
        </table>
      </div>
    </ExerciseLayout>
  )
}
```

- [ ] **Step 5: Verify TypeScript compiles**

Run: `pnpm tsc --noEmit`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/app/lab/caching/02-cache-life/
git commit -m "feat(lab): add caching exercise 02 — cacheLife profiles

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 4: Exercise 03 — On-demand revalidation

**Files:**
- Create: `src/app/lab/caching/03-on-demand/page.tsx`
- Create: `src/app/lab/caching/03-on-demand/_components/CachedTodos.tsx`
- Create: `src/app/lab/caching/03-on-demand/_components/RevalidateButton.tsx`

- [ ] **Step 1: Create CachedTodos**

```tsx
// src/app/lab/caching/03-on-demand/_components/CachedTodos.tsx
import { cacheLife, cacheTag } from 'next/cache'

export async function CachedTodos() {
  'use cache'
  cacheLife('hours')
  cacheTag('lab-todos')

  const res = await fetch('https://dummyjson.com/todos?limit=5')
  const { todos } = await res.json()
  const cachedAt = new Date().toISOString()

  return (
    <div className="rounded-lg border bg-white p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Cached Todos</h3>
        <span className="rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
          Cached at: {cachedAt}
        </span>
      </div>
      <ul className="mt-3 space-y-1">
        {todos.map((t: { id: number; todo: string; completed: boolean }) => (
          <li key={t.id} className="flex items-center gap-2 text-sm">
            <span className={t.completed ? 'text-green-600' : 'text-gray-400'}>
              {t.completed ? '✓' : '○'}
            </span>
            <span className={t.completed ? 'line-through text-gray-400' : ''}>
              {t.todo}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-blue-600">
        Tagged with <code>lab-todos</code>. Click Revalidate, then refresh to see new timestamp.
      </p>
    </div>
  )
}
```

- [ ] **Step 2: Create RevalidateButton**

```tsx
// src/app/lab/caching/03-on-demand/_components/RevalidateButton.tsx
'use client'

import { useTransition } from 'react'
import { revalidateTodosAction } from '../_actions'

export function RevalidateButton() {
  const [pending, start] = useTransition()

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => start(() => revalidateTodosAction())}
      className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
    >
      {pending ? 'Revalidating...' : 'Revalidate Todos'}
    </button>
  )
}
```

- [ ] **Step 3: Create Server Action file**

```ts
// src/app/lab/caching/03-on-demand/_actions.ts
'use server'

import { revalidateTag } from 'next/cache'

export async function revalidateTodosAction() {
  revalidateTag('lab-todos', 'max')
}
```

- [ ] **Step 4: Create exercise page**

```tsx
// src/app/lab/caching/03-on-demand/page.tsx
import { Suspense } from 'react'
import { ExerciseLayout } from '../../rsc/_components/ExerciseLayout'
import { CachedTodos } from './_components/CachedTodos'
import { RevalidateButton } from './_components/RevalidateButton'

export default function OnDemandExercise() {
  return (
    <ExerciseLayout
      number="03"
      title="cacheTag + revalidateTag"
      concept="cacheTag assigns a label to cached data. revalidateTag invalidates all cache entries with that tag. With profile='max', stale content is served immediately while fresh data loads in the background (stale-while-revalidate)."
      questions={[
        "How does cacheTag differ from the old next: { tags } approach?",
        'What happens when you call revalidateTag? Is the next response fresh or stale?',
        'Can you use the same tag across multiple cached functions?',
      ]}
    >
      <div className="space-y-4">
        <Suspense fallback={<div className="animate-pulse h-48 rounded bg-gray-100" />}>
          <CachedTodos />
        </Suspense>
        <div className="flex items-center gap-3">
          <RevalidateButton />
          <span className="text-xs text-gray-500">
            Click to invalidate the <code>lab-todos</code> tag, then refresh the page.
          </span>
        </div>
      </div>
    </ExerciseLayout>
  )
}
```

- [ ] **Step 5: Verify TypeScript compiles**

Run: `pnpm tsc --noEmit`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/app/lab/caching/03-on-demand/
git commit -m "feat(lab): add caching exercise 03 — cacheTag + revalidateTag

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 5: Exercise 04 — updateTag vs revalidateTag

**Files:**
- Create: `src/app/lab/caching/04-update-tag/page.tsx`
- Create: `src/app/lab/caching/04-update-tag/_components/TodoListA.tsx`
- Create: `src/app/lab/caching/04-update-tag/_components/TodoListB.tsx`
- Create: `src/app/lab/caching/04-update-tag/_components/InvalidateButtons.tsx`
- Create: `src/app/lab/caching/04-update-tag/_actions.ts`

- [ ] **Step 1: Create TodoListA (updateTag variant)**

```tsx
// src/app/lab/caching/04-update-tag/_components/TodoListA.tsx
import { cacheLife, cacheTag } from 'next/cache'

export async function TodoListA() {
  'use cache'
  cacheLife('hours')
  cacheTag('lab-todos-a')

  const res = await fetch('https://dummyjson.com/todos?limit=3&skip=' + Math.floor(Math.random() * 20))
  const { todos } = await res.json()

  return (
    <div className="rounded-lg border-2 border-green-300 bg-green-50 p-4">
      <h3 className="font-semibold text-green-900">List A — updateTag</h3>
      <p className="text-xs text-green-600">{new Date().toISOString()}</p>
      <ul className="mt-2 space-y-1">
        {todos.map((t: { id: number; todo: string }) => (
          <li key={t.id} className="text-sm">{t.todo}</li>
        ))}
      </ul>
      <p className="mt-2 rounded bg-green-100 p-1 text-xs text-green-700">
        Immediate expire — next request waits for fresh data
      </p>
    </div>
  )
}
```

- [ ] **Step 2: Create TodoListB (revalidateTag variant)**

```tsx
// src/app/lab/caching/04-update-tag/_components/TodoListB.tsx
import { cacheLife, cacheTag } from 'next/cache'

export async function TodoListB() {
  'use cache'
  cacheLife('hours')
  cacheTag('lab-todos-b')

  const res = await fetch('https://dummyjson.com/todos?limit=3&skip=' + Math.floor(Math.random() * 20))
  const { todos } = await res.json()

  return (
    <div className="rounded-lg border-2 border-amber-300 bg-amber-50 p-4">
      <h3 className="font-semibold text-amber-900">List B — revalidateTag</h3>
      <p className="text-xs text-amber-600">{new Date().toISOString()}</p>
      <ul className="mt-2 space-y-1">
        {todos.map((t: { id: number; todo: string }) => (
          <li key={t.id} className="text-sm">{t.todo}</li>
        ))}
      </ul>
      <p className="mt-2 rounded bg-amber-100 p-1 text-xs text-amber-700">
        Stale-while-revalidate — serves cached, refreshes in background
      </p>
    </div>
  )
}
```

- [ ] **Step 3: Create Server Actions**

```ts
// src/app/lab/caching/04-update-tag/_actions.ts
'use server'

import { updateTag, revalidateTag } from 'next/cache'

export async function invalidateWithUpdateTag() {
  updateTag('lab-todos-a')
}

export async function invalidateWithRevalidateTag() {
  revalidateTag('lab-todos-b', 'max')
}

export async function invalidateBoth() {
  updateTag('lab-todos-a')
  revalidateTag('lab-todos-b', 'max')
}
```

- [ ] **Step 4: Create InvalidateButtons**

```tsx
// src/app/lab/caching/04-update-tag/_components/InvalidateButtons.tsx
'use client'

import { useTransition } from 'react'
import { invalidateBoth } from '../_actions'

export function InvalidateButtons() {
  const [pending, start] = useTransition()

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        disabled={pending}
        onClick={() => start(() => invalidateBoth())}
        className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {pending ? 'Invalidating...' : 'Invalidate Both'}
      </button>
      <span className="text-xs text-gray-500">
        Then refresh — List A shows new data immediately, List B may show stale first.
      </span>
    </div>
  )
}
```

- [ ] **Step 5: Create exercise page**

```tsx
// src/app/lab/caching/04-update-tag/page.tsx
import { Suspense } from 'react'
import { ExerciseLayout } from '../../rsc/_components/ExerciseLayout'
import { TodoListA } from './_components/TodoListA'
import { TodoListB } from './_components/TodoListB'
import { InvalidateButtons } from './_components/InvalidateButtons'

export default function UpdateTagExercise() {
  return (
    <ExerciseLayout
      number="04"
      title="updateTag vs revalidateTag"
      concept="updateTag immediately expires the cache — the next request blocks until fresh data is ready (read-your-own-writes). revalidateTag with profile='max' uses stale-while-revalidate — serves cached data while fetching fresh in background. updateTag is Server Actions only; revalidateTag works in Route Handlers too."
      questions={[
        'When would you use updateTag over revalidateTag?',
        "What does 'read-your-own-writes' mean in the context of caching?",
        'Can you use updateTag in a Route Handler?',
      ]}
    >
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Suspense fallback={<div className="animate-pulse h-40 rounded bg-gray-100" />}>
            <TodoListA />
          </Suspense>
          <Suspense fallback={<div className="animate-pulse h-40 rounded bg-gray-100" />}>
            <TodoListB />
          </Suspense>
        </div>
        <InvalidateButtons />
        <div className="rounded bg-gray-50 p-3 text-xs">
          <table className="w-full">
            <thead>
              <tr className="text-left text-gray-500">
                <th className="pb-1"></th>
                <th className="pb-1">updateTag</th>
                <th className="pb-1">revalidateTag</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              <tr><td className="py-1 font-medium">Where</td><td>Server Actions only</td><td>Server Actions + Route Handlers</td></tr>
              <tr><td className="py-1 font-medium">Behavior</td><td>Immediate expire</td><td>Stale-while-revalidate</td></tr>
              <tr><td className="py-1 font-medium">Use case</td><td>Read-your-own-writes</td><td>Background refresh</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </ExerciseLayout>
  )
}
```

- [ ] **Step 6: Verify TypeScript compiles**

Run: `pnpm tsc --noEmit`
Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add src/app/lab/caching/04-update-tag/
git commit -m "feat(lab): add caching exercise 04 — updateTag vs revalidateTag

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 6: Exercise 05 — Runtime APIs + cache

**Files:**
- Create: `src/app/lab/caching/05-runtime/page.tsx`
- Create: `src/app/lab/caching/05-runtime/_components/ThemeToggle.tsx`
- Create: `src/app/lab/caching/05-runtime/_components/ThemedContent.tsx`
- Create: `src/app/lab/caching/05-runtime/_actions.ts`

- [ ] **Step 1: Create ThemedContent (cached with theme arg)**

```tsx
// src/app/lab/caching/05-runtime/_components/ThemedContent.tsx
import { cacheLife } from 'next/cache'

interface ThemedContentProps {
  theme: string
}

async function getCachedQuote(theme: string) {
  'use cache'
  cacheLife('minutes')
  const res = await fetch('https://dummyjson.com/quotes/random')
  const quote = await res.json()
  return { quote: quote.quote, author: quote.author, cachedAt: new Date().toISOString(), theme }
}

export async function ThemedContent({ theme }: ThemedContentProps) {
  const data = await getCachedQuote(theme)

  const isDark = data.theme === 'dark'

  return (
    <div className={`rounded-lg border p-4 ${isDark ? 'bg-gray-900 text-white border-gray-700' : 'bg-white text-gray-900 border-gray-200'}`}>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Theme: {data.theme}</h3>
        <span className={`rounded px-2 py-0.5 text-xs ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
          Cached at: {data.cachedAt}
        </span>
      </div>
      <p className={`mt-3 text-sm italic ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
        "{data.quote}"
      </p>
      <p className={`mt-1 text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
        — {data.author}
      </p>
      <p className={`mt-3 rounded p-2 text-xs ${isDark ? 'bg-gray-800 text-gray-400' : 'bg-blue-50 text-blue-700'}`}>
        theme="{data.theme}" is part of the cache key. Switch theme → different cache entry → different quote.
        Switch back → same quote (cache hit!).
      </p>
    </div>
  )
}
```

- [ ] **Step 2: Create ThemeToggle**

```tsx
// src/app/lab/caching/05-runtime/_components/ThemeToggle.tsx
'use client'

import { useTransition } from 'react'
import { setThemeAction } from '../_actions'

export function ThemeToggle({ current }: { current: string }) {
  const [pending, start] = useTransition()

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-500">Theme:</span>
      {(['light', 'dark'] as const).map((t) => (
        <button
          key={t}
          type="button"
          disabled={pending || current === t}
          onClick={() => start(() => setThemeAction(t))}
          className={`rounded px-3 py-1 text-sm ${
            current === t
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50'
          }`}
        >
          {t}
        </button>
      ))}
      {pending && <span className="text-xs text-gray-400">Switching...</span>}
    </div>
  )
}
```

- [ ] **Step 3: Create Server Action**

```ts
// src/app/lab/caching/05-runtime/_actions.ts
'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export async function setThemeAction(theme: string) {
  const c = await cookies()
  c.set('theme', theme, { path: '/', sameSite: 'lax', maxAge: 60 * 60 * 24 * 7 })
  revalidatePath('/lab/caching/05-runtime')
}
```

- [ ] **Step 4: Create exercise page**

```tsx
// src/app/lab/caching/05-runtime/page.tsx
import { Suspense } from 'react'
import { cookies } from 'next/headers'
import { ExerciseLayout } from '../../rsc/_components/ExerciseLayout'
import { ThemeToggle } from './_components/ThemeToggle'
import { ThemedContent } from './_components/ThemedContent'

export default async function RuntimeExercise() {
  const c = await cookies()
  const theme = c.get('theme')?.value ?? 'light'

  return (
    <ExerciseLayout
      number="05"
      title="Runtime APIs + cache"
      concept="You can't use cookies() or headers() directly inside a 'use cache' scope — they're runtime APIs. Instead, read them outside and pass the value as an argument to a cached function. The argument becomes part of the cache key, so different values produce separate cache entries."
      questions={[
        "Why can't you use cookies() directly inside a 'use cache' function?",
        'How do function arguments affect the cache key?',
        'Why does the component that reads cookies need to be wrapped in Suspense?',
      ]}
    >
      <div className="space-y-4">
        <ThemeToggle current={theme} />
        <Suspense fallback={<div className="animate-pulse h-40 rounded bg-gray-100" />}>
          <ThemedContent theme={theme} />
        </Suspense>
      </div>
    </ExerciseLayout>
  )
}
```

- [ ] **Step 5: Verify TypeScript compiles**

Run: `pnpm tsc --noEmit`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/app/lab/caching/05-runtime/
git commit -m "feat(lab): add caching exercise 05 — runtime APIs + cache

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 7: Exercise 06 — Streaming uncached data

**Files:**
- Create: `src/app/lab/caching/06-no-cache/page.tsx`
- Create: `src/app/lab/caching/06-no-cache/_components/CachedSection.tsx`
- Create: `src/app/lab/caching/06-no-cache/_components/FreshSection.tsx`

- [ ] **Step 1: Create CachedSection**

```tsx
// src/app/lab/caching/06-no-cache/_components/CachedSection.tsx
import { cacheLife } from 'next/cache'

export async function CachedSection() {
  'use cache'
  cacheLife('hours')

  const res = await fetch('https://dummyjson.com/products/1')
  const product = await res.json()

  return (
    <div className="rounded-lg border-2 border-green-300 bg-green-50 p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-green-900">Cached</h3>
        <span className="text-xs text-green-600">{new Date().toISOString()}</span>
      </div>
      <p className="mt-2 text-sm">{product.title} — ${product.price}</p>
      <p className="mt-2 rounded bg-green-100 p-1 text-xs text-green-700">
        Uses 'use cache' + cacheLife('hours'). Appears instantly from cache. Timestamp stays same on refresh.
      </p>
    </div>
  )
}
```

- [ ] **Step 2: Create FreshSection**

```tsx
// src/app/lab/caching/06-no-cache/_components/FreshSection.tsx
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

export async function FreshSection() {
  await sleep(1500)
  const res = await fetch('https://dummyjson.com/products/2')
  const product = await res.json()

  return (
    <div className="rounded-lg border-2 border-orange-300 bg-orange-50 p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-orange-900">Fresh (uncached)</h3>
        <span className="text-xs text-orange-600">{new Date().toISOString()}</span>
      </div>
      <p className="mt-2 text-sm">{product.title} — ${product.price}</p>
      <p className="mt-2 rounded bg-orange-100 p-1 text-xs text-orange-700">
        No 'use cache'. Fetches every request. Streamed via Suspense. Timestamp changes every refresh.
      </p>
    </div>
  )
}
```

- [ ] **Step 3: Create exercise page**

```tsx
// src/app/lab/caching/06-no-cache/page.tsx
import { Suspense } from 'react'
import { ExerciseLayout } from '../../rsc/_components/ExerciseLayout'
import { CachedSection } from './_components/CachedSection'
import { FreshSection } from './_components/FreshSection'

export default function NoCacheExercise() {
  return (
    <ExerciseLayout
      number="06"
      title="Streaming uncached data"
      concept="When you need fresh data every request, don't use 'use cache'. Instead wrap the async component in <Suspense> to stream it. The page shell and cached components render instantly; uncached components show a fallback first, then stream in when ready."
      questions={[
        'When should you NOT use caching?',
        "What's the role of Suspense for uncached components?",
        'What happens if you don\'t wrap an uncached async component in Suspense?',
      ]}
    >
      <p className="mb-4 text-sm text-gray-600">
        On refresh: cached section appears instantly (same timestamp), fresh section shows skeleton then loads (new timestamp).
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <Suspense fallback={<div className="animate-pulse h-32 rounded bg-gray-100" />}>
          <CachedSection />
        </Suspense>
        <Suspense fallback={
          <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-4">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />
              <span className="text-sm text-gray-500">Fetching fresh data (~1.5s)...</span>
            </div>
          </div>
        }>
          <FreshSection />
        </Suspense>
      </div>
    </ExerciseLayout>
  )
}
```

- [ ] **Step 4: Verify TypeScript compiles**

Run: `pnpm tsc --noEmit`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/app/lab/caching/06-no-cache/
git commit -m "feat(lab): add caching exercise 06 — streaming uncached data

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 8: Build verification

- [ ] **Step 1: Run TypeScript check**

Run: `pnpm tsc --noEmit`
Expected: no errors.

- [ ] **Step 2: Run existing tests**

Run: `pnpm test`
Expected: all existing tests pass (38 tests).

- [ ] **Step 3: Run build**

Run: `pnpm build`
Expected: build succeeds. Route list includes `/lab/caching`, `/lab/caching/01-use-cache` through `/lab/caching/06-no-cache`.

- [ ] **Step 4: Smoke test dev server**

Run: `pnpm dev`

Visit http://localhost:3000/lab/caching — verify index page lists all 6 exercises.
Click each exercise — verify no errors.
Specifically:
- Exercise 01: refresh → timestamps should stay same (cached)
- Exercise 05: toggle light/dark → content changes with theme
- Exercise 06: cached section instant, fresh section shows spinner then loads

Stop dev server.

---

## Self-Review Notes

- Spec coverage: all 6 exercises mapped to Tasks 2-7. Config in Task 1. Verification in Task 8.
- No placeholders. Every file has complete code.
- `revalidateTag` always called with 2 args: `revalidateTag('tag', 'max')` per Next.js 16 docs (single-arg form is deprecated).
- `updateTag` only used in Server Actions (`_actions.ts` files).
- `ExerciseLayout` imported from `../../rsc/_components/ExerciseLayout` — reused, not duplicated.
- `cacheTag` and `cacheLife` always inside `'use cache'` scope.
- Runtime API (cookies) read outside cached scope, value passed as argument (exercise 05).
