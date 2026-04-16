# Server/Client Components Lab — Design

**Date:** 2026-04-16
**Status:** Approved (pending implementation plan)
**Stack:** Next.js 16.2.3, React 19.2.4, Tailwind v4, TypeScript
**Purpose:** Interview prep — hands-on exercises for senior Next.js RSC concepts

## Goal

Build 7 practical exercises under `/lab/rsc/` that each demonstrate one Server/Client Component concept commonly asked in senior Next.js interviews. Each exercise is a standalone route with live demo, concept explanation, and interview questions.

## Non-Goals

- Unit tests (lab exercises, not production code)
- Auth/guard for lab routes
- Responsive design (functional over pretty)
- Real API integration (all data mock/inline)

## Route Map

| # | Route | Concept | Key demonstration |
|---|---|---|---|
| 01 | `/lab/rsc/01-boundary` | `'use client'` boundary | Server logs in terminal, Client logs in browser console. Visual indicator per component. |
| 02 | `/lab/rsc/02-composition` | Server wraps Client | Server Component fetches async data, passes to Client Component via props. Client has interactivity. |
| 03 | `/lab/rsc/03-children` | Children (donut) pattern | Client wrapper with state; Server Component passed as children stays server-rendered. |
| 04 | `/lab/rsc/04-serialization` | Props boundary constraint | Pass Date, Function, Map, string, JSX across boundary — show what works and what breaks. |
| 05 | `/lab/rsc/05-streaming` | Suspense streaming | 3 async sections with 500ms/1500ms/3000ms latency in separate Suspense boundaries. |
| 06 | `/lab/rsc/06-server-only` | Guard imports | `'server-only'` prevents client import. `'client-only'` prevents server import. |
| 07 | `/lab/rsc/07-third-party` | Wrap client-only lib | Wrap `window` API in `'use client'` wrapper with `useEffect` to avoid SSR mismatch. |

**Index page** `/lab/rsc/` lists all exercises with links and short descriptions.

## File Structure

```
src/app/lab/
├── layout.tsx                          ← lab layout (minimal nav)
└── rsc/
    ├── page.tsx                        ← index: exercise list
    ├── _components/
    │   └── ExerciseLayout.tsx          ← shared wrapper (Server Component)
    │
    ├── 01-boundary/
    │   ├── page.tsx
    │   └── _components/
    │       ├── ServerInfo.tsx          ← Server: console.log on server
    │       └── ClientInfo.tsx          ← Client: console.log on browser
    │
    ├── 02-composition/
    │   ├── page.tsx                    ← Server: async fetch mock user
    │   └── _components/
    │       └── UserCard.tsx            ← Client: toggle expand, receives data via props
    │
    ├── 03-children/
    │   ├── page.tsx
    │   └── _components/
    │       ├── InteractiveWrapper.tsx  ← Client: accordion with state
    │       └── ExpensiveData.tsx       ← Server: async fetch heavy data
    │
    ├── 04-serialization/
    │   ├── page.tsx                    ← Server: passes various prop types
    │   └── _components/
    │       └── DataDisplay.tsx         ← Client: receives and inspects props
    │
    ├── 05-streaming/
    │   ├── page.tsx                    ← Server: 3 Suspense boundaries
    │   └── _components/
    │       ├── SlowSection.tsx         ← Server: sleep(500ms)
    │       ├── SlowerSection.tsx       ← Server: sleep(1500ms)
    │       └── SlowestSection.tsx      ← Server: sleep(3000ms)
    │
    ├── 06-server-only/
    │   ├── page.tsx
    │   └── _components/
    │       ├── SecretDisplay.tsx       ← Server: import 'server-only', reads env
    │       └── BrowserOnly.tsx         ← Client: import 'client-only', reads navigator
    │
    └── 07-third-party/
        ├── page.tsx
        └── _components/
            └── WindowSize.tsx          ← Client: wraps window.innerWidth/Height
```

## Shared ExerciseLayout Component

Server Component that wraps every exercise page with consistent structure:

