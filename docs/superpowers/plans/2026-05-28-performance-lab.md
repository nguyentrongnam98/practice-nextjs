# Performance Lab Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build 6 hands-on exercises under `/lab/performance/` covering `next/image`, `next/font`, dynamic imports & bundle splitting, lazy loading (with and without SSR), prefetching strategies, and `useReportWebVitals` Web Vitals monitoring.

**Architecture:** Each exercise is an independent route under `src/app/lab/performance/NN-name/`. Reuses the existing `ExerciseLayout` from RSC lab. No unit tests for lab pages — verified visually + Network DevTools. No new dependencies installed (bundle-analyzer demo shows the *technique* + how to inspect the existing build output; users can opt into `@next/bundle-analyzer` later).

**Tech Stack:** Next.js 16.2.3, React 19.2.4, TypeScript, Tailwind v4

**Spec:** `docs/superpowers/specs/2026-05-28-nextjs-interview-prep-design.md` (Phase 1, Lab 3)

**Verification policy:** After each exercise, type-check with `pnpm exec tsc --noEmit`. Final task runs `pnpm lint`. Do NOT run `pnpm dev` from subagents (blocks). Build verification is best-effort — pre-existing SSL failure in caching lab is unrelated.

---

## File Structure

| Path | Purpose | Status |
|---|---|---|
| `src/app/lab/performance/page.tsx` | Index listing 6 exercises | NEW |
| `src/app/lab/performance/01-image/page.tsx` | Image demos + concept | NEW |
| `src/app/lab/performance/01-image/_components/HeroImage.tsx` | priority + sizes example | NEW |
| `src/app/lab/performance/01-image/_components/BlurredImage.tsx` | placeholder="blur" example | NEW |
| `src/app/lab/performance/01-image/_components/ResponsiveGrid.tsx` | sizes prop demo | NEW |
| `src/app/lab/performance/02-font/page.tsx` | Font demo + concept | NEW |
| `src/app/lab/performance/02-font/_fonts.ts` | next/font/google config | NEW |
| `src/app/lab/performance/03-bundle/page.tsx` | Bundle analysis intro + dynamic import | NEW |
| `src/app/lab/performance/03-bundle/_components/HeavyChart.tsx` | Pseudo-heavy module | NEW |
| `src/app/lab/performance/03-bundle/_components/BundleToggle.tsx` | Client toggles import on demand | NEW |
| `src/app/lab/performance/04-lazy/page.tsx` | Lazy loading exercise | NEW |
| `src/app/lab/performance/04-lazy/_components/DynamicChart.tsx` | dynamic + ssr:false | NEW |
| `src/app/lab/performance/04-lazy/_components/Chart.tsx` | Client component lazy-loaded | NEW |
| `src/app/lab/performance/04-lazy/_components/IntersectionLoader.tsx` | IO-based deferred mount | NEW |
| `src/app/lab/performance/05-prefetch/page.tsx` | Prefetch strategies | NEW |
| `src/app/lab/performance/05-prefetch/target/page.tsx` | Navigation target | NEW |
| `src/app/lab/performance/05-prefetch/_components/HoverPrefetchLink.tsx` | Client link with router.prefetch on hover | NEW |
| `src/app/lab/performance/06-vitals/page.tsx` | Vitals reporter demo | NEW |
| `src/app/lab/performance/06-vitals/_components/VitalsReporter.tsx` | useReportWebVitals client component | NEW |
| `src/app/lab/performance/06-vitals/_components/VitalsTable.tsx` | Pretty table of captured metrics | NEW |

---

## Task 1: Performance lab index page

**Files:**
- Create: `src/app/lab/performance/page.tsx`

- [ ] **Step 1: Create the index**

