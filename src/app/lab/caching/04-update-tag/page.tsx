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