```tsx
interface ExerciseLayoutProps {
  number: string           // "01"
  title: string            // "'use client' boundary"
  concept: string          // 2-3 sentence explanation
  questions: string[]      // interview questions
  children: React.ReactNode // live demo
}
```

Renders:
- Back link to `/lab/rsc`
- Exercise number + title
- Concept box (gray background)
- Live demo area (children)
- Interview questions box (blue background)

## Exercise Details

### 01 — `'use client'` boundary

**ServerInfo.tsx** (Server Component):
- `console.log('🖥️ ServerInfo rendered on SERVER at', new Date().toISOString())`
- Renders a green card: "I am a Server Component" with environment info (`process.env.NODE_ENV`, `typeof window === 'undefined'`)

**ClientInfo.tsx** (`'use client'`):
- `console.log('🌐 ClientInfo rendered on BROWSER at', new Date().toISOString())`
- Renders an orange card: "I am a Client Component" with browser info (`typeof window`, `navigator.userAgent` snippet)

**Page** renders both side by side with instruction: "Open terminal AND browser DevTools console to see where each log appears."

**Interview questions:**
- What happens when you add `'use client'` to a file?
- Can a Client Component import a Server Component?
- What is the default rendering mode in Next.js App Router?

### 02 — Server wraps Client (composition)

**Page** (Server Component):
```tsx
async function getUser() {
  await sleep(500)
  return { name: 'Hùng', email: 'hung@example.com', bio: '...long text...', joinedAt: '2024-01-15' }
}
export default async function Page() {
  const user = await getUser()
  return <UserCard user={user} />
}
```

**UserCard.tsx** (`'use client'`):
- Receives `user` as serializable plain object prop
- Has `useState` for expanded/collapsed bio
- Has `onClick` toggle button
- Displays: "Data fetched on server (no useEffect!), interactivity on client"

**Interview questions:**
- Why not fetch data inside the Client Component?
- What are the benefits of fetching data on the server?
- How do you pass server data to a client component?

### 03 — Children (donut) pattern

**InteractiveWrapper.tsx** (`'use client'`):
- Has `useState<boolean>` for open/closed
- Renders toggle button + `{children}` when open
- Children are passed through — NOT imported

**ExpensiveData.tsx** (Server Component):
- `await sleep(1000)`
- Renders a data table with server-fetched content
- Has `console.log('ExpensiveData rendered on SERVER')` to prove it stays server

**Page:**
```tsx
export default function Page() {
  return (
    <InteractiveWrapper title="Toggle Server Data">
      <ExpensiveData />
    </InteractiveWrapper>
  )
}
```

**Visual explanation on page:**
```
✅ Children pattern:
Page (Server) → InteractiveWrapper (Client) → children = ExpensiveData (Server!)

❌ Direct import pattern (what NOT to do):
InteractiveWrapper (Client) → import ExpensiveData → ExpensiveData becomes Client!
```

**Interview questions:**
- How can a Server Component be a child of a Client Component?
- What's the "donut" pattern and why is it useful?
- What happens if you import a Server Component directly inside a Client Component?

### 04 — Serialization constraint

**Page** (Server Component) passes various prop types to `DataDisplay`:

```tsx
<DataDisplay
  stringVal="hello"
  numberVal={42}
  boolVal={true}
  dateVal={new Date()}
  objVal={{ a: 1, b: { c: 2 } }}
  arrayVal={[1, 2, 3]}
  jsxVal={<span className="text-green-600">I am JSX</span>}
  // functionVal={() => console.log('hi')}  ← uncomment to see error
  // mapVal={new Map([['key', 'value']])}   ← uncomment to see error
/>
```

**DataDisplay.tsx** (`'use client'`):
- Inspects each prop: `typeof`, `instanceof`, JSON.stringify
- Renders table showing: prop name, passed type, received type, status (pass/fail)
- Highlights: Date loses prototype (not instanceof Date), Function/Map/Set cannot cross

Page includes commented-out lines with instructions: "Uncomment these one at a time to see the error."

