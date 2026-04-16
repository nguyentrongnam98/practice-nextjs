import { Suspense } from 'react'
import { ExerciseLayout } from '../_components/ExerciseLayout'
import { SlowSection } from './_components/SlowSection'
import { SlowerSection } from './_components/SlowerSection'
import { SlowestSection } from './_components/SlowestSection'

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

export default function StreamingExercise() {
  return (
    <ExerciseLayout
      number="05"
      title="Suspense streaming"
      concept="Each <Suspense> boundary defines an independent streaming unit. The page shell renders immediately, and each async section streams in as soon as its data resolves — without waiting for siblings. Faster sections appear first."
      questions={[
        'What is streaming and how does Suspense enable it?',
        "What's the difference between loading.tsx and inline <Suspense>?",
        'Can you nest Suspense boundaries? What happens?',
      ]}
    >
      <p className="mb-4 text-sm text-gray-600">
        Watch the 3 sections appear one by one. The page shell renders immediately.
      </p>
      <div className="space-y-4">
        <Suspense fallback={<Skeleton label="Fast (~500ms)" />}>
          <SlowSection />
        </Suspense>
        <Suspense fallback={<Skeleton label="Medium (~1500ms)" />}>
          <SlowerSection />
        </Suspense>
        <Suspense fallback={<Skeleton label="Slow (~3000ms)" />}>
          <SlowestSection />
        </Suspense>
      </div>
    </ExerciseLayout>
  )
}
