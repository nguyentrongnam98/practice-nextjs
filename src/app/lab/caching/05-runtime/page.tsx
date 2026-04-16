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
