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