```tsx
// src/app/lab/performance/page.tsx
import Link from 'next/link'

const EXERCISES = [
  {
    num: '01',
    slug: '01-image',
    title: 'next/image deep dive',
    desc: 'priority, sizes, placeholder="blur", LCP optimisation, fill vs fixed dimensions.',
  },
  {
    num: '02',
    slug: '02-font',
    title: 'next/font self-host & no-CLS',
    desc: 'Google fonts via next/font/google, subset, variable fonts, layout shift prevention.',
  },
  {
    num: '03',
    slug: '03-bundle',
    title: 'Bundle splitting & dynamic import',
    desc: 'Read build output to see chunks; defer heavy modules with dynamic import().',
  },
  {
    num: '04',
    slug: '04-lazy',
    title: 'Lazy loading Client Components',
    desc: 'next/dynamic with and without ssr:false; intersection-observer-based mounting.',
  },
  {
    num: '05',
    slug: '05-prefetch',
    title: 'Prefetch strategies',
    desc: 'Default vs disabled vs hover-triggered vs programmatic router.prefetch().',
  },
  {
    num: '06',
    slug: '06-vitals',
    title: 'Web Vitals with useReportWebVitals',
    desc: 'Capture LCP, CLS, INP, FCP, TTFB in a table — same hook real analytics use.',
  },
]

export default function PerformanceLabIndex() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Performance Lab</h1>
      <p className="mt-1 text-sm text-gray-500">6 exercises on optimisation primitives</p>
      <div className="mt-6 space-y-3">
        {EXERCISES.map((ex) => (
          <Link
            key={ex.slug}
            href={`/lab/performance/${ex.slug}`}
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

- [ ] **Step 2: Type-check + commit**

```
pnpm exec tsc --noEmit
git add src/app/lab/performance/page.tsx
git commit -m "feat(lab): add performance lab index page"
```

---

## Task 2: Exercise 01 — next/image deep dive

**Concept:** `next/image` extends `<img>` with automatic format conversion (AVIF/WebP), size optimisation per device, lazy loading by default, and CLS prevention. Key props: `priority` (LCP candidate, eager-load), `sizes` (responsive selection), `placeholder="blur"` (decode-aware blur-up), and `fill` (parent-relative).

**Files:** All 4 files below.

- [ ] **Step 1: Hero image component**

```tsx
// src/app/lab/performance/01-image/_components/HeroImage.tsx
import Image from 'next/image'

export function HeroImage() {
  return (
    <div className="relative h-64 w-full overflow-hidden rounded-lg">
      <Image
        src="https://picsum.photos/seed/hero/1200/600"
        alt="Hero image — random landscape"
        fill
        priority
        sizes="(max-width: 768px) 100vw, 800px"
        className="object-cover"
        unoptimized
      />
    </div>
  )
}
```

> Note: `unoptimized` is set because `picsum.photos` isn't whitelisted in `next.config.ts`'s `remotePatterns`. For a real LCP image you'd remove `unoptimized` and add the host to `remotePatterns` to get AVIF/WebP.

- [ ] **Step 2: Blurred image**

```tsx
// src/app/lab/performance/01-image/_components/BlurredImage.tsx
import Image from 'next/image'

const BLUR =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCA0IDQnPjxyZWN0IHdpZHRoPSc0JyBoZWlnaHQ9JzQnIGZpbGw9JyM5OTk5OTknLz48L3N2Zz4='

export function BlurredImage() {
  return (
    <div className="relative h-48 w-full overflow-hidden rounded-lg">
      <Image
        src="https://picsum.photos/seed/blur/900/450"
        alt="Image with blur-up placeholder"
        fill
        placeholder="blur"
        blurDataURL={BLUR}
        sizes="(max-width: 768px) 100vw, 600px"
        className="object-cover"
        unoptimized
      />
    </div>
  )
}
```

- [ ] **Step 3: Responsive grid**

```tsx
// src/app/lab/performance/01-image/_components/ResponsiveGrid.tsx
import Image from 'next/image'

const IDS = ['grid-1', 'grid-2', 'grid-3', 'grid-4', 'grid-5', 'grid-6']

