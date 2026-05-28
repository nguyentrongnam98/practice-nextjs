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
        target route&apos;s RSC payload. Reload to reset.
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
