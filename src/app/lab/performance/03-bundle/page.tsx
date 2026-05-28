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
        module would ship in the page&apos;s initial JS.
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