export function ResponsiveGrid() {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {IDS.map((id) => (
        <div key={id} className="relative aspect-video overflow-hidden rounded">
          <Image
            src={`https://picsum.photos/seed/${id}/600/400`}
            alt={`Grid ${id}`}
            fill
            sizes="(max-width: 640px) 50vw, 33vw"
            className="object-cover"
            unoptimized
          />
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 4: Exercise page**

```tsx
// src/app/lab/performance/01-image/page.tsx
import { ExerciseLayout } from '@/app/lab/rsc/_components/ExerciseLayout'
import { HeroImage } from './_components/HeroImage'
import { BlurredImage } from './_components/BlurredImage'
import { ResponsiveGrid } from './_components/ResponsiveGrid'

export default function ImageExercise() {
  return (
    <ExerciseLayout
      number="01"
      title="next/image deep dive"
      concept="next/image extends <img> with format conversion (AVIF/WebP), responsive sizing, lazy-by-default, CLS prevention via width/height, blur placeholders, and the priority prop for LCP images. The sizes prop tells the browser which candidate to download."
      questions={[
        'Why does next/image need both width/height (or fill) to prevent layout shift?',
        'When should you set the priority prop, and what does it disable?',
        'What does the sizes prop affect — the rendered size or the downloaded size?',
        'How does placeholder="blur" work — what asset gets shipped?',
        'What is the difference between fill and explicit width/height?',
      ]}
    >
      <section className="space-y-2">
        <h3 className="text-sm font-semibold">priority + fill + sizes (LCP candidate)</h3>
        <HeroImage />
        <p className="text-xs text-gray-500">Loads eagerly. Inspect &lt;link rel=&quot;preload&quot;&gt; in DevTools.</p>
      </section>

      <section className="mt-6 space-y-2">
        <h3 className="text-sm font-semibold">placeholder=&quot;blur&quot; with blurDataURL</h3>
        <BlurredImage />
        <p className="text-xs text-gray-500">Throttle to Slow 3G in DevTools to see the blur preview.</p>
      </section>

      <section className="mt-6 space-y-2">
        <h3 className="text-sm font-semibold">Responsive grid (sizes drives download size)</h3>
        <ResponsiveGrid />
        <p className="text-xs text-gray-500">
          Resize the viewport from mobile to desktop and re-load — the browser picks a smaller candidate
          on mobile thanks to <code>sizes</code>.
        </p>
      </section>
    </ExerciseLayout>
  )
}
```

- [ ] **Step 5: Type-check + commit**

```
pnpm exec tsc --noEmit
git add src/app/lab/performance/01-image/
git commit -m "feat(lab/performance): add 01-image exercise"
```

---

## Task 3: Exercise 02 — next/font

**Concept:** `next/font` self-hosts Google or local fonts at build time, eliminating runtime network calls to fonts.googleapis.com. It generates a `className` and `style` (with `--font-*` CSS variable) that prevents layout shift via `size-adjust` matching the fallback metrics. The `subset` option strips unused glyphs.

**Files:** 2 files below. The font is scoped to this exercise route only — does NOT modify the global root layout.

- [ ] **Step 1: Font config**

```ts
// src/app/lab/performance/02-font/_fonts.ts
import { Inter, JetBrains_Mono } from 'next/font/google'

export const inter = Inter({
  subsets: ['latin', 'vietnamese'],
  display: 'swap',
  variable: '--font-inter',
})

export const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jetbrains',
  weight: ['400', '700'],
})
```

- [ ] **Step 2: Exercise page**

```tsx
// src/app/lab/performance/02-font/page.tsx
import { ExerciseLayout } from '@/app/lab/rsc/_components/ExerciseLayout'
import { inter, jetbrains } from './_fonts'

export default function FontExercise() {
  return (
    <ExerciseLayout
      number="02"
      title="next/font self-host & no-CLS"
      concept="next/font downloads Google fonts at build time and self-hosts them, eliminating render-blocking requests to fonts.googleapis.com. It also produces a CSS variable and a precomputed size-adjust so the fallback font's metrics align with the web font — no Flash of Unstyled Text."
      questions={[
        'Why does next/font require subsets to be declared at config time?',
        'How does next/font prevent layout shift even before the web font loads?',
        'What is the difference between display: swap, block, fallback, and optional?',
        'How are variable fonts different from named-weight imports?',
        'Where do the self-hosted font files end up in the build output?',
      ]}
    >
      <section className={`${inter.variable} ${jetbrains.variable} space-y-3`}>
        <p style={{ fontFamily: 'var(--font-inter)' }} className="text-base">
          Inter (sans, Latin + Vietnamese subset). Tiếng Việt: chữ &ldquo;đ&rdquo; ư â ê ô ơ ạ ả.
        </p>
        <p
          style={{ fontFamily: 'var(--font-jetbrains)' }}
          className="rounded bg-gray-900 p-2 text-xs text-green-200"
        >
          {`function greet(name: string) {\n  return \`Hello, \${name}\`\n}`}
        </p>
        <p className="text-xs text-gray-500">
          Both fonts are self-hosted. Open Network → Fonts: you should see local <code>.woff2</code>
          files served from the same origin, NOT requests to fonts.gstatic.com.
        </p>
      </section>
    </ExerciseLayout>
  )
}
```

> Note on Tailwind v4: setting CSS variables via `inter.variable` puts `--font-inter` on the wrapper; we use inline `style={{ fontFamily: 'var(--font-inter)' }}` rather than configuring Tailwind theme tokens — this keeps the exercise self-contained.

- [ ] **Step 3: Type-check + commit**

```
pnpm exec tsc --noEmit
git add src/app/lab/performance/02-font/
git commit -m "feat(lab/performance): add 02-font exercise"
```

---

## Task 4: Exercise 03 — Bundle splitting & dynamic import

**Concept:** Next.js auto-splits each route into its own JS chunk. Client Components and their dependencies bundle together. A dynamic `import()` (or `next/dynamic`) defers a module to a separate chunk fetched only when needed. `pnpm build` prints a table of route + bundle sizes — the canonical way to see what's in your client JS.

**Files:** 3 files below.

- [ ] **Step 1: Pseudo-heavy module**

```tsx
// src/app/lab/performance/03-bundle/_components/HeavyChart.tsx
'use client'

// Pseudo-heavy: a long word list and helpers that simulate a large dependency.
const HEAVY = Array.from({ length: 200 }, (_, i) => `item-${i}-${'x'.repeat(20)}`)

function compute() {
  return HEAVY.map((v) => v.length).reduce((a, b) => a + b, 0)
}

export default function HeavyChart() {
  return (
    <div className="rounded-md border-2 border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
      ✓ Heavy module loaded. Computed sum of lengths: <strong>{compute()}</strong>
      <p className="mt-1 text-xs text-amber-700">
        In a real app, this would be a charting library or PDF renderer ~hundreds of KB. Bundled in a
        separate chunk thanks to the dynamic import on the parent page.
      </p>
    </div>
  )
}
```

- [ ] **Step 2: Client toggle that dynamically imports**

```tsx
// src/app/lab/performance/03-bundle/_components/BundleToggle.tsx
'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { Button } from '@/shared/components/ui'

const HeavyChart = dynamic(() => import('./HeavyChart'), {
  loading: () => <p className="text-sm text-gray-500">Loading heavy module…</p>,
})

export function BundleToggle() {
  const [show, setShow] = useState(false)
  return (
    <div className="space-y-3">
      <Button type="button" onClick={() => setShow((s) => !s)}>
        {show ? 'Hide' : 'Load heavy chart'}
      </Button>
      {show && <HeavyChart />}
    </div>
  )
}
```

- [ ] **Step 3: Exercise page**

```tsx
// src/app/lab/performance/03-bundle/page.tsx
import { ExerciseLayout } from '@/app/lab/rsc/_components/ExerciseLayout'
import { BundleToggle } from './_components/BundleToggle'

export default function BundleExercise() {
  return (
    <ExerciseLayout
      number="03"
      title="Bundle splitting & dynamic import"
      concept="Next.js automatically code-splits by route. Each route loads only the JS it needs. A dynamic import (or next/dynamic) further splits a module into a separate chunk, fetched on demand — useful for code paths users may never hit (modals, charts, editors)."
      questions={[
        'How do you read pnpm build output to find your largest route?',
        'What is the difference between import() at the top of a file vs inside an event handler?',
        'When does Tree-Shaking remove unused exports — at dev or build time?',
        'How is next/dynamic different from React.lazy + Suspense?',
        'How do you add @next/bundle-analyzer to a Next.js project, and what does it tell you?',
      ]}
    >
      <p className="mb-4 text-sm text-gray-600">
        Open DevTools → Network → JS, filter for &quot;chunk&quot;. Click <strong>Load heavy chart</strong> —
        watch a new chunk request arrive only after the click. Without the dynamic import, the heavy
        module would ship in the page's initial JS.
      </p>
      <BundleToggle />

      <div className="mt-6 rounded-md bg-gray-100 p-3 text-xs">
        <p className="font-semibold">How to read pnpm build output:</p>
        <pre className="mt-2 overflow-x-auto">{`Route (app)                              Size     First Load JS
├ ○ /lab/performance                     1.2 kB   115 kB
├ ○ /lab/performance/03-bundle           2.4 kB   118 kB
└ ƒ /lab/performance/03-bundle/...       3.1 kB   119 kB`}</pre>
        <p className="mt-2">
          <strong>Size</strong> = the chunk for this route only.{' '}
          <strong>First Load JS</strong> = total bytes a fresh visitor downloads.
        </p>
        <p className="mt-2">
          To install bundle-analyzer (optional, network):{' '}
          <code>pnpm add -D @next/bundle-analyzer</code>, then wrap{' '}
          <code>next.config.ts</code> with <code>withBundleAnalyzer()</code> and run
          <code> ANALYZE=true pnpm build</code>.
        </p>
      </div>
    </ExerciseLayout>
  )
}
```

- [ ] **Step 4: Type-check + commit**

```
pnpm exec tsc --noEmit
git add src/app/lab/performance/03-bundle/
git commit -m "feat(lab/performance): add 03-bundle exercise"
```

---

## Task 5: Exercise 04 — Lazy loading

**Concept:** `next/dynamic` is a wrapper over `React.lazy` + Suspense that integrates with Next.js code splitting. With `ssr: false`, the component is skipped during server rendering and only loads on the client — useful for libraries that touch `window`. `ssr: false` is NOT allowed in Server Components; you must call it from a Client Component file.

**Files:** 4 files below.

- [ ] **Step 1: Pure client chart**

```tsx
// src/app/lab/performance/04-lazy/_components/Chart.tsx
'use client'

import { useEffect, useState } from 'react'

export default function Chart() {
  const [now, setNow] = useState<string | null>(null)
  useEffect(() => {
    setNow(new Date().toLocaleTimeString())
  }, [])

  // Reference window to prove this can't SSR
  const ua = typeof window === 'undefined' ? '(server)' : window.navigator.userAgent.slice(0, 30)

  return (
    <div className="rounded-md border-2 border-sky-300 bg-sky-50 p-3 text-sm text-sky-900">
      <p>📈 Pretend this is a chart from a heavy library that touches window.</p>
      <p className="mt-2 text-xs">Loaded at (client): {now ?? '…'}</p>
      <p className="text-xs">UA: {ua}</p>
    </div>
  )
}
```

- [ ] **Step 2: Dynamic loader wrapper**

```tsx
// src/app/lab/performance/04-lazy/_components/DynamicChart.tsx
'use client'

import dynamic from 'next/dynamic'

export const DynamicChart = dynamic(() => import('./Chart'), {
  ssr: false,
  loading: () => <p className="text-sm text-gray-500">Mounting Chart on client…</p>,
})
```

- [ ] **Step 3: Intersection-observer mounter**

```tsx
// src/app/lab/performance/04-lazy/_components/IntersectionLoader.tsx
'use client'

import { useEffect, useRef, useState } from 'react'

export function IntersectionLoader({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (!ref.current) return
    const el = ref.current
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setShow(true)
          io.disconnect()
        }
      },
      { rootMargin: '100px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div ref={ref} className="min-h-[120px]">
      {show ? (
        children
      ) : (
        <p className="text-sm text-gray-400 italic">Scroll into view to mount…</p>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Exercise page**

```tsx
// src/app/lab/performance/04-lazy/page.tsx
import { ExerciseLayout } from '@/app/lab/rsc/_components/ExerciseLayout'
import { DynamicChart } from './_components/DynamicChart'
import { IntersectionLoader } from './_components/IntersectionLoader'

export default function LazyExercise() {
  return (
    <ExerciseLayout
      number="04"
      title="Lazy loading Client Components"
      concept="next/dynamic defers a Client Component to a separate JS chunk. Pair with ssr: false when the component needs window or document. Use an IntersectionObserver to delay the load further — only mount when the element scrolls near the viewport."
      questions={[
        'When is ssr: false strictly required, and when is it just an optimisation?',
        'What does the loading prop on next/dynamic render before the chunk arrives?',
        'How is next/dynamic different from a regular ES dynamic import()?',
        'Why is ssr: false illegal inside a Server Component file?',
        'When would you combine IntersectionObserver lazy mount with next/dynamic?',
      ]}
    >
      <section className="space-y-2">
        <h3 className="text-sm font-semibold">next/dynamic with ssr:false</h3>
        <DynamicChart />
        <p className="text-xs text-gray-500">
          Mounts only after hydration — no server HTML. Look in DevTools Sources for a separate chunk.
        </p>
      </section>

      <div className="my-8 h-[400px] rounded-md bg-gray-100 p-3 text-xs text-gray-500">
        ← Spacer to scroll past. Scroll down to trigger the IntersectionObserver…
      </div>

      <section className="space-y-2">
        <h3 className="text-sm font-semibold">IntersectionObserver-deferred mount</h3>
        <IntersectionLoader>
          <DynamicChart />
        </IntersectionLoader>
      </section>
    </ExerciseLayout>
  )
}
```

- [ ] **Step 5: Type-check + commit**

```
pnpm exec tsc --noEmit
git add src/app/lab/performance/04-lazy/
git commit -m "feat(lab/performance): add 04-lazy exercise"
```

---

## Task 6: Exercise 05 — Prefetch strategies

**Concept:** `<Link>` automatically prefetches static routes (when in viewport) in production. Override with `prefetch={false}` to disable, or programmatically warm a route via `router.prefetch()` (e.g., on hover). For dynamic pages, prefetching is opt-in via `loading.tsx`.

**Files:** 3 files below.

- [ ] **Step 1: Hover-prefetch link**

```tsx
// src/app/lab/performance/05-prefetch/_components/HoverPrefetchLink.tsx
'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function HoverPrefetchLink({ href, label }: { href: string; label: string }) {
  const router = useRouter()
  const [prefetched, setPrefetched] = useState(false)

  return (
    <Link
      href={href as never}
      prefetch={false}
      onMouseEnter={() => {
        if (!prefetched) {
          router.prefetch(href)
          setPrefetched(true)
        }
      }}
      className="inline-block rounded-md border px-3 py-1 text-sm text-blue-600 hover:underline"
    >
      {label}
      {prefetched && <span className="ml-2 text-xs text-green-600">✓ prefetched</span>}
    </Link>
  )
}
```

> Note: `href as never` is a workaround for the Next.js typed-routes constraint on Link's `href`. Since the URL is composed at runtime, the type checker can't validate the literal — coercing `as never` here keeps the example readable. In production code, prefer typed routes or `URL` objects.

- [ ] **Step 2: Target page**

```tsx
// src/app/lab/performance/05-prefetch/target/page.tsx
export default function PrefetchTarget() {
  return (
    <div className="rounded-md bg-emerald-50 p-4 text-sm text-emerald-800">
      ✓ You landed on the prefetch target. If the route was prefetched, this transition felt instant.
    </div>
  )
}
```

- [ ] **Step 3: Exercise page**

```tsx
// src/app/lab/performance/05-prefetch/page.tsx
import Link from 'next/link'
import { ExerciseLayout } from '@/app/lab/rsc/_components/ExerciseLayout'
import { HoverPrefetchLink } from './_components/HoverPrefetchLink'

export default function PrefetchExercise() {
  return (
    <ExerciseLayout
      number="05"
      title="Prefetch strategies"
      concept="By default, <Link> prefetches static routes (production only) when the link enters the viewport. Use prefetch={false} to opt out, or call router.prefetch() programmatically — e.g., on hover — to control bandwidth use."
      questions={[
        'Why does prefetching only run in production by default?',
        'What is the difference between full route prefetch and loading.tsx prefetch?',
        'When would you disable prefetch on a Link?',
        'How does the client cache TTL interact with prefetched payloads?',
        'What is the network cost of automatic prefetching for a page with 50 links?',
      ]}
    >
      <p className="mb-3 text-sm text-gray-600">
        Open DevTools → Network → filter <code>_rsc</code>. Each prefetch fires a request for the
        target route's RSC payload. Reload to reset.
      </p>

      <section className="space-y-2">
        <h3 className="text-sm font-semibold">1. Default prefetch (production only)</h3>
        <Link
          href="/lab/performance/05-prefetch/target"
          className="inline-block rounded-md border px-3 py-1 text-sm text-blue-600 hover:underline"
        >
          Visit target (default prefetch)
        </Link>
        <p className="text-xs text-gray-500">
          In a production build, this prefetches when it scrolls into view.
        </p>
      </section>

      <section className="mt-4 space-y-2">
        <h3 className="text-sm font-semibold">2. Disabled prefetch</h3>
        <Link
          href="/lab/performance/05-prefetch/target"
          prefetch={false}
          className="inline-block rounded-md border px-3 py-1 text-sm text-blue-600 hover:underline"
        >
          Visit target (prefetch=false)
        </Link>
        <p className="text-xs text-gray-500">No prefetch — full server round-trip on click.</p>
      </section>

      <section className="mt-4 space-y-2">
        <h3 className="text-sm font-semibold">3. Hover-triggered prefetch</h3>
        <HoverPrefetchLink
          href="/lab/performance/05-prefetch/target"
          label="Visit target (hover to prefetch)"
        />
        <p className="text-xs text-gray-500">
          Hover triggers <code>router.prefetch()</code> once; the badge confirms.
        </p>
      </section>
    </ExerciseLayout>
  )
}
```

- [ ] **Step 4: Type-check + commit**

```
pnpm exec tsc --noEmit
git add src/app/lab/performance/05-prefetch/
git commit -m "feat(lab/performance): add 05-prefetch exercise"
```

---

## Task 7: Exercise 06 — Web Vitals

**Concept:** `useReportWebVitals` from `next/web-vitals` registers a callback that fires when each Core Web Vital (LCP, CLS, INP, FCP, TTFB) is observed. Real analytics platforms (Vercel Analytics, Google Analytics) wrap this hook to forward metrics. Hook must be called from a Client Component.

**Files:** 3 files below.

- [ ] **Step 1: Vitals reporter (writes to module-level array)**

```tsx
// src/app/lab/performance/06-vitals/_components/VitalsReporter.tsx
'use client'

import { useReportWebVitals } from 'next/web-vitals'
import { useEffect, useState } from 'react'

export type VitalMetric = {
  id: string
  name: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  navigationType: string
}

const captured: VitalMetric[] = []
const listeners = new Set<() => void>()

function record(m: VitalMetric) {
  // de-dup by id
  if (captured.some((c) => c.id === m.id)) return
  captured.push(m)
  listeners.forEach((l) => l())
}

export function VitalsReporter() {
  useReportWebVitals((metric) => {
    record({
      id: metric.id,
      name: metric.name,
      value: metric.value,
      rating: metric.rating as VitalMetric['rating'],
      navigationType: metric.navigationType,
    })
  })
  return null
}

export function useVitals(): VitalMetric[] {
  const [, force] = useState(0)
  useEffect(() => {
    const fn = () => force((n) => n + 1)
    listeners.add(fn)
    return () => {
      listeners.delete(fn)
    }
  }, [])
  return [...captured]
}
```

- [ ] **Step 2: Display table**

```tsx
// src/app/lab/performance/06-vitals/_components/VitalsTable.tsx
'use client'

import { useVitals, type VitalMetric } from './VitalsReporter'

const RATING_COLOR: Record<VitalMetric['rating'], string> = {
  good: 'text-green-700 bg-green-50',
  'needs-improvement': 'text-amber-700 bg-amber-50',
  poor: 'text-red-700 bg-red-50',
}

export function VitalsTable() {
  const metrics = useVitals()
  if (metrics.length === 0) {
    return <p className="text-sm text-gray-500 italic">Waiting for vitals to be reported…</p>
  }
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b text-left text-xs text-gray-500">
          <th className="py-1">Name</th>
          <th>Value</th>
          <th>Rating</th>
          <th>Nav</th>
        </tr>
      </thead>
      <tbody>
        {metrics.map((m) => (
          <tr key={m.id} className="border-b last:border-0">
            <td className="py-1 font-mono">{m.name}</td>
            <td>{m.value.toFixed(2)} ms</td>
            <td>
              <span className={`rounded px-2 py-0.5 text-xs ${RATING_COLOR[m.rating]}`}>{m.rating}</span>
            </td>
            <td className="text-xs text-gray-500">{m.navigationType}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
```

- [ ] **Step 3: Exercise page**

```tsx
// src/app/lab/performance/06-vitals/page.tsx
import { ExerciseLayout } from '@/app/lab/rsc/_components/ExerciseLayout'
import { VitalsReporter } from './_components/VitalsReporter'
import { VitalsTable } from './_components/VitalsTable'

export default function VitalsExercise() {
  return (
    <ExerciseLayout
      number="06"
      title="Web Vitals with useReportWebVitals"
      concept="useReportWebVitals from next/web-vitals is the hook every analytics integration wraps. It fires once per metric as each Core Web Vital settles: LCP, CLS, INP, FCP, TTFB. Must be called inside a Client Component."
      questions={[
        'What is a "good" threshold for LCP, CLS, and INP?',
        'Why does the callback for useReportWebVitals fire multiple times per page load?',
        'How do Vercel Analytics and GA4 use this hook under the hood?',
        'What is the difference between FID and INP?',
        'How would you batch-send these metrics to your backend without blocking the UI?',
      ]}
    >
      <VitalsReporter />
      <p className="mb-3 text-sm text-gray-600">
        Metrics appear as they settle. Try refreshing, then interact with the page (click, scroll) to
        trigger INP. Throttle the network in DevTools to push LCP into the &quot;poor&quot; range.
      </p>
      <VitalsTable />
    </ExerciseLayout>
  )
}
```

- [ ] **Step 4: Type-check + commit**

```
pnpm exec tsc --noEmit
git add src/app/lab/performance/06-vitals/
git commit -m "feat(lab/performance): add 06-vitals exercise"
```

---

## Task 8: Final lint + commit

- [ ] **Step 1: Lint**

Run: `pnpm lint`. Fix any new errors. Common: `react/no-unescaped-entities` for `"`/`'` in JSX text — replace with `&ldquo;`/`&rdquo;`/`&apos;`. Anything else: read the error message and apply the smallest fix.

- [ ] **Step 2: Commit fixes if any**

```
git add -A
git status
git commit -m "chore(lab/performance): fix lint issues"
```

Skip if nothing.

- [ ] **Step 3: Build (best-effort)**

Run: `pnpm build`. Routing/Forms/Performance routes should compile cleanly. The pre-existing caching-lab SSL failure may still block the prerender step — that's a separate issue, not ours. Document the outcome.

---

## Acceptance Criteria

1. `http://localhost:3000/lab/performance` lists 6 cards.
2. Each exercise renders + demonstrates its concept:
   - 01: 3 image variants visible; DevTools shows `<link rel="preload">` for the hero.
   - 02: Inter & JetBrains Mono apply; Network shows local `.woff2`, not gstatic.
   - 03: Heavy chunk appears in Network only after clicking Load.
   - 04: Chart mounts only on client; spacer + IntersectionObserver loader works.
   - 05: Hover badge appears; default prefetch (only in production build) prefetches RSC payload.
   - 06: Vitals table populates with LCP / CLS / FCP / INP / TTFB.
3. `pnpm exec tsc --noEmit` clean for `src/`.
4. `pnpm lint` clean for new files.
5. No global root-layout changes (font is scoped to exercise 02 only).

## Out of Scope

- Unit tests (spec non-goal).
- Installing `@next/bundle-analyzer` (shown as an exercise note, not required to run the lab).
- Wiring metrics to a real analytics backend.
- Pre-existing caching-lab SSL failure.
- Real LCP optimisation on production hosts — picsum.photos uses `unoptimized` to skip whitelisting.
