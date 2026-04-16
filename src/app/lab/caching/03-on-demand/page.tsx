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