**Interview questions:**
- What types can be passed from Server to Client Component?
- Why can't you pass functions as props across the boundary?
- What happens to a Date object when passed to a Client Component?

### 05 — Suspense streaming

**Page:**
```tsx
export default function Page() {
  return (
    <div className="space-y-4">
      <Suspense fallback={<Skeleton label="Fast" />}>
        <SlowSection />     {/* 500ms */}
      </Suspense>
      <Suspense fallback={<Skeleton label="Medium" />}>
        <SlowerSection />   {/* 1500ms */}
      </Suspense>
      <Suspense fallback={<Skeleton label="Slow" />}>
        <SlowestSection />  {/* 3000ms */}
      </Suspense>
    </div>
  )
}
```

Each section component:
- `await sleep(N)`
- Renders card with content + timestamp showing when it resolved
- `console.log` on server showing resolve time

Page shows instruction: "Watch the sections appear one by one. The page shell renders immediately."

**Interview questions:**
- What is streaming and how does Suspense enable it?
- What's the difference between `loading.tsx` and inline `<Suspense>`?
- Can you nest Suspense boundaries? What happens?

### 06 — server-only & client-only

**SecretDisplay.tsx** (Server Component):
- `import 'server-only'`
- Reads `process.env.SECRET_KEY ?? 'default-secret-123'`
- Renders: "Secret: ****123" (masked) + "This component can ONLY run on the server"

**BrowserOnly.tsx** (`'use client'`):
- `import 'client-only'`
- Reads `window.navigator.userAgent` in `useEffect`
- Renders: "User Agent: ..." + "This component can ONLY run in the browser"

**Page** renders both + explanation of when to use each guard.

Page includes note: "Try importing SecretDisplay into a 'use client' file — the build will fail with a clear error message."

**Interview questions:**
- What does `import 'server-only'` do?
- When would you use `'client-only'`?
- How do you prevent accidentally leaking server secrets to the client bundle?

### 07 — Third-party library wrapping

**WindowSize.tsx** (`'use client'`):
```tsx
'use client'
import { useState, useEffect } from 'react'

export function WindowSize() {
  const [size, setSize] = useState<{ w: number; h: number } | null>(null)

  useEffect(() => {
    const update = () => setSize({ w: window.innerWidth, h: window.innerHeight })
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  if (!size) return <div className="animate-pulse h-8 bg-gray-200 rounded" />

  return (
    <div>
      <p>Window: {size.w} × {size.h}</p>
    </div>
  )
}
```

**Page** explains the pattern:
1. Library/code needs `window`, `document`, or browser API
2. Wrap in `'use client'` component
3. Use `useEffect` for side effects (not during SSR)
4. Handle `null` initial state (SSR renders first, no window)

Shows before/after: without `useEffect` → hydration mismatch error. With `useEffect` → works.

**Interview questions:**
- How do you use a client-only library in a Server Component page?
- What is a hydration mismatch and how do you avoid it?
- Why do we check for `null` before rendering window data?

## Lab Layout

```tsx
// src/app/lab/layout.tsx
export default function LabLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white px-6 py-3">
        <span className="text-sm font-semibold text-gray-500">LAB</span>
      </header>
      <div className="mx-auto max-w-4xl p-6">{children}</div>
    </div>
  )
}
```

Minimal — no sidebar, no RoleSwitcher, just content area.

## Mock Data

All inline per exercise. No shared service. Each exercise is self-contained. The `sleep` utility is intentionally duplicated in each file rather than extracted to a shared module — this keeps exercises independent so any single exercise can be understood without reading other files.

```ts
// inline in each page/component that needs it
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))
```

## Implementation Order

1. Lab layout + ExerciseLayout shared component + index page
2. Exercise 01 (boundary) — simplest, establishes pattern
3. Exercise 02 (composition)
4. Exercise 03 (children)
5. Exercise 04 (serialization)
6. Exercise 05 (streaming)
7. Exercise 06 (server-only)
8. Exercise 07 (third-party)

Each exercise is independent after step 1. Detailed task breakdown to be produced by writing-plans skill.
