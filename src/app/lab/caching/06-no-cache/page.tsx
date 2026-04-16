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
